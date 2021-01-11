class Tile {
    constructor(id, allowedDirections, type, rot=Math.floor(Math.random()*4)) {

        this.id = id;
        this.type = type;
        this.rotation = rot * Math.PI / 2;
        this.allowedDirections = allowedDirections;
        this.x = 0;
        this.y = 0;
        this.InitialiseAllowedDirections();
    }
    
    InitialiseAllowedDirections() {
        let arr = this.allowedDirections.slice();
        arr = arr.concat(arr.splice(0,arr.length - this.rotation));
        this.allowedDirections = arr;
    }
    
    UpdateAllowedDirections() {
        let arr = this.allowedDirections.slice();
        arr = arr.concat(arr.splice(0,arr.length - 1));
        this.allowedDirections = arr;
    }
}

module.exports = Tile;