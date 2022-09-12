const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

module.exports.stats = {
    name: "Gear Man",
    imageName: "gearman",
    attack: 3,
    health: 3,
    cost: 1,
    type: "Entity",
    tribes: [],
    illegal: true, // this card can not be put in decks or drafted/displayed in any way. It is only made via automatic generation
    token: true
}

module.exports.Zone_Card = class GearMan_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class GearMan_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
    }
}

