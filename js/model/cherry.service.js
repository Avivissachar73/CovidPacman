'use strict';

import EventManager from '../EventManager.js';

import {getIsEnemyInitPos} from './board.service.js';

import utils from '../services/utils.service.js';


function getAllEmptyPoss(board) {
    // var {board} = gState;
    var empties = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isEmpty && !getIsEnemyInitPos({i,j})) empties.push({i,j});
        }
    }
    return empties;
}


export function spreadCherry(board) {
    // var board = gState.board;
    var emptyPoss = getAllEmptyPoss(board);
    if (!emptyPoss.length) return;
    let randomPos = emptyPoss[utils.getRandomInt(0, emptyPoss.length-1)];
    var cherry = board[randomPos.i][randomPos.j] = {
        initialPos: randomPos,
        type: 'food',
        subtype: 'cherry',
        cellId: utils.getRandomId(),
        pos: randomPos,
        score: 15
    }
    EventManager.emit('obj-added', randomPos, board);
}