/*
This manages a player entity, their zones of control (hand/deck/grave/banish) as well as their connection key


*/
const figmentModule = require("./cards/Figment")
const shatteredSeekerModule = require("./cards/ShatteredSeeker")
module.exports.Player = class Player{

    hand = null;
    deck = null;

    spentDivineConnection = null;
    game = null;

    
    constructor(id,name,game){
        this.id = id;
        this.hand = []; 
        this.deck = [];
        this.game = game;
        this.name = name;

        this.spentDivineConnection=0;

        // making the deck
        for (let i = 0; i < 45; i++){
            let card = null;
            if (Math.random() > .5){
                card = new figmentModule.Zone_Card({
                    id: this.game.nextCardID++,
                    owner: this
                });
            }else{
                card = new shatteredSeekerModule.Zone_Card({
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
    }

    data(game){
        let resData = {
            hand: [],
            deck: [], // note that this should be ordered
            divineConnection: this.getDivineConnection(game)
        }
        for (let card of this.hand){
            resData.hand.push(card.data())
        }
        for (let card of this.deck){
            resData.deck.push(card.data())
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
        return [...this.hand,...this.deck]
    }
}