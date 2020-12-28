const express = require('express');
const app = express();
const serv = require('http').Server(app);
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
})

app.use('/client', express.static(__dirname + '/client'));

serv.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

const Player = require("./server/player.js"); // import the player class
const Board = require("./server/board.js"); // import the board class

let gameBoard = new Board();
let SOCKET_LIST = {};
const startingPos = [[0,0], [6,0], [6,6], [0,6]]
let numberOfPlayers = -1;

const io = require('socket.io')(serv,{});
io.sockets.on('connection', socket => {
    console.log('socket connection');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    numberOfPlayers++;
    // create player and add to player list
    const x = startingPos[numberOfPlayers][0];
    const y = startingPos[numberOfPlayers][1];
    let player = Player(socket.id, x, y);

    gameBoard.playerList[socket.id] = player;
    
    // updating the board
    socket.on('colShiftDown', col => {
        gameBoard.ShiftColDown(col);
    })
    socket.on('colShiftUp', col => {
        gameBoard.ShiftColUp(col);
    })
    socket.on('rowShiftRight', row => {
        gameBoard.ShiftRowRight(row);
    })
    socket.on('rowShiftLeft', row => {
        gameBoard.ShiftRowLeft(row);
    })

    socket.on('keyPress', data => {
            if (data.inputId === 'left')
                player.MoveLeft();
            else if (data.inputId === 'right')
                player.MoveRight();
            else if (data.inputId === 'up')
                player.MoveUp();
            else if (data.inputId === 'down')
                player.MoveDown();
    });
    socket.on('disconnect', () => {
        delete SOCKET_LIST[socket.id];
        delete gameBoard.playerList[socket.id];
        numberOfPlayers--;
    });
}); 

setInterval(() => {
    let playerPack = [];
    let boardPack;
    for(let i in gameBoard.playerList) {
        let player = gameBoard.playerList[i];
        playerPack.push({x:player.x,
                   y:player.y
        })
    }
    boardPack = gameBoard
    for (let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions', {playerPack, boardPack});
    }
}, 1000/25)
