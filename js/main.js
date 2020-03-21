'use strict';

import EventManager from './EventManager.js';
import A_Alert from './services/alert.service.js';
const {Confirm, Alert, Prompt} = new A_Alert();

import createBtnsController from './services/btn-controls.cmp.js';

// import utils from './services/utils.service.js';

import connectModel from './model/index.js';

const BOARD_SELECTOR = '#board';

var gIsSupperMode = false;

document.body.onload = () => {
    connectModel();
    connectEvents();
    setDomMethods();
    createBtnsController(handleKeyPress, undefined, 'main');
    init(false);
    setReSizeBoard();
}

function setDomMethods() {
    document.querySelector('.reset-btn').onclick = () => init(true);
    document.body.onkeydown = handleKeyPress;
    // document.querySelector(BOARD_SELECTOR).onkeydown = handleKeyPress;
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
        reSizeBoard();
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
        else Alert(`Game over...`);
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
    var htmlStr = '<table>';
    for (let i = 0; i < board.length; i++) {
        htmlStr += '<tr>';
        for (let j = 0; j < board[i].length; j++) {
            let cell = board[i][j];
            htmlStr += `<td id="${getCellIdByPos({i,j})}" class="board-cell">
                            ${getCellHtmlStr(cell)}
                        </td>`
        }
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    document.querySelector(BOARD_SELECTOR).innerHTML = htmlStr;
}


function getCellIdByPos({i,j}) {
    return `cell-${i}-${j}`;
}

function renderCellByPos(pos, board) {
    var cellId = getCellIdByPos(pos);
    var value = getCellHtmlStr(board[pos.i][pos.j]);
    document.querySelector(`#${cellId}`).innerHTML = value;
}


function getCellHtmlStr(cell) {
    const contentStr = (() => {
        // return '';
        if (cell.isEmpty) return '';
        if (cell.type === 'border') return ``;
        if (cell.type === 'player') return `😷`;
        if (cell.type === 'supper-food') return `S`;
        if (cell.type === 'food') return ``;
        if (cell.type === 'enemy') return `E`;
        return '';
    })();
    const styleStr = (() => {
        var styleStr = '';
        if (cell.type === 'enemy') styleStr = `background-color:${gIsSupperMode? '#b88ae8' : cell.color};`;
        if (cell.type === 'player') styleStr = `background-color:#f3b8a2;`;
        if (cell.type === 'food') styleStr = `background-color:#a2f3ba;`;
        if (cell.type === 'supper-food') styleStr = `background-color:#83e7dd;`;
        return styleStr;
    })();
    const classListStr = (() => {
        return `${cell.type || ''} ${(cell.type === 'player' || cell.type === 'enemy' || cell.type === 'supper-food')? 'content' : ''}`;
    })();
    return `<span style="${styleStr}" class="${classListStr}">${contentStr}</span>`;
}

function setReSizeBoard() {
    reSizeBoard();
    window.addEventListener('resize', () => {
        reSizeBoard();
    });
}
function reSizeBoard() {
    var elBoard = document.querySelector(BOARD_SELECTOR);
    var boardWidth = elBoard.offsetWidth;
    let elBoardTable = elBoard.querySelector('table');
    elBoardTable.style.width = boardWidth + 'px';
    elBoardTable.style.height = boardWidth + 'px';
    elBoardTable.style['font-size'] = boardWidth/30 + 'px';
}