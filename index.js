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
        gameRooms[roomName].boardShifted = false; // to allow board to move on next turn
        if (result == 1)
            io.sockets.in(roomName).emit('endGame', JSON.stringify({player}));

    }
    
    function handleStartGame(roomName) {
        startGameInterval(roomName);
        gameRooms[roomName].gameHasStarted = true;
        gameRooms[roomName].playerTurn = Object.keys(gameRooms[roomName].playerList)[0];
        io.sockets.in(roomName).emit('startGame');
    }

    function handleNewGame(playerName) {
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        gameRooms[roomName] = new Board();
        client.join(roomName);
        createNewPlayer(roomName, playerName);
        let playerList = gameRooms[roomName].playerList;
        client.emit('showLobby', JSON.stringify({roomName, playerList}));
    }

    function handleJoinGame(data) {
        data = JSON.parse(data);
        const roomName = data.code;
        const playerName = data.name;
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
        createNewPlayer(roomName, playerName);
        let playerList = gameRooms[roomName].playerList;
        io.sockets.in(roomName).emit('showLobby', JSON.stringify({roomName, playerList}));
    }
    
    function createNewPlayer(room, playerName) {
        let num = gameRooms[room].playerList != {} ? Object.keys(gameRooms[room].playerList).length : 0;
        const x = startingPos[num][0];
        const y = startingPos[num][1];
        gameRooms[room].playerList[client.id] = new Player(client.id, x, y, num + 1);
        gameRooms[room].playerList[client.id].playerName = playerName;
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
        if (!ValidMove(gameRooms[roomName], player, data.inputId)) return;
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

function ValidMove(gameBoard, player, direction) {
    const board = gameBoard.board;
    let result = false;
    const x = player.x;
    const y = player.y;
    const currentTile = board[y][x];
    if (!gameBoard.boardShifted) return false;
    if (direction == 'up') {
        if (y == 0) return;
        const targetTile = board[y-1][x];
        if (currentTile.allowedDirections[0] == 1 && targetTile.allowedDirections[2] == 1)
            result = true;
    } 
    else if (direction == 'right') {
        if (x == 6) return;
        const targetTile = board[y][x+1];
        if (currentTile.allowedDirections[1] == 1 && targetTile.allowedDirections[3] == 1)
            result = true;
    } 
    else if (direction == 'down') {
        if (y == 6) return;
        const targetTile = board[y+1][x];
        if (currentTile.allowedDirections[2] == 1 && targetTile.allowedDirections[0] == 1)
            result = true;
    }
    else if (direction == 'left') {
        if (x == 0) return;
        const targetTile = board[y][x-1];
        if (currentTile.allowedDirections[3] == 1 && targetTile.allowedDirections[1] == 1)
            result = true;
    }
    return result;
}

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