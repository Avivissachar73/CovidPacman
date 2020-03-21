'use strict';

import EventManager from '../EventManager.js';

import {createGameBoard, getIsborder, createEmptyCell, getIsEnemyInitPos} from './board.service.js';
import { getRandomInt } from '../services/utils.service.js';
import utils from '../services/utils.service.js';

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
        isSuperMode: false,
        deadEnemies: [],
        foodCount: boardRes.foodCount,
        eatCount: 0,
        chrryInterval: null
    }
    window.gState = gState;
}

function startGame() {
    gState.isGameOn = true;
    gState.enemiesInterval = setInterval(moveEnemies ,500);
    gState.chrryInterval = setInterval(spreadCherry ,5000);
}

function moveEnemies() {
    var {enemies, deadEnemies} = gState;
    for (let enemy of enemies) {
        const posDiffs = {i:getRandomInt(-1,1), j:getRandomInt(-1,1)};
        const newPos = {i: enemy.pos.i+posDiffs.i, j:enemy.pos.j+posDiffs.j};
        if ([...enemies, ...deadEnemies].find(curr => curr.initialPos.i === newPos.i && curr.initialPos.j === newPos.j)) continue;
        moveObj(enemy, newPos);
    }
}

function moveObj(obj, toPos) {
    if (!gState.isGameOn) return;
    var board = gState.board;
    var toPosObj = board[toPos.i][toPos.j];
    if (toPosObj.type === 'border') return;

    if (obj.type === 'player' && toPosObj.type === 'enemy' ||
        obj.type === 'enemy' && toPosObj.type === 'player') {
            if (gState.isSuperMode) {
                let enemy = obj.type === 'enemy' ? obj : toPosObj;
                let {enemies, deadEnemies} = gState;
                updateScore(enemy.score);
                if (enemy.content) {
                    console.log('yes it does');
                    let content = enemy.content;
                    updateScore(content.score || 0);
                    if (content.type === 'food' || content.type === 'super-food') gState.eatCount++;
                    enemy.content = null;
                }
                board[enemy.pos.i][enemy.pos.j] = createEmptyCell(enemy.pos);
                
                let enemyIdx = enemies.findIndex(curr => curr.cellId === toPosObj.cellId);
                deadEnemies.push(...enemies.splice(enemyIdx, 1));
                console.log('ateEnemy:', enemies, deadEnemies);
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
    else if (obj.type === 'enemy' && toPosObj.type === 'food' && toPosObj.subtype !== 'reg' ||
            obj.type === 'enemy' && toPosObj.type === 'enemy') return

    else if (obj.type === 'enemy' && toPosObj.type === 'food' && !obj.content) {
        // console.log('collecting')
        obj.content = toPosObj;
        board[toPos.i][toPos.j] = createEmptyCell(toPos);
    }

    var prevPos = {...obj.pos};
    
    // if (obj.content) {
        //     console.log(obj.content);
        //     console.log(prevPos);
        //     throw new Error();
        // }
    // board[toPos.i][toPos.j].pos = prevPos;
    // let temp = board[prevPos.i][prevPos.j];
    if (obj.content && obj.content.pos.i === prevPos.i && obj.content.pos.j === prevPos.j) {
        // console.log(obj.content, prevPos);
        board[prevPos.i][prevPos.j] = obj.content;
        if (toPosObj.type === 'food') obj.content = board[toPos.i][toPos.j];
        else obj.content = null;
    } else {
        board[prevPos.i][prevPos.j] = board[toPos.i][toPos.j];
        board[prevPos.i][prevPos.j].pos = prevPos;
    }
    board[toPos.i][toPos.j] = obj;
    obj.pos = toPos;

    // obj.content = null
    EventManager.emit('object-moved', prevPos, toPos, board);

    checkVictory();
}


function doGameOver(isVictory) {
    gState.isGameOn = false;
    clearIntervals();
    EventManager.emit('game-over', isVictory);
}

function clearIntervals() {
    if (!gState) return;
    clearInterval(gState.enemiesInterval);
    clearInterval(gState.chrryInterval);
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
        let {enemies, deadEnemies, board} = gState;
        for (let enemy of deadEnemies) {
            enemy.pos = {...enemy.initialPos};
            enemies.push(enemy);
            let idx = deadEnemies.findIndex(curr => curr.cellId === enemy.cellId);
            deadEnemies.splice(idx, 1);

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


function getAllEmptyPoss() {
    var {board} = gState;
    var empties = [];
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isEmpty && !getIsEnemyInitPos({i,j})) empties.push({i,j});
        }
    }
    return empties;
}


function spreadCherry() {
    var board = gState.board;
    var emptyPoss = getAllEmptyPoss();
    if (!emptyPoss.length) return;
    let randomPos = emptyPoss[getRandomInt(0, emptyPoss.length-1)];
    var cherry = board[randomPos.i][randomPos.j] = {
        initialPos: randomPos,
        type: 'food',
        subtype: 'cherry',
        cellId: utils.getRandomId(),
        pos: randomPos,
        score: 15
    }
    console.log('cherry was created', cherry)
    EventManager.emit('obj-added', randomPos, board);
}