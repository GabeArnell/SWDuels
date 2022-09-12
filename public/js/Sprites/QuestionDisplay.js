class QuestionDisplay extends Sprite {
    constructor(config) {
        super(config);
        this.promptText = null;
        this.responses = null;
        this.buttons = null;
        this.numberCounter = null;
        this.counterMax = null;
        this.counterMin = null;
        this.promptText = "";
        this.responses = [];
        this.visible = false;
        this.numberCounter = 0;
        this.counterMax = 0;
        this.counterMin = 0;
    }
    askQuestion(data) {
        //console.log("printing question: ",data)
        this.buttons = [];
        this.promptText = data.prompt;
        this.responses = data.responses;
        this.visible = true;
        this.numberCounter = null;
        if (typeof (data.responses[0]) == "number") {
            this.numberCounter = data.responses[0];
            this.counterMin = data.responses[0];
            this.counterMax = data.responses[data.responses.length - 1];
            let addButton = new IncreaseButton(this, { visible: true, position: PositionReference.center, width: 70, height: 70 });
            let subtractButton = new DecreaseButton(this, { visible: true, position: PositionReference.center, width: 60, height: 70 });
            let confirmButton = new QuestionButton('N/A', data.callback, this, { visible: true, position: PositionReference.center, width: 100, height: 70 });
            addButton.x = (SETTINGS.BOARDX / 2) + 200;
            addButton.y = SETTINGS.BOARDY / 2;
            subtractButton.y = SETTINGS.BOARDY / 2;
            subtractButton.x = (SETTINGS.BOARDX / 2) - 200;
            confirmButton.x = (SETTINGS.BOARDX / 2);
            confirmButton.y = SETTINGS.BOARDY / 2;
            this.buttons.push(addButton);
            this.buttons.push(subtractButton);
            this.buttons.push(confirmButton);
            console.log('number prompt!');
        }
        else {
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
        if (this.parent.numberCounter != null) {
            this.callbackFunction(this.parent.numberCounter);
        }
        else {
            this.callbackFunction(this.text);
        }
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
        if (this.parent.numberCounter != null) {
            this.text = this.parent.numberCounter.toString();
        }
        ctx.fillText(this.text || "Null", this.x, this.y);
        return renderZ + 1;
    }
}
class IncreaseButton extends Sprite {
    constructor(parent, config) {
        super(config);
        this.parent = null;
        this.parent = parent;
    }
    click() {
        if (this.parent.numberCounter < this.parent.counterMax) {
            this.parent.numberCounter++;
        }
    }
    async render(ctx, mouse, renderZ) {
        if (this.parent.numberCounter >= this.parent.counterMax) {
            return renderZ;
        }
        this.renderZ = renderZ;
        this.drawRectangle(ctx, {
            fill: true,
            color: "orange"
        });
        ctx.font = "bold 25 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("+1", this.x, this.y);
        return renderZ + 1;
    }
}
class DecreaseButton extends Sprite {
    constructor(parent, config) {
        super(config);
        this.parent = null;
        this.parent = parent;
    }
    click() {
        if (this.parent.numberCounter > this.parent.counterMin) {
            this.parent.numberCounter--;
        }
    }
    async render(ctx, mouse, renderZ) {
        if (this.parent.numberCounter <= this.parent.counterMin) {
            return renderZ;
        }
        this.renderZ = renderZ;
        this.drawRectangle(ctx, {
            fill: true,
            color: "orange"
        });
        ctx.font = "bold 25 Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("-1", this.x, this.y);
        return renderZ + 1;
    }
}
//# sourceMappingURL=QuestionDisplay.js.map