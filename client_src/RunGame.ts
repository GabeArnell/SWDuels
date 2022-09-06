
let playerID = null

let urlString = window.location.href;
let paramString = urlString.split('?')[1];
let queryString = new URLSearchParams(paramString);
let urlParams = {}
if (queryString.get("id") && queryString.get("game") ){
    fetch("/game",{
        method: "POST",
        cache: "no-cache",
        headers: [["Content-Type","application/json"]],
        body: JSON.stringify({
            player: queryString.get("id"),
            game: queryString.get("game")
            
        })
    }).then((response)=>{
        response.json().then(json=>{
            console.log(`My ID is ${json.newID}`)
            playerID = json.newID
            enterGame(json.view)
        })
    })
}
else{
    fetch("/newgame",{
        method: "POST",
        cache: "no-cache",
        headers: [["Content-Type","application/json"]],
        body: JSON.stringify({
            testAttribute: "test value",
            id: 2
            
        })
    }).then((response)=>{
        response.json().then(json=>{
            console.log(`My ID is ${json.newID}`)
            playerID = json.newID
            enterGame(json.view)
    
        })
    })
    
}


function enterGame(startingView){
    let game = new Game(startingView)
}