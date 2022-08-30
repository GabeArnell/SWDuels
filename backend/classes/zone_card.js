/*
This represents cards that are in a hand, library, graveyard etc, anything that is not IN the field

*/



module.exports.Zone_Card = class Zone_Card{
    // Stats is information about the card, data is metadata on the card (owner, object id, etc). data also covers stuff that is attached to the card

    constructor(stats,data={},boardClass){
        this.boardClass = boardClass;
        this.stats = stats;
        this.id = data.id || -1;
        this.owner = data.owner || null;
        this.abilities = []
    }

    data(){
        // cost and all other stuff would be calculated here
        let resData = {
            name: this.stats.name,
            imageName: this.stats.imageName,
            cost: this.stats.cost,
            id: this.id,
            type: this.stats.type,
            owner: this.owner.name // this should be a different owner ig
        }
        return resData
    }
}