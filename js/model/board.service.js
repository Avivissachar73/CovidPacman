'use strict';

import utils from '../services/utils.service.js';

export const BOARD_SIZE = 21;

var gBoard;

export function createGameBoard() {
    var board = [];
    var res = {
        board,
        player: null,
        enemies: [],
        foodCount: 0
    }
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = createInitializedCell({i,j}, BOARD_SIZE, BOARD_SIZE, res);
        }
    }
    gBoard = board;
    return res;
    // return board;
}

function createInitializedCell(pos, boardHeight, boardWidth, res) {
    var {i, j} = pos;
    
    // if (i === 0 || j === 0 || i === boardHeight-1 || j === boardWidth-1) {
    if (getIsborder(pos, boardHeight, boardWidth)) {
        return creasteBoardCell(pos);
    }

    if (i === 5 && j === 10) {
        let player = createPlayerCell(pos);
        res.player = player;
        return player;
    }

    if ((i === 10 || i === 12) && (j === 9 || j === 11)) {
        let enemy = createEnemyCell(pos);
        res.enemies.push(enemy);
        return enemy;
    }

    if (i === 1 && j === 1 || i === 1 && j === boardWidth-2 ||
        i === boardHeight-2 && j === 1 || i === boardHeight-2 && j === boardWidth-2) {
            res.foodCount ++;
            return createSupperFoodCell(pos);
    }
        
    res.foodCount ++;
    return createRegFoodCell(pos);
}


export function createEmptyCell(pos) {
    return {
        initialPos: {...pos},
        isEmpty: true,
        cellId: utils.getRandomId(),
        pos
    };
}


function createPlayerCell(pos) {
    return {
        initialPos: {...pos},
        type: 'player',
        cellId: utils.getRandomId(),
        pos
    }
}

function createEnemyCell(pos) {
    return {
        initialPos: {...pos},
        type: 'enemy',
        cellId: utils.getRandomId(),
        pos,
        color: utils.getRandomColor(),
        score: 20
    }
}


function creasteBoardCell(pos) {
    return {
        initialPos: {...pos},
        type: 'border',
        cellId: utils.getRandomId(),
        pos,
    }
}

function createSupperFoodCell(pos) {
    return {
        initialPos: {...pos},
        type: 'supper-food',
        cellId: utils.getRandomId(),
        pos,
        score: 20
    }
}

function createRegFoodCell(pos) {
    return {
        initialPos: {...pos},
        type: 'food',
        cellId: utils.getRandomId(),
        pos,
        score: 1
    }
}


export function getIsborder(pos, boardHeight, boardWidth) {
    const {i,j} = pos;

    if (i === 0 || j === 0 || i === boardHeight-1 || j === boardWidth-1) return true;

    if ((i >= 10 && i <= 15) && 
        (j === 7 || j === 13) ||
        i === 15 && j <= 13 && j >= 7) {
            return true;
    }

    return false
}