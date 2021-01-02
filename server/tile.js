let Tile = function(id, allowedDirections ,rot=Math.floor(Math.random()*4)) {
    let self = {
        id:id,
        rotation:rot,
        allowedDirections: allowedDirections
    }

    self.InitialiseAllowedDirections = function() {
        let arr = this.allowedDirections.slice();
        arr = arr.concat(arr.splice(0,arr.length - this.rotation));
        this.allowedDirections = arr;
    }

    self.UpdateAllowedDirections = function() {
        let arr = this.allowedDirections.slice();
        arr = arr.concat(arr.splice(0,arr.length - 1));
        this.allowedDirections = arr;
    }

    self.InitialiseAllowedDirections(); // call it when constructed
    return self;
}

module.exports = Tile;