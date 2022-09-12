const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

const {Ability_Class} = require("../ability")
const GearManBoard = require("./GearMan").Board_Card;
const GearManZone = require("./GearMan").Zone_Card;

module.exports.stats = {
    name: "Factory Gate",
    imageName: "factorygate",
    attack: 0,
    health: 0,
    cost: 1,
    type: "Ward",
    tribes: []
}

module.exports.Zone_Card = class FactoryGate_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class FactoryGate_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        
        this.abilities.push(new module.exports.FactoryGate_EndTurn_Ability(this));
    }
}
module.exports.FactoryGate_EndTurn_Ability = class FactoryGate_Ability extends Ability_Class {
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.class = module.exports.TwinsoulGnome_Call_Ability;
        this.keyword = "ENDTURN";
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "ENDTURN" && stackStatus == "Added"){
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            //console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,parentID )
            let boardCard = game.board.getCard(this.parentID);
            if (!boardCard[0] || boardCard[1] < 0){
                return null;
            }
            let owner = game.getPlayer(boardCard[0].data(game).owner)
            let row = boardCard[1]
            return {owner: owner, row:row };
        }
        //console.log(stackAction.type,'does not trigger this event',stackStatus,stackAction.card.id,parentID )
        return null;
    }
    execute(savedData,game){
        let owner = savedData.owner;
        let zoneCopy = new GearManZone({
            id: game.nextCardID++,
            owner: owner
        })
        console.log("ZONE COPY", zoneCopy)
        let boardCopy = new GearManBoard(zoneCopy);
        game.placeCreatedBoardCard(boardCopy,savedData.row);
    }
    data(){
        // returning the information of the event
        let resData = {
            text: "Create a 3/3 Gear Man in my Zone.",
            keyword: this.keyword
        }
        return resData;
    }
}