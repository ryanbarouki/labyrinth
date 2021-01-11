const { TILE_SIZE, BOARD_SPEED, ROTATE_SPEED } = require("./constants.js");

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
    
    for (let i = 1; i < 6; i+=2) {
        // i = 1,3,5;
        SlideColDown(i);
        SlideColUp(i);
        SlideRowRight(i);
        SlideRowLeft(i);
    }
    rotateSpareTile();
    return gameBoard;
}

module.exports = { GameLoop };