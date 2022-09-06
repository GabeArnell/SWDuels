const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")
const {Ability_Class} = require("../ability")
const Surge_AbilityClass = require("../abilities/Surge").Ability;

const {StackAction} = require("../StackAction")
module.exports.stats = {
    name: "Minesweeper",
    imageName: "minesweeper",
    attack: 1,
    health: 4,
    cost: 0,
    type: "Entity",
    tribes: [],
}

module.exports.Zone_Card = class Minesweeper_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class Minesweeper_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        this.abilities.push(new module.exports.Minesweeper_Ability(this))
        this.abilities.push(new Surge_AbilityClass(this));

    }
}

module.exports.Minesweeper_Ability = class Minesweeper_Ability extends Ability_Class {
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.keyword = "ON DAMAGE";
        this.class = module.exports.Minesweeper_Ability;
        this.parentID = cardParent.id;
        this.damageActions = []; // damage actions I've already scanned and triggered off of
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,stackStatus,owner,game){
        let myCard = game.getCard(this.parentID);
        if (!myCard){
            return null;
        }
        myCard = myCard[0]
        if (stackAction.type == "DAMAGE" && stackAction.card.data(game).owner == myCard.data(game).owner && stackAction.card.id != this.parentID && stackStatus == "Popping"){
            if (this.damageActions.includes(stackAction.id) || stackAction.hitObj.value < 1){ // skips if no damage is being dealt
                console.log('skipped damage')
                return null;
            }
            if (stackAction.hitObj.tags && stackAction.hitObj.tags.includes("minesweeper")){
                return null;
            }
            let targetCardBoard = game.board.getCard(stackAction.card.id)
            let myCardBoard = game.board.getCard(this.parentID)
            if (targetCardBoard[0] == null || myCardBoard[0] == null || targetCardBoard[1] != myCardBoard[1]){
                return null
            }
            this.damageActions.push(stackAction.id)
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            //console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,parentID )
            console.log('triggering minesweeper for ',myCard.data(game).owner)
            return {stackAction: stackAction, hitObj: stackAction.hitObj};
        }
        //console.log(stackAction.type,'does not trigger this event',stackStatus,stackAction.card.id,parentID )
        return null;
    }
    preresolvePrompt(savedData,game){
        if (savedData.hitObj.value < 1){
            console.log('no sweeping')
            return false;
        }
        let myCard = game.getCard(this.parentID);
        if (!myCard){
            console.log('no card for sweeper', this.parentID)
            return false;
        }
        myCard = myCard[0]
        let myOwner = game.getPlayer(myCard.data(game).owner);
        console.log('setting up minesweeper prompt');
        game.waiting = "PROMPT"
        game.setPrompt(
            `Redirect damage to minesweeper?`,
            [0,savedData.hitObj.value],
            myOwner.id,
            savedData // saved data
        )
        return true; // returns true if the game actually needs to pause for the prompt. Sometimes it doesnt if the prompt is no longer necessary
    }
    execute(savedData,game,response){
        console.log('Minesweeper triggers!')
        let myCard = game.getCard(this.parentID);
        if (!myCard || myCard[1].toLowerCase() != 'board'){
            console.log('no card for sweeper', this.parentID)
            return false;
        }
        myCard = myCard[0]
        if (!parseInt(response)){
            return null;
        }
        let damageNumber = parseInt(response)
        if (damageNumber > savedData.hitObj.value){
            damageNumber = savedData.hitObj.value
        }
        if (damageNumber < 0){
            return;
        }
        // reduce the value by the amount minesweeper takes
        savedData.hitObj.value -= damageNumber;
        // add new damage for minesweeper

        let redirectedDamage = new StackAction(game,{
            type:"DAMAGE",
            card: myCard,
            hitObj: {
                source: savedData.hitObj.source,
                value: damageNumber,
                tags: ["minesweeper"]
            },
            owner: game.getPlayer(myCard.data(game).owner),
        })
        game.stack.push(redirectedDamage)    

        console.log('swapped to ',damageNumber)
    }
    data(){
        // returning the information of the event
        let resData = {
            text: "Mineswept",
            keyword: this.keyword
        }
        return resData;
    }

}