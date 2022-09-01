class DetailOverLay extends Sprite{

    public viewingCard = null;
    public closeButton:CloseCardDisplayButton = null;
    public gameParent:Game = null;
    public cardPointers:Number[] = null; // the ids of cards I want to point at

    public targetingSession = null;
    public possibleTargets = []; // ids of cards that the player can select

    constructor(game:Game,config){
        super(config);
        this.gameParent = game;
        this.cardPointers = []
        this.closeButton = new CloseCardDisplayButton(this,{visible: true, width: SETTINGS.STACKX/2,height: 30,x: this.x+50, y: 10})
    }

    startTargetingSession(cardData,actionData,targetRow=0){
        this.quitTargetingSession();

        this.targetingSession = {
            card: cardData,
            targets: cardData.targets,
            index: 0,
            confirmedTargets: [], // card ids of the targets
            actionData: actionData,
            row: targetRow
        }
        this.checkVisibility()
        this.calcPossibleTargets(this.gameParent.getAllCards(),this.targetingSession.targets[this.targetingSession.index])
    }

    finishTargetingSession(){
        let session = this.targetingSession;
        if (!session){return;}

        if (session.actionData[0] == "ACTION" && session.actionData[1] == "PLAYCARD"){
            let sendData = {
                type: "ACTION",
                data: {
                    actiontype: "PLAYCARD",
                    card: session.card.id,
                    row: session.targetRow,
                    targets: this.targetingSession.confirmedTargets
                }
            }
            this.quitTargetingSession();
            this.gameParent.sendPlayerAction(sendData)
            return;
        }
    }

    addTarget(cardData){
        this.targetingSession.confirmedTargets.push(cardData.id);

        this.targetingSession.index++;
        if (this.targetingSession.index >= this.targetingSession.targets.length){
            // send off 
            console.log('sending off targeting play');
            this.finishTargetingSession()
        }else{
            this.calcPossibleTargets(this.gameParent.getAllCards(),this.targetingSession.targets[this.targetingSession.index])
        }
    }

    // goes through all the given cards, matches it to requiremeents. if it has
    calcPossibleTargets(cards:CardSprite[],targetRequirement){
        this.possibleTargets = [];
        if (!targetRequirement){
            console.log("Error: Missing any requirements.")
            return;
        }
        for (let card of cards){
            let passes = true;
            console.log(card.cardData)
            for (let key in targetRequirement.requirements){
                switch(key){
                    case("type"):
                        if (card.cardData.type != targetRequirement.requirements[key]){
                            passes = false;
                            console.log("denied due to type")
                        }
                        break;
                    case("unique"):
                        if (targetRequirement.requirements[key] && this.targetingSession.confirmedTargets.includes(card.cardData.id)){
                            passes = false;
                            console.log("denied due to unique")
                        }
                        break;
                    case("zone"):
                        if (card.holder.isBoard() && !targetRequirement.requirements[key].includes("board")){
                            passes = false;
                            console.log("denied due to zone")
                        }
                        if (card.holder.isHand() && !targetRequirement.requirements[key].includes("hand")){
                            passes = false;
                            console.log("denied due to zone")
                        }
                        break;
                    case("range"):
                        if (card.holder.isBoard() && Math.abs(card.holder.row - this.gameParent.viewData.player.currentRow) > targetRequirement.requirements[key]){
                            passes = false;
                            console.log("denied due to range")

                        }
                }
            }

            if (passes){
                this.possibleTargets.push(card.cardData.id);
            }
        }
        console.log("Valid targets: ",this.possibleTargets)
    }

    quitTargetingSession(){
        this.targetingSession = null;
    }


    openCardView(cardData){
        this.visible = true;
        this.viewingCard = cardData
    }
    closeCardView(){
        this.viewingCard = null;
        this.checkVisibility();
        this.quitTargetingSession();
    }

    clearPointers(){
        this.cardPointers = [];
        this.checkVisibility();
    }
    setPointers(list:Number[]){
        this.cardPointers = list;
        this.checkVisibility();
    }
    addPointer(cardID:Number){
        if (!this.cardPointers.includes(cardID)){
            console.log("Pointered added: ",cardID)
            this.cardPointers.push(cardID)
            this.visible = true;
        }
    }

    spriteChildren() {
        return [this.closeButton]
    }

    checkVisibility(){
        if (!this.targetingSession && this.cardPointers.length < 1 && !this.viewingCard){
            this.visible = false;
        }else{
            this.visible = true
        }
    }

    async render(ctx,mouse:Mouse,renderZ:number){
        let object=this;
        this.renderZ=renderZ;

        if (this.viewingCard){
            let texture = "/Cards/hand/"+this.viewingCard.imageName+".png"
            var myImg = await this.getImage(texture);
            ctx.drawImage(myImg,this.x+50,this.y+50,SETTINGS.CARDX*2,SETTINGS.CARDY*2);
            await this.closeButton.render(ctx,mouse,renderZ)
        }

        if (this.cardPointers.length > 0){
            var arrowImage = await this.getImage(SETTINGS.DOWN_ARROW_TEXTURE);
            for (let id of this.cardPointers){
                for (let cardHolder of this.gameParent.myBoard.spriteChildren()){
                    if (cardHolder.heldCard && cardHolder.heldCard.cardData.id == id){
                        // do the highlight
                        ctx.drawImage(arrowImage,cardHolder.x+cardHolder.width/2-50,cardHolder.y-75,100,75)
                    }
                }
            }
        }
        if (this.targetingSession && this.targetingSession.targets[this.targetingSession.index]){
            let currentPrompt = this.targetingSession.targets[this.targetingSession.index].text;
            ctx.font = "bold 30px Arial"
            ctx.textAlign = "center";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.fillText(currentPrompt,this.x+this.width/2,this.y+30)
            ctx.strokeText(currentPrompt,this.x+this.width/2,this.y+30)
        }
        return renderZ+1
    }

}

class CloseCardDisplayButton extends Sprite{
    public parent:DetailOverLay=null

    constructor(parent:DetailOverLay,config){
        super(config)
        this.parent = parent
    }

    click(){
        this.parent.closeCardView();
    }

    async render (ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        this.drawRectangle(ctx,{
            fill: true,
            color: "red"
        })
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center"
        ctx.fillText("Close",this.x+this.width/2,this.y+this.height/2 );

        return renderZ+1
    }
}