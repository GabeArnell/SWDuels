const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")
const {Ability_Class} = require("../ability")

module.exports.stats = {
    name: "Shattered Seeker",
    imageName: "shatteredseeker",
    attack: 2,
    health: 1,
    cost: 1,
    type: "Entity",
    tribes: [],
}

module.exports.Zone_Card = class ShatteredSeeker_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
        
        let parentID = this.id;
        this.abilities = [
        ]


    }
}
module.exports.Board_Card = class ShatteredSeeker_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        this.abilities.push(new module.exports.Broken_Seeker_Ability(this))

    }
}

module.exports.Broken_Seeker_Ability = class Broken_Seeker_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "DEATH";
        this.class = module.exports.Broken_Seeker_Ability
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "DEATH" && stackAction.card.id == this.parentID && stackStatus == "Resolved"){
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,this.parentID )
            return {stackAction: stackAction, player:owner};
        }
        return null;
}
    execute(savedData,game){
        console.log('saved data',savedData)
        savedData.player.drawCard();
    }
    data(){
        // returning the information of the event
        let resData = {
            name: "Shattered Seeker Death",
            text: "Death: Draw a Card",
            image: "death",
            keyword: this.keyword
        }
        return resData;
    }

}