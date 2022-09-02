

module.exports.StackAction = class StackAction{
    
    constructor(build={}){
        this.type = build.type;
        this.owner = build.owner;
        this.chainedToTop = build.chainedToTop || false; // if a stack action is chained to the stack action on top of it it completes immediatly without opportunities for events or swift crap
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
                break;
            case("DEATH"):
                // Death is a triggered event but does not go on stack or actually get resolved

            default:
                if (build.card){
                    this.card = build.card
                }
        }
    }

    resolve(game){
        switch(this.type){
            case("SUMMON"):
                game.summonEntity(this);
                break;
            case("MOVEENTITY"):
                game.moveEntity(this)
                break;
            case("ATTACK"):
                game.attackEntity(this);
                break;
            case("EVOCATION"):
                game.resolveSpell(this)
                break;
            case("EVENT"):
                game.resolveEvent(this);
                break;
        }
    }
    
    data(askingPlayerID){
        let res =  {
            type: this.type,
            owner: true, // player is the owner of this object
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