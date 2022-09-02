const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

module.exports.stats = {
    name: "Quell",
    imageName: "quell",
    attack: 0,
    health: 0,
    cost: 0,
    type: "Evocation",
    spellRange: 3,
    tribes: [],
}

module.exports.Zone_Card = class ShatteredSeeker_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
        
        let parentID = this.id;
        this.abilities = [
            

        ]
    }
    calcTargetRequirements(){
        let targetList = [
            {
                text: "Select Target Entity.",
                canCancel: true,
                requirements: {
                    type: "Entity",
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
            console.log(`Quelled ${stackAction.targets[0].data().name}`)
            function abilityFilter(ability){
                console.log('removing ability',ability)
                return false;
            }
            stackAction.targets[0].abilities = stackAction.targets[0].abilities.filter(abilityFilter)
            // removing its ability events from stack
            function stackFilter(testAction){
                if (testAction.card && testAction.card == stackAction.targets[0]){
                    return false;
                }
                return true;
            }
            game.stack = game.stack.filter(stackFilter)
        }else{
            console.log("Quell fizzles ig")
        }
    }
}
module.exports.Board_Card = class ShatteredSeeker_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
    }
}
