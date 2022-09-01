/*
This manages a player entity, their zones of control (hand/deck/grave/banish) as well as their connection key


*/
const figmentModule = require("./cards/Figment")
const shatteredSeekerModule = require("./cards/ShatteredSeeker")
const quellModule = require("./cards/Quell")


const player_cardModule = require("./cards/Player_Card")
const {zoneCardMap,boardCardMap} = require("../cardcontroller")
module.exports.Player = class Player{

    hand = null;
    deck = null;
    grave = null;

    spentDivineConnection = null;
    game = null;

    
    constructor(id,name,startingRow,game){
        this.id = id;
        this.hand = []; 
        this.deck = [];
        this.grave = [];
        this.game = game;
        this.name = name;
        this.startingRow = startingRow;

        this.spentDivineConnection=0;
        
        // making the deck
        for (let i = 0; i < 10; i++){
            let card = null;
            if (Math.random() > .5){
                card = new quellModule.Zone_Card({
                    id: this.game.nextCardID++,
                    owner: this
                });
            }else{
                card = new figmentModule.Zone_Card({
                    id: this.game.nextCardID++,
                    owner: this
                });
            }
            this.deck.push(card)
        }

        // Drawing starting 4 cards
        for (let i = 0; i < 4; i++){
            let topCard = this.deck.shift();
            this.hand.push(topCard);
        }


        // Adding player token
        let zonePlayerCard = new player_cardModule.Zone_Card({
            id: this.game.nextCardID++,
            owner: this
        });
        this.playerCard = new player_cardModule.Board_Card(zonePlayerCard)
        this.game.board.addEntity(this.playerCard,this.startingRow)
    }

    data(game){
        let resData = {
            hand: [],
            deck: [], // note that this should be ordered
            grave: [],
            name: this.name,
            divineConnection: this.getDivineConnection(game),
            currentRow: this.game.board.getCard(this.playerCard.id)[1] // current row they are ein
        }
        for (let card of this.hand){
            resData.hand.push(card.data())
        }
        for (let card of this.deck){
            resData.deck.push(card.data())
        }
        for (let card of this.grave){
            resData.grave.push(card.data())
        }
        return(resData)
    }

    shuffleDeck(){
        this.game.log(`${this.name} shuffles their deck.`)
        let newDeck = []
        while (this.deck.length > 0){
            let outCard = this.deck.splice(Math.floor(Math.random()*this.deck.length),1)[0]
            newDeck.push(outCard)
        }
        this.deck = newDeck;
    }

    mulliganHand(){
        this.game.log(`${this.name} mulligans their hand:`)
        for (let card of this.hand){
            this.deck.push(card);
        }
        this.hand = []
        this.shuffleDeck();
        // draw 4 
        for (let i = 0; i < 4; i++){
            this.drawCard()
        }
    }

    drawCard(){
        this.game.log(`${this.name} draws a card.`)
        console.log(this.id+ " drew a card")
        if (this.deck.length > 0){
            this.hand.push(this.deck.shift())
        }
    }

    getDivineConnection(game){
        return game.turn-this.spentDivineConnection;
    }

    getAllCards(){
        return [...this.hand,...this.deck,...this.grave]
    }

    sendBoardToGrave(boardCard){
        
        let zoneClass = zoneCardMap.get(boardCard.stats.name);
        let graveCard = new zoneClass({
            owner: this,
            id: boardCard.id
        },boardCard)
        this.grave.push(graveCard);
    }
}