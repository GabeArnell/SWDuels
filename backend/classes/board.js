/*
This class handles the board zone of the game


*/
module.exports.Board = class Board {


    matrix = null;

    constructor(game){
        this.matrix = []  
        this.gameParent = game  
        for (let i = 0; i < 5; i++){
            this.matrix.push({
                cards: []
            })
        }
    }

    addEntity(entity,row){
        this.matrix[row].cards.push(entity)
    }
    

    data(game){
        let resData = {
            rows: []
        }
        for (let row of this.matrix){
            let rowData = {
                cards: []
            }
            for (let card of row.cards){
                rowData.cards.push(card.data(game))
            }
            resData.rows.push(rowData);
        }
        return resData;
    }

    // searches all of the zones for a card with the given id and returns it. Returns [card, row-it-was-found-in]
    getCard(cardID){
        let card = null;
        let foundRow = null;
        // searching board
        let i = 0;
        function checkAttachedCards(parentCard){
            for (let card of parentCard.attachedCards){
                if (card.id == cardID){
                    return card;
                }
            }
        }
        for (let row of this.matrix){
            for (let c of row.cards){
                if (c.data(this.gameParent).id == cardID){
                    card = c;
                    foundRow = i;
                }
                let attachmentResult = checkAttachedCards(c);
                if (attachmentResult != null){
                    card = attachmentResult;
                    foundRow = -1;
                }
            }
            i++;
        }

        return [card,foundRow];
    }

    getAllCards(){
        let list = []
        for (let row of this.matrix){
            for (let c of row.cards){
                list.push(c)
                for (let attached of c.attachedCards){
                    list.push(attached);
                }
            }
        }
        return list;
    }


    // returns all enemy guardians within card's attack range that it must target if it does attack
    checkAttackGuardian(card,row){
        let guardians = [];
        for (let r =0; r < this.matrix.length;r++){
            for (let targetCheck of this.matrix[r].cards){
                if (card.data(this.gameParent).owner != targetCheck.data(this.gameParent).owner){
                    if (targetCheck.hasKeyWord("GUARDIAN") && Math.abs(row-r) <= card.data(this.gameParent).attackRange ){
                        guardians.push(targetCheck.id)
                    }
                }
            }
        }
        return guardians
    }
    checkMoveGuardian(card,row){
        for (let r =0; r < this.matrix.length;r++){
            for (let targetCheck of this.matrix[r].cards){
                if (card.data(this.gameParent).owner != targetCheck.data(this.gameParent).owner){
                    if (targetCheck.hasKeyWord("GUARDIAN") && row == r ){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    moveCard(card,newRow){
        let game = this.gameParent
        function filter(testCard){
            if (testCard.data(game).id == card.data(game).id){
                return false;
            }
            return true;
        }
        //removed it
        for (let row of this.matrix){
            row.cards = row.cards.filter(filter);
        }
        // placing it
        this.matrix[newRow].cards.push(card)
    }

    removeCard(card){
        let game = this.gameParent
        let didRemove = false;
        function filter(testCard){
            if (testCard.data(game).id == card.data(game).id){
                didRemove = true;
                return false;
            }
            return true;
        }
        for (let row of this.matrix){
            row.cards = row.cards.filter(filter);
        }
        return didRemove;
    }
}