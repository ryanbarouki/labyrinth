// ==================================== CONSTS & INITS ======================================
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
const OFFSET = (BOARD_SIZE - 7 * TILE_SIZE) / 2;
const PLAYER_WIDTH = 128/4;
const PLAYER_HEIGHT = 192/4;
const PLAYER_OFFSET_X = (TILE_SIZE - PLAYER_WIDTH) / 2;
const PLAYER_OFFSET_Y = (TILE_SIZE - PLAYER_HEIGHT) / 2;

const cornerSprite = new Image();
cornerSprite.src = './client/img/Corner.png'
const straightSprite = new Image();
straightSprite.src = './client/img/Straight.png'
const Tsprite = new Image();
Tsprite.src = './client/img/Tpiece.png'
const brownWizardSprite = new Image();
const redWizardSprite = new Image();
const blueWizardSprite = new Image();
const greenWizardSprite = new Image();
brownWizardSprite.src = './client/img/brownwizard.png';
redWizardSprite.src = './client/img/redwizard.png';
blueWizardSprite.src = './client/img/bluewizard.png';
greenWizardSprite.src = './client/img/greenwizard.png';

const tileSprites = {0:cornerSprite,
                     1:straightSprite,
                     2:Tsprite}

const playerSprites = {1: redWizardSprite,
                       2: blueWizardSprite,
                       3: greenWizardSprite,
                       4: brownWizardSprite}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const endTurnBtn = document.getElementById('endTurnBtn');
const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const startGameBtn = document.getElementById('startGameBtn');
const lobbyScreen = document.getElementById('lobby');
const lobbyPlayers = document.getElementById('lobbyPlayers');
const endGameScreen = document.getElementById('endGameScreen')
const arrows = [];

// ==================================== EVENT LISTENERS =======================================
newGameBtn.addEventListener('click', () => {
    let name = nameInput.value;
    if (!name){
        alert('Please enter a name');
        return;
    }
    socket.emit('newGame', name);
});

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
        socket.emit('rotate');
    }
});

endTurnBtn.addEventListener('click', () => {
    socket.emit('endTurn', gameCode);
});

startGameBtn.addEventListener('click', () => {
    socket.emit('startGameBtn', gameCode);
});

joinGameBtn.addEventListener('click', () => {
    let name = nameInput.value;
    if (!name){
        alert('Please enter a name');
        return;
    }
    const code = gameCodeInput.value;
    socket.emit('joinGame', JSON.stringify({code, name}));
});

let down = false;
document.addEventListener('keydown', e => {
    if (down) return;
    if (!startGame) return;
    down = true;
    if (e.key == "w" || e.key == "W")
        socket.emit('keyPress', {inputId:'up', state:true});
    else if (e.key == "a" || e.key == "A")
        socket.emit('keyPress', {inputId:'left', state:true});
    else if (e.key == "s" || e.key == "S")
        socket.emit('keyPress', {inputId:'down', state:true});
    else if (e.key == "d" || e.key == "D")
        socket.emit('keyPress', {inputId:'right', state:true});
})

document.addEventListener('keyup', e => {
    down = false;
    if (!startGame) return;
    if (e.key == "w" || e.key == "W")
        socket.emit('keyRelease', {inputId:'up', state:false});
    else if (e.key == "a" || e.key == "A")
        socket.emit('keyRelease', {inputId:'left', state:false});
    else if (e.key == "s" || e.key == "S")
        socket.emit('keyRelease', {inputId:'down', state:false});
    else if (e.key == "d" || e.key == "D")
        socket.emit('keyRelease', {inputId:'right', state:false});
})

// ==================================== SOCKET ONS =========================================
socket.on('startGame', () => {
    startGame = true;
    showBoard();
    initialiseArrows(); 
})

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
});

socket.on('showLobby', package => {
    package = JSON.parse(package);
    gameCode = package.roomName;
    players = package.playerList;
    gameCodeDisplay.innerText = gameCode;
    showLobby();
});

socket.on('playerCards', package => {
    package = JSON.parse(package);
    // cards = package.cardPack;
    playerId = package.id;
    //console.log(cards[0].id);
});
