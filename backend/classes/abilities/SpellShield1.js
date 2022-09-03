module.exports.Ability = class SpellShield1_Agility{
    keyword = null;
    constructor(cardParent,copy=null){
        this.keyword = "SPELLSHIELD";
        this.class = module.exports.Ability;
        this.parentID = cardParent.id;
        this.triggeredStackActions = []; //stack actions that have already been triggered on spell shield. So if a cost
        if (copy){
            // check copy stuff
        }
    }

    
    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "EVOCATION"  && this.parentID == stackAction.targets[0].id && stackAction.card.data().owner != stackAction.targets[0].data().owner  && stackStatus == "Popping"){
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
            savedData.targetCard.owner.id,
            savedData, // saved data
            this.callBack
        )
        return true; // returns true if the game actually needs to pause for the prompt. Sometimes it doesnt if the prompt is no longer necessary
    }
    execute(savedData,game,response){
        // first check if the card is still on the stack and if it is an enemy card that targets this card etc
        if (savedData.enemyPlayer != this){

        }
        console.log('Spell shield response was', response)

        // also want to check if the player can even afford to pay the spellshield cost. if not it will just automatically resolve

    }

    data(){
        // returning the information of the event
        let resData = {
            text: "Spellshield 1: Pay 1 Or Dispell",
            image: "spellshield",
            keyword: this.keyword
        }
        return resData;
    }

}