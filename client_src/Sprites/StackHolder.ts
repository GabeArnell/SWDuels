
class StackHolder extends Sprite {

    public list:StackAction[] = null;
    public gameParent:Game = null;

    constructor(config,game:Game){
        super(config)
        this.gameParent = game;
        this.list = []
        this.visible = false;
    }


    clearStack(){
        // clears the list of StackActions
        this.list = [];
        this.visible = false;
    }

    pushStack(newActionData){
        this.visible = true;

        if (this.gameParent.viewData.priority && this.gameParent.viewData.waiting == "ACTION"){
            //this.button.visible = true;
            //this.button.clicked = false;
        }

        let newAction = new StackAction({visible:true,x: this.x,y:this.y+(this.list.length*80),width:this.width,height:50},newActionData,this);
        this.list.push(newAction)
    }


    async render(ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;

        // Render the Children
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, this.width, this.height)
        
        // This is prob fucking up the renderZ as the first child will have the same render
        for (let action of this.list){
            await action.render(ctx,mouse,renderZ)
        }
        
        return renderZ+1
    }

    spriteChildren() {
        return this.list;
    }
}

class PassButton extends Sprite{
    public parent:Game=null
    public clicked:Boolean = false;

    constructor(parent:Game,config){
        super(config)
        this.parent = parent
    }

    click(){
        if (!this.clicked){
            this.clicked = true;
            this.visible = false;
            console.log('resolving')
            if (this.parent.viewData.priority && this.parent.viewData.waiting == "ACTION"){
                this.parent.sendPlayerAction({
                    type: "ACTION",
                    data: {
                        actiontype: "PASS"
                    }
                })
            }
        }
    }

    async render (ctx,mouse:Mouse,renderZ:number){
        this.renderZ=renderZ;
        let color = "blue"
        let text = "Pass"
        if (this.parent.viewData.passes >= this.parent.viewData.otherPlayers.length){
            if (this.parent.myStack.list.length > 0){
                color="orange"
                text="Resolve"
            }else{
                color="green"
                text="End Turn"
            }
        }
        this.drawRectangle(ctx,{
            fill: true,
            color: color
        })
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center"
        ctx.fillText(text,this.x+this.width/2,this.y+this.height/2 );

        return renderZ+1
    }
}