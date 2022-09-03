

module.exports.StackAction = class StackAction{
    
    constructor(id,build={}){
        this.id = id
        this.type = build.type;
        this.owner = build.owner;
        this.chained = build.chained || false; // if a stack action is chained to the stack action on top of it it completes immediatly without opportunities for events or swift crap
        this.preresolvePrompt = null;
        switch(this.type){
            case("MOVEENTITY"):
                this.startingRow = build.startingRow;
            case("SUMMON"):
                this.card = build.card;
                this.row = build.row || 0
                break;
            case("ATTACK"):
                this.card = build.card;
                this.targetCard = build.targetCard;
                this.row = build.row;
                this.targetRow = build.targetRow;
                break;
            case("EVOCATION"): 
                this.card = build.card;
                this.targets = build.targets;
                break;
            case("EVENT"):
                this.card = build.card;
                this.ability = build.ability;
                this.savedData = build.savedData;
                if (this.savedData.targetCard){
                    this.targetCard = this.savedData.targetCard
                }
                if (this.ability.preresolvePrompt){
                    this.preresolvePrompt = this.ability.preresolvePrompt
                }
                break;
            case("DEATH"):
                // Death is a triggered event but does not go on stack or actually get resolved

            default:
                if (build.card){
                    this.card = build.card
                }
        }
    }

    resolve(game,promptResponse=null){
        switch(this.type){
            case("SUMMON"):
                game.summonEntity(this,promptResponse);
                break;
            case("MOVEENTITY"):
                game.moveEntity(this,promptResponse)
                break;
            case("ATTACK"):
                game.attackEntity(this,promptResponse);
                break;
            case("EVOCATION"):
                game.resolveSpell(this,promptResponse)
                break;
            case("EVENT"):
                game.resolveEvent(this,promptResponse);
                break;
        }
    }
    
    data(askingPlayerID){
        let res =  {
            type: this.type,
            owner: true, // player is the owner of this object
            chained: this.chained,
            id: this.id,
        }
        switch(this.type){
            case("MOVEENTITY"):
                res.startingRow = this.startingRow;
            case("SUMMON"):
                res.card = this.card.data();
                res.row = this.row;
                break;
            case("ATTACK"):
                res.card = this.card.data();
                res.targetCard = this.targetCard.data();
                res.row = this.row;
                res.targetRow = this.targetRow;
                break;
            case("EVOCATION"):
                res.card = this.card.data();
                res.targets = [];
                for (let target of this.targets){
                    res.targets.push(target.data())
                }
            case("EVENT"):
                if (this.card){
                    res.card = this.card.data();
                }
                if (this.targetCard){
                    res.targetCard = this.targetCard.data();
                }
                if (this.ability){
                    res.data = this.ability.data();
                }
                break;
                
        }
        if (askingPlayerID != this.owner.id){
            res.owner = false;
        }
        return res;
    }
}