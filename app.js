const path = require("path")
const {PORT} = require("./config.json")
const express = require('express')
const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


app.use(express.static(path.join(__dirname,'public')));
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})

const {Game} = require("./backend/classes/game")
const ongoingGames = new Map(); // map of ongoing games

function generateID(){
    var text = "";
    var possible = "ABCDEFGHIkLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));         
    }
    text+=new Date().getTime();
    return text
}

app.post("/newgame",(req,res)=>{
    console.log("Got new game request")
    let newID = generateID();
    console.log(newID)

    let newGame = new Game(generateID(), [newID,"Robot1"])
    // populate the data with decks and shit later ig
    ongoingGames.set(newGame.id,newGame)

    let playerView = newGame.getPlayerView(newID)
    res.send({
        newID: newID,
        view: playerView
    })
})

app.post("/action",(req,res)=>{
    console.log("Got action request")
    console.log(req.body)
    let targetGame = ongoingGames.get(req.body.game);
    if (!targetGame){
        res.send({
            status: "failure"
        })
        return;
    }
    // checking if there is a player in the game with that id
    targetGame.playerAction(req,res,req.body)
})