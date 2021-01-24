class Vec2d {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    add(vec) {
        return new Vec2d(this.x + vec.x, this.y + vec.y);
    }

    rotate(ang) {
        const x = this.x * Math.cos(ang) - this.y * Math.sin(ang);
        const y = this.x * Math.sin(ang) + this.y * Math.cos(ang);
        return new Vec2d(x,y);
    }

    cross(vec){
        return this.x * vec.y - this.y * vec.x;
    }
}

class Triangle {
    constructor(vec1, vec2, x, y) {
        this.vec1 = vec1; //new Vec2d(vec1.x, vec1.y);
        this.vec2 = vec2; //new Vec2d(vec2.x, vec2.y);
        this.x = x;
        this.y = y;
        this.posVec = new Vec2d(x,y);
        this.colour = "rgb(255, 245, 104)";
    }
    
    rotate(ang) {
        this.vec1 = this.vec1.rotate(ang);
        this.vec2 = this.vec2.rotate(ang);
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.vec1.x, this.y + this.vec1.y);
        ctx.lineTo(this.x + this.vec2.x, this.y + this.vec2.y);
        ctx.fillStyle = this.colour;
        ctx.fill();
    }
}

class Arrow extends Triangle {
    constructor(vec1, vec2, x, y, action){
        super(vec1, vec2, x, y);
        this.action = action;
    }

    clicked(xmouse, ymouse) {
        let mouseVec = new Vec2d(xmouse, ymouse);
        // let mouseVec = originoftirangle + a*vec1 + b*vec2
        const a = (mouseVec.cross(this.vec2) - this.posVec.cross(this.vec2)) / this.vec1.cross(this.vec2);
        const b = -(mouseVec.cross(this.vec1) - this.posVec.cross(this.vec1)) / this.vec1.cross(this.vec2);
        // formula to determine if vector is interior to triangle
        if (a > 0 && b > 0 && a + b < 1){
            return true;
        }
        return false;
    }
}

class TileSprite {
    constructor(x,y,type){
        this.x = x;
        this.y = y;
        this.type = type;
    }

    draw(ctx, sprite, ang) {
        ctx.save();
        ctx.translate(this.x + TILE_SIZE / 2, this.y + TILE_SIZE / 2);
        ctx.rotate(ang);
        ctx.drawImage(sprite, 0, 0, sprite.naturalWidth, sprite.naturalHeight, -TILE_SIZE / 2, -TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);
        ctx.restore();
    }

    clicked(xmouse, ymouse) {
        return (xmouse > this.x && xmouse < this.x + TILE_SIZE && ymouse > this.y && ymouse < this.y + TILE_SIZE)
    }
}

class PlayerSprite {
    constructor(x, y, ) {
        this.x = x;
        this.y = y;
    }

    draw(ctx, sprite) {
        ctx.drawImage()
    }
}