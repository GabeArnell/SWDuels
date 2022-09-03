/*
    This entity represents a card that exists on the board.


*/
const {StackAction} = require("./StackAction")
module.exports.Board_Card = class Board_Card{

    constructor(zoneCard, zoneClass){
        this.zoneClass = zoneClass
        this.stats = zoneCard.stats;
        this.abilities = [];
        this.id = zoneCard.id;
        this.owner = zoneCard.owner;
        this.lastRecordedRow = null;
        this.effects = [
            /*  {
                source: card.id
                keyword: null/silence


            }*/
        ];
        this.hits = [
            /*
                source: (card.id)
                value: (damage dealt)

            */
        ];
        this.exhausts= [/*
            reason: Summoned/Copied/Moved/Attacked/Ability
            source: card.id if ability
            turns: 1 // how many turns this exhaust takes for
        */]

        this.died = false;
    }

    calcHealth(){
        let baseHealth = this.stats.health;
        for (let hit of this.hits){
            baseHealth -= hit.value;
        }
        return baseHealth
    }
    calcAttack(){
        return this.stats.attack;
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
        return 0;
    }
    calcName(){
        return this.stats.name
    }

    data(game){
        let resData = {
            name: this.calcName(),
            imageName: this.stats.imageName,
            cost: this.stats.cost,
            id: this.id,
            type: this.calcType(),
            owner: this.owner.name, 
            attack: this.calcAttack(),
            health: this.calcHealth(),
            movementRange: this.calcMovementRange(),
            attackRange: this.calcAttackRange(),
            abilities: [],
            exhausted: false,
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
            resData.abilities.push(ability.data())
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
        console.log('exhausts:',this.exhausts)
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
        // deals damage equal to this cards attack to the defender
        defender.hurt(game,this,{
            source: this.id,
            value: (this.calcAttack())
        })
    }

    hurt(game,attacker,hitObj){
        game.log(`${attacker} deals ${hitObj.value} damage to ${this.data().name}`)
        this.hits.push(hitObj)
    }

    checkState(game){
        // check death
        if (this.data().health < 1){
            console.log('dying')
            this.die(game);
            return true;
        }

        return null; // false as in nothing was triggered
    }

    addEffect(game,originCard,effectData){
        this.effects.push(effectData)
    }
    
    // moves
    die(game){
        this.lastRecordedRow = game.board.getCard(this.id)[1];
        let successfulRemoval = game.board.removeCard(this)
        if (successfulRemoval){
            let owner = this.owner;
            owner.sendBoardToGrave(this);
            let stackAction = new StackAction(
            game.nextStackActionID++,    
            { //used as a stack action for purpose of triggering death, does not actually go on stack
                type:"DEATH",
                card: this,
            })
            game.checkEvents( stackAction,false)    
        }
    }
}