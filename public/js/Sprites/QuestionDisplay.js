class QuestionDisplay extends Sprite {
    constructor(config) {
        super(config);
        this.promptText = null;
        this.responses = null;
        this.buttons = null;
        this.promptText = "";
        this.responses = [];
        this.visible = false;
    }
    askQuestion(data) {
        //console.log("printing question: ",data)
        this.buttons = [];
        this.promptText = data.prompt;
        this.responses = data.responses;
        this.visible = true;
        for (let text of this.responses) {
            let i = this.buttons.length;
            let total = data.responses.length;
            let button = new QuestionButton(text, data.callback, this, { visible: true, position: PositionReference.center, width: 200, height: 70 });
            button.y = SETTINGS.BOARDY / 2;
            if (total == 2) {
                if (i == 0) {
                    button.x = (SETTINGS.BOARDX / 2) - 200;
                }
                else {
                    button.x = (SETTINGS.BOARDX / 2) + 200;
                }
            }
            //console.log(button)
            this.buttons.push(button);
        }
    }
    async render(ctx, mouse, renderZ) {
        this.renderZ = renderZ;
        ctx.fillStyle = "grey";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.font = "bold 40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText(this.promptText || "Null", SETTINGS.BOARDX / 2, this.y + 40);
        ctx.strokeText(this.promptText || "Null", SETTINGS.BOARDX / 2, this.y + 40);
        for (let button of this.buttons) {
            button.render(ctx, mouse, renderZ);
        }
        return renderZ + 1;
    }
    spriteChildren() {
        return this.buttons;
    }
}
class QuestionButton extends Sprite {
    constructor(myText, callback, parent, config) {
        super(config);
        this.text = null;
        this.callbackFunction = null;
        this.parent = null;
        this.text = myText;
        this.parent = parent;
        this.callbackFunction = callback;
    }
    click() {
        this.parent.visible = false;
        this.callbackFunction(this.text);
        for (let button of this.parent.buttons) {
            button.visible = false;
        }
        this.parent.buttons = [];
    }
    async render(ctx, mouse, renderZ) {
        this.renderZ = renderZ;
        this.drawRectangle(ctx, {
            fill: true,
            color: "orange"
        });
        ctx.font = "bold 25 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(this.text || "Null", this.x, this.y);
        return renderZ + 1;
    }
}
//# sourceMappingURL=QuestionDisplay.js.map