const Tile = require('./tile.js');
const {shuffle} = require('./utils.js');
const Card = require("./card.js");
const { TILE_SIZE, BOARD_SIZE, OFFSET, treasure } = require("./constants.js");
const Treasure = require('./treasure.js');

class Board {
    // 0: Corner, 1: Straight, 2: T shape - Tile Types
    constructor() {
        const board = [[new Tile(0, null, 1), new Tile(0, treasure.bag), new Tile(2, treasure.pearl), new Tile(1, null), new Tile(2, treasure.blueStone), new Tile(0, null), new Tile(2, null, 2)],
        [new Tile(2, treasure.chest1), new Tile(1, null), new Tile(1, null), new Tile(1, null), new Tile(1, null), new Tile(2, treasure.chest2), new Tile(1, null)],
        [new Tile(2, treasure.chest3), new Tile(2, treasure.vessel), new Tile(2, treasure.chest4), new Tile(0, null), new Tile(2, treasure.chest5), new Tile(0, null), new Tile(2, treasure.crown1)],
        [new Tile(0, null), new Tile(2, treasure.crown2), new Tile(0, treasure.diamond), new Tile(0, null), new Tile(1, null), new Tile(0, null), new Tile(2, treasure.emerald)],
        [new Tile(2, treasure.gold), new Tile(1, null), new Tile(2, treasure.jewellery), new Tile(0, treasure.key), new Tile(2, treasure.violetStone), new Tile(1, null), new Tile(2, treasure.pinkStone)],
        [new Tile(1, null), new Tile(0, treasure.ring1), new Tile(1, null), new Tile(0, null), new Tile(0, null), new Tile(1, null), new Tile(2, treasure.ring2)],
        [new Tile(0, null, 0), new Tile(0, treasure.ruby), new Tile(2, treasure.scepter), new Tile(1, null), new Tile(2, treasure.scroll), new Tile(0, treasure.scull), new Tile(0, null, 3)]];
        const sparePiece = new Tile(0);
        const cards = [new Card(0), new Card(1), new Card(2), new Card(3), new Card(4), new Card(5),
                    new Card(6), new Card(7), new Card(8), new Card(9), new Card(10), new Card(11),
                    new Card(12), new Card(13), new Card(14), new Card(15), new Card(16), new Card(17),
                    new Card(18), new Card(19), new Card(20), new Card(21), new Card(22), new Card(23)];

        this.board = board;
        this.cards = cards;
        this.sparePiece = sparePiece;
        this.sparePiecePreviousPos =  [-1,-1];
        this.playerList =  {};
        this.gameHasStarted =  false;
        this.playerTurn =  "";
        this.boardShifted =  false;
        this.amountShifted =  1000;
        this.amountRotated = 0;
        this.slideColDown =  {1:false, 3:false, 5:false};
        this.slideColUp =  {1:false, 3:false, 5:false};
        this.slideRowRight =  {1:false, 3:false, 5:false};
        this.slideRowLeft =  {1:false, 3:false, 5:false};
        this.rotate = false;
        this.board = this.InitialiseBoard();
    }

    Score(id) {
        const player = this.playerList[id];
        const x = player.x;
        const y = player.y;
        let cards = player.cards;
        const card = cards[0];
        const tile = this.board[y][x];
        if (tile.treasure == null) return;
        if (tile.treasure.id == card.id) {
            tile.treasure.visible = false;
            if(cards.length > 0){
                cards.splice(0,1);
            }
            if (cards.length == 0) {
                return 1;
            }
            player.score++;
            return 0;
        }
        return 0;
    }

    NextTurn() {
        let playerIds = Object.keys(this.playerList)
        const indexOfCurrentPlayer = playerIds.indexOf(this.playerTurn);
        let indexOfNextPlayer = (indexOfCurrentPlayer + 1).mod(playerIds.length);
        this.playerTurn = playerIds[indexOfNextPlayer];
    }
    
    RotateSparePiece() {
        // this.sparePiece.rotation++
        // this.sparePiece.rotation = this.sparePiece.rotation.mod(4);
        if (this.rotate) return;
        this.rotate = true;
        this.sparePiece.UpdateAllowedDirections();
    }

    InitialiseBoard() {
        let flatBoard = [].concat(...this.board);
        flatBoard.push(this.sparePiece); // add the spare tile to be shuffled

        const fixed = {0:new Tile(0, null, 1),
                       6:new Tile(0, null, 2),
                       42:new Tile(0, null, 0),
                       48:new Tile(0, null, 3)};

        flatBoard = flatBoard.filter(tile => {return !tile.isFixed});
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
        this.InitialiseTileXY(newBoard);
        return newBoard;
    }

    InitialiseTileXY(board) {
        for(let i = 0; i < board.length; i++) {
            for(let j = 0; j < board.length; j++) {
                const tile = board[i][j];
                const x = j * TILE_SIZE + OFFSET;
                const y = i * TILE_SIZE + OFFSET;
                tile.x = x;
                tile.y = y;
                tile.setTreasurePosition();
            }
        }
        // spare piece position
        this.sparePiece.x = OFFSET + 9 * TILE_SIZE;
        this.sparePiece.y = OFFSET;
        this.sparePiece.setTreasurePosition();
    }

    DealCards() {
        if (this.playerList == {}) return;

        let numPlayers = Object.keys(this.playerList).length;
        const cardsPerPlayer = 24 / numPlayers;
        this.cards = shuffle(this.cards);
        let j = 0;
        for (let i in this.playerList){
            let player = this.playerList[i];
            player.cards = this.cards.slice(j, j + cardsPerPlayer);
            j += cardsPerPlayer;
        }
    }

    SetSparePiecePosition() {
        this.sparePiece.x = OFFSET + 9 * TILE_SIZE;
        this.sparePiece.y = OFFSET;
        this.sparePiece.setTreasurePosition();
    }
    ShiftColDown(col) {
        if (this.boardShifted) return;  
        if (col == this.sparePiecePreviousPos[0] && 0 == this.sparePiecePreviousPos[1]) return;   
        this.sparePiece.y = this.board[0][col].y - TILE_SIZE;
        this.sparePiece.x = this.board[0][col].x;
        const sparePieceTemp = this.sparePiece; // save current spare piece
        this.sparePiece = this.board[this.board.length - 1][col]; // set spare piece to last one on col
        this.SetSparePiecePosition();
        this.sparePiecePreviousPos = [col, this.board.length - 1] // save previous location of spare piece
        for (let i = this.board.length - 1; i > 0; i--) {
            this.board[i][col] = this.board[i-1][col];
        }
        this.board[0][col] = sparePieceTemp; // set first piece to original spare piece
        // move players if they are on the col
        for (let i in this.playerList) {
            let player = this.playerList[i];
            if (player.x == col) {
                player.y++;
                player.y = player.y.mod(7);
            }
        }
        this.boardShifted = true;
        this.slideColDown[col] = true;
        this.amountShifted = 0;
    }
    
    ShiftColUp(col) {
        if (this.boardShifted) return;  
        if (col == this.sparePiecePreviousPos[0] && this.board.length - 1 == this.sparePiecePreviousPos[1]) return;
        this.sparePiece.y = this.board[this.board.length - 1][col].y + TILE_SIZE;
        this.sparePiece.x = this.board[this.board.length - 1][col].x;
        const sparePieceTemp = this.sparePiece; // save current spare piece
        this.sparePiece = this.board[0][col]; // set spare piece to first one on col
        this.SetSparePiecePosition();
        this.sparePiecePreviousPos = [col, 0] // save previous location of spare piece
        for (let i = 0; i < this.board.length - 1; i++) {
            this.board[i][col] = this.board[i+1][col];
        }
        this.board[this.board.length - 1][col] = sparePieceTemp; // set first piece to original spare piece
        // move players if they are on the col
        for (let i in this.playerList) {
            let player = this.playerList[i];
            if (player.x == col) {
                player.y--;
                player.y = player.y.mod(7);
            }
        }
        this.boardShifted = true;
        this.slideColUp[col] = true;
        this.amountShifted = 0;
    }
    
    ShiftRowRight(row) {
        if (this.boardShifted) return; 
        if (0 == this.sparePiecePreviousPos[0] && row == this.sparePiecePreviousPos[1]) return;
        this.sparePiece.x = this.board[row][0].x - TILE_SIZE;
        this.sparePiece.y = this.board[row][0].y;
        const sparePieceTemp = this.sparePiece; // save current spare piece
        this.sparePiece = this.board[row][this.board.length - 1]; // set spare piece to last one on col
        this.SetSparePiecePosition();
        this.sparePiecePreviousPos = [this.board.length - 1, row] // save previous location of spare piece
        for (let i = this.board.length - 1; i > 0; i--) {
            this.board[row][i] = this.board[row][i-1];
        }
        this.board[row][0] = sparePieceTemp; // set first piece to original spare piece
        // move players if they are on the row
        for (let i in this.playerList) {
            let player = this.playerList[i];
            if (player.y == row) {
                player.x++;
                player.x = player.x.mod(7);
            }
        }
        this.boardShifted = true;
        this.slideRowRight[row] = true;
        this.amountShifted = 0;
    }
    
    
    ShiftRowLeft(row) {
        if (this.boardShifted) return;  
        if (this.board.length - 1 == this.sparePiecePreviousPos[0] && row == this.sparePiecePreviousPos[1]) return;
        this.sparePiece.x = this.board[row][this.board.length - 1].x + TILE_SIZE;
        this.sparePiece.y = this.board[row][this.board.length - 1].y;
        const sparePieceTemp = this.sparePiece; // save current spare piece
        this.sparePiece = this.board[row][0]; // set spare piece to last one on col
        this.SetSparePiecePosition();
        this.sparePiecePreviousPos = [0, row] // save previous location of spare piece
        for (let i = 0; i < this.board.length - 1; i++) {
            this.board[row][i] = this.board[row][i+1];
        }
        this.board[row][this.board.length - 1] = sparePieceTemp; // set first piece to original spare piece
        // move players if they are on the row
        for (let i in this.playerList) {
            let player = this.playerList[i];
            if (player.y == row) {
                player.x--;
                player.x = player.x.mod(7);
            }
        }
        this.boardShifted = true;
        this.slideRowLeft[row] = true;
        this.amountShifted = 0;
    }
}

Number.prototype.mod = function(n) {
    return ((this%n)+n)%n;
};

module.exports = {Board, TILE_SIZE};