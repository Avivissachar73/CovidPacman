'use strict';


export default function createBtnsController(cbFunc, speed = 100, parentSelector = 'body', styleTemplate = _getDefaultStyle()) {
    const template = {
        template: `
            <div class="mobile-controllers">
                ${styleTemplate || ''}
                <div class="arrow-btns">
                    <button value="ArrowUp" class="arrow-btn up-btn">U</button>
                    <button value="ArrowDown"class="arrow-btn down-btn">D</button>
                    <button value="ArrowLeft" class="arrow-btn left-btn">L</button>
                    <button value="ArrowRight" class="arrow-btn right-btn">R</button>
                </div>
                <!-- <div>
                    <button onmouseup="clearActionInterval()" onmousedown="pressActionBtn()" class="fire-btn">F</button>
                </div> -->
            </div>
        `
    }.template;
    const state = {
        arrowsInterval: null,
        arrowsTimeOut: null,
        isArrowPress: false

        // actionInterval: null,
    }
    const pressArowBtn = key => {
        if (state.arrowsInterval || state.arrowsTimeOut) return;
        if (state.isArrowPress) return;
        state.isArrowPress = true;
        cbFunc({key});
        if (!speed) return;
        state.arrowsTimeOut = setTimeout(() => {
            state.arrowsInterval = setInterval(() => {
                // if (!state.arrowsInterval && state.arrowsInterval !== 0 ) return;
                cbFunc({key});
            }, speed);
            state.arrowsTimeOut = null;
        }, 200);
    }; const clearArrowInterval = () => {
        state.isArrowPress = false;
        if (!speed) return;
        clearTimeout(state.arrowsTimeOut);state.arrowsTimeOut = null;
        clearInterval(state.arrowsInterval);state.arrowsInterval = null;
        // if (state.arrowsTimeOut || state.arrowsTimeOut === 0) {
        // }
        // if (state.arrowsInterval || state.arrowsInterval === 0) {
        // }
    }
    // const pressActionBtn = key => {
    //     if (state.actionInterval) return;
    //     sbFunk({key});
    //     state.actionInterval = setInterval(() => cbFunc({key}), speed);
    // }; const clearActionInterval = () => {clearInterval(state.actionInterval);state.actionInterval = null};

    let el = document.createElement('div');
    el.innerHTML = template.trim();
    el = el.firstChild;
    
    el.querySelectorAll('.arrow-btn').forEach(elBtn => {
        elBtn.onmousedown = elBtn.ontouchstart = () => pressArowBtn(elBtn.value);
        elBtn.onmouseup = elBtn.ontouchend = clearArrowInterval;
        // elBtn.ontouchstart = () => pressArowBtn(elBtn.value);
        // elBtn.ontouchend = clearArrowInterval;
    })

    document.querySelector(parentSelector).appendChild(el);
}




function _getDefaultStyle() {
    return {
        template: `
            <style>
                .mobile-controllers {
                    background-color: #a49a9a4a;
                    padding: 10px;
                    margin-top: 5px;
                    /* position: fixed; */
                    z-index: 15;
                    bottom: 0;
                    width: 100%;
                    height: 30%;
                    padding-bottom: 30px;
                    user-select: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .mobile-controllers >*:not(style) {
                    width: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .mobile-controllers button {
                    background-color: rgba(0, 0, 0, 0.2);
                    border: unset;
                    box-shadow: inset 0px 0px 3px 0px rgba(0,0,0,0.5);
                    height: 50px;
                    width: 50px;
                    border-radius: 50%;
                    font-size: 20px;
                    user-select: none;
                }
                .mobile-controllers button:active {
                    transform: scale(0.975);
                }

                .mobile-controllers .arrow-btns {
                    display: grid;
                    grid-template-rows: repeat(3, 40px);
                    grid-template-columns:  repeat(3, 40px);
                }
                .mobile-controllers .arrow-btns >* {
                    background: none;
                }

                .mobile-controllers .up-btn {
                    grid-area: 1/2/1/2;
                }
                .mobile-controllers .down-btn {
                    grid-area: 3/2/3/2;
                }
                .mobile-controllers .left-btn {
                    grid-area: 2/1/2/1;
                }
                .mobile-controllers .right-btn {
                    grid-area: 2/3/2/3;
                }

                @media (min-width: 500px) {
                    .mobile-controllers {
                        display: none;
                    }
                }
            </style>
        `
    }.template
}