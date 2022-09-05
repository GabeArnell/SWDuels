const {Zone_Card} = require("../zone_card")
const {Board_Card} = require("../board_card")

const Agile_AbilityClass = require("../abilities/Agile").Ability;
const Surge_AbilityClass = require("../abilities/Surge").Ability;
const {Ability_Class} = require("../ability")

module.exports.stats = {
    name: "Twinsoul Gnome",
    imageName: "twinsoulgnome",
    attack: 2,
    health: 2,
    cost: 1,
    type: "Entity",
    tribes: ["Fae"]
}

module.exports.Zone_Card = class TwinsoulGnome_Zone extends Zone_Card{
    constructor(data={},Board_Card = null){
        super(module.exports.stats,data,module.exports.Board_Card,Board_Card);
    }
}
module.exports.Board_Card = class TwinsoulGnome_Board extends Board_Card{
    constructor(Zone_Card){
        super(Zone_Card,module.exports.Zone_Card);
        
        this.abilities.push(new module.exports.TwinsoulGnome_Call_Ability(this));
        this.abilities.push(new Agile_AbilityClass(this));
        console.log("my abilities",this.abilities)
    }
}
module.exports.TwinsoulGnome_Call_Ability = class TwinsoulGnome_Call_Ability extends Ability_Class {
    keyword = null;
    constructor(cardParent,copy=null){
        super()
        this.class = module.exports.TwinsoulGnome_Call_Ability;
        this.keyword = "CALL";
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,stackStatus,owner,game){
        if (stackAction.type == "SUMMON" && stackAction.card.id == this.parentID && stackStatus == "Resolved"){
            // if the event should trigger it returns any stored data it wants to keep, which it will get back on the execute phase. 
            //console.log(stackAction.type,' !triggers! this event',stackStatus,stackAction.card.id,parentID )
            return {stackAction: stackAction, player:owner};
        }
        //console.log(stackAction.type,'does not trigger this event',stackStatus,stackAction.card.id,parentID )
        return null;
    }
    execute(savedData,game){
        let boardCard = game.board.getCard(this.parentID);
        if (boardCard[0]){
            // make a copy of the card that is on the board

            let copiedCard = game.copyBoardCard(boardCard[0],savedData.player)
            copiedCard.abilities.push(new Surge_AbilityClass(copiedCard))

            game.placeCreatedBoardCard(copiedCard,boardCard[1])
        }else{
            let cardParent = game.getCard(this.parentID); // we are searching for the ID within the game, so if it died it would get the grave version, not the vestigle board data
            let lastRow = 0;
            if (cardParent.boardCard && cardParent.boardCard.lastRecordedRow != null){
                lastRow = cardParent.boardCard.lastRecordedRow
            }
            if (cardParent){
                let copiedCard = game.copyZoneCardAsBoard(cardParent[0],savedData.player)
                // copy card from a zone
                copiedCard.abilities.push(new Surge_AbilityClass(copiedCard))
                game.placeCreatedBoardCard(copiedCard,lastRow)
            }else{
                console.log('error, no copy target for some wack ass reason shrug')
            }
        }   
        
    }
    data(){
        // returning the information of the event
        let resData = {
            text: "Call: Create a copy of me with Surge.",
            keyword: this.keyword
        }
        return resData;
    }
}