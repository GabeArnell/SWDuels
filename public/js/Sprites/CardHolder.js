/*
Frame for holding a card in the hand or in the board


*/
class CardHolder extends Sprite {
    constructor(config) {
        super(config);
        this.heldCard = null;
        this.row = null;
        this.column = null;
        this.zone = null;
        this.draggable = false;
        this.zone = config.zone || "N/A";
        this.row = config.row || 0;
    }
    setCard(card) {
        this.heldCard = card;
        card.holder = this;
        card.x = this.x;
        card.y = this.y;
    }
    isBoard() {
        return this.zone == "Board";
    }
    isHand() {
        return this.zone == "Hand";
    }
    isGrave() {
        return this.zone == "Grave";
    }
    isDeck() {
        return this.zone == "Deck";
    }
    async render(ctx, mouse, renderZ) {
        let object = this;
        /*
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
        this.renderZ=renderZ;*/
        if (this.heldCard) {
            this.heldCard.render(ctx, mouse, renderZ);
        }
        return renderZ + 1;
    }
    spriteChildren() {
        if (this.heldCard) {
            return [this.heldCard];
        }
        else {
            return null;
        }
    }
}
//# sourceMappingURL=CardHolder.js.map