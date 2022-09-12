var MouseState;
(function (MouseState) {
    MouseState[MouseState["default"] = 0] = "default";
    MouseState[MouseState["hovering"] = 1] = "hovering";
    MouseState[MouseState["dragging"] = 2] = "dragging";
    MouseState[MouseState["targeting"] = 3] = "targeting";
})(MouseState || (MouseState = {}));
class Mouse {
    constructor(myGame) {
        this.x = 0;
        this.y = 0;
        this.canvasObject = null;
        this.dragging = false;
        this.mouseDown = false;
        this.gameParent = null;
        this.dragObject = null;
        this.dragOffset = [0, 0]; //x,y
        this.lastClick = null;
        this.prevHoverObject = null;
        this.gameParent = myGame;
        this.prevHoverObject = null;
        this.lastClick = new Date().getTime();
    }
    over(sprite, mouse) {
        if (!sprite.visible) {
            return false;
        }
        switch (sprite.position) {
            case (PositionReference.topleft):
                if (mouse.x >= sprite.x && mouse.x <= sprite.x + sprite.width && mouse.y >= sprite.y && mouse.y <= sprite.y + sprite.height) {
                    return true;
                }
                else {
                    return false;
                }
            case (PositionReference.center):
                if (mouse.x >= sprite.x - sprite.width / 2 && mouse.x <= sprite.x + sprite.width / 2 && mouse.y >= sprite.y - sprite.height / 2 && mouse.y <= sprite.y + sprite.height / 2) {
                    return true;
                }
                else {
                    return false;
                }
        }
        return false;
    }
    getState() {
        if (this.dragging) { // check if mouse is down
            if (this.mouseDown && this.dragObject.canDrag(this)) {
                //continue to drag
                this.dragObject.x = this.x + this.dragOffset[0];
                this.dragObject.y = this.y + this.dragOffset[1];
                if (this.dragObject.dragging) {
                    this.dragObject.dragging(this);
                }
                return MouseState.dragging;
            }
            else {
                console.log('stopped drag');
                this.dragObject.endDrag(this);
                this.dragObject = null;
                this.dragging = false;
            }
        }
        // check hovering
        let overFunction = this.over;
        let mouse = this;
        let hoverObject = null;
        function checkSprite(sprite) {
            if ((sprite.canDrag(mouse) || sprite.click || sprite.canHover(mouse)) && sprite.visible && overFunction(sprite, mouse)) {
                if (hoverObject && sprite.renderZ > hoverObject.renderZ) {
                    hoverObject = sprite;
                }
                else if (!hoverObject) {
                    hoverObject = sprite;
                }
            }
            if (sprite.canHover(mouse) && hoverObject != sprite) {
                sprite.hovering = false;
                if (sprite == mouse.prevHoverObject) {
                    sprite.endHover(mouse);
                }
                //console.log('closed',sprite.constructor.name, overFunction(sprite,mouse),sprite.visible)
            }
            let list = sprite.spriteChildren();
            if (list) {
                for (let child of list) {
                    checkSprite(child);
                }
            }
        }
        for (let sprite of this.canvasObject.sprites) {
            checkSprite(sprite);
        }
        if (hoverObject && this.mouseDown && hoverObject.canDrag(this) == true && new Date().getTime() > this.lastClick + 1000) {
            this.dragging = true;
            this.dragObject = hoverObject;
            this.dragOffset[0] = this.dragObject.x - this.x;
            this.dragOffset[1] = this.dragObject.y - this.y;
            this.lastClick = new Date().getTime();
            this.dragObject.startDrag(this);
            return MouseState.dragging;
        }
        if (hoverObject && this.mouseDown && hoverObject.click && new Date().getTime() > this.lastClick + 1000) {
            hoverObject.click(this);
            this.lastClick = new Date().getTime();
            return MouseState.hovering;
        }
        if (this.dragObject && this.dragObject.canHover(mouse)) {
            this.dragObject.hovering = true;
            this.prevHoverObject = this.dragObject;
        }
        else if (hoverObject && hoverObject.canHover(mouse)) {
            hoverObject.hovering = true;
            this.prevHoverObject = hoverObject;
        }
        if (hoverObject) {
            //console.log("hovering: ", hoverObject.constructor.name)
            return MouseState.hovering;
        }
        this.prevHoverObject = null;
        return MouseState.default;
    }
    rightClick() {
        if (this.prevHoverObject && this.prevHoverObject.canRightClick(this)) {
            this.prevHoverObject.rightClick(this);
        }
    }
}
//# sourceMappingURL=Mouse.js.map