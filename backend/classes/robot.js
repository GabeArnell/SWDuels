
const {Player} = require("./Player")
module.exports.Robot = class Robot extends Player{

    constructor(id,game){
        super(id,id,game)
    }

    decideAction(req,res){
        switch(this.game.waiting){
            case("MULLIGAN"):
                // dont mulligan
                this.game.playerAction(req,res,{
                    player: this.id,
                    data: {
                        type: "MULLIGAN",
                        data: "No"
                    }
                })
                break;
            case("ACTION"):
                // pass
                let summonCard = this.canSummonCard();
                if (false && summonCard){
                    this.game.playerAction(req,res,{
                        player: this.id,
                        data: {
                            type: "ACTION",
                            data: {
                                actiontype: "PLAYCARD",
                                card: summonCard.id,
                                row: 0
                            }
                        }
                    })
                }else{
                    console.log(this.name+" is passing turn")
                    this.game.playerAction(req,res,{
                        player: this.id,
                        data: {
                            type: "ACTION",
                            data: {
                                actiontype: "PASS"
                            }
                        }
                    })
                }
                break;
            
        }
    }

    canSummonCard(){
        for (let card of this.hand){
            if (card.data().cost <= this.getDivineConnection(this.game)){
                return card;
            }
        }
        return null;
    }
}