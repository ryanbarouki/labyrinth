let Tile = function(id, rot=Math.floor(Math.random()*4)) {
    let self = {
        id:id,
        rotation:rot
    }
    return self;
}

module.exports = Tile;