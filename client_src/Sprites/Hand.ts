const maxHandSize = 5; // 5 cards per row
class Hand extends Sprite{
    public draggable:boolean = false;

    public list:CardHolder[] = []
    public graveList:CardHolder[] = [];
    public deckList:CardHolder[] = [];

    public showing:string = null;

    public graveButton:GraveButton = null;
    public deckButton:DeckButton = null;
    public handButton:HandButton = null;

    constructor(config){
        super(config)
        this.showing = "Hand"
        this.graveButton = new GraveButton(this,{visible:true,height:25,width:25})
        this.graveButton.x = this.x+100;
        this.graveButton.y = this.y-15;

        this.deckButton = new DeckButton(this,{visible:true,height:30,width:25})
        this.deckButton.x = this.x+400;
        this.deckButton.y = this.y-15;

        this.handButton = new HandButton(this,{visible:true,height:30,width:25})
        this.handButton.x = this.x+200;
        this.handButton.y = this.y-15;
        let zoneLists = [this.list,this.graveList,this.deckList]
        for (let list of ["Hand","Grave","Deck"]){
            for (let i = 0; i < 4;i++){
                for (let j = 0; j < maxHandSize;j++){
                    let holder = new CardHolder({visible:true,height:SETTINGS.CARDY,width:SETTINGS.CARDX,zone: list});
                    holder.row = j;
                    holder.column = 0;
                    
                    holder.y = this.y + 20 +((SETTINGS.ROWBUFFER+SETTINGS.CARDY+10)*i)
                    holder.x = this.x + 20 +(SETTINGS.COLUMNBUFFER+SETTINGS.CARDX)*j
                    switch(list){
                        case("Hand"):
                            this.list.push(holder);
                            break;
                        case("Grave"):
                            this.graveList.push(holder);
                            break;
                        case("Deck"):
                            this.deckList.push(holder);
                            break;
                    }
                }
            }
        }

    }

    addHandCard(card:CardSprite){
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
    addGraveCard(card:CardSprite){
        for (let holder of this.graveList){
            if (holder.heldCard == null){
                holder.setCard(card)
                break;
            }
        }
    }
    clearGrave(){
        for (let holder of this.graveList){
            holder.heldCard=null;
        }
    }
    addDeckCard(card:CardSprite){
        for (let holder of this.deckList){
            if (holder.heldCard == null){
                holder.setCard(card)
                break;
            }
        }
    }
    clearDeck(){
        for (let holder of this.deckList){
            holder.heldCard=null;
        }
    }
    resetVisiblity(){
        for (let holder of this.list){
            holder.visible=false;
        }
        for (let holder of this.deckList){
            holder.visible=false;
        }
        for (let holder of this.graveList){
            holder.visible=false;
        }

    }


    async render(ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        //console.log('rendering hand')

        // Render the Top Book imgage
        let topper = await this.getImage(SETTINGS.HAND_TOPPER_TEXTURE);
        let topHeight = this.width*.1
        ctx.drawImage(topper,this.x,this.y-topHeight,this.width,topHeight)

        ctx.fillStyle = "#FFF7E5";
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        let targetList = this.list;
        if (this.showing == "Deck"){
            targetList = this.deckList;
        }
        if (this.showing == "Grave"){
            targetList = this.graveList;
        }
        for (let j = 0; j < targetList.length; j++){
            targetList[j].visible = true
            targetList[j].render(ctx,mouse,renderZ)
        }
        renderZ+1
        this.graveButton.render(ctx,mouse,renderZ);
        renderZ+1
        this.deckButton.render(ctx,mouse,renderZ);
        renderZ+1
        this.handButton.render(ctx,mouse,renderZ);

        return renderZ+1
    }

    spriteChildren() {
        let children = [...this.list,this.handButton,this.graveButton,this.deckButton];
        if (this.showing == "Deck"){
            children = [...this.deckList,this.handButton,this.graveButton,this.deckButton]
        }
        if (this.showing == "Grave"){
            children = [...this.graveList,this.handButton,this.graveButton,this.deckButton]
        }

        return children
    }

    cardLists(){
        return [...this.list,...this.graveList,...this.deckList]
    }
}

class GraveButton extends Sprite{
    public parent:Hand=null
    constructor(parent:Hand,config){
        super(config)
        this.parent = parent
    }

    click(){
        console.log("Showing grave")
        this.parent.resetVisiblity()
        this.parent.showing = "Grave"
    }

    async render (ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        let image = await this.getImage(SETTINGS.GRAVE_ICON)
        this.drawImage(ctx,image);

        let graveCount = mouse.gameParent.viewData.player.grave.length;
        ctx.font = "18 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "start"
        ctx.fillText(graveCount,this.x+30,this.y+20 );


        return renderZ+1
    }
}
class DeckButton extends Sprite{
    public parent:Hand=null
    constructor(parent:Hand,config){
        super(config)
        this.parent = parent
    }

    click(){
        console.log("Showing deck")
        this.parent.resetVisiblity()
        this.parent.showing = "Deck"
    }

    async render (ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        let image = await this.getImage(SETTINGS.DECK_ICON)
        this.drawImage(ctx,image);

        let deckCount = mouse.gameParent.viewData.player.deck.length;
        ctx.font = "18 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "start"
        ctx.fillText(deckCount,this.x+30,this.y+25 );


        return renderZ+1
    }
}

class HandButton extends Sprite{
    public parent:Hand=null
    constructor(parent:Hand,config){
        super(config)
        this.parent = parent
    }

    click(){        
        console.log("Showing hand")
        this.parent.resetVisiblity()
        this.parent.showing = "Hand"
    }

    async render (ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        let image = await this.getImage(SETTINGS.HAND_ICON)
        this.drawImage(ctx,image);

        let handCount = mouse.gameParent.viewData.player.hand.length;
        ctx.font = "18 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "start"
        ctx.fillText(handCount,this.x+30,this.y+25 );


        return renderZ+1
    }
}

