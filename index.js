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
const clientRooms = {};
const gameRooms = {};

const io = require('socket.io')(serv,{});
io.sockets.on('connection', client => {
    console.log('socket connection');
    SOCKET_LIST[client.id] = client;
    
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    
    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        gameRooms[roomName] = new Board();
        client.join(roomName);
        createNewPlayer(roomName);
        startGameInterval(roomName);
    }

    function handleJoinGame(roomName) {
        const room = io.sockets.adapter.rooms.get(roomName);
        
        let numClients = 0;
        if (room) {
            numClients = room.size;
        }

        if (numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > 3) {
            client.emit('gameFull');
            return;
        }
        clientRooms[client.id] = roomName;

        client.join(roomName);
        client.emit('gameCode', roomName);
        createNewPlayer(roomName);
        startGameInterval(roomName);
    }
    
    function createNewPlayer(room) {
        let num = gameRooms[room].playerList != {} ? Object.keys(gameRooms[room].playerList).length : 0;
        const x = startingPos[num][0];
        const y = startingPos[num][1];
        gameRooms[room].playerList[client.id] = new Player(client.id, x, y);
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
        io.sockets.in(roomName).emit('newPositions', {playerPack, boardPack});
    }, 1000/25);
}