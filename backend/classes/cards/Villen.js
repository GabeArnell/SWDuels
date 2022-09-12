const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")
const {Ability_Class} = require("../ability")
const Guardian_AbilityClass = require("../abilities/Guardian").Ability;

module.exports.stats = {
    name: "Villen",
    imageName: "villen",
    attack: 2,
    health: 1,
    cost: 1,
    type: "Entity",
    tribes: [],
}

module.exports.Zone_Card = class Villen_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
        
        let parentID = this.id;
        this.abilities = [
        ]


    }
}
module.exports.Board_Card = class Villen_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        this.abilities.push(new module.exports.Villen_Ability(this))
        this.abilities.push(new Guardian_AbilityClass(this))
    }
}

module.exports.Villen_Ability = class Villen_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "DEATH";
        this.class = module.exports.Villen_Ability
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
        for (let player of game.playerList){
            if (player.id != savedData.player.id){
                // heal
                player.playerCard.giveEffect({
                    keyword: "GRANT",
                    health: 3
                })
            }
        }
    }
    data(){
        // returning the information of the event
        let resData = {
            name: "Villen Death",
            text: "Death: Grant enemy Caster 3 health.",
            image: "death",
            keyword: this.keyword
        }
        return resData;
    }

}