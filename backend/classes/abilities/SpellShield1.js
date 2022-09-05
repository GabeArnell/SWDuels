const {Ability_Class} = require("../ability")

module.exports.Ability = class SpellShield1_Agility extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "SPELLSHIELD";
        this.class = module.exports.Ability;
        this.parentID = cardParent.id;
        this.energyTax = 1;
        this.triggeredStackActions = []; //stack actions that have already been triggered on spell shield. So if a cost
        if (copy){
            // check copy stuff
        }
    }

    
    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "EVOCATION"  && this.parentID == stackAction.targets[0].id && stackAction.card.data(game).owner != stackAction.targets[0].data(game).owner  && stackStatus == "Popping"){
            if (this.triggeredStackActions.includes(stackAction.id)){
                return null;
            }
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,this.parentID )
            this.triggeredStackActions.push(stackAction.id)
            return {stackAction: stackAction, targetCard:stackAction.card};
        }
        //console.log(stackAction.type,'does not trigger this event',stackStatus,stackAction.card.id,parentID )
        return null;
    }
    preresolvePrompt(savedData,game){
        console.log('setting up prompt');
        game.waiting = "PROMPT"
        game.setPrompt(
            `Pay spellshield?`,
            ['Yes','No'],
            savedData.stackAction.owner.id,
            savedData // saved data
        )
        return true; // returns true if the game actually needs to pause for the prompt. Sometimes it doesnt if the prompt is no longer necessary
    }
    execute(savedData,game,response){
        // first check if the card is still on the stack and if it is an enemy card that targets this card etc
        let enemyPlayer = savedData.stackAction.owner;
        if (savedData.stackAction == null || enemyPlayer == null){
            // fizzles
            return;
        }
        if (response == "Yes" && enemyPlayer.getDivineConnection(game) >= this.energyTax){
            enemyPlayer.spentDivineConnection+=this.energyTax;
        }else{
            // checking if the spell only exists on the stack by searching the game for it
            let targetCard = game.getCard(savedData.targetCard.id);
            if (!targetCard || targetCard[1] == "Stack"){
                // send to grave of owner
                savedData.targetCard.owner.sendZoneToGrave(savedData.targetCard);
                // delete the action from the stack
                game.removeActionFromStack(savedData.stackAction.id)
            }
        }
        console.log('Spell shield response was', response)

        // also want to check if the player can even afford to pay the spellshield cost. if not it will just automatically resolve

    }

    data(){
        // returning the information of the event
        let resData = {
            text: "Spellshield "+this.energyTax+": Pay "+this.energyTax+" Or Dispell",
            image: "spellshield",
            keyword: this.keyword
        }
        return resData;
    }

}