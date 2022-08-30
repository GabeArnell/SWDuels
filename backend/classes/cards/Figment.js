const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

module.exports.stats = {
    name: "Figment",
    imageName: "figment",
    attack: 2,
    health: 1,
    cost: 1,
    type: "Entity"
}

module.exports.Zone_Card = class Figment_Zone extends Zone_Card{
    constructor(data={}){
        super(module.exports.stats,data,module.exports.Board_Card);
    }
}
module.exports.Board_Card = class Figment_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        let parentID = this.id;
        this.abilities = [
            {
                keyword: "CALL",
                // What is checked when the event goes off
                trigger: (stackAction,placingOnStack,owner,game)=>{// placing on stack is false if it just resolved
                    if (stackAction.type == "SUMMON" && stackAction.card.id == parentID && placingOnStack == false){
                        // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
                        console.log(stackAction.type,' !triggers! this event',placingOnStack,stackAction.card.id,parentID )
                        return {stackAction: stackAction, player:owner};
                    }
                    console.log(stackAction.type,'does not trigger this event',placingOnStack,stackAction.card.id,parentID )
                    return null;
                },
                execute:(savedData,game)=>{
                    console.log('saved data',savedData)
                    savedData.player.drawCard();
                },
                data: ()=>{
                    // returning the information of the event
                    let resData = {
                        text: "Call: Draw a Card"
                    }
                    return resData;
                }
            }

        ]
    }
}