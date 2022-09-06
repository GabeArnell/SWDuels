const {Ability_Class} = require("../ability")


module.exports.Ability = class Agile_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()

        this.keyword = "SWIFT";
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
            text: "Swift: Does not take an action to use. May be used in response to another action.",
            keyword: this.keyword
        }
        return resData;
    }

}