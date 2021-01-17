const { PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_SPEED, TILE_SIZE} = require("./constants.js");

class Player {
    constructor(id, x, y, xCanvas, yCanvas, playerNumber){
        this.x = x;
        this.y = y;
        this.xCanvas = xCanvas;
        this.yCanvas = yCanvas;
        this.id = id;
        this.score = 0;
        this.cards = [];
        this.playerNumber = playerNumber;
        this.playerName = "";
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.frameX = 0;
        this.frameY = 0;
        this.moving = false;
        this.amountMoved = 0;
        this.moveRight = false;
        this.moveLeft = false;
        this.moveDown = false;
        this.moveUp = false;
    }
}
module.exports = Player;