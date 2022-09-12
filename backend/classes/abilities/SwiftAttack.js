const {Ability_Class} = require("../ability")


module.exports.Ability = class Agile_Ability extends Ability_Class{
    keyword = null;
    constructor(cardParent,copy=null){
        super()

        this.keyword = "SWIFTATTACK";
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
            text: "Swift Attack: Entity can attack as a Swift action.",
            keyword: this.keyword,
            image: "swiftattack",
            keywordAbility: true,
        }
        return resData;
    }

}