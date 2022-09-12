/*
    This entity represents a card that exists on the board.


*/
const {StackAction} = require("./StackAction")
module.exports.Board_Card = class Board_Card{

    constructor(zoneCard, zoneClass){
        this.zoneClass = zoneClass
        this.stats = zoneCard.stats;
        this.abilities = [];
        this.attachedCards = [];
        this.kidnappedCards = []
        this.parentCard = null;
        this.id = zoneCard.id;
        this.owner = zoneCard.owner;
        this.lastRecordedRow = null;
        
        this.effects = [
            /*  {
                source: card.id
                keyword: null/silence/damage


            }*/
        ];
        this.exhausts= [/*
            reason: Summoned/Copied/Moved/Attacked/Ability
            source: card.id if ability
            turns: 1 // how many turns this exhaust takes for
        */]

        this.died = false;
    }

    calcHealth(game){
        let baseHealth = this.stats.health;
        let maxHealth = this.stats.health;
        let me = this;
        function checkEffect(effect){
            if (effect.keyword == "DAMAGE"){
                baseHealth -= effect.value;
            }
            if (effect.keyword == "GRANT" && effect.health != null){
                baseHealth+=effect.health;
                maxHealth+=effect.health
            }
            if (effect.keyword == "ATTACH" ){
                let card = me.getAttachedCard(effect.source)
                if (card && card.getEffect){
                    let attachedEffect = card.getEffect(game,this)
                    checkEffect(attachedEffect)    
                }
            }
        }
        for (let effect of this.effects){
            checkEffect(effect)
        }
        return baseHealth
    }
    calcAttack(game){
        let base = this.stats.attack;
        let me = this;
        function checkEffect(effect){
            if (effect.keyword == "GRANT" && effect.attack != null){
                base+=effect.attack
            }
            if (effect.keyword == "ATTACH"){
                let card = me.getAttachedCard(effect.source)
                if (card && card.getEffect){
                    let attachedEffect = card.getEffect(game,this)
                    checkEffect(attachedEffect)    
                }
            }
        }

        for (let effect of this.effects){
            checkEffect(effect)
        }

        if (base < 0){
            return 0;
        }
        return base;
    }

    calcType(){

        return [this.stats.type];
    }

    calcMovementRange(){
        let baseMovement = 0;
        if (this.calcType().includes("Entity") ||this.calcType().includes("Player")) {
            baseMovement = 1;
        }
        return 1;
    }
    calcAttackRange(){
        return 1;
    }
    calcName(){
        return this.stats.name
    }
    calcCost(game){
        if (this.stats.token){
            if (this.calcType().includes("Entity")){
                return Math.floor((this.calcAttack(game)+this.calcHealth(game))/2)
            }else{
                
            }
        }
        return this.stats.cost;
    }
    data(game){
        let resData = {
            name: this.calcName(),
            imageName: this.stats.imageName,
            cost: this.calcCost(game),
            id: this.id,
            type: this.calcType(),
            owner: this.owner.name, 
            attack: this.calcAttack(game),
            health: this.calcHealth(game),
            movementRange: this.calcMovementRange(),
            attackRange: this.calcAttackRange(),
            abilities: [],
            exhausted: false,
            attachedCards: [],
            kidnappedCards: [],
        }
        for (let exhausts of this.exhausts){
            if (exhausts.turns > 0){
                switch(exhausts.reason){
                    case("Summoned"):
                    case("Copied"):
                        if ( !this.hasKeyWord("SURGE")){
                            resData.exhausted = true;
                        }
                        break;
                    case("Moved"):
                    case("Attacked"):
                        resData.exhausted = true;
                        break;
                }
            }
        }
        for (let ability of this.abilities){
            if (ability.isActive(game)){
                resData.abilities.push(ability.data(game));
            }
        }
        for (let card of this.attachedCards){
            resData.attachedCards.push(card.data(game));
        }
        for (let card of this.kidnappedCards){
            resData.kidnappedCards.push(card.data(game));
        }
        return resData
    }

    addExhaust(reason,source,turns=0,extraData={}){
        this.exhausts.push(
            {
                reason: reason,
                source: source,
                turns: turns,
                extraData:extraData
            }
        )
        //console.log('exhausts:',this.exhausts)
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

    attack(game,defender){
        // returns attacking data. may vary based on defender
        return {
            source: this,
            keyword: "DAMAGE",
            value: (this.calcAttack(game))
        }
    }

    hurt(game,attacker,hitObj){
        game.log(`${attacker} deals ${hitObj.value} damage to ${this.data(game).name}`)
        this.effects.push(hitObj)
    }

    checkState(game){
        // check death
        if (this.data(game).health < 1 && (this.data(game).type.includes("Player") ||this.data(game).type.includes("Entity")) ){
            console.log('dying')
            this.die(game);
            return true;
        }

        return null; // false as in nothing was triggered
    }

    addEffect(game,originCard,effectData){
        this.effects.push(effectData)
    }

    // returns an object data given the card attached to it
    getEffect(game,targetCard){
        return null;
    }

    attachCard(boardCard){
        let attachEffect = {
            source: boardCard.id,
            keyword: "ATTACH"
        }
        this.effects.push(attachEffect);
        this.attachedCards.push(boardCard);
        boardCard.parentCard = this
    }
    getAttachedCard(cardID){
        for (let card of this.attachedCards){
            if (card.id == cardID){
                return card;
            }
        }
        return null;
    }

    kidnapCard(game,boardCard){
        boardCard.lastRecordedRow = game.board.getCard(boardCard.id)[1];
        let successfulRemoval = game.board.removeCard(boardCard);
        if (!successfulRemoval){
            console.log('failed to kidnap',boardCard);
            return;
        }
        this.kidnappedCards.push(boardCard);
        let stackAction = new StackAction(
            game,    
            { //used as a stack action for purpose of triggering death, does not actually go on stack
                type:"KIDNAP",
                card: this,
                targetCard: boardCard
            })
        game.checkEvents(stackAction,"Resolved")    
    }

    giveEffect(effect){
        this.effects.push(effect)
    }

    
    // moves
    die(game){
        this.lastRecordedRow = game.board.getCard(this.id)[1];
        let successfulRemoval = game.board.removeCard(this);
        for (let card of this.attachedCards){
            card.owner.sendBoardToGrave(card);
            card.parentCard = null;
        }
        if (successfulRemoval){
            let owner = this.owner;
            owner.sendBoardToGrave(this);
            let stackAction = new StackAction(
            game,    
            { //used as a stack action for purpose of triggering death, does not actually go on stack
                type:"DEATH",
                card: this,
            })
            game.checkEvents( stackAction,"Resolved")    
        }
    }
}