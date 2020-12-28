let Board = function () {
    const board = [[0, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 31, 32, 33, 34],
    [35, 36, 37, 38, 39, 40, 41],
    [42, 43, 44, 45, 46, 47, 48]]
    const sparePiece = 49;
    let self = {
        board:board,
        sparePiece:sparePiece,
        ShiftColDown: ShiftColDown,
        ShiftColUp: ShiftColUp,
        ShiftRowLeft: ShiftRowLeft,
        ShiftRowRight: ShiftRowRight,
        playerList: Object
    };
    return self;
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

function ShiftColDown(col) {
    sparePieceTemp = this.sparePiece; // save current spare piece
    this.sparePiece = this.board[this.board.length - 1][col]; // set spare piece to last one on col
    for (let i = this.board.length - 1; i > 0; i--) {
        this.board[i][col] = this.board[i-1][col];
    }
    this.board[0][col] = sparePieceTemp; // set first piece to original spare piece
    // move pieces if they are on the col
    for (let i in this.playerList) {
        let player = this.playerList[i];
        if (player.x == col) {
            player.y++;
            player.y = player.y.mod(7);
        }
    }
}

function ShiftColUp(col) {
    sparePieceTemp = this.sparePiece; // save current spare piece
    this.sparePiece = this.board[0][col]; // set spare piece to last one on col
    for (let i = 0; i < this.board.length - 1; i++) {
        this.board[i][col] = this.board[i+1][col];
    }
    // move pieces if they are on the col
    this.board[this.board.length - 1][col] = sparePieceTemp; // set first piece to original spare piece
    for (let i in this.playerList) {
        let player = this.playerList[i];
        if (player.x == col) {
            player.y--;
            player.y = player.y.mod(7);
        }
    }
}

function ShiftRowRight(row) {
    sparePieceTemp = this.sparePiece; // save current spare piece
    this.sparePiece = this.board[row][this.board.length - 1]; // set spare piece to last one on col
    for (let i = this.board.length - 1; i > 0; i--) {
        this.board[row][i] = this.board[row][i-1];
    }
    // move pieces if they are on the row
    this.board[row][0] = sparePieceTemp; // set first piece to original spare piece
    for (let i in this.playerList) {
        let player = this.playerList[i];
        if (player.y == row) {
            player.x++;
            player.x = player.x.mod(7);
        }
    }
}


function ShiftRowLeft(row) {
    sparePieceTemp = this.sparePiece; // save current spare piece
    this.sparePiece = this.board[row][0]; // set spare piece to last one on col
    for (let i = 0; i < this.board.length - 1; i++) {
        this.board[row][i] = this.board[row][i+1];
    }
    // move pieces if they are on the row
    this.board[row][this.board.length - 1] = sparePieceTemp; // set first piece to original spare piece
    for (let i in this.playerList) {
        let player = this.playerList[i];
        if (player.y == row) {
            player.x--;
            player.x = player.x.mod(7);
        }
    }
}

module.exports = Board;