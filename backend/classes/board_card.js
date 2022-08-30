/*
    This entity represents a card that exists on the board.


*/
module.exports.Board_Card = class Board_Card{



    constructor(zoneCard, zoneClass){
        this.zoneClass = zoneClass
        this.stats = zoneCard.stats;
        this.exhausted = true;
        this.abilities = []
        this.id = zoneCard.id;
        this.owner = zoneCard.owner;
    }

    calcHealth(){
        return this.stats.health
    }

    data(){
        let resData = {
            name: this.stats.name,
            imageName: this.stats.imageName,
            cost: this.stats.cost,
            id: this.id,
            type: this.stats.type,
            owner: this.owner.name, 
            attack: this.stats.attack,
            health: this.calcHealth(),
        }
        return resData
    }
}