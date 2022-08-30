const maxHandSize = 5;
class Hand extends Sprite {
    constructor(config) {
        super(config);
        this.draggable = false;
        this.list = [];
        for (let j = 0; j < maxHandSize; j++) {
            let holder = new CardHolder({ visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            holder.row = j;
            holder.column = 0;
            holder.y = this.y + 20 + (SETTINGS.ROWBUFFER + SETTINGS.CARDY) * 0;
            holder.x = this.x + 20 + (SETTINGS.COLUMNBUFFER + SETTINGS.CARDX) * j;
            this.list.push(holder);
        }
    }
    addCard(card) {
        for (let holder of this.list) {
            if (holder.heldCard == null) {
                holder.setCard(card);
                break;
            }
        }
    }
    clearHand() {
        for (let holder of this.list) {
            holder.heldCard = null;
        }
    }
    async render(ctx, mouse, renderZ) {
        this.renderZ = renderZ;
        //console.log('rendering hand')
        // Render the Children
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        for (let j = 0; j < this.list.length; j++) {
            this.list[j].visible = true;
            this.list[j].render(ctx, mouse, renderZ);
        }
        return renderZ + 1;
    }
    spriteChildren() {
        return this.list;
    }
}
//# sourceMappingURL=Hand.js.map