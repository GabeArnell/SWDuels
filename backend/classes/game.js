const {Player} = require("./player")
const {Robot} = require("./Robot")
const {StackAction} = require("./StackAction")

const {Board} = require("./board")
/*
    MULLIGAN, // waiting for the player to mulligan
    ACTION, // player has priority, waiting for them to take an action

*/
const {zoneCardMap,boardCardMap} = require("../cardcontroller")

function recursiveObjCopy(original){
    let copy = {}
    for (let key in original){
        copy[key] = original[key]
    }
    return copy;
}

module.exports.Game = class Game{
    id = null;
    playerList = [];
    board = null;
    stack = null;
    turn = null;
    priority = 0;
    waiting = null;
    totalActions=0;
    nextCardID = 1;
    passes = 0; // how many passes have already occured

    constructor(id, playerIDs){
        this.id = id;
        this.playerList = [];
        this.stack = [];

        this.eventPool = []

        this.totalActions = 0;
        this.nextCardID = 1;
        this.passes = 0;
        this.gameLog = [];

        this.board = new Board()
        this.turn = 0;
        this.winner = null;
        this.priority = 0// Math.random() > .5?0:1 // sets to 0 or 1
        this.waiting = "MULLIGAN"


        // Creating players
        for (let id of playerIDs){
            let startingRow = 1;
            if (this.playerList%2 == 0){
                startingRow = 3
            }
            if (id.startsWith("Robot")){
                let player = new Robot(id,startingRow,this);
                this.playerList.push(player);
            }
            else{
                let player = new Player(id,'Player'+this.playerList.length,startingRow,this);
                this.playerList.push(player);
            }
        }

    }

    log(text){
        this.gameLog.push(text)
    }

    nextTurn(){
        this.turn++;
        this.passes = 0;
        this.priority = 0;// this should alternate technically but w/e
        this.log(`Turn ${this.turn} begins.`)

        // unexhaust all entities
        function filterExhaust(exhaust){
            exhaust.turns--;
            if (exhaust < 1){
                return false;
            }
            return true;
        }
        for (let card of this.board.getAllCards()){
            card.exhausts = card.exhausts.filter(filterExhaust);
        }

        // draw cards for all of the players
        for (let player of this.playerList){
            player.drawCard();
            player.spentDivineConnection = 0;
        }
        this.waiting = "ACTION" // action from newest person
    }

    // Returns JSON for all of the data a given player should be able to see (usually everything but the other player's hand/deck)
    getPlayerView(playerID){
        let myPlayer = null;
        
        for (let plr of this.playerList){
            if (plr.id == playerID){
                myPlayer = plr
            }
        }
        if (!myPlayer){
            return( {
                status: "failure"
            })
        }

        let resData = {
            id: this.id,
            status: "success",
            board: this.board.data(this),
            player: myPlayer.data(this),
            otherPlayers: [],
            passes: this.passes,

            stack: [],
            winner: null,

            turn: this.turn,
            waiting: this.waiting,
            totalActions: this.totalActions,
            priority: false // if the player has priority or not, boolean instead of ID
        }
        

        // getting data of stack actions
        for (let stackAction of this.stack){
            resData.stack.push(stackAction.data(playerID))
        }

        if (this.playerList[this.priority].id == myPlayer.id){
            resData.priority = true
        }
        
        for (let plr of this.playerList){
            if (plr.id != myPlayer.id){
                resData.otherPlayers.push(plr.data(this))
            }
        }
        if (this.winner){
            if (this.winner == "Draw"){
                resData.winner = "Draw"
            }else{
                resData.winner = this.winner.name
            }
            resData.priority = false; // no actions after game!
        }

        return resData;
    }


    playerAction(req,res,bodyData){
        let originalPlayerID = req.body.player
        let playerID = bodyData.player;
        let player = null;
        for (let plr of this.playerList){
            if (plr.id == playerID){
                player = plr
                //console.log('found player')
            }
        }
        if (!player || this.playerList[this.priority].id != player.id || this.waiting != bodyData.data.type){ // must be the action the game is waiting for as well as the player who is being waited on
            console.log('kicked',this.waiting, bodyData.type)
            res.send({
                status: "failure"
            });
            return;  
        }
        //console.log("allowed to play")
        this.totalActions++;
        switch(bodyData.data.type){
            case("MULLIGAN"):
                if (bodyData.data.data == "Yes"){
                    player.mulliganHand();
                }else{
                    this.log(`Player does not mulligan their hand.`)
                }
                // pass it to the next person who needs to mulligan
                this.priority++;
                if (this.priority > this.playerList.length-1){ // priority has been passed around, everyone has mulliganed
                    this.priority = 0;
                    this.nextTurn();
                }
                break;
            case("ACTION"):
                let actionData = bodyData.data.data;

                let result = this.runAction(player,actionData);
                if (!result){
                    console.log('action failure')
                    res.send({
                        status: "failure"
                    });
                    return; 
                } 

                break;
        }


        // checking if game is over only works for 2 players atm. Sets priority to -1 so no players can input actions after
        if (this.playerList[0].playerCard.calcHealth() < 1 && this.playerList[1].playerCard.calcHealth() > 0){
            this.winner = this.playerList[1]
            this.priority = -1;
            this.log(`${this.winner.name} wins!`)
        }else if (this.playerList[1].playerCard.calcHealth() < 1 && this.playerList[0].playerCard.calcHealth() > 0){
            this.winner = this.playerList[0]
            this.priority = -1;
            this.log(`${this.winner.name} wins!`)
        }else if (this.playerList[1].playerCard.calcHealth() < 1 && this.playerList[0].playerCard.calcHealth() < 1){
            this.winner = "Draw"
            this.priority = -1;
            this.log(`Game ends in a draw.`)
        }
        
        // check if waiting on a Robot, if so do the Robot's turn. Otherwise send response back
        if (!this.winner && this.playerList[this.priority].id.startsWith("Robot")){
            // do Robot shit
            this.playerList[this.priority].decideAction(req,res)
            
        }else{
            res.send({
                status: "success",
                view: this.getPlayerView(originalPlayerID)
            })
        }
        return;
    }

    runAction(player,actionData){
        let card=null;
        let index=0;// index of card in the current zone if needed
        let cardResults=null; // when searching board for card
        let targetCard = null;

        let actionResult = false;
        switch(actionData.actiontype){
            case("PLAYCARD"):
                this.passes = 0;// reseting pass count. Anything that isnt the PASS actiontype should reset this
                for (let c of player.hand){
                    if (c.data().id == actionData.card){
                        card = c;
                        actionData['index'] = index
                    }
                    index++;
                }
                if (!card){
                    return false;
                }
                actionResult= (this.castCard(player,card,actionData))
                break;
            case("MOVEENTITY"):
                this.passes = 0;
                cardResults = this.board.getCard(actionData.card);
                card = cardResults[0];
                if (!card){
                    return false;
                }
                actionResult=  (this.putMovementOnStack(player,card,actionData))
                break;
            case("ATTACK"):
                this.passes = 0;
                cardResults = this.board.getCard(actionData.attacker);
                card = cardResults[0];
                if (!card){
                    return false;
                }
                cardResults = this.board.getCard(actionData.defender)
                targetCard = cardResults[0]
                if (!targetCard){
                    return false;
                }
                actionResult=  (this.putAttackOnStack(player,card,targetCard,actionData))
                break;
            case("AGILEATTACK"): // client wants to do normal movement then attack
                this.passes = 0;
                cardResults = this.board.getCard(actionData.attacker);
                card = cardResults[0];
                if (!card){
                    console.log('no card')
                    return false;
                }
                cardResults = this.board.getCard(actionData.defender)
                targetCard = cardResults[0]
                if (!targetCard){
                    console.log('no target card')
                    return false;
                }
                // informs that it can correctly attack
                actionResult = this.putAttackOnStack(player,card,targetCard,actionData)
                if (!actionResult){
                    console.log(' attack stack failed')
                    return false;
                }
                actionResult = this.putMovementOnStack(player,card,actionData)
                if (!actionResult){
                    console.log(' movement stack failed')
                    this.stack.pop(); // remove the attack stack if the movement action is not valid
                    this.eventPool = []; // This may cause bugs. reset the event pool from any movement shit the above action may have caused. 
                }

                break;
            case("AGILEMOVE"):
                this.passes = 0;
                cardResults = this.board.getCard(actionData.attacker);
                card = cardResults[0];
                if (!card){
                    console.log('no card')
                    return false;
                }
                cardResults = this.board.getCard(actionData.defender)
                targetCard = cardResults[0]
                if (!targetCard){
                    console.log('no target card')
                    return false;
                }
                // informs that it can correctly attack
                actionResult = this.putMovementOnStack(player,card,actionData)
                if (!actionResult){
                    console.log(' movement stack failed')
                    return false;
                }
                actionResult = this.putAttackOnStack(player,card,targetCard,actionData)
                if (!actionResult){
                    console.log(' attack stack failed')
                    this.stack.pop(); // remove the movement stack if the attack action is not valid
                    this.eventPool = []; // This may cause bugs. reset the event pool from any attack shit the above action may have caused. 
                }
                break
            case("PASS"):
                this.passes+=1;
                this.log(`Player passes priority.`)

                console.log("Checking state based actions");


                // if the actionWasCaused, break
                // checking state based actions
                let actionWasCaused = this.checkStateActions();
                let loopLimit = 0;
                // if stateebased crap occured, then we need to check if the event pool had anything, and add it to stack if so
                while (actionWasCaused && loopLimit < 100){
                    this.checkForEvents();
                    actionWasCaused=this.checkStateActions();
                    loopLimit++;
                }

                // After passing, priority transfers
                this.priority++;
                if (this.priority > this.playerList.length-1){ 
                    this.priority = 0;
                }
                
                // all characters have passed, so priority resets and the first card on stack is resolved
                if (this.passes >= this.playerList.length){
                    console.log("Everyone is passing")
                    if (this.stack.length > 0){
                        console.log("Going to resolve stack action");
                        this.passes = 0;
                        this.resolveStackAction();
                    }else{
                        console.log("Going to new turn");
                        this.nextTurn()
                    }
                    actionResult=  true;
                }else{
                    // character has passed and priority passes to the next character
                    actionResult=  true;
                }
        }
        // Check the event pool to see if anything still exists, if so, put it onto the stack. Then repeat until nothing is in event pool 
        // events have been added here after stuff has beene triggered
        if (actionResult){ // only check for events if it was a valid action
            this.checkForEvents();
        }
        return actionResult;
    }

    checkForEvents(){
        if (this.eventPool.length > 0){
            console.log('checking events')
            // check here to see if we need to make a decision on what goes first, otherwise send them off
            let theStack = this.stack
            function filterEvents(event){
                let newAction = new StackAction(event);
                theStack.push(newAction);
                return false;
            }
            this.eventPool = this.eventPool.filter(filterEvents);
            return true;
        }else{
            return false;
        }
    }

    // Spend energy on a card and place it on stack
    castCard(player,card,actionData){
        let row = null;
        let stackAction = null;
        let targetFailures = null;
        switch(card.data().type[0]){
            case("Entity"):
                if (actionData.row == null){
                    return false;
                }
                row = parseInt(actionData.row);
                if (row == null || row > 4 || row < 0){
                    console.log('invalid row', row)
                    return false;
                }
                // checking if can be casted
                if (player.getDivineConnection(this) < card.data().cost){
                    console.log('not enough energy',player.getDivineConnection(this), card.data().cost)
                    return false;
                }

                // Increase spent energy
                player.spentDivineConnection+= card.data().cost;

                // remove card from hand and place it on the stack
                stackAction = new StackAction({
                    type: "SUMMON",
                    card: card,
                    owner: player,
                    row: row,
                })
                this.stack.push(stackAction);

                player.hand.splice(actionData.index,1); 
                this.log(`Player casts ${card.name}, placing its summon onto the stack..`)

                // check if this generates any casting events, if so throw it into the pool
                this.checkEvents(stackAction,true)

                return true;
                break;
            case("Evocation"):
                // checking if can be casted
                if (player.getDivineConnection(this) < card.data().cost){
                    console.log('not enough energy',player.getDivineConnection(this), card.data().cost)
                    return false;
                }

                // Check if the evocation is valid to target those entities
                if (!actionData.targets){
                    return false;
                }
                let goodValidation = this.checkTargetValidation(player,card,actionData)
                if (!goodValidation){
                    console.log("targeting failure detected")
                    return false;
                }
                // Increase spent energy
                player.spentDivineConnection+= card.data().cost;

                // remove card from hand and place it on the stack
                stackAction = new StackAction({
                    type: "EVOCATION",
                    card: card,
                    owner: player,
                    targets: []
                })
                // push all of the cards onto targets
                for (let targetID of actionData.targets){
                    let card = this.getCard(targetID)[0];
                    stackAction.targets.push(card)
                }

                this.stack.push(stackAction);

                player.hand.splice(actionData.index,1); 
                this.log(`Player casts ${card.name}, placing its spell onto the stack..`)

                // check if this generates any casting events, if so throw it into the pool
                this.checkEvents(stackAction,true)

                return true;

                break;
            default:
                console.log("error, tried to cast card with no casting type")
                return false;
                break;
        }

    }



    // Spend action to move an entity to a different zone
    putMovementOnStack(player,card,actionData){
        let row = null;
        if (actionData.row == null){
            return false;
        }
        row = parseInt(actionData.row);
        if (row == null || row > 4 || row < 0){
            console.log('invalid row', row)
            return false;
        }
        if (!card.data().type.includes('Entity') && !card.data().type.includes('Player')){
            console.log("Tried to move card that was not an entity.")
            return false;
        }
        let startingRow = this.board.getCard(card.id)[1];
        if (startingRow == row){
            console.log("Tried to move card to zone it was already in.")
            return false;            
        }
        if (Math.abs(startingRow-row) > card.calcMovementRange()){
            console.log("Tried to move card to zone further than its movement range.")
            return false;
        }

        if (card.data().exhausted){
            console.log('cant move exhausted card')
            return;
        }

        if (actionData.actiontype != "AGILEMOVE"){ // dont exhaust the user on agile movement, otherwise the attack will fail. The attack will exhaust it for both reasons
            card.addExhaust("Moved",card.id,1)
        }


        let stackAction = new StackAction({
            type: "MOVEENTITY",
            card: card,
            owner: player,
            row: row,
            startingRow: startingRow,
            chainedToTop: false,
        })
        if (actionData.actiontype == "AGILEMOVE"){ // dont exhaust the user on agile movement, otherwise the attack will fail. The attack will exhaust it for both reasons
            stackAction.chainedToTop = true;
        }

        this.stack.push(stackAction);

        this.log(`Player goes to move ${card.name} to zone ${row+1}.`)

        // Check events for character moving here, throw into pool if so

        return true;
    }

    // spend action to attack an entity (in same zone typically)
    putAttackOnStack(player,card,targetCard,actionData){
        if (!card.data().type.includes('Entity')){
            console.log("Tried to attack with card that was not an entity.")
            return false;
        }
        if (!targetCard.data().type.includes('Entity') && !targetCard.data().type.includes('Player')){
            console.log("Tried to attack card that was not an entity.")
            return false;
        }

        let cardRow = this.board.getCard(card.id)[1];
        if (actionData.actiontype=="AGILEATTACK"){ // ensures that attack viability is being counted from their moved position
            cardRow = actionData.row;
        }


        let targetRow = this.board.getCard(targetCard.id)[1];
        if (Math.abs(cardRow - targetRow) > card.calcAttackRange()){
            console.log("Tried to attack card that was out of range.")
            return false;
        }
        if (card.data().exhausted){
            console.log('cant attack with exhausted card')
            return;
        }

        // checking stack for attacks already involving this card
        for (let otherAction of this.stack){
            if (otherAction.type == "ATTACK" && otherAction.card.id == card.id){
                console.log("Tried to attack with a card that was already on the stack.")
                return false;
            }
        }
        if (actionData.actiontype == "AGILEMOVE"){ // exhausting on agile movement
            card.addExhaust("Moved",card.id,1)
        }

        let stackAction = new StackAction({
            type: "ATTACK",
            owner: player,
            card: card,
            targetCard: targetCard,
            row: cardRow,
            targetRow: targetRow,
            chainedToTop: false,
        })
        if (actionData.actiontype=="AGILEATTACK"){ // ensures that attack viability is being counted from their moved position
            stackAction.chainedToTop = true;
        }
        
        this.stack.push(stackAction);

        this.log(`Player goes to move ${card.name} to zone ${cardRow+1}.`)
        // Check events for card attacking targetcard, throw into pool if so
        this.checkEvents(stackAction,true)
        return true;
    }


    // Checks if a target is successful or not.
    checkTargetValidation(player,card,actionData){
        let targetingList = card.calcTargetRequirements();
        for (let i = 0; i < targetingList.length; i++){
            let targetData = targetingList[i]
            let targetID = actionData.targets[i];
            if (!targetID){
                console.log("evocation does not have a target for slot",i)
                return false;
            }
            let goodTarget = this.validateSingleTarget(player,targetData,targetID,actionData.targets)
            if (!goodTarget){
                return false;
            }
        }
        return true
    }

    validateSingleTarget(player,targetData,targetID,allTargets){
        if (!targetID){
            console.log("evocation does not have a target for slot",i)
            return false;
        }
        let targetCard = this.getCard(targetID);
        if (!targetCard){
            console.log("evocation does not have a card for slot",i)
            return false;
        }
        for (let key in targetData.requirements){
            switch(key){
                case("type"):
                    if (!targetCard[0].data().type.includes(targetData.requirements[key])){
                        console.log("denied due to type")
                        return false
                    }
                    break;
                case("unique"):
                    if (targetData.requirements[key] == true && allTargets.firstIndexOf(targetID) != allTargets.lastIndexOf(targetID)){
                        console.log("denied due to unique")
                        return false
                    }
                    break;
                case("zone"):
                    if (targetCard[1]=="board" && !targetData.requirements[key].includes("board")){
                        console.log("denied due to zone")
                        return false
                    }
                    if (targetCard[1]=="hand"&& !targetData.requirements[key].includes("hand")){
                        console.log("denied due to zone")
                        return false
                    }
                    break;
                case("range"):
                    if (targetCard[1]=="board"){
                        let targetRow = this.board.getCard(targetID)[1]
                        if (targetRow == null || Math.abs(player.data(player.id).currentRow - targetRow) > targetData.requirements[key]){
                            console.log("denied due to range")
                            return false
                        }
                    } 
            }
        }
        return true;
    }


    resolveStackAction(){
        let topAction = this.stack.pop();
        topAction.resolve(this);
        while (this.stack.length > 0 && this.stack[this.stack.length-1].chainedToTop){
            topAction=this.stack.pop();
            topAction.resolve(this);
        }
    }


    resolveSpell(stackAction){
        stackAction.card.execute(this,stackAction);
        this.checkEvents(stackAction,false) 
    }

    attackEntity(stackAction){
        // trigger before something would be summoned/when it is being summoned
        let card = null;
        let targetCard = null;
        let boardCardResults = this.board.getCard(stackAction.card.id)
        if (!boardCardResults[0]){
            console.log("Attack fizzles as attacker is no longer on board.")
            return;
        }
        card = boardCardResults[0]
        if (boardCardResults[1] != stackAction.row){
            console.log("Movement fizzles as attacking card has been moved.")
            return;
        }
        boardCardResults = this.board.getCard(stackAction.targetCard.id)
        if (!boardCardResults[0]){
            console.log("Attack fizzles as defender is no longer on board.")
            return;
        }
        targetCard = boardCardResults[0]
        
        if (boardCardResults[1] != stackAction.targetRow){
            console.log("Movement fizzles as defending card has been moved.")
            return;
        }

        if (Math.abs(boardCardResults[1] - stackAction.targetRow) > card.calcAttackRange()){
            console.log("Tried to attack card that was out of range.")
            return false;
        }
        
        if (card.data().attack < 1){
            console.log("Attack fizzles due to less than 1 attack.")
            return;
        }

        this.log(`${card.data().name} attacks ${targetCard.data().name}`)
        card.addExhaust("Attacked",card.id,1)
        card.attack(this,targetCard);

        if (targetCard.data().type.includes("Entity")){
            targetCard.attack(this,card);
        }
        console.log('attacks are done')

        // trigger after movement crap
        this.checkEvents(stackAction,false)

    }

    moveEntity(stackAction){
        // trigger before something would be summoned/when it is being summoned
        let boardCardResults = this.board.getCard(stackAction.card.id)
        if (!boardCardResults[0]){
            console.log("Movement fizzles as the card no longer exists on the board.")
            return;
        }
        if (boardCardResults[1] != stackAction.startingRow){
            console.log("Movement fizzles as card has been moved.")
            return;
        }
        if (Math.abs(boardCardResults[1]-stackAction.row) > boardCardResults[0].calcMovementRange()){
            console.log("Movement fizzles as the card is out of movement range.")
            return;
        }
        
        this.board.moveCard(boardCardResults[0],stackAction.row)
        // trigger after movement crap
        this.checkEvents(stackAction,false)
    }

    summonEntity(stackAction){
        // trigger before something would be summoned/when it is being summoned

        let zoneCard = stackAction.card;
        let boardCard = new zoneCard.boardClass(stackAction.card)
        boardCard.addExhaust("Summoned",boardCard.owner.id,1)
        this.board.addEntity(boardCard,stackAction.row)
        // trigger calls/etb triggers
        this.checkEvents(stackAction,false)
    }
    copyBoardCard(originalCard,owner){
        const newID = this.nextCardID++;
        const zoneClass = zoneCardMap.get(originalCard.data().name);
        let zoneCard = new zoneClass({
            id: newID,
            owner: owner
        })
        const boardClass = boardCardMap.get(originalCard.data().name)
        let copiedCard = new boardClass(zoneCard)
        copiedCard.effects = [];
        for (let effect of originalCard.effects){
            copiedCard.effects.push(effect) // sharing the effects here
        }
        for (let exhaust of originalCard.exhausts){
            copiedCard.exhausts.push(recursiveObjCopy(exhaust))
        }
        copiedCard.abilities = []; // clear the abilities
        for (let ability of originalCard.abilities){
            copiedCard.abilities.push(new ability.class(copiedCard,ability))
        }
        return copiedCard
    }

    copyZoneCardAsBoard(originalCard,owner){
        let newID = this.nextCardID++;
        let zoneClass = zoneCardMap.get(originalCard.data().name);
        let zoneCard = new zoneClass({
            id: newID,
            owner: owner
        })
        let boardClass = boardCardMap.get(originalCard.data().name)
        let copiedCard = new boardClass(zoneCard)
        return copiedCard
    }

    placeCreatedBoardCard(newCard,row){
        this.board.addEntity(newCard,row)
        // trigger etc and create triggers
        let stackAction = new StackAction({ //used as a stack action for purpose of triggering death, does not actually go on stack
            type:"CREATE",
            card: newCard,
        })
        newCard.addExhaust("Copied",newCard.owner.id,1)
        this.checkEvents( stackAction,false)
    }


    checkEvents(stackAction,placingOnStack){
        console.log('checking events for',stackAction.type)
        let foundCard = false;
        for (let player of this.playerList){
            let cards = player.getAllCards();
            for (let card of cards){
                if (stackAction.card && card == stackAction.card){
                    foundCard = true;
                }
                //console.log(card)
                for (let ability of card.abilities){
                    console.log('checking ability of player card')
                    let returnData = ability.trigger(stackAction,placingOnStack,player,this);
                    if (returnData != null){
                        console.log('event triggered')
                        this.eventPool.push({
                            type: "EVENT",
                            owner: card.owner,
                            card: card,
                            ability: ability,
                            savedData: returnData
                        })
                    }
                }    
            }
        }
        for (let card of this.board.getAllCards()){
            if (stackAction.card && card == stackAction.card){
                foundCard = true;
            }
            for (let ability of card.abilities){
                let returnData = ability.trigger(stackAction,placingOnStack,card.owner,this);
                if (returnData){
                    this.eventPool.push({
                        type: "EVENT",
                        owner: card.owner,
                        card: card,
                        ability: ability,
                        savedData: returnData
                    })
                }
            }    
        }
        if (!foundCard){
            for (let ability of stackAction.card.abilities){
                let returnData = ability.trigger(stackAction,placingOnStack,stackAction.card.owner,this);
                if (returnData){
                    this.eventPool.push({
                        type: "EVENT",
                        owner: stackAction.card.owner,
                        card: stackAction.card,
                        ability: ability,
                        savedData: returnData
                    })
                }
            }    
        }

        // Sorting events by Active Player first(?) then nonactive people 
    }

    resolveEvent(stackAction){
        let ability = stackAction.ability;
        ability.execute(stackAction.savedData,this)
    }

    checkStateActions(){
        let triggeredSomething = false;
        console.log('checking state based actions')
        for (let player of this.playerList){
            let cards = player.getAllCards();
            for (let card of cards){
                if (card.checkState(this)){
                    triggeredSomething = true;
                }
                
            }
        }
        for (let card of this.board.getAllCards()){
            if (card.checkState(this)){
                triggeredSomething = true;
            }
        }

        // Sorting events by Active Player first(?) then nonactive people 
        return triggeredSomething
    }

    getCard(cardID){
        let boardSearch = this.board.getCard(cardID);
        if (boardSearch[0] != null){
            return [boardSearch[0],"board"]
        }
        for (let player of this.playerList){
            for (let card of player.hand){
                if (card.id == cardID){
                    return [card,"hand"]
                }
            }
            for (let card of player.deck){
                if (card.id == cardID){
                    return [card,"deck"]
                }
            }
            for (let card of player.grave){
                if (card.id == cardID){
                    return [card,"grave"]
                }
            }
        }
    
        return null;
    }
    
}