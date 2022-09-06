const createRoomButton = document.getElementById("createbutton");
const joinRoomButton = document.getElementById("joinbutton");
const lobbyCodeInput = document.getElementById("joininput");
const startGameButton = document.getElementById("startbutton");
const infoDiv = document.getElementById("roominfodiv");
const myNameInput = document.getElementById("nameinput");
let myLobbyData = null;
let lobbyPlayerID = null;
let IN_LOBBY = false;
function refreshRoomData() {
    if (!myLobbyData) {
        return;
    }
    let playerCountHeader = document.getElementById("playercount");
    playerCountHeader.innerText = `PLAYERS: ${myLobbyData.players.length}/2`;
    let playerList = document.getElementById("playerlist");
    playerList.innerHTML = '';
    for (let player of myLobbyData.players) {
        let obj = document.createElement('li');
        obj.innerText = `Player: ${player}`;
        playerList.appendChild(obj);
    }
    let linkinfo = document.getElementById('linkinfo');
    linkinfo.innerHTML = `Code: ${myLobbyData.id}`;
}
createRoomButton.onclick = () => {
    let newName = myNameInput['value'].trim();
    if (newName.length < 1) {
        newName = "Bob";
    }
    fetch("/createlobby", {
        method: "POST",
        cache: "no-cache",
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify({
            name: newName,
        })
    }).then((response) => {
        response.json().then(json => {
            if (json.status == "failure") {
                return;
            }
            console.log(`My ID is ${json.newID}`);
            lobbyPlayerID = json.newID;
            myLobbyData = json.lobbyData;
            refreshRoomData();
            IN_LOBBY = true;
        });
    });
};
joinRoomButton.onclick = () => {
    let newName = myNameInput['value'].trim();
    if (newName.length < 1) {
        newName = "Bob";
    }
    let myID = lobbyCodeInput['value'].trim();
    if (myID.length < 1) {
        alert("Input a lobby code");
        return;
    }
    fetch("/joinlobby", {
        method: "POST",
        cache: "no-cache",
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify({
            id: myID,
            name: newName,
        })
    }).then((response) => {
        response.json().then(json => {
            if (json.status == "failure") {
                return;
            }
            console.log(`My ID is ${json.newID}`);
            lobbyPlayerID = json.newID;
            myLobbyData = json.lobbyData;
            refreshRoomData();
            IN_LOBBY = true;
        });
    });
};
startGameButton.onclick = () => {
    if (!IN_LOBBY || !myLobbyData) {
        return;
    }
    fetch("/startlobby", {
        method: "POST",
        cache: "no-cache",
        headers: [["Content-Type", "application/json"]],
        body: JSON.stringify({
            playerID: lobbyPlayerID,
            lobbyID: myLobbyData.id
        })
    }).then((response) => {
        response.json().then(json => {
            if (json.status == "failure") {
                return;
            }
            // JOINING GAME
            console.log("JOINING GAME");
            window.location.href = "/game.html?" + `id=${lobbyPlayerID}&game=${json.lobbyData.gameID}`;
            IN_LOBBY = false;
        });
    });
};
setInterval(() => {
    if (IN_LOBBY && myLobbyData) {
        fetch("/getlobby", {
            method: "POST",
            cache: "no-cache",
            headers: [["Content-Type", "application/json"]],
            body: JSON.stringify({
                playerID: lobbyPlayerID,
                lobbyID: myLobbyData.id,
            })
        }).then((response) => {
            response.json().then(json => {
                if (json.status == "failure") {
                    IN_LOBBY = false;
                    myLobbyData = null;
                    return;
                }
                if (json.lobbyData.gameID) {
                    // starting game
                    console.log("Entering game");
                    window.location.href = "/game.html?" + `id=${lobbyPlayerID}&game=${json.lobbyData.gameID}`;
                    return;
                }
                myLobbyData = json.lobbyData;
                refreshRoomData();
            });
        });
    }
}, 2000);
//# sourceMappingURL=RoomClient.js.map