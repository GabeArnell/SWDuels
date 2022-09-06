
const {Player} = require("./Player")
const doNothing = false;
module.exports.Robot = class Robot extends Player{

    constructor(id,startingRow,game){
        super(id,id,startingRow,game)
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
                if (!doNothing && summonCard){
                    this.game.playerAction(req,res,{
                        player: this.id,
                        data: {
                            type: "ACTION",
                            data: {
                                actiontype: "PLAYCARD",
                                card: summonCard.id,
                                row: this.game.board.getCard(this.playerCard.id)[1], // plays to the row the robot's current avatar is in
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
            if (card.data(this.game).cost <= this.getDivineConnection(this.game) && card.data(this.game).type.includes("Entity")){
                if (this.game.stack.length > 0 && !card.hasKeyWord("SWIFT")){
                    continue;
                }
                return card;
            }
        }
        return null;
    }
}