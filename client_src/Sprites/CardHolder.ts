/*
Frame for holding a card in the hand or in the board


*/


class CardHolder extends Sprite{

    public heldCard:CardSprite = null;
    public row:number = null;
    public column:number = null;

    private inBoard = null;

    constructor(config){
        super(config)
        this.draggable = false
        this.inBoard = config.inBoard || false
        this.row = config.row || 0;
    }

    setCard(card:CardSprite){
        this.heldCard = card;
        card.holder = this;
        card.x = this.x;
        card.y = this.y;
    }

    isBoard(){
        return this.inBoard
    }
    isHand(){
        return !this.inBoard
    }

    async render(ctx,mouse:Mouse,renderZ:number){
        let object=this;


        if (this.heldCard != null&& this.heldCard.cardData.owner != mouse.gameParent.viewData.player.name){
            this.drawRectangle(ctx,{
                color: "#FF0000",
                width: 3,
            })
        }else if (this.heldCard){
            this.drawRectangle(ctx,{
                color: "black",
                width: 3,
            })
        }
        this.renderZ=renderZ;
        
        if (this.heldCard){
            this.heldCard.render(ctx,mouse,renderZ);
        }

        return renderZ+1
    }

    spriteChildren() {
        if (this.heldCard){
            return[this.heldCard]
        }else{
            return null
        }
    }
}