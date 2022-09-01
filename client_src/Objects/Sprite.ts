enum PositionReference{
    topleft,
    center
}

const imageCacheMap = new Map();

class Sprite{
    public x:number = 0;
    public y:number = 0;
    public height:number = 0;
    public width:number=0;
    public renderZ:number=null;
    public position:PositionReference = null;

    public visible:boolean = false;
    public hovering:boolean = false;
    public draggable:boolean = false;

    public selected:boolean = false;
    
    constructor(config){
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.height = config.height || 0;
        this.width = config.width || 0;
        this.position = config.position || PositionReference.topleft;
        this.visible = config.visible || false;
    }

    render(ctx:Object,mouse:Mouse,renderZ:number){
        
    }

    //should prob pre-load all assets or find some other way to duy
    async getImage(link:string){
        if (!imageCacheMap.get(link)){
            let img;
            const imageLoadPromise = new Promise(resolve => {
                img = new Image();
                img.onload = resolve;
                img.src = link;
            });
        
            await imageLoadPromise;
            console.log("image loaded");
        
            imageCacheMap.set(link,img);
            return imageCacheMap.get(link);
        }else{
            return imageCacheMap.get(link);
        }
    }
    
    drawImage(ctx,img){
        switch(this.position){
            case(PositionReference.center):
                ctx.drawImage(img,this.x-this.width/2,this.y-this.height/2,this.width,this.height);
                break;
            case(PositionReference.topleft):
            default:
                ctx.drawImage(img,this.x,this.y,this.width,this.height);
        }
    }

    drawRectangle(ctx,box){
        ctx.lineWidth = box.width
        ctx.fillStyle = box.color;
        ctx.strokeStyle = ctx.fillStyle
        switch(this.position){
            case(PositionReference.center):
                if (!box.fill)
                    ctx.strokeRect(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
                else
                    ctx.fillRect(this.x-this.width/2,this.y-this.height/2,this.width,this.height);
                
                break;
            case(PositionReference.topleft):
            default:
                if (!box.fill)
                    ctx.strokeRect(this.x,this.y,this.width,this.height);
                else
                    ctx.fillRect(this.x,this.y,this.width,this.height);

        }

    }

    collides(sprite:Sprite){ // checks if sprite is overlapping with another specific sprite

        return false;
    }

    canDrag(mouse:Mouse){
        return this.draggable;
    }

    rightClick(mouse:Mouse){
        
    }

    canRightClick(mouse:Mouse){
        return false;
    }

    dragging(mouse:Mouse){

    }
    canHover(mouse:Mouse){
        return false;
    }
    endHover(mouse:Mouse){
        
    }

    startDrag(mouse:Mouse){

    }

    endDrag(mouse:Mouse){

    }

    spriteChildren(){
        return null
    }


}