const {Ability_Class} = require("../ability")

module.exports.Ability = class Guardian_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()

        this.keyword = "GUARDIAN";
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
            text: "Guardian: Attacks must target this if able to. Enemy entities can not move out of a shared zone.",
            image: "guardian",
            keyword: this.keyword,
            keywordAbility: true,
        }
        return resData;
    }

}