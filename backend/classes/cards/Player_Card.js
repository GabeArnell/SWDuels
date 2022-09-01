const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

module.exports.stats = {
    name: "Player",
    imageName: "PlayerCultist",
    attack: 0,
    health: 25,
    cost: 0,
    type: "Player",
    tribes: [],

    illegal: true, // this card can not be put in decks or drafted/displayed in any way. It is only made via automatic generation
}

module.exports.Zone_Card = class Player_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
        this.name = this.owner.name;
    }
}
module.exports.Board_Card = class Player_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
    }

    calcName(){
        return this.owner.name
    }

    die(game){
        console.log('player is dead! game state will catch this soon')
    }
}
