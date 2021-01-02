const Tile = require('./tile.js');
const {shuffle} = require('./utils.js');
const Card = require("./card.js");

let Board = function () {
    const board = [[new Tile(0,0), new Tile(1), new Tile(2), new Tile(3), new Tile(4), new Tile(5), new Tile(6,1)],
    [new Tile(7), new Tile(8), new Tile(9), new Tile(10), new Tile(11), new Tile(12), new Tile(13)],
    [new Tile(14), new Tile(15), new Tile(16), new Tile(17), new Tile(18), new Tile(19), new Tile(20)],
    [new Tile(21), new Tile(22), new Tile(23), new Tile(24), new Tile(25), new Tile(26), new Tile(27)],
    [new Tile(28), new Tile(29), new Tile(30), new Tile(31), new Tile(32), new Tile(33), new Tile(34)],
    [new Tile(35), new Tile(36), new Tile(37), new Tile(38), new Tile(39), new Tile(40), new Tile(41)],
    [new Tile(42,3), new Tile(43), new Tile(44), new Tile(45), new Tile(46), new Tile(47), new Tile(48,2)]]
    const sparePiece = new Tile(49);
    let cards = [new Card(1), new Card(2), new Card(4), new Card(7), new Card(12), new Card(14),
                   new Card(15), new Card(16), new Card(18), new Card(20), new Card(22), new Card(23),
                   new Card(27), new Card(28), new Card(30), new Card(31), new Card(32), new Card(34),
                   new Card(36), new Card(41), new Card(43), new Card(44), new Card(46), new Card(49)];
    let self = {
        board:board,
        sparePiece:sparePiece,
        ShiftColDown: ShiftColDown,
        ShiftColUp: ShiftColUp,
        ShiftRowLeft: ShiftRowLeft,
        ShiftRowRight: ShiftRowRight,
        playerList: {},
        gameHasStarted: false,
        playerTurn: ""
    };

    self.Score = function(id) {
        const player = this.playerList[id];
        const x = player.x;
        const y = player.y;
        let cards = player.cards;
        const card = cards[0];
        const tile = this.board[y][x];
        if (tile.id == card.id) {
            if(cards.length > 0){
                cards.splice(0,1);
            }
            if (cards.length == 0) {
                return 1;
            }
            player.score++;
            return 0;
        }
    }

    self.NextTurn = function() {
        let playerIds = Object.keys(this.playerList)
        const indexOfCurrentPlayer = playerIds.indexOf(this.playerTurn);
        let indexOfNextPlayer = (indexOfCurrentPlayer + 1).mod(playerIds.length);
        this.playerTurn = playerIds[indexOfNextPlayer];
    }
    
    self.RotateSparePiece = function () {
        this.sparePiece.rotation++
        this.sparePiece.rotation = this.sparePiece.rotation.mod(4);
    }

    self.InitialiseBoard = function(board) {
        let flatBoard = [].concat(...board);
        flatBoard.push(this.sparePiece); // add the spare tile to be shuffled

        const fixed = {0:new Tile(0,0),
                       6:new Tile(6,1),
                       42:new Tile(42,3),
                       48:new Tile(48,2)};

        flatBoard = flatBoard.filter(tile => {return !(Object.keys(fixed).includes(String(tile.id)))});
        flatBoard = shuffle(flatBoard);

        // add fixed tiles back in
        for (let i in fixed) {
            flatBoard.splice(i, 0, fixed[i]);
        }

        // replace spare and remove from board array
        this.sparePiece = flatBoard[flatBoard.length - 1];
        flatBoard.splice(flatBoard.length - 1,1);

        const newBoard = [];
        while(flatBoard.length) newBoard.push(flatBoard.splice(0,7));
        return newBoard;
    }

    self.DealCards = function() {
        if (this.playerList == {}) return;

        let numPlayers = Object.keys(this.playerList).length;
        const cardsPerPlayer = 24 / numPlayers;
        cards = shuffle(cards);
        let j = 0;
        for (let i in this.playerList){
            let player = this.playerList[i];
            player.cards = cards.slice(j, j + cardsPerPlayer);
            j += cardsPerPlayer;
        }
    }

    self.board = self.InitialiseBoard(board);

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
    this.board[this.board.length - 1][col] = sparePieceTemp; // set first piece to original spare piece
    // move pieces if they are on the col
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
    this.board[row][0] = sparePieceTemp; // set first piece to original spare piece
    // move pieces if they are on the row
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
    this.board[row][this.board.length - 1] = sparePieceTemp; // set first piece to original spare piece
    // move pieces if they are on the row
    for (let i in this.playerList) {
        let player = this.playerList[i];
        if (player.y == row) {
            player.x--;
            player.x = player.x.mod(7);
        }
    }
}

module.exports = Board;