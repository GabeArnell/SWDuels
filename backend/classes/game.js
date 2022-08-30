const {Player} = require("./player")
const {Robot} = require("./Robot")
const {StackAction} = require("./StackAction")

const {Board} = require("./board")
/*
    MULLIGAN, // waiting for the player to mulligan
    ACTION, // player has priority, waiting for them to take an action

*/


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
        this.gameLog = []

        for (let id of playerIDs){
            if (id.startsWith("Robot")){
                let player = new Robot(id,this);
                this.playerList.push(player);
            }
            else{
                let player = new Player(id,'Player'+this.playerList.length,this);
                this.playerList.push(player);
            }
        }
        this.board = new Board()
        this.turn = 0;
        this.priority = 0// Math.random() > .5?0:1 // sets to 0 or 1
        this.waiting = "MULLIGAN"
    }

    log(text){
        this.gameLog.push(text)
    }

    nextTurn(){
        this.turn++;
        this.passes = 0;
        this.priority = 0;// this should alternate technically but w/e
        this.log(`Turn ${this.turn} begins.`)
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
            board: this.board.data(),
            player: myPlayer.data(this),
            otherPlayers: [],
            passes: this.passes,

            stack: [],

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

        // check if waiting on a Robot, if so do the Robot's turn. Otherwise send response back
        if (this.playerList[this.priority].id.startsWith("Robot")){
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
            case("PASS"):
                this.passes+=1;
                this.log(`Player passes priority.`)

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
        }
        return actionResult;
    }

    // Spend energy on a card and place it on stack
    castCard(player,card,actionData){
        let row = null;
        switch(card.stats.type){
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
                let stackAction = new StackAction({
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
        if (card.data().type != 'Entity'){
            console.log("Tried to move card that was not an entity.")
            return false;
        }
        // remove card from hand and place it on the stack
        let stackAction = new StackAction({
            type: "MOVEENTITY",
            card: card,
            owner: player,
            row: row,
            startingRow: this.board.getCard(card.id)[1]
        })
        this.stack.push(stackAction);

        player.hand.splice(actionData.index,1); 
        console.log('new length', player.hand.length)
        this.log(`Player goes to move ${card.name} to zone ${row+1}.`)

        // Check events for character moving here, throw into pool if so

        return true;
    }

    // spend action to attack an entity (in same zone typically)
    putAttackOnStack(player,card,targetCard,actionData){
        let row = null;
        if (card.data().type != 'Entity'){
            console.log("Tried to attack with card that was not an entity.")
            return false;
        }
        if (targetCard.data().type != 'Entity'){
            console.log("Tried to attack card that was not an entity.")
            return false;
        }

        let cardRow = this.board.getCard(card.id)[1];
        let targetRow = this.board.getCard(targetCard.id)[1];
        if (cardRow != targetRow){
            console.log("Tried to attack card that was out of range.")
            return false;
        }

        // remove card from hand and place it on the stack
        let stackAction = new StackAction({
            type: "ATTACK",
            owner: player,
            card: card,
            targetCard: targetCard,
            row: row,
            targetRow: targetRow
        })
        this.stack.push(stackAction);

        this.log(`Player goes to move ${card.name} to zone ${row+1}.`)
        // Check events for card attacking targetcard, throw into pool if so
        this.checkEvents(stackAction,true)
        return true;
    }


    resolveStackAction(){
        let topAction = this.stack.pop();
        topAction.resolve(this)
    }


    attackEntity(stackAction){

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
        if (Math.abs(boardCardResults[1]-stackAction.row) != 1){
            console.log("Movement fizzles as the card is out of range.")
            return;
        }
        
        this.board.moveEntity(boardCardResults[0],stackAction.row)
        // trigger after movement crap
        this.checkEvents(stackAction,false)
    }

    summonEntity(stackAction){
        // trigger before something would be summoned/when it is being summoned

        let zoneCard = stackAction.card;
        let boardCard = new zoneCard.boardClass(stackAction.card)
        this.board.addEntity(boardCard,stackAction.row)
        // trigger calls/etb triggers
        this.checkEvents(stackAction,false)

    }


    checkEvents(stackAction,placingOnStack){
        console.log('checking events for',stackAction.type)
        for (let player of this.playerList){
            let cards = player.getAllCards();
            for (let card of cards){
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

        // Sorting events by Active Player first(?) then nonactive people 
    }

    resolveEvent(stackAction){
        let ability = stackAction.ability;
        ability.execute(stackAction.savedData,this)
    }

}