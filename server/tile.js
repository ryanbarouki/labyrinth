class Tile {
    constructor(id, type, rot=Math.floor(Math.random()*4)) {

        this.id = id;
        this.type = type;
        this.rotation = rot * Math.PI / 2;
        this.x = 0;
        this.y = 0;
        this.rotating = false;
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
}

module.exports = Tile;