let Player = function(id,x,y,playerNumber) {
    const self = {
        x:x,
        y:y,
        id:id,
        score:0,
        cards: [],
        playerNumber: playerNumber,
        playerName: ""
    }
    self.MoveRight = function(){
        if(this.x < 6)
            this.x++;
    }
    self.MoveLeft = function(){
        if(this.x > 0)
            this.x--;
    }
    self.MoveUp = function(){
        if(this.y > 0)
            this.y--;
    }
    self.MoveDown = function(){
        if(this.y < 6)
            this.y++;
    }
    return self;
}

module.exports = Player;