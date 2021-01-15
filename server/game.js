const { TILE_SIZE, BOARD_SPEED, ROTATE_SPEED, PLAYER_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT } = require("./constants.js");
const Player = require("./player.js");

function GameLoop(gameBoard) {
    if (!gameBoard) {
        return;
    }
    let board = gameBoard.board;
    function SlideColDown(col) {
        if(!gameBoard.slideColDown[col]) return;
        gameBoard.amountShifted += BOARD_SPEED; 
        if (gameBoard.amountShifted > TILE_SIZE) {
            gameBoard.slideColDown[col] = false;
            gameBoard.amountShifted = 0;
            return;
        }
        for (let i = 0; i < board.length; i++) {
            let tile = board[i][col];
            tile.y += BOARD_SPEED;
        }
    }

    function SlideColUp(col) {
        if(!gameBoard.slideColUp[col]) return;
        gameBoard.amountShifted += BOARD_SPEED; 
        if (gameBoard.amountShifted > TILE_SIZE) {
            gameBoard.slideColUp[col] = false;
            gameBoard.amountShifted = 0;
            return;
        }
        for (let i = 0; i < board.length; i++) {
            let tile = board[i][col];
            tile.y -= BOARD_SPEED;
        }
    
    }
    function SlideRowRight(row) {
        if(!gameBoard.slideRowRight[row]) return;
        gameBoard.amountShifted += BOARD_SPEED; 
        if (gameBoard.amountShifted > TILE_SIZE) {
            gameBoard.slideRowRight[row] = false;
            gameBoard.amountShifted = 0;
            return;
        }
        for (let i = 0; i < board.length; i++) {
            let tile = board[row][i];
            tile.x += BOARD_SPEED;
        }
    }
    
    function SlideRowLeft(row) {
        if(!gameBoard.slideRowLeft[row]) return;
        gameBoard.amountShifted += BOARD_SPEED; 
        if (gameBoard.amountShifted > TILE_SIZE) {
            gameBoard.slideRowLeft[row] = false;
            gameBoard.amountShifted = 0;
            return;
        }
        for (let i = 0; i < board.length; i++) {
            let tile = board[row][i];
            tile.x -= BOARD_SPEED;
        }
    }

    function rotateSpareTile() {
        if (!gameBoard.rotate) return;
        gameBoard.amountRotated += ROTATE_SPEED;
        if (gameBoard.amountRotated > Math.PI / 2) {
            gameBoard.amountRotated = 0;
            gameBoard.rotate = false;
            return;
        }
        gameBoard.sparePiece.rotation += ROTATE_SPEED;
    }

    function moveRight() {
        const id = gameBoard.playerTurn;
        let player = gameBoard.playerList[id];
        if (!player.moveRight) return;
        if (player.amountMoved >= TILE_SIZE) {
            player.x++; // update the discrete board position at the end of the move
            player.moveRight = false;
            player.amountMoved = 0;
            player.frameY = 0;
            return;
        }

        player.xCanvas += PLAYER_SPEED;
        player.amountMoved += PLAYER_SPEED;
        player.frameY = 2 * PLAYER_HEIGHT;
    }
    function moveLeft() {
        const id = gameBoard.playerTurn;
        let player = gameBoard.playerList[id];
        if (!player.moveLeft) return;
        if (player.amountMoved >= TILE_SIZE) {
            player.x--; // update the discrete board position at the end of the move
            player.moveLeft = false;
            player.amountMoved = 0;
            return;
        }

        player.xCanvas -= PLAYER_SPEED;
        player.amountMoved += PLAYER_SPEED;
    }

    function moveUp() {
        const id = gameBoard.playerTurn;
        let player = gameBoard.playerList[id];
        if (!player.moveUp) return;
        if (player.amountMoved >= TILE_SIZE) {
            player.y--; // update the discrete board position at the end of the move
            player.moveUp = false;
            player.amountMoved = 0;
            return;
        }

        player.yCanvas -= PLAYER_SPEED;
        player.amountMoved += PLAYER_SPEED;
    }
    function moveDown() {
        const id = gameBoard.playerTurn;
        let player = gameBoard.playerList[id];
        if (!player.moveDown) return;
        if (player.amountMoved >= TILE_SIZE) {
            player.x++; // update the discrete board position at the end of the move
            player.moveDown = false;
            player.amountMoved = 0;
            return;
        }

        player.yCanvas += PLAYER_SPEED;
        player.amountMoved += PLAYER_SPEED;
    }

    for (let i = 1; i < 6; i+=2) {
        // i = 1,3,5;
        SlideColDown(i);
        SlideColUp(i);
        SlideRowRight(i);
        SlideRowLeft(i);
    }
    rotateSpareTile();
    const id = gameBoard.playerTurn;
    let player = gameBoard.playerList[id];
    moveLeft();
    moveRight();
    moveUp();
    moveDown();
        
    return gameBoard;
}

module.exports = { GameLoop };