/*
This class handles the board zone of the game


*/
module.exports.Board = class Board {


    matrix = null;

    constructor(){
        this.matrix = []    
        for (let i = 0; i < 5; i++){
            this.matrix.push({
                wards: [],
                entities: []
            })
        }
    }

    addEntity(entity,row){
        this.matrix[row].entities.push(entity)
    }
    

    data(playerID){
        let resData = {
            rows: []
        }
        for (let row of this.matrix){
            let rowData = {
                wards: [],
                entities: [],
            }
            for (let ward of row.wards){
                rowData.wards.push(ward.data(playerID))
            }
            for (let entity of row.entities){
                rowData.entities.push(entity.data(playerID))
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
            for (let c of row.entities){
                if (c.data().id == cardID){
                    card = c;
                    foundRow = i;
                }
            }
            for (let c of row.wards){
                if (c.data().id == cardID){
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
            for (let c of row.entities){
                list.push(c)
            }
            for (let c of row.wards){
                list.push(c)
            }
        }
        return list;
    }


    moveEntity(card,newRow){
        function filter(testCard){
            if (testCard.data().id == card.data().id){
                return false;
            }
            return true;
        }
        //removed it
        for (let row of this.matrix){
            row.entities = row.entities.filter(filter);
            row.wards = row.wards.filter(filter);
        }
        // placing it
        this.matrix[newRow].entities.push(card)
    }
}