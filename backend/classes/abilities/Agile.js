const {Ability_Class} = require("../ability")

module.exports.Ability = class Agile_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()

        this.keyword = "AGILE";
        this.class = module.exports.Ability;
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,stackStatus,owner,game){
        return null;
    }
    execute(savedData,game){
        return null;
    }
    data(){
        // returning the information of the event
        let resData = {
            text: "Agile: Can move and attack in the same action.",
            image: "agile",
            keyword: this.keyword
        }
        return resData;
    }

}