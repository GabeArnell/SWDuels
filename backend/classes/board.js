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
        for (let row of this.matrix){
            for (let c of row.cards){
                if (c.data(this.gameParent).id == cardID){
                    card = c;
                    foundRow = i;
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
            }
        }
        return list;
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