const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")
const Surge_AbilityClass = require("../abilities/Surge").Ability;
const {Ability_Class} = require("../ability")

module.exports.stats = {
    name: "Figment",
    imageName: "figment",
    attack: 2,
    health: 1,
    cost: 1,
    type: "Entity",
    tribes: [],
}

module.exports.Zone_Card = class Figment_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class Figment_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        //this.abilities.push(new module.exports.Figment_Ability(this))
        this.abilities.push(new Surge_AbilityClass(this))
    }
}

module.exports.Figment_Ability = class Figment_Call_Ability extends Ability_Class {
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "CALL";
        this.class = module.exports.Figment_Ability;
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
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
    execute(savedData,game){
        console.log('saved data',savedData)
        savedData.player.drawCard();
    }
    data(){
        // returning the information of the event
        let resData = {
            text: "Call: Draw a Card",
            keyword: this.keyword
        }
        return resData;
    }

}