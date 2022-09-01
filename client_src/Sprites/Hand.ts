const maxHandSize = 5; // 5 cards per row
class Hand extends Sprite{
    public draggable:boolean = false;

    public list:CardHolder[] = []

    constructor(config){
        super(config)
        for (let i = 0; i < 4;i++){
            for (let j = 0; j < maxHandSize;j++){
                let holder = new CardHolder({visible:true,height:SETTINGS.CARDY,width:SETTINGS.CARDX});
                holder.row = j;
                holder.column = 0;
                
                holder.y = this.y + 20 +((SETTINGS.ROWBUFFER+SETTINGS.CARDY+10)*i)
                holder.x = this.x + 20 +(SETTINGS.COLUMNBUFFER+SETTINGS.CARDX)*j
                this.list.push(holder)
            }
        }

    }

    addCard(card:CardSprite){
        for (let holder of this.list){
            if (holder.heldCard == null){
                holder.setCard(card)
                break;
            }
        }
    }
    clearHand(){
        for (let holder of this.list){
            holder.heldCard=null;
        }
    }

    async render(ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        //console.log('rendering hand')

        // Render the Children
        let topper = await this.getImage(SETTINGS.HAND_TOPPER_TEXTURE);
        let topHeight = this.width*.1
        ctx.drawImage(topper,this.x,this.y-topHeight,this.width,topHeight)

        ctx.fillStyle = "#FFF7E5";
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        for (let j = 0; j < this.list.length; j++){
            this.list[j].visible = true
            this.list[j].render(ctx,mouse,renderZ)
        }
        
        
        return renderZ+1
    }

    spriteChildren() {
        return this.list
    }
}