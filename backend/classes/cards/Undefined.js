const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

const {Ability_Class} = require("../ability")


module.exports.stats = {
    name: "Undefined",
    imageName: "undefined",
    attack: 4,
    health: 6,
    cost: 1,
    type: "Entity",
    tribes: ["Unbeast"],
}

module.exports.Zone_Card = class Undefined_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class Undefined_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        this.abilities.push(new module.exports.Undefined_Call_Ability(this))
    }
}
module.exports.Undefined_Call_Ability = class Undefined_Call_Ability extends Ability_Class {
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "CALL";
        this.class = module.exports.Undefined_Call_Ability;
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }
    calcTargetRequirements(currentRow){
        let targetList = [
            {
                text: "Kidnap Target Entity.",
                canSkip: true,
                requirements: {
                    type: ["Entity"],
                    zone: ["board"],
                    inRow: [currentRow],
                    not: {
                        name: ["Undefined"]
                    },              
                    unique: false, // if a requiremenet is unique then the card it is targeting can not be targeted by other targets in this list
                }
            }
        ]
        return targetList;
    }


    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "SUMMON" && stackAction.card.id == this.parentID && stackStatus == "Resolved"){
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            //console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,parentID )
            return {stackAction: stackAction, player:owner};
        }
        //console.log(stackAction.type,'does not trigger this event',stackStatus,stackAction.card.id,parentID )
        return null;
    }
    // Asks for data when it is put on stack 
    prepushPrompt(game,stackAction){
        console.log('asking question')
        console.log('setting up prompt');
        game.waiting = "PROMPT"
        let cardSearch = game.board.getCard(this.parentID);
        if (!cardSearch[0]){
            console.log("cant find entity")
            return false;
        }
        game.setPrompt({
            text:`Kidnap target non-Undefined Entity in my Zone?`,
            playerID: game.getPlayer(cardSearch[0].data(game).owner).id,
            savedData: {
                currentRow: cardSearch[1]
            }, // saved data
            status: "Preprompt",
            targets: this.calcTargetRequirements(cardSearch[1])
        })
        return true; // returns true if the game actually needs to pause for the prompt. Sometimes it doesnt if the prompt is no longer necessary
    }
    // Sets data when it has to get stuff from stack
    setPrePushPrompt(savedData,game,stackAction,response){
        if (!response || response[0] == null){return;}
        let cardSearch = game.board.getCard(this.parentID);
        let targetCardSearch = game.board.getCard(response[0]);
        if (!targetCardSearch[0]){
            console.log("cant find target entity")
            return false;
        }

        let targetList = this.calcTargetRequirements(savedData.currentRow);
        // changing the row to whatever my current row is
        targetList[0].inRow = [cardSearch[0]]
        if (game.validateSingleTarget(stackAction.owner,targetList[0],response[0],[])){
            console.log('confirmed valid target')
            // valid target, setting target
            stackAction.targetCard = targetCardSearch[0]
        }
        console.log('finished setting preprompt target')
        return;
    }

    execute(savedData,game,response,stackAction){
        console.log("now kidnapping",stackAction.targetCard.id)
        let cardSearch = game.board.getCard(this.parentID);
        let targetCardSearch = game.board.getCard(stackAction.targetCard.id);
        
        if (!targetCardSearch[0] || targetCardSearch[0] !=stackAction.targetCard ){
            console.log("cant find target entity")
            return false;
        }
        if (!cardSearch[0] || cardSearch[0] != stackAction.card){
            console.log("cant find original entity")
            return false;
        }
        


        console.log('going thru with the kidnapping');
        cardSearch[0].kidnapCard(game,targetCardSearch[0])
    }
    data(data){
        // returning the information of the event
        let resData = {
            text: "Kidnap Entity",
            keyword: this.keyword
        }
        return resData;
    }

}