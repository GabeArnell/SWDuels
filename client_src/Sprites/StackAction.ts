

class StackAction extends Sprite {

    public data = null;
    public parent:StackHolder = null

    private stopHovering:boolean = false;
    private card:CardSprite = null;
    private targetCard:CardSprite = null;

    constructor(config,actionData,parent:StackHolder){
        super(config)
        this.parent = parent
        this.data = actionData;
        this.stopHovering = false;
        if (actionData.card){
            this.card = new CardSprite(actionData.card,{visible:true,height:SETTINGS.CARDY,width:SETTINGS.CARDX})
            this.card.y = this.parent.y;
            this.card.x = this.parent.x - 25 - SETTINGS.CARDX;
        }
        if (actionData.targetCard){
            this.targetCard = new CardSprite(actionData.targetCard,{visible:true,height:SETTINGS.CARDY,width:SETTINGS.CARDX})
            this.targetCard.y = this.parent.y - (SETTINGS.CARDY/2) - SETTINGS.ROWBUFFER
            this.targetCard.x = this.parent.x - 25 - SETTINGS.CARDX;

            // moving the attacking card down
            this.card.y = this.parent.y + (SETTINGS.CARDY/2) + SETTINGS.ROWBUFFER

        }
    }

    canHover(mouse: Mouse): boolean {
        return true;
    }
    endHover(mouse: Mouse): void {
        this.stopHovering = true;
        // cut off the board highlight
    }

    async render(ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        //console.log('rendering hand')

        // Render the Children
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x, this.y, this.width, this.height)
        let texture=null;
        switch(this.data.type){
            case("SUMMON"):
                ctx.font = "bold 30px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "center"
                ctx.fillText("Summon: "+this.data.card.name,this.x+this.width/2,this.y+this.height/2 );
                ctx.strokeStyle = "black";
                ctx.strokeText("Summon: "+this.data.card.name,this.x+this.width/2,this.y+this.height/2 );
                if (this.hovering){
                    // highlight the row it will be summoned in
                    this.parent.gameParent.myBoard.targetRow = this.data.row;

                    // popping up the card
                    if (this.card){
                        await this.card.render(ctx,mouse,renderZ)
                    }


                }else if (this.stopHovering && this.parent.gameParent.myBoard.targetRow == this.data.row){
                    this.parent.gameParent.myBoard.targetRow=null
                }
                break;
            case("ATTACK"):
                ctx.font = "bold 20px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "center"
                ctx.fillText(this.data.card.name+' attacks '+this.data.targetCard.name,this.x+this.width/2,this.y+this.height/2 );
                ctx.strokeStyle = "black";
                ctx.strokeText(this.data.card.name+' attacks '+this.data.targetCard.name,this.x+this.width/2,this.y+this.height/2 );
                if (this.hovering){
                    // popping up the card
                    if (this.card){
                        await this.card.render(ctx,mouse,renderZ)
                    }
                    if (this.targetCard){
                        await this.targetCard.render(ctx,mouse,renderZ)
                    }
                    texture = await this.getImage(SETTINGS.FIGHT_TEXTURE);
                    ctx.drawImage(texture,this.parent.x - 25 - SETTINGS.CARDX,this.y-(50),100,100);

                }
                break;
            case("MOVEENTITY"):
                ctx.font = "bold 30px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "center"
                ctx.fillText("Move: "+this.data.card.name,this.x+this.width/2,this.y+this.height/2 );
                ctx.strokeStyle = "black";
                ctx.strokeText("Move: "+this.data.card.name,this.x+this.width/2,this.y+this.height/2 );
                if (this.hovering){
                    // highlight the row it will be summoned in
                    this.parent.gameParent.myBoard.targetRow = this.data.row;
                    // popping up the card
                    if (this.card){
                        await this.card.render(ctx,mouse,renderZ)
                    }
                }else if (this.stopHovering && this.parent.gameParent.myBoard.targetRow == this.data.row){
                    this.parent.gameParent.myBoard.targetRow=null
                }
                break;

            case("EVENT"):
                ctx.font = "bold 20px Arial";
                ctx.fillStyle = "white";
                ctx.textAlign = "center"
                ctx.fillText(this.data.data.text,this.x+this.width/2,this.y+this.height/2 );
                ctx.strokeStyle = "black";
                ctx.strokeText(this.data.data.text,this.x+this.width/2,this.y+this.height/2 );
                if (this.hovering){
                    // popping up the card
                    if (this.card){
                        await this.card.render(ctx,mouse,renderZ)
                    }
                    if (this.targetCard){
                        await this.targetCard.render(ctx,mouse,renderZ)
                    }
                }
                break;

        }

        if (this.stopHovering){
            this.stopHovering=false;
        }
        
        return renderZ+1
    }

}