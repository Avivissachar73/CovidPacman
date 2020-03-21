'use strict';

import EventManager from './EventManager.js';
import A_Alert from './services/alert.service.js';
const {Confirm, Alert, Prompt} = new A_Alert();

import createBtnsController from './services/btn-controls.cmp.js';

import connectModel from './model/index.js';
import boardGameUtils from './services/board-game-utils.js';

import {setPrototypes} from './services/utils.service.js'
setPrototypes()

const BOARD_SELECTOR = '#board';

const WELCOME_MSG = 'Hello!, do you think you can collect all the foods in the market without being infected by any of the other costumers? Lets play!';
// const WELCOME_MSG = 'Lets play Pacman!';

var gIsSupperMode = false;
var gIsGameOver = true;

document.body.onload = async () => {
    connectModel();
    connectEvents();
    setDomMethods();
    createBtnsController(handleKeyPress, undefined, 'main');
    init(false);
    // setReSizeBoard();
    if (await Confirm(WELCOME_MSG)) {
        init(true);
        gIsGameOver = false;
    }
    
}

function setDomMethods() {
    document.querySelector('.reset-btn').onclick = () => {
        init(true);
        gIsGameOver = false;
    }
    document.querySelector('.pause-btn').onclick = pauseGame;
    document.body.onkeydown = handleKeyPress;
    // document.querySelector(BOARD_SELECTOR).onkeydown = handleKeyPress;
}

async function pauseGame() {
    if (gIsGameOver) return;
    EventManager.emit('pause-game');
    await Alert('Game paused');
    EventManager.emit('resurm-game');
}

function handleKeyPress(event) {
    if (event.preventDefault) event.preventDefault();
    if (event.key === 'ArrowLeft') EventManager.emit('move-player', {i:0,j:-1});
    if (event.key === 'ArrowRight') EventManager.emit('move-player', {i:0,j:1});
    if (event.key === 'ArrowUp') EventManager.emit('move-player', {i:-1,j:0});
    if (event.key === 'ArrowDown') EventManager.emit('move-player', {i:1,j:0});
}

function init(isStart) {
    EventManager.emit('set-game', isStart);
}

function connectEvents() {
    EventManager.on('game-setted', (board) => {
        renderBoard(board);
        // reSizeBoard();
    });
    EventManager.on('object-moved', (fromPos, toPos, board) => {
        renderCellByPos(fromPos, board);
        renderCellByPos(toPos, board);
    });
    EventManager.on('player-eaten', (pos, board) => {
        renderCellByPos(pos, board);
    });
    EventManager.on('game-over', isVictory => {
        if (isVictory) Alert(`You win!`);
        // else Alert(`Game over...`);
        else Alert(`Game over... You been infected by a sick costumer..`);
        gIsGameOver = true;
    });
    EventManager.on('score-update', score => {
        document.querySelector('.score-span').innerText = score;
    });
    EventManager.on('obj-added', (pos, board) => {
        renderCellByPos(pos, board);
    });
    EventManager.on('supper-mode', duration => {
        gIsSupperMode = true;
        setTimeout(() => gIsSupperMode = false, duration);
    });
}

function renderBoard(board) {
    boardGameUtils.renderBoard(board, getCellHtmlStr, BOARD_SELECTOR);
    boardGameUtils.setReSizeBoard(BOARD_SELECTOR, 'table');
}

function renderCellByPos(pos, board) {
    boardGameUtils.renderCellByPos(pos, board, getCellHtmlStr);
}


function getCellHtmlStr(cell) {
    const contentStr = (() => {
        if (cell.isEmpty || cell.type === 'border') return ' ';
        if (cell.type === 'player') return '🤠';
        if (cell.type === 'enemy') return ['😷','🤒','🤕','🤢','🤮','🤧'].random();
        if (cell.type === 'food' && cell.subtype === 'food') return ' ';
        if (cell.subtype === 'supper-food') return ['☕','🥛','🍷','🍸','🍺','🍻','🥃','🥤'][0];
        if (cell.subtype === 'cherry') return ['🥑','🍒','🍆','🍉','🍌','🍅','🥥','🥔','🥦','🥕','🌽','🥒','🍄','🍇','🍞','🥐','🥨','🍦','🍨','🍩','🍪','🍰','🍔','🍟','🍕','🌮','🥪','🍿','🍲','🥘','🍳','🥡','🍭','🍬','🍫','🥫'].random();
        return ' ';
    })();
    const styleStr = (() => {
        var styleStr = '';
        if (cell.type === 'enemy') styleStr += ` background-color:${gIsSupperMode? '#b88ae8' : cell.color};`;
        return styleStr;
    })();
    const classListStr = (() => {
        return `${cell.subtype || cell.type || ''}`;
    })();
    return `<span style="${styleStr}" class="${classListStr}">${contentStr}</span>`;
}
