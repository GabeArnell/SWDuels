var PositionReference;
(function (PositionReference) {
    PositionReference[PositionReference["topleft"] = 0] = "topleft";
    PositionReference[PositionReference["center"] = 1] = "center";
})(PositionReference || (PositionReference = {}));
const imageCacheMap = new Map();
class Sprite {
    constructor(config) {
        this.x = 0;
        this.y = 0;
        this.height = 0;
        this.width = 0;
        this.renderZ = null;
        this.position = null;
        this.visible = false;
        this.hovering = false;
        this.draggable = false;
        this.selected = false;
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.height = config.height || 0;
        this.width = config.width || 0;
        this.position = config.position || PositionReference.topleft;
        this.visible = config.visible || false;
    }
    render(ctx, mouse, renderZ) {
    }
    //should prob pre-load all assets or find some other way to duy
    async getImage(link) {
        if (!imageCacheMap.get(link)) {
            let img;
            const imageLoadPromise = new Promise(resolve => {
                img = new Image();
                img.onload = resolve;
                img.src = link;
            });
            await imageLoadPromise;
            console.log("image loaded");
            imageCacheMap.set(link, img);
            return imageCacheMap.get(link);
        }
        else {
            return imageCacheMap.get(link);
        }
    }
    drawImage(ctx, img) {
        switch (this.position) {
            case (PositionReference.center):
                ctx.drawImage(img, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                break;
            case (PositionReference.topleft):
            default:
                ctx.drawImage(img, this.x, this.y, this.width, this.height);
        }
    }
    drawRectangle(ctx, box) {
        ctx.lineWidth = box.width;
        ctx.fillStyle = box.color;
        switch (this.position) {
            case (PositionReference.center):
                if (!box.fill)
                    ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                else
                    ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
                break;
            case (PositionReference.topleft):
            default:
                if (!box.fill)
                    ctx.strokeRect(this.x, this.y, this.width, this.height);
                else
                    ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
    collides(sprite) {
        return false;
    }
    canDrag(mouse) {
        return this.draggable;
    }
    dragging(mouse) {
    }
    canHover(mouse) {
        return false;
    }
    endHover(mouse) {
    }
    startDrag(mouse) {
    }
    endDrag(mouse) {
    }
    spriteChildren() {
        return null;
    }
}
//# sourceMappingURL=Sprite.js.map