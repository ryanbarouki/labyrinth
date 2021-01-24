const Treasure = require('./treasure.js');
const {TREASURE_OFFSET} = require('./constants.js');

class Tile {
    constructor(type, treasureId, rot = null) {
        this.type = type;
        this.isFixed = rot != null ? true : false; // it is fixed if I specify a rotation in constructor
        this.rotation = rot ? rot * Math.PI / 2 : Math.floor(Math.random()*4) * Math.PI / 2;
        this.x = 0;
        this.y = 0;
        this.rotating = false;
        this.treasure = treasureId != null ? new Treasure(treasureId) : null;
        this.allowedDirectionsByType = {0: [1,1,0,0],
                                        1: [0,1,0,1],
                                        2: [1,1,0,1]};

        this.allowedDirections = this.allowedDirectionsByType[type];
        this.InitialiseAllowedDirections();
    } 

    InitialiseAllowedDirections() {
        let arr = this.allowedDirections.slice();
        const shift = this.rotation / (Math.PI/2);
        arr = arr.concat(arr.splice(0,arr.length - shift));
        this.allowedDirections = arr;
    }
    
    UpdateAllowedDirections() {
        let arr = this.allowedDirections.slice();
        arr = arr.concat(arr.splice(0,arr.length - 1));
        this.allowedDirections = arr;
    }

    setTreasurePosition() {
        if (!this.treasure) return;
        this.treasure.x = this.x + TREASURE_OFFSET;
        this.treasure.y = this.y + TREASURE_OFFSET;
    }
}

module.exports = Tile;