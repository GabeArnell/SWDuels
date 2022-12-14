// Handles Game view for player
class Game {
    constructor(startingView) {
        this.RenderObject = null;
        this.code = null;
        this.mouse = null;
        this.state = null;
        this.viewData = null;
        this.myHand = null;
        this.myBoard = null;
        this.myStack = null;
        this.detailOverlay = null;
        this.myPrompt = null;
        this.myPassButton = null;
        this.selectedCard = null;
        this.inputDebouce = false;
        this.polling = false; // if we are waiting for server to respond
        this.viewData = startingView;
        this.mouse = new Mouse(this);
        let canvasObject = document.getElementById("GameCanvas");
        this.RenderObject = new CanvasScreen(canvasObject, this.mouse);
        ;
        this.mouse.canvasObject = this.RenderObject;
        let gameObj = this;
        function track(e) {
            gameObj.mouse.y = e.pageY;
            gameObj.mouse.x = e.pageX;
            //console.log("X - ", e.pageX, " Y - ", e.pageY);
        }
        addEventListener("mousemove", track, false);
        addEventListener("mousedown", (event) => {
            if (event.button == 0) {
                this.mouse.mouseDown = true;
            }
            if (event.button == 2) {
                this.mouse.rightClick();
            }
        }, false);
        addEventListener("mouseup", () => {
            this.mouse.mouseDown = false;
        }, false);
        this.layoutBoard();
        this.state = this.viewData.waiting;
        this.RenderObject.run();
        if (this.viewData.priority) {
            this.getPriority();
        }
        else {
            console.log('no priority ig lol');
        }
        this.refreshTime();
    }
    async refreshTime() {
        let game = this;
        setInterval(() => {
            if (!game.viewData.priority && !game.polling && !game.viewData.prompt) {
                console.log("loading");
                game.polling = true;
                fetch("/game", {
                    method: "POST",
                    cache: "no-cache",
                    headers: [["Content-Type", "application/json"]],
                    body: JSON.stringify({
                        game: this.viewData.id,
                        player: playerID
                    })
                }).then(response => {
                    game.polling = false;
                    response.json().then(json => {
                        console.log('got information');
                        if (json.status == "success") {
                            console.log('was a success!');
                            this.resolveResponse(json.view);
                        }
                        else {
                            console.log(json);
                        }
                    });
                });
            }
            else {
                //console.log("already has to make a choice, no loading")
            }
        }, 2000);
    }
    layoutBoard() {
        let BoardObject = new Board({ visible: true, height: SETTINGS.BOARDY, width: SETTINGS.BOARDX, position: PositionReference.topleft });
        let HandObject = new Hand({ y: SETTINGS.BOARDY, visible: true, height: SETTINGS.HANDY, width: SETTINGS.BOARDX, position: PositionReference.topleft });
        let StackObject = new StackHolder({ x: SETTINGS.BOARDX, y: 200, visible: true, height: 300, width: SETTINGS.STACKX, position: PositionReference.topleft }, this);
        this.myPassButton = new PassButton(this, { visible: false, width: SETTINGS.STACKX / 2, height: 50, x: SETTINGS.BOARDX + SETTINGS.STACKX / 4, y: 100 });
        let detailOverlayObject = new DetailOverLay(this, { visible: false, height: SETTINGS.BOARDY, width: SETTINGS.BOARDX, position: PositionReference.topleft });
        this.detailOverlay = detailOverlayObject;
        this.myHand = HandObject;
        this.myBoard = BoardObject;
        this.myStack = StackObject;
        this.RenderObject.addSprite(BoardObject);
        this.RenderObject.addSprite(HandObject);
        this.RenderObject.addSprite(StackObject);
        this.RenderObject.addSprite(this.myPassButton);
        this.RenderObject.addSprite(this.detailOverlay);
        // filling hand with items
        console.log(this.viewData);
        for (let cardData of this.viewData.player.hand) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            HandObject.addHandCard(cardSprite);
        }
        for (let cardData of this.viewData.player.grave) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            HandObject.addGraveCard(cardSprite);
        }
        for (let cardData of this.viewData.player.deck) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            HandObject.addDeckCard(cardSprite);
        }
        // Set up Prompter
        this.myPrompt = new QuestionDisplay({ visible: true, height: SETTINGS.BOARDY / 4, width: SETTINGS.BOARDX, y: SETTINGS.BOARDY / 4, position: PositionReference.topleft });
        this.RenderObject.addSprite(this.myPrompt);
    }
    getPriority() {
        console.log('checking priority data');
        let clicked = false;
        switch (this.viewData.waiting) {
            case ("MULLIGAN"):
                // add mulligan option
                console.log('running mull question');
                this.myPrompt.askQuestion({
                    prompt: "Mulligan the hand?",
                    responses: ["Yes", "No"],
                    callback: (response) => {
                        if (!clicked && this.viewData.waiting == "MULLIGAN") {
                            clicked = true;
                            if (response == "Yes") {
                                // pass post data that the response is YES
                                this.sendPlayerAction({
                                    type: "MULLIGAN",
                                    data: "Yes"
                                });
                            }
                            else {
                                // pass post data that the response is NO
                                this.sendPlayerAction({
                                    type: "MULLIGAN",
                                    data: "No"
                                });
                            }
                        }
                    }
                });
                break;
            case ("ACTION"):
                console.log('pass button enabled!');
                this.myPassButton.visible = true;
                this.myPassButton.clicked = false;
                this.state = "ACTION";
                break;
            case ("PROMPT"):
                let promptData = this.viewData.prompt;
                console.log('running prompt question');
                if (promptData.targets == null) {
                    this.myPrompt.askQuestion({
                        prompt: promptData.text,
                        responses: promptData.responses,
                        callback: (response) => {
                            if (!clicked && this.viewData.waiting == "PROMPT") {
                                clicked = true;
                                this.sendPlayerAction({
                                    type: "PROMPT",
                                    data: {
                                        actiontype: "PROMPT",
                                        data: response
                                    }
                                });
                            }
                        }
                    });
                }
                else {
                    console.log("asking for prompt");
                    this.detailOverlay.startTargetingSession(promptData.card, ["PROMPT", (response) => {
                            if (!clicked && this.viewData.waiting == "PROMPT") {
                                clicked = true;
                                this.sendPlayerAction({
                                    type: "PROMPT",
                                    data: {
                                        actiontype: "PROMPT",
                                        data: response
                                    }
                                });
                            }
                        }], null, promptData.targets);
                }
                break;
        }
    }
    sendPlayerAction(data) {
        if (this.inputDebouce) {
            return;
        }
        this.inputDebouce = true;
        fetch("/action", {
            method: "POST",
            cache: "no-cache",
            headers: [["Content-Type", "application/json"]],
            body: JSON.stringify({
                game: this.viewData.id,
                player: playerID,
                data: data
            })
        }).then(response => {
            response.json().then(json => {
                if (json.status == "success") {
                    this.resolveResponse(json.view);
                }
                else {
                }
            });
        });
    }
    resolveResponse(newView) {
        this.inputDebouce = false;
        // change zones+board
        console.log('new view', newView);
        // change hand
        this.myHand.clearHand();
        for (let cardData of newView.player.hand) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            this.myHand.addHandCard(cardSprite);
        }
        // change grave
        this.myHand.clearGrave();
        for (let cardData of newView.player.grave) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            this.myHand.addGraveCard(cardSprite);
        }
        // change deck
        this.myHand.clearDeck();
        for (let cardData of newView.player.deck) {
            let cardSprite = new CardSprite(cardData, { visible: true, height: SETTINGS.CARDY, width: SETTINGS.CARDX });
            this.myHand.addDeckCard(cardSprite);
        }
        // change board
        this.myBoard.clearBoard();
        this.myBoard.populateBoard(newView.board);
        // change stack
        this.myStack.clearStack();
        // filling stack in reverse, so newest is on top
        for (let i = newView.stack.length - 1; i >= 0; i--) {
            console.log('reading from stack', i);
            this.myStack.pushStack(newView.stack[i]);
        }
        // clear selections
        this.selectedCard = null;
        this.detailOverlay.quitTargetingSession();
        this.detailOverlay.cardPointers = [];
        // Check pass button
        this.myPassButton.visible = false;
        // check priority
        this.viewData = newView;
        this.state = this.viewData.waiting;
        if (this.viewData.priority) {
            this.getPriority();
        }
    }
    // this still needs to cover cards from grave and shit. 
    getAllCards() {
        let list = [];
        for (let cardHolder of this.myBoard.spriteChildren()) {
            if (cardHolder.heldCard) {
                list.push(cardHolder.heldCard);
            }
        }
        for (let cardHolder of this.myHand.cardLists()) {
            if (cardHolder.heldCard) {
                list.push(cardHolder.heldCard);
            }
        }
        return list;
    }
}
//# sourceMappingURL=Game.js.map