const minColumns = 5;
const maxColumns = 25;
class Board extends Sprite {
    constructor(config) {
        super(config);
        this.draggable = false;
        this.matrix = []; // 2d array of card holders
        this.targetRow = null; // row number currently being highlighted
        for (let i = 0; i < 5; i++) {
            this.matrix.push([]);
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
            for (let ward of rowData.wards) {
                let wardSprite = new CardSprite(ward, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
                this.matrix[i][column].setCard(wardSprite);
                column++;
            }
            for (let entity of rowData.entities) {
                let entitySprite = new CardSprite(entity, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
                this.matrix[i][column].setCard(entitySprite);
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
        let columns = minColumns;
        if (this.targetRow != null) {
            ctx.fillStyle = "#7EE9FC";
            let top = 10 + ((SETTINGS.ROWBUFFER + SETTINGS.CARDY) * (this.targetRow));
            let bot = (SETTINGS.ROWBUFFER + SETTINGS.CARDY);
            ctx.fillRect(this.x, top, this.width, bot);
        }
        for (let i = 0; i < this.matrix.length; i++) {
            for (let j = 0; j < columns; j++) {
                if (j < minColumns) {
                    this.matrix[i][j].visible = true;
                    this.matrix[i][j].render(ctx, mouse, renderZ);
                }
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
            ...this.matrix[4]
        ];
        return list;
    }
}
//# sourceMappingURL=Board.js.map