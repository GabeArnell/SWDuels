class CardSprite extends Sprite{
    public draggable:boolean = true;
    public texture = 'https://media.discordapp.net/attachments/883861811642921051/960308602382471238/sablewatchtower.png'
    public holder:CardHolder = null;
    public cardData = null;

    public targetRow = null;

    constructor(cardData, config){
        super(config)
        if (cardData.imageName){
            this.texture = "/Cards/hand/"+cardData.imageName+".png"
        }
        this.cardData = cardData;
    }
    
    async render(ctx,mouse:Mouse,renderZ:number){
        let object=this;
        var myImg = await this.getImage(this.texture);
        
        if (this.selected){
            ctx.fillStyle = "red"
            ctx.fillRect(this.x-5,this.y-5,this.width+10,this.height+10)
        }
        this.drawImage(ctx,myImg);
        // checking if there is gona be a fight
        if (this.hovering && this.holder.isBoard() && mouse.gameParent.selectedCard && this != mouse.gameParent.selectedCard ){
            if (!(mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner)){ // ensures you can not attack yourself
                // check range here
                let texture = await this.getImage(SETTINGS.FIGHT_TEXTURE);
                this.drawImage(ctx,texture);    
            }
        }
        this.renderZ=renderZ;
        return renderZ+1
    }


    click(mouse:Mouse){
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard()){
            if (!this.selected){
                if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner){
                    mouse.gameParent.selectedCard.selected = false;
                    mouse.gameParent.selectedCard = this;
                    this.selected = true    
                }else if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner != this.cardData.owner){
                    // offering a fight
                    mouse.gameParent.sendPlayerAction({
                        type: "ACTION",
                        data: {
                            actiontype: "ATTACK",
                            attacker: mouse.gameParent.selectedCard.cardData.id,
                            defender: this.cardData.id,
                        }
                    })
                }else if (!mouse.gameParent.selectedCard){
                    mouse.gameParent.selectedCard = this;
                    this.selected = true    
                }
            }else {
                mouse.gameParent.selectedCard = null;
                this.selected = false
            }
        }
    }
    canHover(mouse: Mouse): boolean {
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard()){
            return true
        }
    }

    endDrag(mouse: Mouse): void {

        // check if I can actually attempt to place something onto the board
        if (this.holder.isHand() && mouse.gameParent.state == "ACTION" && mouse.gameParent.viewData.player.divineConnection >= (this.cardData.cost) && mouse.gameParent.myBoard.targetRow !=null){
            // can play card. make it go on the stack
            mouse.gameParent.sendPlayerAction({
                type: "ACTION",
                data: {
                    actiontype: "PLAYCARD",
                    card: this.cardData.id,
                    row: mouse.gameParent.myBoard.targetRow
                }
            })
        }
        else if (this.holder.isHand() && mouse.gameParent.state == "ACTION"){
            console.log("Card costs too much to play or there is no row")
        }
        else if (this.holder.isBoard() && this.selected && mouse.gameParent.state == "ACTION" && mouse.gameParent.myBoard.targetRow !=null && mouse.gameParent.myBoard.targetRow != this.holder.row){
            // wants to move to new area
            mouse.gameParent.sendPlayerAction({
                type: "ACTION",
                data: {
                    actiontype: "MOVEENTITY",
                    card: this.cardData.id,
                    row: mouse.gameParent.myBoard.targetRow
                }
            })
            this.selected = false;
        }

        this.x = this.holder.x;
        this.y = this.holder.y;
        mouse.gameParent.myBoard.targetRow = null;
    }

    // should highlight the board rows when it is being dragged
    dragging(mouse: Mouse): void {
        if (this.holder.isHand()){
            mouse.gameParent.myBoard.highlightRow(this)
        }
        if (this.holder.isBoard()){
            mouse.gameParent.myBoard.highlightRow(this)
        }
    }

    canDrag(mouse: Mouse): boolean {
        if (mouse.gameParent.state == "ACTION" && this.holder.isHand()){
            return this.draggable;
        }
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard() && this.selected){
            return this.draggable;
        }

        return false;

    }
    
   
}