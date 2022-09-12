class DetailOverLay extends Sprite {
    constructor(game, config) {
        super(config);
        this.viewingCard = null;
        this.closeButton = null;
        this.gameParent = null;
        this.cardPointers = null; // the ids of cards I want to point at
        this.cancelTargetButton = null;
        this.targetingSession = null;
        this.possibleTargets = []; // ids of cards that the player can select
        this.possibleTargetRows = []; //what rows are selectable
        this.gameParent = game;
        this.cardPointers = [];
        this.cancelTargetButton = new CancelTargettingButton(this, { visible: false, width: 150, height: 30, x: this.x + 10, y: 10 });
        this.closeButton = new CloseCardDisplayButton(this, { visible: false, width: SETTINGS.STACKX / 2, height: 30, x: this.x + 50, y: 80 + SETTINGS.CARDY * 2 });
    }
    startTargetingSession(cardData, actionData, targetRow = 0, altTargets = null) {
        this.quitTargetingSession();
        this.targetingSession = {
            card: cardData,
            targets: altTargets || cardData.targets,
            index: 0,
            confirmedTargets: [],
            actionData: actionData,
            row: targetRow
        };
        // if it is a prompt the action data[0] is "PROMPT" and the [1] is the callback
        this.checkVisibility();
        this.calcPossibleTargets(this.gameParent.getAllCards(), this.targetingSession.targets[this.targetingSession.index]);
    }
    finishTargetingSession(canceled = false) {
        this.cancelTargetButton.visible = false;
        let session = this.targetingSession;
        if (!session) {
            return;
        }
        if (session.actionData[0] == "ACTION" && session.actionData[1] == "PLAYCARD") {
            if (canceled) {
                this.quitTargetingSession();
                return;
            }
            let sendData = {
                type: "ACTION",
                data: {
                    actiontype: "PLAYCARD",
                    card: session.card.id,
                    row: session.targetRow,
                    targets: this.targetingSession.confirmedTargets
                }
            };
            this.quitTargetingSession();
            this.gameParent.sendPlayerAction(sendData);
            return;
        }
        if (session.actionData[0] == "PROMPT") {
            let callback = session.actionData[1];
            callback(this.targetingSession.confirmedTargets);
            this.quitTargetingSession();
            return;
        }
        if (this.gameParent.state == "CLIENT AGILE") {
            if (canceled) {
                this.quitTargetingSession();
                this.gameParent.state = this.gameParent.viewData.waiting;
                return;
            }
            if (session.actionData[1] == "ATTACK") {
                // checking if skipped, if so just do normal movement
                if (this.targetingSession.confirmedTargets[0] == null) {
                    let sendData = {
                        type: "ACTION",
                        data: {
                            actiontype: "MOVEENTITY",
                            card: session.card.id,
                            row: session.targets[0].originRow
                        }
                    };
                    this.quitTargetingSession();
                    this.gameParent.sendPlayerAction(sendData);
                    return;
                }
                // Send agile attack 
                let sendData = {
                    type: "ACTION",
                    data: {
                        actiontype: "AGILEATTACK",
                        card: session.card.id,
                        attacker: session.card.id,
                        row: session.targets[0].originRow,
                        defender: this.targetingSession.confirmedTargets[0]
                    }
                };
                this.quitTargetingSession();
                this.gameParent.sendPlayerAction(sendData);
            }
            else if (session.actionData[1] == "MOVEENTITY") {
                // checking if they skipped making a movement, if so just do a normal ass attack
                if (this.targetingSession.confirmedTargets[0] == null) {
                    let sendData = {
                        type: "ACTION",
                        data: {
                            actiontype: "ATTACK",
                            attacker: this.gameParent.selectedCard.cardData.id,
                            defender: session.targets[0].defender,
                        }
                    };
                    this.quitTargetingSession();
                    this.gameParent.sendPlayerAction(sendData);
                    return;
                }
                let sendData = {
                    type: "ACTION",
                    data: {
                        actiontype: "AGILEMOVE",
                        card: session.card.id,
                        attacker: session.card.id,
                        row: this.targetingSession.confirmedTargets[0],
                        defender: session.targets[0].defender
                    }
                };
                this.quitTargetingSession();
                this.gameParent.sendPlayerAction(sendData);
            }
        }
    }
    addTarget(cardData, skipped = false) {
        if (skipped) {
            this.targetingSession.confirmedTargets.push(null);
        }
        else {
            this.targetingSession.confirmedTargets.push(cardData.id);
        }
        this.targetingSession.index++;
        if (this.targetingSession.index >= this.targetingSession.targets.length) {
            // send off 
            console.log('sending off targeting play');
            this.finishTargetingSession();
        }
        else {
            this.calcPossibleTargets(this.gameParent.getAllCards(), this.targetingSession.targets[this.targetingSession.index]);
        }
    }
    addTargetRow(row, skipped = false) {
        if (!skipped) {
            this.targetingSession.confirmedTargets.push(row);
        }
        else {
            this.targetingSession.confirmedTargets.push(null);
        }
        this.targetingSession.index++;
        if (this.targetingSession.index >= this.targetingSession.targets.length) {
            // send off 
            console.log('sending off targeting play');
            this.finishTargetingSession();
        }
        else {
            this.calcPossibleTargets(this.gameParent.getAllCards(), this.targetingSession.targets[this.targetingSession.index]);
        }
    }
    // goes through all the given cards, matches it to requiremeents. if it has
    calcPossibleTargets(cards, targetRequirement) {
        this.possibleTargets = [];
        this.possibleTargetRows = [];
        if (!targetRequirement) {
            console.log("Error: Missing any requirements.");
            return;
        }
        if (!targetRequirement.rowSelect) {
            for (let card of cards) {
                let passes = true;
                console.log(card.cardData);
                for (let key in targetRequirement.requirements) {
                    switch (key) {
                        case ("type"):
                            let canTargetType = false;
                            for (let tarType of targetRequirement.requirements[key]) {
                                if (card.cardData.type.includes(tarType)) {
                                    canTargetType = true;
                                }
                            }
                            if (!canTargetType) {
                                console.log("denied due to type");
                                passes = false;
                            }
                            break;
                        case ("unique"):
                            if (targetRequirement.requirements[key] && this.targetingSession.confirmedTargets.includes(card.cardData.id)) {
                                passes = false;
                                console.log("denied due to unique");
                            }
                            break;
                        case ("zone"):
                            if (card.holder.isBoard() && !targetRequirement.requirements[key].includes("board")) {
                                passes = false;
                                console.log("denied due to zone");
                            }
                            if (card.holder.isHand() && !targetRequirement.requirements[key].includes("hand")) {
                                passes = false;
                                console.log("denied due to zone");
                            }
                            break;
                        case ("attackable"):
                            if (card.holder.isBoard() && (card.cardData.type.includes("Entity") || card.cardData.type.includes("Player")) && card.cardData.owner != this.targetingSession.card.owner && Math.abs(card.holder.row - targetRequirement.originRow) <= this.targetingSession.card.attackRange) {
                                //correct!
                                let guardians = this.gameParent.myBoard.checkAttackGuardians(this.targetingSession.card, targetRequirement.originRow);
                                if (guardians.length > 0 && !guardians.includes(card.cardData.id)) {
                                    passes = false;
                                    console.log('cant target due to guardian');
                                }
                            }
                            else {
                                passes = false;
                                console.log("denied due to not being attackable", card.cardData.owner, this.targetingSession.card.owner);
                                console.log(Math.abs(card.holder.row - targetRequirement.originRow) > this.targetingSession.card.attackRange, card.holder.row, targetRequirement.originRow);
                            }
                            break;
                        case ("range"):
                            if (card.holder.isBoard() && Math.abs(card.holder.row - this.gameParent.viewData.player.currentRow) > targetRequirement.requirements[key]) {
                                passes = false;
                                console.log("denied due to range");
                            }
                            break;
                        case ("not"):
                            for (let notKey in targetRequirement.requirements[key]) {
                                console.log(notKey);
                                switch (notKey) {
                                    case ("name"):
                                        if (targetRequirement.requirements[key][notKey].includes(card.cardData.name)) {
                                            if (card.holder.isBoard()) {
                                                console.log("rejected", card.cardData, "doesnt belong in ", targetRequirement.requirements[key][notKey]);
                                            }
                                            else {
                                                console.log('isnt in board');
                                            }
                                            passes = false;
                                        }
                                }
                            }
                            break;
                        case ("inRow"):
                            console.log(targetRequirement.requirements[key]);
                            if (card.holder.isBoard() && targetRequirement.requirements[key].includes(card.holder.row)) {
                                // passes
                            }
                            else {
                                if (card.holder.isBoard()) {
                                    console.log('rejected due to not being in right row');
                                }
                                passes = false;
                            }
                            break;
                    }
                }
                if (passes) {
                    console.log('passes');
                    this.possibleTargets.push(card.cardData.id);
                }
            }
        }
        else if (targetRequirement.rowSelect) {
            // selecting by zone
            for (let i = 0; i < this.gameParent.myBoard.matrix.length; i++) {
                let passes = true;
                let rowList = this.gameParent.myBoard.matrix[i];
                for (let key in targetRequirement.requirements) {
                    switch (key) {
                        case ("moveable"):
                            if (Math.abs(targetRequirement.currentRow - i) > this.targetingSession.card.movementRange) {
                                passes = false;
                                console.log("denied due to type");
                            }
                            break;
                    }
                }
                if (passes) {
                    this.possibleTargetRows.push(i);
                }
            }
        }
        console.log("Valid targets: ", this.possibleTargets);
    }
    quitTargetingSession() {
        this.targetingSession = null;
        this.possibleTargetRows = [];
    }
    openCardView(cardData) {
        this.visible = true;
        this.viewingCard = cardData;
    }
    closeCardView() {
        this.viewingCard = null;
        this.checkVisibility();
    }
    clearPointers() {
        this.cardPointers = [];
        this.checkVisibility();
    }
    setPointers(list) {
        this.cardPointers = list;
        this.checkVisibility();
    }
    addPointer(cardID) {
        if (!this.cardPointers.includes(cardID)) {
            this.cardPointers.push(cardID);
            this.visible = true;
        }
    }
    checkVisibility() {
        if (!this.targetingSession && this.cardPointers.length < 1 && !this.viewingCard) {
            this.visible = false;
        }
        else {
            this.visible = true;
        }
    }
    async render(ctx, mouse, renderZ) {
        let object = this;
        this.renderZ = renderZ;
        if (this.viewingCard) {
            let texture = "/Cards/hand/" + this.viewingCard.imageName + ".png";
            var myImg = await this.getImage(texture);
            ctx.drawImage(myImg, this.x + 50, this.y + 50, SETTINGS.CARDX * 2, SETTINGS.CARDY * 2);
            for (let i = 0; i < this.viewingCard.attachedCards.length; i++) {
                let attachedCard = this.viewingCard.attachedCards[i];
                let newImage = "/Cards/hand/" + attachedCard.imageName + ".png";
                var loadedImg = await this.getImage(newImage);
                ctx.drawImage(loadedImg, this.x + 50 + (SETTINGS.CARDX * 2 + 50), this.y + 50, SETTINGS.CARDX * 2, SETTINGS.CARDY * 2);
            }
            this.closeButton.visible = true;
            await this.closeButton.render(ctx, mouse, renderZ);
        }
        if (this.cardPointers.length > 0) {
            var arrowImage = await this.getImage(SETTINGS.DOWN_ARROW_TEXTURE);
            for (let id of this.cardPointers) {
                for (let cardHolder of this.gameParent.myBoard.spriteChildren()) {
                    if (cardHolder.heldCard && cardHolder.heldCard.cardData.id == id) {
                        // do the highlight
                        ctx.drawImage(arrowImage, cardHolder.x + cardHolder.width / 2 - 50, cardHolder.y - 75, 100, 75);
                    }
                }
            }
        }
        if (this.targetingSession && this.targetingSession.targets[this.targetingSession.index]) {
            let currentPrompt = this.targetingSession.targets[this.targetingSession.index].text;
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "start";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.fillText(currentPrompt, this.x + this.width / 4, this.y + 30);
            ctx.strokeText(currentPrompt, this.x + this.width / 4, this.y + 30);
        }
        if (this.targetingSession && (this.targetingSession.targets[this.targetingSession.index].canSkip || this.targetingSession.targets[this.targetingSession.index].canCancel)) {
            this.cancelTargetButton.visible = true;
            renderZ = await this.cancelTargetButton.render(ctx, mouse, renderZ);
        }
        else {
            this.cancelTargetButton.visible = false;
        }
        return renderZ + 1;
    }
    spriteChildren() {
        return [this.closeButton, this.cancelTargetButton];
    }
}
class CloseCardDisplayButton extends Sprite {
    constructor(parent, config) {
        super(config);
        this.parent = null;
        this.parent = parent;
    }
    click() {
        this.parent.closeCardView();
        this.visible = false;
    }
    async render(ctx, mouse, renderZ) {
        this.renderZ = renderZ;
        this.drawRectangle(ctx, {
            fill: true,
            color: "red"
        });
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText("Close", this.x + this.width / 2, this.y + this.height / 2 + 8);
        return renderZ + 1;
    }
}
class CancelTargettingButton extends Sprite {
    constructor(parent, config) {
        super(config);
        this.parent = null;
        this.parent = parent;
    }
    click() {
        if (this.parent.targetingSession.targets[this.parent.targetingSession.index].canSkip) {
            if (this.parent.targetingSession.targets[this.parent.targetingSession.index].rowSelect) {
                this.parent.addTargetRow(null, true);
            }
            else {
                this.parent.addTarget(null, true);
            }
        }
        else {
            this.parent.finishTargetingSession(true);
        }
    }
    async render(ctx, mouse, renderZ) {
        if (!this.visible) {
            return renderZ;
        }
        this.renderZ = renderZ;
        let text = "Cancel";
        let color = "red";
        if (this.parent.targetingSession.targets[this.parent.targetingSession.index].canSkip) {
            text = "Skip";
            color = "orange";
        }
        this.drawRectangle(ctx, {
            fill: true,
            color: color
        });
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(text, this.x + this.width / 2, this.y + this.height / 2 + 12);
        return renderZ + 1;
    }
}
//# sourceMappingURL=DetailOverlay.js.map