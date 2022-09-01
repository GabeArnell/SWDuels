class CardSprite extends Sprite {
    constructor(cardData, config) {
        super(config);
        this.draggable = true;
        this.texture = 'https://media.discordapp.net/attachments/883861811642921051/960308602382471238/sablewatchtower.png';
        this.holder = null;
        this.cardData = null;
        this.targetRow = null;
        if (cardData.imageName) {
            this.texture = "/Cards/hand/" + cardData.imageName + ".png";
        }
        this.cardData = cardData;
    }
    async render(ctx, mouse, renderZ) {
        if (this.holder && this.holder.isBoard()) {
            this.texture = "/Cards/board/" + this.cardData.imageName + ".png";
        }
        let object = this;
        var myImg = await this.getImage(this.texture);
        if (this.selected) {
            ctx.fillStyle = "orange";
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
        }
        this.drawImage(ctx, myImg);
        if (this.holder && this.holder.isBoard()) {
            let fangs = await this.getImage(SETTINGS.ATTACK_TEXTURE);
            ctx.drawImage(fangs, this.x - 10, this.y + this.height - 30, 40, 40);
            let stamp = await this.getImage(SETTINGS.HEALTH_TEXTURE);
            ctx.drawImage(stamp, this.x + this.width - 30, this.y + this.height - 30, 40, 40);
            ctx.font = "bold 30px Arial";
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText(this.cardData.health, this.x + this.width - 10, this.y + this.height - 2);
            ctx.strokeText(this.cardData.health, this.x + this.width - 10, this.y + this.height - 2);
            ctx.fillText(this.cardData.attack, this.x + 10, this.y + this.height - 2);
            ctx.strokeText(this.cardData.attack, this.x + 10, this.y + this.height - 2);
        }
        // checking if it is being hovered over for fighting
        if (this.hovering && this.holder.isBoard() && mouse.gameParent.selectedCard && this != mouse.gameParent.selectedCard) {
            if (!(mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner)) { // ensures you can not attack yourself
                // check range here
                if (Math.abs(this.holder.row - mouse.gameParent.selectedCard.holder.row) <= mouse.gameParent.selectedCard.cardData.attackRange) {
                    let texture = await this.getImage(SETTINGS.FIGHT_TEXTURE);
                    this.drawImage(ctx, texture);
                }
            }
        }
        // checking if it is a possible selection
        if (mouse.gameParent.detailOverlay.targetingSession && mouse.gameParent.detailOverlay.possibleTargets.includes(this.cardData.id)) {
            let texture;
            if (this.hovering) {
                texture = await this.getImage(SETTINGS.CARD_HOVER_SELECT_FRAME); //300 by 270
            }
            else {
                texture = await this.getImage(SETTINGS.CARD_SELECT_FRAME); //300 by 270
            }
            ctx.drawImage(texture, this.x + this.width / 2 - 100, this.y + this.height / 2 - 90, 200, 180);
        }
        if (this.holder && this.holder.isBoard()) {
            // Name
            if (this.hovering) {
                ctx.font = "bold 30px Arial";
                ctx.textAlign = "center";
                if (mouse.gameParent.viewData.player.name != this.cardData.owner) {
                    ctx.fillStyle = "red";
                    ctx.strokeStyle = "black";
                }
                else {
                    ctx.fillStyle = "blue";
                    ctx.strokeStyle = "black";
                }
                ctx.fillText(this.cardData.name, this.x + this.width / 2, this.y + 10);
                ctx.strokeText(this.cardData.name, this.x + this.width / 2, this.y + 10);
            }
        }
        this.renderZ = renderZ;
        return renderZ + 1;
    }
    click(mouse) {
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard() && !mouse.gameParent.detailOverlay.targetingSession) {
            if (!this.selected) {
                // check if it is a possible target first
                if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner == this.cardData.owner) {
                    mouse.gameParent.selectedCard.selected = false;
                    mouse.gameParent.selectedCard = this;
                    this.selected = true;
                }
                else if (mouse.gameParent.selectedCard && mouse.gameParent.selectedCard.cardData.owner != this.cardData.owner) {
                    // checking card range
                    if (Math.abs(this.holder.row - mouse.gameParent.selectedCard.holder.row) <= mouse.gameParent.selectedCard.cardData.attackRange) {
                        // checking stack
                        let clearStack = true;
                        for (let action of mouse.gameParent.myStack.list) {
                            if (action.data.type == "ATTACK" && action.data.card.id == mouse.gameParent.selectedCard.cardData.id) {
                                clearStack = false;
                            }
                        }
                        if (clearStack) {
                            mouse.gameParent.sendPlayerAction({
                                type: "ACTION",
                                data: {
                                    actiontype: "ATTACK",
                                    attacker: mouse.gameParent.selectedCard.cardData.id,
                                    defender: this.cardData.id,
                                }
                            });
                        }
                    }
                }
                else if (!mouse.gameParent.selectedCard) {
                    mouse.gameParent.selectedCard = this;
                    this.selected = true;
                }
            }
            else {
                mouse.gameParent.selectedCard = null;
                this.selected = false;
            }
        }
        else if (this.cardData && mouse.gameParent.detailOverlay.targetingSession && mouse.gameParent.detailOverlay.possibleTargets.includes(this.cardData.id)) {
            mouse.gameParent.detailOverlay.addTarget(this.cardData);
        }
    }
    rightClick(mouse) {
        console.log('sending to display');
        mouse.gameParent.detailOverlay.openCardView(this.cardData);
    }
    canRightClick(mouse) {
        return true;
    }
    canHover(mouse) {
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard()) {
            return true;
        }
        return true;
    }
    endDrag(mouse) {
        // check if I can actually attempt to place something onto the board
        if (this.holder.isHand() && mouse.gameParent.state == "ACTION" && mouse.gameParent.viewData.player.divineConnection >= (this.cardData.cost) && mouse.gameParent.myBoard.targetRow != null) {
            // can play card. make it go on the stack
            if (this.cardData.targets == null) {
                mouse.gameParent.sendPlayerAction({
                    type: "ACTION",
                    data: {
                        actiontype: "PLAYCARD",
                        card: this.cardData.id,
                        row: mouse.gameParent.myBoard.targetRow
                    }
                });
            }
            else {
                mouse.gameParent.detailOverlay.startTargetingSession(this.cardData, ["ACTION", "PLAYCARD"]);
            }
        }
        else if (this.holder.isHand() && mouse.gameParent.state == "ACTION") {
            console.log("Card costs too much to play or there is no row");
        }
        else if (this.holder.isBoard() && this.selected && mouse.gameParent.state == "ACTION" && mouse.gameParent.myBoard.targetRow != null && mouse.gameParent.myBoard.targetRow != this.holder.row) {
            if (Math.abs(this.holder.row - mouse.gameParent.myBoard.targetRow) <= this.cardData.movementRange) {
                // wants to move to new area
                mouse.gameParent.sendPlayerAction({
                    type: "ACTION",
                    data: {
                        actiontype: "MOVEENTITY",
                        card: this.cardData.id,
                        row: mouse.gameParent.myBoard.targetRow
                    }
                });
                this.selected = false;
            }
        }
        this.x = this.holder.x;
        this.y = this.holder.y;
        mouse.gameParent.myBoard.targetRow = null;
    }
    // should highlight the board rows when it is being dragged
    dragging(mouse) {
        if (this.holder.isHand()) {
            mouse.gameParent.myBoard.highlightRow(this);
        }
        if (this.holder.isBoard()) {
            mouse.gameParent.myBoard.highlightRow(this);
        }
    }
    canDrag(mouse) {
        if (mouse.gameParent.detailOverlay.targetingSession) {
            return false;
        }
        if (mouse.gameParent.state == "ACTION" && this.holder.isHand()) {
            return this.draggable;
        }
        if (mouse.gameParent.state == "ACTION" && this.holder.isBoard() && this.selected) {
            return this.draggable;
        }
        return false;
    }
}
//# sourceMappingURL=CardSprite.js.map