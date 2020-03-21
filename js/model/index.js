'use strict';

import EventManager from '../EventManager.js';

import {createGameBoard, getIsborder, createEmptyCell, getIsEnemyInitPos} from './board.service.js';
import { getRandomInt } from '../services/utils.service.js';

import {spreadCherry} from './cherry.service.js';

export default function connectEvents() {
    EventManager.on('set-game', (isStartGame) => {
        init(isStartGame);
        EventManager.emit('game-setted', gState.board);
    });
    EventManager.on('move-player', posDiffs => {
        const {i : diffI, j : diffJ} = posDiffs;
        var {player} = gState;
        moveObj(player, {i:player.pos.i+diffI, j:player.pos.j+diffJ});
    });
    EventManager.on('pause-game', pauseGame);
    EventManager.on('resurm-game', startGame);
}

var gState;

function init(isStartGame) {
    clearIntervals();
    setState();
    updateScore(0);
    if (isStartGame) startGame();
}

function setState() {
    var boardRes = createGameBoard()
    gState = {
        board: boardRes.board,
        score: 0,
        enemies: boardRes.enemies,
        player: boardRes.player,
        enemiesInterval: null,
        isGameOn: false,
        isGameOver: false,
        isSuperMode: false,
        deadEnemies: [],
        foodCount: boardRes.foodCount,
        eatCount: 0,
        chrryInterval: null
    }
    window.gState = gState;
}

function startGame() {
    if (gState.isGameOver) return;
    gState.isGameOn = true;
    gState.enemiesInterval = setInterval(moveEnemies ,500);
    gState.chrryInterval = setInterval(() => spreadCherry(gState.board) ,5000);
}

function doGameOver(isVictory) {
    pauseGame();
    gState.isGameOver = true;
    EventManager.emit('game-over', isVictory);
}

function pauseGame() {
    if (!gState.isGameOn) return;
    gState.isGameOn = false;
    clearIntervals();
}

function clearIntervals() {
    if (!gState) return;
    clearInterval(gState.enemiesInterval);
    clearInterval(gState.chrryInterval);
}


function moveEnemies() {
    var {enemies} = gState;
    for (let enemy of enemies) {
        const posDiffs = {i:getRandomInt(-1,1), j:getRandomInt(-1,1)};
        const newPos = {i: enemy.pos.i+posDiffs.i, j:enemy.pos.j+posDiffs.j};
        if (getIsEnemyInitPos(newPos)) continue;
        moveObj(enemy, newPos);
    }
}

function moveObj(obj, toPos) {
    if (getIsEnemyInitPos(toPos)) return;
    if (obj.isDead) return;
    if (!gState.isGameOn) return;
    var board = gState.board;
    fixToPos(toPos, board)
    var toPosObj = board[toPos.i][toPos.j];
    if (toPosObj.type === 'border') return;

    if (obj.type === 'player' && toPosObj.type === 'enemy' ||
        obj.type === 'enemy' && toPosObj.type === 'player') {
        if (gState.isSuperMode) {
            let enemy = obj.type === 'enemy' ? obj : toPosObj;
            enemy.isDead = true;
            let {enemies, deadEnemies} = gState;
            updateScore(enemy.score);
            if (enemy.content) {
                let content = enemy.content;
                updateScore(content.score || 0);
                if (content.type === 'food' && content.subtype !== 'cherry') gState.eatCount++;
                enemy.content = null;
            }
            board[enemy.pos.i][enemy.pos.j] = createEmptyCell(enemy.pos);
        }    
        else return doGameOver();
    }
    else if (obj.type === 'player' && toPosObj.type === 'food') {
        if (toPosObj.subtype === 'supper-food') {
            if (gState.isSuperMode) return;
            setSupperMode();
        }
        if (toPosObj.subtype !== 'cherry') gState.eatCount++;
        updateScore(toPosObj.score);
        board[toPos.i][toPos.j] = createEmptyCell(toPos);
    }
    else if (obj.type === 'enemy' && toPosObj.type === 'food' && toPosObj.subtype === 'supper-food' ||
            obj.type === 'enemy' && toPosObj.type === 'enemy') return

    else if (obj.type === 'enemy' && toPosObj.type === 'food' && !obj.content) {
        // console.log('collecting')
        obj.content = toPosObj;
        board[toPos.i][toPos.j] = createEmptyCell(toPos);
    }

    var prevPos = {...obj.pos};
    
    if (obj.content && obj.content.pos.i === prevPos.i && obj.content.pos.j === prevPos.j) {
        board[prevPos.i][prevPos.j] = obj.content;
        if (toPosObj.type === 'food') obj.content = board[toPos.i][toPos.j];
        else obj.content = null;
    } else {
        board[prevPos.i][prevPos.j] = board[toPos.i][toPos.j];
        board[prevPos.i][prevPos.j].pos = prevPos;
    }
    board[toPos.i][toPos.j] = obj;
    obj.pos = toPos;

    EventManager.emit('object-moved', prevPos, toPos, board);

    checkVictory();
}

function updateScore(diff) {
    gState.score += diff;
    EventManager.emit('score-update', gState.score);
}

function setSupperMode() {
    const supperDuration = 5000;
    gState.isSuperMode = true;
    setTimeout(() => {
        gState.isSuperMode = false;
        let {enemies, board} = gState;
        for (let enemy of enemies) {
            if (!enemy.isDead) continue;
            enemy.isDead = false;
            enemy.pos = {...enemy.initialPos};
            board[enemy.initialPos.i][enemy.initialPos.j] = enemy;
            EventManager.emit('obj-added', enemy.pos, board);
        }
    }, supperDuration);
    EventManager.emit('supper-mode', supperDuration);
}


function checkVictory() {
    if (gState.foodCount === gState.eatCount) {
        doGameOver(true);
    }
}


function fixToPos(pos, board) {
    const {i, j} = pos;
    if (i > board.length-1) pos.i = 0;
    else if (i < 0) pos.i = board.length-1;

    if (j > board[0].length-1) pos.j = 0;
    else if (j < 0) pos.j = board[0].length-1;
}