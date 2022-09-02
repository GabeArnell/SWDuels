function rbgToGrey(r,g,b){
    return(Math.floor(r*.299+g*.587+b*.114));
}

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

    hasKeyWord(keyword:String){
        if (!this.cardData){
            return false;
        }
        for (let ability of this.cardData.abilities){
            if (ability.keyword.toLowerCase() == keyword.toLowerCase()){
                return true;
            }
        }
        return false;
    }
    
    async render(ctx,mouse:Mouse,renderZ:number){
        if (this.holder && this.holder.isBoard()){
            this.texture = "/Cards/board/"+this.cardData.imageName+".png"
        }
        if (!this.cardData){
            return renderZ
        }
        let object=this;
        var myImg = await this.getImage(this.texture);
        
        if (this.selected){
            ctx.fillStyle = "orange"
            ctx.fillRect(this.x-5,this.y-5,this.width+10,this.height+10)
        }            
        
        this.drawImage(ctx,myImg);
        if (this.holder && this.cardData.exhausted && this.holder.isBoard()){
            var imgData = ctx.getImageData(this.x,this.y,this.width,this.height);
                                    
            for (let i = 0; i < imgData.data.length;i+=4){
                //let redness = Math.ceil(Math.random()*255);
                let grey = rbgToGrey(imgData.data[i],imgData.data[i+1],imgData.data[i+2]);
                imgData.data[i]=grey;
                imgData.data[i+1]=grey;
                imgData.data[i+2]=grey;
            }
            ctx.putImageData(imgData,this.x,this.y);

            let exhaustTexture = await this.getImage(SETTINGS.EXHAUSTED_TEXTURE);
            ctx.drawImage(exhaustTexture,this.x,this.y,SETTINGS.CARDX,SETTINGS.CARDY)
            
        }
        let nextAbility = 0;
        if (this.holder && this.holder.isBoard()){

            let alreadyDisplayed = []
            // checking abilities
            for (let ability of this.cardData.abilities){
                if (ability.image && !alreadyDisplayed.includes(ability.image)){
                    let abilityImage = await this.getImage("/images/icons/"+ability.image+".png");
                    if (nextAbility == 0){
                        ctx.drawImage(abilityImage,this.x+this.width/2-20,this.y+this.height-30,40,40)
                    }
                    else if (nextAbility == 1){
                        ctx.drawImage(abilityImage,this.x-10,this.y+this.height-70,40,40)
                    }
                    else if (nextAbility == 2){
                        ctx.drawImage(abilityImage,this.x+this.width-30,this.y+this.height-70,40,40)
                    }
                    else if (nextAbility == 3){
                        ctx.drawImage(abilityImage,this.x-10,this.y+this.height-100,40,40)
                    }
                    else if (nextAbility == 4){
                        ctx.drawImage(abilityImage,this.x+this.width-30,this.y+this.height-70,40,40)
                    }
                    alreadyDisplayed.push(ability.image)
                    nextAbility++;
                }else{

                }
            }
            
            let fangs = await this.getImage(SETTINGS.ATTACK_TEXTURE);
            ctx.drawImage(fangs,this.x-10,this.y+this.height-30,40,40)

            let stamp = await this.getImage(SETTINGS.HEALTH_TEXTURE);
            ctx.drawImage(stamp,this.x+this.width-30,this.y+this.height-30,40,40)
            
            ctx.font = "bold 30px Arial"
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.cardData.health,this.x+this.width-10,this.y+this.height-2)
            ctx.strokeText(this.cardData.health,this.x+this.width-10,this.y+this.height-2)

            ctx.fillText(this.cardData.attack,this.x+10,this.y+this.height-2)
            ctx.strokeText(this.cardData.attack,this.x+10,this.y+this.height-2)

        }

        // checking if it is being hovered over for fighting
        if (this.hovering && this.holder.isBoard() && mouse.gameParent.state == "ACTION" && mouse.gameParent.selectedCard && this != mouse.gameParent.selectedCard ){
            if (!mouse.gameParent.selectedCard.cardData.exhausted && !(mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner)){ // ensures you can not attack yourself
                // check range here
                if (Math.abs(this.holder.row - mouse.gameParent.selectedCard.holder.row) <= mouse.gameParent.selectedCard.cardData.attackRange){
                    let texture = await this.getImage(SETTINGS.FIGHT_TEXTURE);
                    this.drawImage(ctx,texture);    
                }
            }
        }

        // checking if it is a possible selection
        if (mouse.gameParent.detailOverlay.targetingSession && mouse.gameParent.detailOverlay.possibleTargets.includes(this.cardData.id)){
            let texture;
            if (this.hovering){
                texture = await this.getImage(SETTINGS.CARD_HOVER_SELECT_FRAME);//300 by 270
            }else{
                texture = await this.getImage(SETTINGS.CARD_SELECT_FRAME);//300 by 270
            }
            ctx.drawImage(texture,this.x+this.width/2-100,this.y+this.height/2-90,200,180)
        }
        if (this.holder && this.holder.isBoard()){
            // Name
            if (this.hovering){
                ctx.font = "bold 30px Arial"
                ctx.textAlign = "center";
                if (mouse.gameParent.viewData.player.name != this.cardData.owner){
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "black";
                }else{
                    ctx.fillStyle = "blue";
                    ctx.strokeStyle = "black";
                }
                ctx.fillText(this.cardData.name,this.x+this.width/2,this.y+10)
                ctx.strokeText(this.cardData.name,this.x+this.width/2,this.y+10)
            }            
        }

        

        this.renderZ=renderZ;
        return renderZ+1
    }


    click(mouse:Mouse){
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard() && !mouse.gameParent.detailOverlay.targetingSession){
            if (!this.selected){
                // check if it is a possible target first
                if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner){
                    mouse.gameParent.selectedCard.selected = false;
                    mouse.gameParent.selectedCard = this;
                    this.selected = true    
                }else if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner != this.cardData.owner){
                    // checking card range
                    if (!mouse.gameParent.selectedCard.cardData.exhausted && Math.abs(this.holder.row - mouse.gameParent.selectedCard.holder.row) <= mouse.gameParent.selectedCard.cardData.attackRange){
                        // checking stack
                        let clearStack = true;
                        for (let action of mouse.gameParent.myStack.list){
                            if (action.data.type == "ATTACK" && action.data.card.id == mouse.gameParent.selectedCard.cardData.id){
                                clearStack = false;
                            }
                        }
                        if (clearStack){
                            if (mouse.gameParent.selectedCard.hasKeyWord("AGILE")){
                                let altTargets = [{
                                    text: "Agile: Select a zone to move to after attacking.",
                                    defender: this.cardData.id,
                                    currentRow: mouse.gameParent.selectedCard.holder.row,
                                    canSkip: true,
                                    rowSelect: true,
                                    requirements: {
                                        moveable: true,
                                    }
                                }]
                                mouse.gameParent.state="CLIENT AGILE" // setting client targetting to 'CLIENT AGILE'
                                mouse.gameParent.detailOverlay.startTargetingSession(mouse.gameParent.selectedCard.cardData,["ACTION","MOVEENTITY"],0,altTargets)            
                            }else{
                                mouse.gameParent.sendPlayerAction({
                                    type: "ACTION",
                                    data: {
                                        actiontype: "ATTACK",
                                        attacker: mouse.gameParent.selectedCard.cardData.id,
                                        defender: this.cardData.id,
                                    }
                                })
                            }
                        }
                    }

                }else if (!mouse.gameParent.selectedCard){
                    mouse.gameParent.selectedCard = this;
                    this.selected = true    
                }
            }else {
                mouse.gameParent.selectedCard = null;
                this.selected = false
            }
        }else if (this.cardData && mouse.gameParent.detailOverlay.targetingSession && mouse.gameParent.detailOverlay.possibleTargets.includes(this.cardData.id)){
            mouse.gameParent.detailOverlay.addTarget(this.cardData)
        }
    }


    rightClick(mouse: Mouse): void {
        console.log('sending to display')
        mouse.gameParent.detailOverlay.openCardView(this.cardData)
    }

    canRightClick(mouse: Mouse): boolean {
        return true;
    }


    canHover(mouse: Mouse): boolean {
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard()){
            return true
        }
        if (mouse.gameParent.state == "CLIENT AGILITY" && mouse.gameParent.detailOverlay.possibleTargetRows.length > 0){
            return false;
        }
        return true;
    }

    endDrag(mouse: Mouse): void {

        // check if I can actually attempt to place something onto the board
        if (this.holder.isHand() && mouse.gameParent.state == "ACTION" && mouse.gameParent.viewData.player.divineConnection >= (this.cardData.cost) && mouse.gameParent.myBoard.targetRow !=null){
            // can play card. make it go on the stack
            if (this.cardData.targets == null){
                mouse.gameParent.sendPlayerAction({
                    type: "ACTION",
                    data: {
                        actiontype: "PLAYCARD",
                        card: this.cardData.id,
                        row: mouse.gameParent.myBoard.targetRow
                    }
                })    
            }else{
                mouse.gameParent.detailOverlay.startTargetingSession(this.cardData,["ACTION","PLAYCARD"])
            }
            
        }
        else if (this.holder.isHand() && mouse.gameParent.state == "ACTION"){
            console.log("Card costs too much to play or there is no row")
        }
        else if (this.holder.isBoard() && this.selected && mouse.gameParent.state == "ACTION" && mouse.gameParent.myBoard.targetRow !=null && mouse.gameParent.myBoard.targetRow != this.holder.row){
            if (Math.abs(this.holder.row - mouse.gameParent.myBoard.targetRow) <= this.cardData.movementRange && !this.cardData.exhausted){
                // wants to move to new area
                // Check if stack exists
                let stack = mouse.gameParent.viewData.stack;
                if (!this.hasKeyWord("AGILE")){
                    console.log('does not have AGILE ig')
                    mouse.gameParent.sendPlayerAction({
                        type: "ACTION",
                        data: {
                            actiontype: "MOVEENTITY",
                            card: this.cardData.id,
                            row: mouse.gameParent.myBoard.targetRow
                        }
                    })
                    this.selected = false;
                }else{
                    // a
                    let altTargets = [{
                        text: "Agile: Select a target to attack.",
                        originRow: mouse.gameParent.myBoard.targetRow,
                        canSkip: true,
                        requirements: {
                            attackable: true,
                        }
                    }]
                    mouse.gameParent.state="CLIENT AGILE" // setting client targetting to 'CLIENT AGILE'
                    mouse.gameParent.detailOverlay.startTargetingSession(this.cardData,["ACTION","ATTACK"],0,altTargets)
                }
                
            }
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
        if (mouse.gameParent.detailOverlay.targetingSession){
            return false;
        }
        if (mouse.gameParent.state == "ACTION" && this.holder.isHand()){
            return this.draggable;
        }
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard() && this.selected){
            return this.draggable;
        }

        return false;

    }
    
   
}