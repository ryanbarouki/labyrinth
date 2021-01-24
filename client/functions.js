function initialiseArrows() {
    const vec1 = new Vec2d(25, 25);
    const vec2 = new Vec2d(25, -25);
    const triPos = [[OFFSET - TILE_SIZE/3, OFFSET + 1.5*TILE_SIZE, Math.PI], [OFFSET - TILE_SIZE/3, OFFSET + 3.5*TILE_SIZE, Math.PI],
                    [OFFSET - TILE_SIZE/3, OFFSET + 5.5*TILE_SIZE, Math.PI], [OFFSET + 1.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2],
                    [OFFSET + 3.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2], [OFFSET + 5.5*TILE_SIZE, BOARD_SIZE - OFFSET + TILE_SIZE/3, Math.PI/2],
                    [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 1.5*TILE_SIZE, 0], [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 3.5*TILE_SIZE, 0], 
                    [BOARD_SIZE - OFFSET + TILE_SIZE/3, OFFSET + 5.5*TILE_SIZE, 0], [OFFSET + 1.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2],
                    [OFFSET + 3.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2], [OFFSET + 5.5*TILE_SIZE, OFFSET - TILE_SIZE/3, Math.PI*3/2]];

    const action = [['rowShiftRight', 1], ['rowShiftRight', 3], ['rowShiftRight', 5],
                      ['colShiftUp', 1], ['colShiftUp', 3], ['colShiftUp', 5],
                      ['rowShiftLeft', 1], ['rowShiftLeft', 3], ['rowShiftLeft', 5],
                      ['colShiftDown', 1], ['colShiftDown', 3], ['colShiftDown', 5]]

    for (let i = 0; i < triPos.length; i++) {
        const tri = new Arrow(vec1, vec2, triPos[i][0], triPos[i][1], action[i]);
        tri.rotate(triPos[i][2]);
        arrows.push(tri);
    }
}


function drawArrows() {
    for (let arrow of arrows) {
        arrow.draw(ctx, "rgb(255, 245, 104)");
    }
}

function drawBoard() {
    ctx.fillStyle = "rgb(0, 50, 90)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let x,y;
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board.length; j++) {
            x = board[i][j].x;
            y = board[i][j].y;
            const ang = board[i][j].rotation;
            const type = board[i][j].type;
            const tile = new TileSprite(x, y, type);
            const sprite = tileSprites[type];
            tile.draw(ctx, sprite, ang)
            const treasure = board[i][j].treasure;
            if (treasure != null && treasure.visible) {
                ctx.drawImage(treasureSprites[treasure.id], treasure.x, treasure.y);
            }
        }
    }
    UpdateScoreBoard();
    drawSparePiece(ctx);
    drawArrows();
    UpdateEndTurnBtn();
    drawPlayers();
}

function drawPlayers() {
    for (let i in players) {
        let player = players[i];
        ctx.drawImage(playerSprites[player.playerNumber], player.frameX, player.frameY, player.width, player.height, player.xCanvas, player.yCanvas, player.width, player.height);
    }
}

function drawSparePiece(ctx){
    const tile = new TileSprite(sparePiece.x, sparePiece.y, sparePiece.type);
    tile.draw(ctx, tileSprites[sparePiece.type], sparePiece.rotation);
    if (sparePiece.treasure != null) {
        ctx.drawImage(treasureSprites[sparePiece.treasure.id], sparePiece.treasure.x, sparePiece.treasure.y);
    }
    // drawRoundedRect(ctx, sparePiece.x, sparePiece.y, 100, 100, 10);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
}

function joinGame() {
    let name = nameInput.value;
    if (!name){
        alert('Please enter a name');
        return;
    }
    const code = gameCodeInput.value;
    socket.emit('joinGame', JSON.stringify({code, name}));
}

function showBoard() {
    lobbyScreen.style.display = "none";
    endGameScreen.style.display = "none";
    gameScreen.style.display = "block";
}

function showLobby() {
    initialScreen.style.display = "none";
    lobbyScreen.style.display = "block";
    lobbyPlayers.innerHTML = "";
    for (let i in players) {
        let player = players[i];
        let id = `player-${player.playerNumber}`;
        lobbyPlayers.innerHTML += `<p>${player.playerName}:</p><div class="player" id=${id}></div>`;
    }
}

function UpdateEndTurnBtn() {
    if (playerId != playerTurn) {
        endTurnBtn.disabled = true;
    } else {
        endTurnBtn.disabled = false;
    }
}

function UpdateScoreBoard() {
    scoreBoard.innerHTML = ""; // clear board
    for (let i in players) {
        let label = "";
        let player = players[i];
        if (!player.cards[0]) return; 
        if (player.id == playerTurn)
            label = "->";
        let targetCardId = player.cards[0].id;
        scoreBoard.innerHTML += `<tr>
                                    <th scope="row">${label}</th>
                                    <td>${player.playerName}</td>
                                    <td>${player.score}</td>
                                    <td><div class="targetCard" id=f${targetCardId}></div></td>
                                </tr>`
    }
}