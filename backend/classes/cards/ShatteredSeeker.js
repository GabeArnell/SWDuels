const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

module.exports.stats = {
    name: "Shattered Seeker",
    imageName: "shatteredseeker",
    attack: 2,
    health: 1,
    cost: 2,
    type: "Entity"
}

module.exports.Zone_Card = class ShatteredSeeker_Zone extends Zone_Card{
    constructor(data={}){
        super(module.exports.stats,data,module.exports.Board_Card);
    }
}
module.exports.Board_Card = class ShatteredSeeker_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
    }
}
