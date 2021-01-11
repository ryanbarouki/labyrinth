const socket = io();
let board;
let sparePiece = 49;
let players = [];
let gameCode;
let startGame = true;
let cards = [];
let playerTurn = "";
let playerId = "";
const BOARD_SIZE = 800;
const TILE_SIZE = BOARD_SIZE/10;
const OFFSET = (BOARD_SIZE - 7 * TILE_SIZE) / 2

const cornerSprite = new Image();
cornerSprite.src = './client/img/Corner.png'
const straightSprite = new Image();
straightSprite.src = './client/img/Straight.png'
const Tsprite = new Image();
Tsprite.src = './client/img/Tpiece.png'

const tileSprites = {0:cornerSprite,
                     1:straightSprite,
                     2:Tsprite}

const canvas = document.getElementById("gameScreen");
const ctx = canvas.getContext("2d");
const endTurnBtn = document.getElementById('endTurnBtn');
const arrows = [];

canvas.addEventListener('click', event => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    for (let arrow of arrows){
        if(arrow.clicked(x, y)){
            socket.emit(arrow.action[0], arrow.action[1]);
            // shift row/col of board
        }
    }
    if (sparePiece.sprite.clicked(x,y)){
        console.log('clicked!');
    }
});

endTurnBtn.addEventListener('click', () => {
    socket.emit('endTurn', gameCode);
});

socket.emit('tempStart');

socket.on('gameState', package => {
    if (startGame){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        package = JSON.parse(package);
        players = package.boardPack.playerList;
        board = package.boardPack.board;
        sparePiece = package.boardPack.sparePiece;
        sparePiece.sprite = new TileSprite(sparePiece.x, sparePiece.y, sparePiece.type);
        playerTurn = package.boardPack.playerTurn;
        requestAnimationFrame(drawBoard);
    }
})

socket.on('showLobby', package => {
    package = JSON.parse(package);
    gameCode = package.roomName;
    //players = package.playerList;
    //gameCodeDisplay.innerText = gameCode;
    //showLobby();
});

function initialiseArrows() {
    const vec1 = new Vec2d(25, 25);
    const vec2 = new Vec2d(25, -25);
    const triPos = [[OFFSET - TILE_SIZE/3, OFFSET + 1.5*TILE_SIZE, Math.PI], [OFFSET - TILE_SIZE/3, OFFSET + 3.5*TILE_SIZE, Math.PI],
                    [OFFSET - TILE_SIZE/3, OFFSET + 5.5*TILE_SIZE, Math.PI], [OFFSET + 1.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2],
                    [OFFSET + 3.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2], [OFFSET + 5.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2],
                    [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 1.5*TILE_SIZE, 0], [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 3.5*TILE_SIZE, 0], 
                    [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 5.5*TILE_SIZE, 0], [OFFSET + 1.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2],
                    [OFFSET + 3.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2], [OFFSET + 5.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2]];

    const action = [['rowShiftRight', 1], ['rowShiftRight', 3], ['rowShiftRight', 5],
                      ['colShiftUp', 1], ['colShiftUp', 3], ['colShiftUp', 5],
                      ['rowShiftLeft', 1], ['rowShiftLeft', 3], ['rowShiftLeft', 5],
                      ['colShiftDown', 1], ['colShiftDown', 3], ['colShiftDown', 5]]

    for (let i = 0; i < triPos.length; i++) {
        const tri = new Arrow(vec1, vec2, triPos[i][0], triPos[i][1], action[i]);
        tri.rotate(triPos[i][2]);
        arrows.push(tri);
    }
}

initialiseArrows(); // this should happen once at the beginning of the game

function drawArrows() {
    for (let arrow of arrows) {
        arrow.draw(ctx, "rgb(255, 245, 104)");
    }
}

function drawBoard() {
    ctx.fillStyle = "rgb(0, 50, 90)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x,y;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            x = board[i][j].x;
            y = board[i][j].y;
            const ang = board[i][j].rotation;
            const type = board[i][j].type;
            const tile = new TileSprite(x, y, type);
            const sprite = tileSprites[type];
            tile.draw(ctx, sprite, ang)
        }
    }
    const tile = new TileSprite(sparePiece.x, sparePiece.y, sparePiece.type);
    tile.draw(ctx, tileSprites[sparePiece.type], sparePiece.rotation);
    drawArrows();
}

function joinGame() {
    let name = nameInput.value;
    if (!name){
        alert('Please enter a name');
        return;
    }
    const code = gameCodeInput.value;
    socket.emit('joinGame', JSON.stringify({code, name}));
}

function showBoard() {
    lobbyScreen.style.display = "none";
    endGameScreen.style.display = "none";
    gameScreen.style.display = "block";
}

function showLobby() {
    initialScreen.style.display = "none";
    lobbyScreen.style.display = "block";
    lobbyPlayers.innerHTML = "";
    for (let i in players) {
        let player = players[i];
        let id = `player-${player.playerNumber}`;
        lobbyPlayers.innerHTML += `<p>${player.playerName}:</p><div class="player" id=${id}></div>`;
    }
}

// let down = false;
// document.addEventListener('keydown', e => {
//     if (down) return;
//     if (!startGame) return;
//     down = true;
//     if (e.key == "w")
//         socket.emit('keyPress', {inputId:'up', state:true});
//     else if (e.key == "a")
//         socket.emit('keyPress', {inputId:'left', state:true});
//     else if (e.key == "s")
//         socket.emit('keyPress', {inputId:'down', state:true});
//     else if (e.key == "d")
//         socket.emit('keyPress', {inputId:'right', state:true});
// })

// document.addEventListener('keyup', e => {
//     down = false;
//     if (!startGame) return;
//     if (e.key == "w")
//         socket.emit('keyRelease', {inputId:'up', state:false});
//     else if (e.key == "a")
//         socket.emit('keyRelease', {inputId:'left', state:false});
//     else if (e.key == "s")
//         socket.emit('keyRelease', {inputId:'down', state:false});
//     else if (e.key == "d")
//         socket.emit('keyRelease', {inputId:'right', state:false});
// })

//const arrows = document.querySelectorAll(".arrow");
//const players = document.querySelectorAll(".player");

// function GiveArrowsEventListeners() {
//     for (let i = 0; i < arrows.length; i++ ) {
//         arrows[i].addEventListener("click", function() {
//             switch (arrows[i].classList[2]) {
//                 case "col1-top":
//                     socket.emit('colShiftDown', 1);
//                     break;
//                 case "col2-top":
//                     socket.emit('colShiftDown', 3);
//                     break;
//                 case "col3-top":
//                     socket.emit('colShiftDown', 5);
//                     break;
//                 case "col1-bottom":
//                     socket.emit('colShiftUp', 1);
//                     break;
//                 case "col2-bottom":
//                     socket.emit('colShiftUp', 3);
//                     break;
//                 case "col3-bottom":
//                     socket.emit('colShiftUp', 5);
//                     break;
//                 case "row1-right":  
//                     socket.emit('rowShiftLeft', 1);
//                     break;          
//                 case "row1-left":  
//                     socket.emit('rowShiftRight', 1);
//                     break;          
//                 case "row2-right":            
//                     socket.emit('rowShiftLeft', 3);       
//                     break;          
//                 case "row2-left":    
//                     socket.emit('rowShiftRight', 3);             
//                     break;          
//                 case "row3-right":   
//                     socket.emit('rowShiftLeft', 5);         
//                     break;          
//                 case "row3-left":    
//                     socket.emit('rowShiftRight', 5);
//                     break;          
//                 }
//         })
//         switch (arrows[i].classList[1]) {
//             case "arrow-down":
//                 arrows[i].addEventListener("mouseover", function() {
//                     this.style.borderTop = "30px solid rgb(100, 100, 100)";
//                 })
//                 arrows[i].addEventListener("mouseout", function() {
//                     this.style.borderTop = "30px solid rgb(255, 245, 104)";
//                 })
//                 break;
//             case "arrow-up":
//                 arrows[i].addEventListener("mouseover", function() {
//                     this.style.borderBottom = "30px solid rgb(100, 100, 100)";
//                 })
//                 arrows[i].addEventListener("mouseout", function() {
//                     this.style.borderBottom = "30px solid rgb(255, 245, 104)";
//                 })
//                 break;
//             case "arrow-right":
//                 arrows[i].addEventListener("mouseover", function() {
//                     this.style.borderLeft = "30px solid rgb(100, 100, 100)";
//                 })
//                 arrows[i].addEventListener("mouseout", function() {
//                     this.style.borderLeft = "30px solid rgb(255, 245, 104)";
//                 })
//                 break;
//             case "arrow-left":
//                 arrows[i].addEventListener("mouseover", function() {
//                     this.style.borderRight = "30px solid rgb(100, 100, 100)";
//                 })
//                 arrows[i].addEventListener("mouseout", function() {
//                     this.style.borderRight = "30px solid rgb(255, 245, 104)";
//                 })
//                 break;
//         }
//     }
// }

function UpdateBoard() {
    let table = document.querySelectorAll("td.inner");
    let spareTile = document.querySelector(".spare-tile");
    const flatBoard = [].concat(...board);
    for (let i = 0; i < flatBoard.length; i++){
        table[i].innerHTML = ""; // clears the board
        if(flatBoard[i] != null){
            const rotation = flatBoard[i].rotation * 90;
            table[i].setAttribute("id", `f${flatBoard[i].id}`); //= "<div class='notfixed-tiles'" + `id=${flatBoard[i]}>${flatBoard[i]+1}</div>`;
            table[i].style.transform = `rotate(${rotation}deg)`;
        }
    }
    // update spare tile orientation
    const rotation = sparePiece.rotation * 90;
    spareTile.setAttribute("id", `f${sparePiece.id}`);
    spareTile.style.transform = `rotate(${rotation}deg)`;

    UpdatePlayers(table);
    UpdateScoreBoard();
    
    // update End Turn button
    if (playerId != playerTurn) {
        endTurnBtn.disabled = true;
    } else {
        endTurnBtn.disabled = false;
    }

}

function UpdatePlayers(gameBoard) {
    for (let i in players){
        let player = players[i];
        const x = player.x;
        const y = player.y;
        const pos = 7*y + x;
        let id = `player-${player.playerNumber}`;
        gameBoard[pos].innerHTML += `<div class="player" id=${id}></div>`;
    }
}

function UpdateScoreBoard() {
    scoreBoard.innerHTML = ""; // clear board
    for (let i in players) {
        let label = "";
        let player = players[i];
        if (!player.cards[0]) return; 
        if (player.id == playerTurn)
            label = "->";
        let targetCardId = player.cards[0].id;
        scoreBoard.innerHTML += `<tr>
                                    <th scope="row">${label}</th>
                                    <td>${player.playerName}</td>
                                    <td>${player.score}</td>
                                    <td><div class="notfixed-tiles targetCard" id=f${targetCardId}></div></td>
                                </tr>`
    }
}