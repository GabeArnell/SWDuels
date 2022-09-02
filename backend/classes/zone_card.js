/*
This represents cards that are in a hand, library, graveyard etc, anything that is not IN the field

*/



module.exports.Zone_Card = class Zone_Card{
    // Stats is information about the card, data is metadata on the card (owner, object id, etc). data also covers stuff that is attached to the card

    constructor(stats,data={},boardClass,boardCard){
        this.boardClass = boardClass;
        this.stats = stats;
        this.id = data.id || -1;
        //console.log('creating zone card',stats,'data',data)
        this.owner = data.owner || null;
        if (boardCard){
            this.boardCard = boardCard
            this.id = this.boardCard.id;
        }
        this.abilities = []
    }

    calcSpellRange(){
        let baseRange = this.stats.spellRange || 0;
        //

        return baseRange
    }

    calcTargetRequirements(){
        return null;
    }

    calcType(){
        return [this.stats.type];
    }
    
    data(){
        // cost and all other stuff would be calculated here
        //console.log(this)
        let resData = {
            name: this.stats.name,
            imageName: this.stats.imageName,
            cost: this.stats.cost,
            id: this.id,
            type: this.calcType(),
            owner: this.owner.name, // this should be a different owner ig

            range: this.calcSpellRange(),
            targets: this.calcTargetRequirements(),
        }
        
        return resData
    }
    checkState(game){
        return false;
    }

}