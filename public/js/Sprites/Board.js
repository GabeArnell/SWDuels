const minColumns = 5;
const maxColumns = 25;
class Board extends Sprite {
    constructor(config) {
        super(config);
        this.draggable = false;
        this.matrix = []; // 2d array of card holders
        this.targetRow = null; // row number currently being highlighted
        this.rowSelectButtons = [];
        for (let i = 0; i < 5; i++) {
            this.matrix.push([]);
            let top = 50 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * (i));
            let but = new SelectBoardRowButton(this, i, { visible: false, width: SETTINGS.STACKX / 2 + 30, height: 40, x: this.x + 50, y: top });
            this.rowSelectButtons.push(but);
        }
        // adding 25 to each row, only 5 should be visible
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < maxColumns; j++) {
                let holder = new CardHolder({ visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX, inBoard: true, row: i });
                holder.row = i;
                holder.column = j;
                holder.y = 20 + (SETTINGS.ROWBUFFER + SETTINGS.CARDY) * i;
                holder.x = 20 + (SETTINGS.COLUMNBUFFER + SETTINGS.CARDX) * j;
                this.matrix[i].push(holder);
            }
        }
    }
    clearBoard() {
        for (let row of this.matrix) {
            for (let holder of row) {
                holder.heldCard = null;
            }
        }
    }
    populateBoard(newMatrix) {
        for (let i = 0; i < newMatrix.rows.length; i++) {
            let rowData = newMatrix.rows[i];
            let column = 0;
            for (let card of rowData.cards) {
                let cSprite = new CardSprite(card, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
                this.matrix[i][column].setCard(cSprite);
                column++;
            }
        }
    }
    // highlights a row 
    highlightRow(sprite) {
        // check maths on if sprite is over a row (by center of card)
        // then 
        let centerX = sprite.x + sprite.width / 2;
        let centerY = sprite.y + sprite.height / 2;
        if (sprite.position == PositionReference.center) {
            centerX = sprite.x;
            centerY = sprite.y;
        }
        if (centerY > this.y && centerY < this.y + this.height) {
            if (centerY < this.y + 20 + (SETTINGS.ROWBUFFER + SETTINGS.CARDY)) {
                this.targetRow = 0;
            }
            else if (centerY < this.y + 20 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * 2)) {
                this.targetRow = 1;
            }
            else if (centerY < this.y + 20 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * 3)) {
                this.targetRow = 2;
            }
            else if (centerY < this.y + 20 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * 4)) {
                this.targetRow = 3;
            }
            else if (centerY < this.y + 20 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * 5)) {
                this.targetRow = 4;
            }
        }
        else {
            this.targetRow = null;
        }
    }
    async render(ctx, mouse, renderZ) {
        this.renderZ = renderZ;
        // Render the Children
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // background texture
        let backgroundTexture = await this.getImage("/images/DirtPathLand.png");
        let bot = (SETTINGS.ROWBUFFER + SETTINGS.CARDY);
        let textureLength = bot * 2;
        for (let i = 0; i < this.matrix.length; i++) {
            let columns = minColumns;
            let length = this.matrix[i].length;
            if (length > columns) {
                columns = length;
            }
            let top = 10 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * (i));
            for (let slide = 0; slide < length / 2; slide++) {
                ctx.drawImage(backgroundTexture, this.x + (textureLength * slide), top, textureLength, bot);
            }
            if (this.targetRow != null && this.targetRow == i) {
                ctx.fillStyle = "#7EE9FC";
                let top = 10 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * (this.targetRow));
                ctx.fillRect(this.x, top, this.width, bot);
            }
            for (let j = 0; j < columns; j++) {
                if (j < minColumns) {
                    this.matrix[i][j].visible = true;
                    await this.matrix[i][j].render(ctx, mouse, renderZ);
                }
            }
        }
        if (mouse.gameParent.detailOverlay.possibleTargetRows.length > 0) {
            for (let but of this.rowSelectButtons) {
                renderZ = await but.render(ctx, mouse, renderZ);
            }
        }
        return renderZ + 1;
    }
    spriteChildren() {
        let list = [
            ...this.matrix[0],
            ...this.matrix[1],
            ...this.matrix[2],
            ...this.matrix[3],
            ...this.matrix[4],
            ...this.rowSelectButtons
        ];
        return list;
    }
}
class SelectBoardRowButton extends Sprite {
    constructor(parent, row, config) {
        super(config);
        this.parent = null;
        this.row = null;
        this.parent = parent;
        this.row = row;
    }
    click(mouse) {
        this.visible = false;
        if (mouse.gameParent.detailOverlay.possibleTargetRows.includes(this.row)) {
            mouse.gameParent.detailOverlay.addTargetRow(this.row);
        }
    }
    async render(ctx, mouse, renderZ) {
        if (!mouse.gameParent.detailOverlay.possibleTargetRows.includes(this.row)) {
            this.visible = false;
            return renderZ;
        }
        else {
            this.visible = true;
        }
        this.renderZ = renderZ;
        this.drawRectangle(ctx, {
            fill: true,
            color: "orange"
        });
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Select Zone " + (this.row + 1), this.x + this.width / 2, this.y + this.height / 2 + 8);
        return renderZ + 1;
    }
}
//# sourceMappingURL=Board.js.map