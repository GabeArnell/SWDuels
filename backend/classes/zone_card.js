/*
This represents cards that are in a hand, library, graveyard etc, anything that is not IN the field

*/



module.exports.Zone_Card = class Zone_Card{
    // Stats is information about the card, data is metadata on the card (owner, object id, etc). data also covers stuff that is attached to the card

    constructor(stats,data={},boardClass,boardCard){
        this.boardClass = boardClass;
        this.stats = stats;
        this.id = data.id || -1;
        this.attachedCards = [];
        this.parentCard = null;
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
    
    data(game){
        // cost and all other stuff would be calculated here
        //console.log(this)
        let resData = {
            name: this.stats.name,
            imageName: this.stats.imageName,
            cost: this.stats.cost,
            id: this.id,
            type: this.calcType(),
            owner: this.owner.name, // this should be a different owner ig
            abilities: [],
            range: this.calcSpellRange(),
            targets: this.calcTargetRequirements(),
            attachedCards: []
        }
        for (let ability of this.abilities){
            if (ability.isActive(game)){
                resData.abilities.push(ability.data(game));
            }
        }
        
        return resData
    }
    // searches abilities for the keyword
    hasKeyWord(keyword){
        for (let ability of this.abilities){
            if (ability.keyword.toLowerCase() == keyword.toLowerCase()){
                return true;
            }
        }
        return false;
    }
    
    checkState(game){
        return false;
    }

}