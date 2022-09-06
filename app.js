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
const ongoingLobbies = new Map();

function generateID(){
    var text = "";
    var possible = "ABCDEFGHIkLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 20; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));         
    }
    text+=new Date().getTime();
    return text
}

function createNewGame(lobby){
    let playerIDs = [];
    for (let key in lobby.nameToIDMap){
        playerIDs.push(lobby.nameToIDMap[key])
    }

    let newGame = new Game(generateID(), playerIDs)
    // populate the data with decks and shit later ig
    ongoingGames.set(newGame.id,newGame)
    return  newGame.id
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

app.post("/game",(req,res)=>{
    console.log("Got game ping request")
    console.log(req.body)
    let id = req.body.game;
    if (!id || !id.toLowerCase){
        console.log("bad id form: ",id);
        res.send({
            status: "failure"
        })    
        return
    }
    let playerID = req.body.player;
    if (!playerID || !id.toLowerCase){
        console.log("bad player id form: ",playerID)
        res.send({
            status: "failure"
        })    
        return
    }

    let game = ongoingGames.get(id);
    if (!game){
        console.log("no game id found: ",id.trim())
        res.send({
            status: "failure"
        })    
        return
    }

    let playerView = game.getPlayerView(playerID)
    res.send({
        status: "success",
        newID: playerID,
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

app.post("/createlobby",(req,res)=>{
    console.log("Got new lobby request")
    let lobbyID = generateID();
    let playerID = generateID();
    let inputName = req.body.name.trim();
    if (inputName.length < 1){
        console.log('failed to create lobby due to invalid name')
        res.send({
            status: "failure",
            reason: "invalid name"
        })
        return;
    }

    let lobby = createLobby(lobbyID,playerID)
    lobby.nameToIDMap[inputName] = playerID
    lobby.players.push(inputName)

    lobby.lastPing[playerID] = new Date().getTime();

    ongoingLobbies.set(lobbyID,lobby)

    console.log('req')
    res.send({
        newID: playerID,
        status: "success",
        lobbyData: {
            id: lobby.id,
            creator: inputName,
            players: lobby.players
        }
    })
})
app.post("/joinlobby",(req,res)=>{
    console.log("Got join lobby request")
    let playerID = generateID();
    let inputName = req.body.name.trim();
    let lobbyID = req.body.id.trim();

    let lobby = ongoingLobbies.get(lobbyID)
    if (inputName.length < 1){
        console.log('failed to join lobby due to invalid name')
        res.send({
            status: "failure",
            reason: "invalid name"
        })
        return;
    }
    if (!lobby){
        console.log('failed to join lobby due to invalid code')
        res.send({
            status: "failure",
            reason: "can not find lobby code"
        })
        return;
    }
    if (lobby.players.length >= 2){
        res.send({
            status: "failure",
            reason: "lobby is full"
        })
    }

    console.log(lobby)
    for (let name of lobby.players){
        if (name.toLowerCase() == inputName.toLowerCase()){
            inputName = inputName+=" Jr"
        }
    }
    lobby.nameToIDMap[inputName] = playerID
    lobby.players.push(inputName)
    lobby.lastPing[playerID] = new Date().getTime();

    ongoingLobbies.set(lobbyID,lobby)

    console.log('req')
    res.send({
        newID: playerID,
        status: "success",
        lobbyData: {
            id: lobby.id,
            creator: inputName,
            players: lobby.players
        }
    })
})

// returns data of lobby
app.post("/getlobby",(req,res)=>{
    let playerID = req.body.playerID.trim();
    let lobbyID = req.body.lobbyID.trim();

    let lobby = ongoingLobbies.get(lobbyID)
    if (!lobby){
        console.log('failed to check lobby due to invalid code')
        res.send({
            status: "failure",
            reason: "can not find lobby with access"
        })
        return;
    }
    let foundName = null;
    for (let key in lobby.nameToIDMap){
        if (lobby.nameToIDMap[key] == playerID){
            foundName = key
        }
    }
    if (!foundName){
        console.log('failed to check lobby due to invalid playerid')
        res.send({
            status: "failure",
            reason: "can not find lobby with access"
        })
        return;
    }

    lobby.lastPing[playerID] = new Date().getTime();
    console.log('updated lobby ping for',foundName)
    ongoingLobbies.set(lobbyID,lobby)
    res.send({
        newID: playerID,
        status: "success",
        lobbyData: {
            id: lobby.id,
            creator: foundName,
            players: lobby.players,
            gameID: lobby.gameID
        }
    })

})

// returns data of lobby
app.post("/startlobby",(req,res)=>{
    let playerID = req.body.playerID.trim();
    let lobbyID = req.body.lobbyID.trim();

    let lobby = ongoingLobbies.get(lobbyID)
    if (!lobby){
        console.log('failed to start lobby due to invalid code')
        res.send({
            status: "failure",
            reason: "can not find lobby with starting permission"
        })
        return;
    }
    if (!playerID == lobby.creatorID){
        console.log('failed to start lobby due to non-ownership')
        res.send({
            status: "failure",
            reason: "can not find lobby with starting permission"
        })
        return;
    }
    if (lobby.gameID !=null){
        console.log('failed to start lobby due to the game already starting')
        res.send({
            status: "failure",
            reason: "game has already started"
        })
        return;

    }

    // starting game
    if (lobby.players.length < 2){
        lobby.players.push("Robot1")
    }
    let newGameID = createNewGame(lobby);
    lobby.gameID = newGameID
    res.send({
        newID: playerID,
        status: "success",
        lobbyData: {
            gameID: lobby.gameID
        }
    })

})

function createLobby(ID, creatorID){
    let res = {
        id: ID,
        creator: creatorID,
        players: [],
        nameToIDMap: {},
        lastPing: {},
        gameID: null,
    }
    
    return res
}