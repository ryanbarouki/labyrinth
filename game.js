let board = [[null,0,null,1,null,2,null],
             [3,4,5,6,7,8,9],
             [null,10,null,11,null,12,null],
             [13,14,15,16,17,18,19],
             [null,20,null,21,null,22,null],
             [23,24,25,26,27,28,29],
             [null,30,null,31,null,32,null]];


const movingPieces = document.querySelectorAll(".notfixed-tiles");
const arrows = document.querySelectorAll(".arrow");
let sparePiece = 33;
// let col1TopClicked = false;
// let col1BottomClicked = false;
// let col2TopClicked = false;
// let col2BottomClicked = false;
// let col3TopClicked = false;
// let col3BottomClicked = false;
// let row1LeftClicked = false;
// let row1RightClicked = false;
// let row2LeftClicked = false;
// let row2RightClicked = false;
// let row3LeftClicked = false;
// let row3RightClicked = false;

function GiveArrowsEventListeners() {
    for (let i = 0; i < arrows.length; i++) {
        arrows[i].addEventListener("click", function() {
            switch (arrows[i].classList[2]) {
                case "col1-top":
                    ShiftColDown(board, 1);
                    break;
                case "col2-top":
                    ShiftColDown(board, 3);
                    break;
                case "col3-top":
                    ShiftColDown(board, 5);
                    break;
                case "col1-bottom":
                    ShiftColUp(board, 1);
                    break;
                case "col2-bottom":
                    ShiftColUp(board, 3);
                    break;
                case "col3-bottom":
                    ShiftColUp(board, 5);
                    break;
                case "row1-right":  
                    ShiftRowLeft(board, 1);
                    break;          
                case "row1-left":  
                    ShiftRowRight(board, 1);   
                    break;          
                case "row2-right":            
                    ShiftRowLeft(board, 3);       
                    break;          
                case "row2-left":    
                    ShiftRowRight(board, 3);         
                    break;          
                case "row3-right":   
                    ShiftRowLeft(board, 5);          
                    break;          
                case "row3-left":    
                    ShiftRowRight(board, 5);         
                    break;          
                }
        })
        switch (arrows[i].classList[1]) {
            case "arrow-down":
                arrows[i].addEventListener("mouseover", function() {
                    this.style.borderTop = "30px solid rgb(100, 100, 100)";
                })
                arrows[i].addEventListener("mouseout", function() {
                    this.style.borderTop = "30px solid rgb(0, 0, 0)";
                })
                break;
            case "arrow-up":
                arrows[i].addEventListener("mouseover", function() {
                    this.style.borderBottom = "30px solid rgb(100, 100, 100)";
                })
                arrows[i].addEventListener("mouseout", function() {
                    this.style.borderBottom = "30px solid rgb(0, 0, 0)";
                })
                break;
            case "arrow-right":
                arrows[i].addEventListener("mouseover", function() {
                    this.style.borderLeft = "30px solid rgb(100, 100, 100)";
                })
                arrows[i].addEventListener("mouseout", function() {
                    this.style.borderLeft = "30px solid rgb(0, 0, 0)";
                })
                break;
            case "arrow-left":
                arrows[i].addEventListener("mouseover", function() {
                    this.style.borderRight = "30px solid rgb(100, 100, 100)";
                })
                arrows[i].addEventListener("mouseout", function() {
                    this.style.borderRight = "30px solid rgb(0, 0, 0)";
                })
                break;
        }
    }
}

function ShiftColDown(board, col) {
    sparePieceTemp = sparePiece; // save current spare piece
    sparePiece = board[board.length - 1][col]; // set spare piece to last one on col
    for (let i = board.length - 1; i > 0; i--) {
        board[i][col] = board[i-1][col];
    }
    board[0][col] = sparePieceTemp; // set first piece to original spare piece
    UpdateBoard();
}

function ShiftColUp(board, col) {
    sparePieceTemp = sparePiece; // save current spare piece
    sparePiece = board[0][col]; // set spare piece to last one on col
    for (let i = 0; i < board.length - 1; i++) {
        board[i][col] = board[i+1][col];
    }
    board[board.length - 1][col] = sparePieceTemp; // set first piece to original spare piece
    UpdateBoard();
}

function ShiftRowRight(board, row) {
    sparePieceTemp = sparePiece; // save current spare piece
    sparePiece = board[row][board.length - 1]; // set spare piece to last one on col
    for (let i = board.length - 1; i > 0; i--) {
        board[row][i] = board[row][i-1];
    }
    board[row][0] = sparePieceTemp; // set first piece to original spare piece
    UpdateBoard();
}

function ShiftRowLeft(board, row) {
    sparePieceTemp = sparePiece; // save current spare piece
    sparePiece = board[row][0]; // set spare piece to last one on col
    for (let i = 0; i < board.length - 1; i++) {
        board[row][i] = board[row][i+1];
    }
    board[row][board.length - 1] = sparePieceTemp; // set first piece to original spare piece
    UpdateBoard();
}

function UpdateBoard() {
    let table = document.querySelectorAll("td.inner");
    let spareTile = document.querySelector(".spare-tile");
    const flatBoard = [].concat(...board);
    for (let i = 0; i < flatBoard.length; i++){
        if(flatBoard[i] != null){
            table[i].innerHTML = "<div class='notfixed-tiles'" + `id=${flatBoard[i]}>${flatBoard[i]+1}</div>`;
        }
    }
    spareTile.innerHTML = sparePiece + 1;
}

//ShiftColDown(board,3);

GiveArrowsEventListeners();