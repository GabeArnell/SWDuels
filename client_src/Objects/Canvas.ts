class CanvasScreen{

    public FPS:number = null; //frames rendered per second
    public canvasDOM = null; // the DOM object
    public ctx = null;
    public runInterval = null;

    public mouse:Mouse=null;

    public sprites=[];
    
    constructor(canvasDOM:Object,mouseObject:Mouse){
        this.FPS = SETTINGS.FPS || 10;
        this.canvasDOM = canvasDOM
        this.ctx = this.canvasDOM.getContext("2d");
        this.mouse = mouseObject
    }


    addSprite(child){
        this.sprites.push(child);
    }

    async run(){
        this.runInterval = setInterval(()=>{
            this.renderFrame();
        },1/this.FPS);
    }
    halt(){
        clearInterval(this.runInterval);
    }

    async renderFrame(){
        this.resetFrame()
        let renderZ = 0;
        for (let child of this.sprites){
            if (child.visible){
                renderZ=await child.render(this.ctx,this.mouse,renderZ);
            }
        }
        let mouseState:MouseState = this.mouse.getState();
        switch(mouseState){
            case(MouseState.default):
                this.canvasDOM.style.cursor = 'default'
                break;
            case(MouseState.hovering):
                this.canvasDOM.style.cursor = 'pointer'
                break;
            case(MouseState.dragging):
                this.canvasDOM.style.cursor = 'grabbing'
                break;
            //case(MouseState.targeting):
                //this.canvasDOM.style.cursor = 'crosshair'
                break;

        }
    }

    resetFrame(){
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0,0,SETTINGS.SCREENX,SETTINGS.SCREENY)
    }

    
}