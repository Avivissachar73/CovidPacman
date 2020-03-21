'use strict';

export default {
    renderBoard,
    renderCellByPos,
    getCellIdByPos,
    setReSizeBoard
}

function renderBoard(board, getCellContentCb, selector) {
    var htmlStr = '<table>';
    for (let i = 0; i < board.length; i++) {
        htmlStr += '<tr>';
        for (let j = 0; j < board[i].length; j++) {
            let cell = board[i][j];
            let content = typeof(getCellContentCb) === 'function'? getCellContentCb(cell) : `{i:${i},j:${j}}`;
            htmlStr += `<td id="${getCellIdByPos({i,j})}" class="board-cell">
                            ${content}
                        </td>`
        }
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    document.querySelector(selector).innerHTML = htmlStr;
}


function renderCellByPos(pos, board, getCellContentCb) {
    var cellId = getCellIdByPos(pos);
    var value = typeof(getCellContentCb) === 'function'? getCellContentCb(board[pos.i][pos.j]) : `{i:${i},j:${j}}`;;
    document.querySelector(`#${cellId}`).innerHTML = value;
}

function getCellIdByPos({i,j}) {
    return `cell-${i}-${j}`;
}


function clearAllElsClass(className) {
    var els = document.querySelectorAll(`.${className}`);
    els.forEach(curr => curr.classList.remove(className));
}

function toggleCellClassByPos({i, j}, className) {
    var el = getElementByPos({i, j});
    el.classList.toggle(className);
}

function addClassToElByPos(pos, className) {
    clearAllElsClass(className);
    var elCell = getElementByPos(pos);
    elCell.classList.add(className);
}


function getElementByPos(pos) {
    var elCellId = getCellIdByPos(pos);
    return document.querySelector(`#${elCellId}`);
}




function addClassToCellsByPosses(poses, selector) {
    let els = getElsByPoses(poses)
    els.forEach(curr => curr.classList.add(selector));
}

function getElsByPoses(poss) {
    return poss.map(currPos => {
        return getElementByPos(currPos);
    });
}

function setReSizeBoard(parentSelector, selector) {
    function reSizeBoard() {
        var elBoard = document.querySelector(parentSelector);
        var boardWidth = elBoard.offsetWidth;
        var elBoardTable = elBoard.querySelector(selector);
        var rowCoumt = elBoardTable.querySelector('tr').querySelectorAll('td').length;
        var tdWidth = boardWidth / rowCoumt;
        var boardFontSize = tdWidth/1.55;
        elBoardTable.querySelectorAll('td').forEach(elTd => {
            elTd.style.width = tdWidth + 'px';
            elTd.style.height = tdWidth + 'px';
        })
        elBoardTable.style.width = boardWidth + 'px';
        elBoardTable.style.height = boardWidth + 'px';
        elBoardTable.style['font-size'] = boardFontSize + 'px';
    }
    reSizeBoard();
    window.addEventListener('resize', () => {
        reSizeBoard();
    });
}