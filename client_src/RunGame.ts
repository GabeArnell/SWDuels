
let playerID = null

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

function enterGame(startingView){
    let game = new Game(startingView)
}