module.exports.Ability_Class = class Ability{

    constructor(){
        this.delayUntilTurn = 0;
    }

    setDelayTurn(newTurn){
        if (this.delayUntilTurn < newTurn){
            this.delayUntilTurn = newTurn
        }
    }

    isActive(game){
        if (this.delayUntilTurn > game.turn){
            return false;
        }

        return true;
    }
}