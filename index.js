const express = require('express');
const app = express();
const serv = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const Player = require("./server/player.js"); // import the player class
const Board = require("./server/board.js"); // import the board class
const {makeid} = require("./server/utils.js");

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
})

app.use('/client', express.static(__dirname + '/client'));

serv.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

//let gameBoard = new Board();
let SOCKET_LIST = {};
const startingPos = [[0,0], [6,0], [6,6], [0,6]]
let numberOfPlayers = -1;
const clientRooms = {};
const gameRooms = {};

const io = require('socket.io')(serv,{});
io.sockets.on('connection', client => {
    console.log('socket connection');
    SOCKET_LIST[client.id] = client;
    numberOfPlayers++;
    // // create player and add to player list
    // const x = startingPos[numberOfPlayers][0];
    // const y = startingPos[numberOfPlayers][1];
    // let player = Player(socket.id, x, y);
    
    // gameBoard.playerList[socket.id] = player;
    
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    
    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        gameRooms[roomName] = new Board();
        client.join(roomName);
        let player = Player(client.id, 0, 0);
        gameRooms[roomName].playerList[client.id] = player;
        startGameInterval(roomName);
    }

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms[roomName];

        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.emit('gameCode', roomName);
        let player = Player(client.id, 6, 0);
        gameRooms[roomName].playerList[client.id] = player;
        startGameInterval(roomName);
    }
    
    // updating the board
    client.on('colShiftDown', col => {
        const roomName = clientRooms[client.id];
        gameRooms[roomName].ShiftColDown(col);
    })
    client.on('colShiftUp', col => {
        const roomName = clientRooms[client.id];
        gameRooms[roomName].ShiftColUp(col);
    })
    client.on('rowShiftRight', row => {
        const roomName = clientRooms[client.id];
        gameRooms[roomName].ShiftRowRight(row);
    })
    client.on('rowShiftLeft', row => {
        const roomName = clientRooms[client.id];
        gameRooms[roomName].ShiftRowLeft(row);
    })

    client.on('keyPress', data => {
        const roomName = clientRooms[client.id];
        let player = gameRooms[roomName].playerList[client.id];
            if (data.inputId === 'left')
                player.MoveLeft();
            else if (data.inputId === 'right')
                player.MoveRight();
            else if (data.inputId === 'up')
                player.MoveUp();
            else if (data.inputId === 'down')
                player.MoveDown();
    });


    client.on('disconnect', () => {
        const roomName = clientRooms[client.id];
        delete SOCKET_LIST[client.id];
        if (roomName) {
            // note that the room is not being deleted
            // want to delete the room when the host player has left
            delete gameRooms[roomName].playerList[client.id];
        }
        numberOfPlayers--;
    });

}); 

function startGameInterval(roomName) {
    const intervalID = setInterval(() => {
        let playerPack = [];
        let boardPack;
        for(let i in gameRooms[roomName].playerList) {
            let player = gameRooms[roomName].playerList[i];
            playerPack.push({x:player.x,
                       y:player.y
            })
        }
        boardPack = gameRooms[roomName];
        // for (let i in SOCKET_LIST){
        //     let socket = SOCKET_LIST[i];
        //     socket.emit('newPositions', {playerPack, boardPack});
        // }
        io.sockets.in(roomName).emit('newPositions', {playerPack, boardPack});
    }, 1000/25);
}