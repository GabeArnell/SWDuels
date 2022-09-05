const {Ability_Class} = require("../ability")


module.exports.Ability = class Agile_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()

        this.keyword = "SURGE";
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
            text: "Surge: Take one ",
            image: "surge",
            keyword: this.keyword
        }
        return resData;
    }

}