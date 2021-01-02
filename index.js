const express = require('express');
const app = express();
const serv = require('http').Server(app);
const PORT = process.env.PORT || 3000;
const Player = require("./server/player.js"); // import the player class
const Board = require("./server/board.js"); // import the board class
const {makeid} = require("./server/utils.js");
const { GameLoop } = require("./server/game.js");

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/client/index.html");
})

app.use('/client', express.static(__dirname + '/client'));

serv.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
})

const startingPos = [[0,0], [6,0], [6,6], [0,6]]
const clientRooms = {};
const gameRooms = {};

const io = require('socket.io')(serv,{});
io.sockets.on('connection', client => {
    console.log('socket connection');
    
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('startGameBtn', handleStartGame);
    client.on('endTurn', handleEndTurn);

    function handleEndTurn(roomName) {
        gameRooms[roomName].NextTurn();
        const result = gameRooms[roomName].Score(client.id);
        const player = gameRooms[roomName].playerList[client.id]
        if (result == 1)
            io.sockets.in(roomName).emit('endGame', JSON.stringify({player}));

    }
    
    function handleStartGame(roomName) {
        startGameInterval(roomName);
        gameRooms[roomName].gameHasStarted = true;
        gameRooms[roomName].playerTurn = Object.keys(gameRooms[roomName].playerList)[0];
        io.sockets.in(roomName).emit('startGame');
    }

    function handleNewGame() {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        gameRooms[roomName] = new Board();
        client.join(roomName);
        createNewPlayer(roomName);
        let playerList = gameRooms[roomName].playerList;
        client.emit('showLobby', JSON.stringify({roomName, playerList}));
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
        } else if (gameRooms[roomName].gameHasStarted) {
            client.emit('gameStarted');
            return;
        } 
        else if (numClients > 3) {
            client.emit('gameFull');
            return;
        }
        clientRooms[client.id] = roomName;

        client.join(roomName);
        createNewPlayer(roomName);
        let playerList = gameRooms[roomName].playerList;
        io.sockets.in(roomName).emit('showLobby', JSON.stringify({roomName, playerList}));
    }
    
    function createNewPlayer(room) {
        let num = gameRooms[room].playerList != {} ? Object.keys(gameRooms[room].playerList).length : 0;
        const x = startingPos[num][0];
        const y = startingPos[num][1];
        gameRooms[room].playerList[client.id] = new Player(client.id, x, y, num + 1);
        gameRooms[room].DealCards();
    }
    // updating the board
    client.on('colShiftDown', col => {
        const roomName = clientRooms[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
        gameRooms[roomName].ShiftColDown(col);
    });
    client.on('colShiftUp', col => {
        const roomName = clientRooms[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
        gameRooms[roomName].ShiftColUp(col);
    });
    client.on('rowShiftRight', row => {
        const roomName = clientRooms[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
        gameRooms[roomName].ShiftRowRight(row);
    });
    client.on('rowShiftLeft', row => {
        const roomName = clientRooms[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
        gameRooms[roomName].ShiftRowLeft(row);
    });

    client.on('rotate', () => {
        const roomName = clientRooms[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
        gameRooms[roomName].RotateSparePiece();
    });

    client.on('keyPress', data => {
        const roomName = clientRooms[client.id];
        let player = gameRooms[roomName].playerList[client.id];
        if (gameRooms[roomName].playerTurn != client.id) return;
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
        if (roomName) {
            // note that the room is not being deleted
            // want to delete the room when the host player has left
            delete gameRooms[roomName].playerList[client.id];
        }
    });

}); 

function startGameInterval(roomName) {
    const intervalID = setInterval(() => {
        // send the board to the clients
        // GAME LOOP HERE
        const boardPack = gameRooms[roomName];

        const players = gameRooms[roomName].playerList;
        for (let id in players){
            let player = players[id];
            let cardPack = [];
            if (player) {
                cardPack = player.cards;
            }
            // send cards to client individually
            io.to(id).emit('playerCards', JSON.stringify({cardPack, id}));
        }
        io.sockets.in(roomName).emit('newPositions', JSON.stringify({boardPack}));

    }, 1000/25);
}