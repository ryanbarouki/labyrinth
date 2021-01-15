const BOARD_SIZE = 800;
const TILE_SIZE = BOARD_SIZE/10;
const OFFSET = (BOARD_SIZE - 7 * TILE_SIZE) / 2
const BOARD_SPEED = 10;
const FRAME_RATE = 25;
const ROTATE_SPEED = Math.PI/16;
const PLAYER_HEIGHT = 192/4
const PLAYER_WIDTH = 128/4;
const PLAYER_SPEED = 5;
const PLAYER_OFFSET_X = (TILE_SIZE - PLAYER_WIDTH) / 2;
const PLAYER_OFFSET_Y = (TILE_SIZE - PLAYER_HEIGHT) / 2;
module.exports = {PLAYER_OFFSET_X, PLAYER_OFFSET_Y, TILE_SIZE, FRAME_RATE, BOARD_SIZE, OFFSET, BOARD_SPEED, ROTATE_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_SPEED};