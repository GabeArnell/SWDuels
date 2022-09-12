const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")
const Swift_AbilityClass = require("../abilities/Swift").Ability;

module.exports.stats = {
    name: "Curse Of Elegance",
    imageName: "curseofelegance",
    attack: 0,
    health: 0,
    cost: 0,
    type: "Hex",
    spellRange: 1,
    tribes: [],
}

module.exports.Zone_Card = class ShatteredSeeker_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
        this.abilities.push(new Swift_AbilityClass(this));
    }
    calcTargetRequirements(){
        let targetList = [
            {
                text: "Select Target Entity.",
                canCancel: true,
                requirements: {
                    type: ["Entity"],
                    zone: ["board"],
                    range: this.calcSpellRange(),
                    unique: false, // if a requiremenet is unique then the card it is targeting can not be targeted by other targets in this list
                }
            }

        ]
        return targetList;
    }

    execute(game,stackAction){
        // check targetting
        let targetList = this.calcTargetRequirements();
        // first target is silenced and has abilities removed from stack if they are there
        if (game.validateSingleTarget(stackAction.owner,targetList[0],stackAction.targets[0].id,stackAction.targets)){
            let targetCard = game.board.getCard(stackAction.targets[0].id);
            if (targetCard[0] == null){
                console.log("Curse of elegance fizzles due to board cant find");
                return;
            }
            game.attachCardToBoardCard(this,targetCard[0])
        }else{
            console.log("Curse of elegance fizzles ig")
        }
    }
}
module.exports.Board_Card = class ShatteredSeeker_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
    }

    getEffect(game,targetCard){
        let effect = {
            keyword:"GRANT",
            attack: -3,
            health: -3,
        }
        
        return effect;
    }
}
