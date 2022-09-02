module.exports.Ability = class Agile_Ability{
    keyword = null;
    constructor(cardParent,copy=null){
        this.keyword = "AGILE";
        this.class = module.exports.Ability;
        this.parentID = cardParent.id;
        if (copy){
            // check copy stuff
        }
    }

    trigger(stackAction,placingOnStack,owner,game){
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