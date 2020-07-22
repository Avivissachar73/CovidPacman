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

const WELCOME_MSG = 'Hello!\ndo you think you can collect all the foods in the market without being infected by any of the other costumers?\nLets play!';
// const WELCOME_MSG = 'Lets play Pacman!';
var PAUSE_MSG = '';

var gIsSupperMode = false;
var gIsGameOver = true;

document.body.onload = async () => {
    connectModel();
    connectEvents();
    setDomMethods();
    createBtnsController(handleKeyPress, 100, 'main');
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
    await Alert(PAUSE_MSG);
    EventManager.emit('resurm-game');
}

function handleKeyPress(event) {
    const key = event.key;
    if (event.preventDefault && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown')) {
        event.preventDefault();
    }
    if (event.key === 'ArrowLeft') EventManager.emit('move-player', {i:0,j:-1});
    if (event.key === 'ArrowRight') EventManager.emit('move-player', {i:0,j:1});
    if (event.key === 'ArrowUp') EventManager.emit('move-player', {i:-1,j:0});
    if (event.key === 'ArrowDown') EventManager.emit('move-player', {i:1,j:0});
}

function init(isStart) {
    EventManager.emit('set-game', isStart);
}

function connectEvents() {
    EventManager.on('game-setted', (board, bestScore) => {
        renderBoard(board);
        PAUSE_MSG = bestScore ? `Game paused <br/> Best score: ${bestScore.name}: ${bestScore.score}` : 'Game paused';
        // reSizeBoard();
    });
    EventManager.on('object-moved', (fromPos, toPos, board) => {
        renderCellByPos(fromPos, board);
        renderCellByPos(toPos, board);
    });
    EventManager.on('player-eaten', (pos, board) => {
        renderCellByPos(pos, board);
    });
    EventManager.on('game-over', async (isVictory, score, isNewHighScore) => {
        console.log('game-over, isVictory:', isVictory, 'score:', score, 'isNewBest:', isNewHighScore);
        if (isVictory) {
            if (isNewHighScore) {
                let playerName = await Prompt(`You broke the high score! You got ${score} points! <br/> save score?`, 'Your name');
                if (playerName) EventManager.emit('save-score', playerName)
            }
            else Alert(`You win! Score: ${score}`);
        }
        // else Alert(`Game over...  Score: ${score}`);
        else Alert(`Game over... <br/> You been infected by a sick costumer.. <br/> Score: ${score}`);
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
