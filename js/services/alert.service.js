'use strict';

export default class A_Alert {
    static counter = 0;
    id = 0;

    idClass = '';
    RootClass = 'A-Alert';
    pasitionClass = 'alert-fixed';
    compactClass = 'compact-alert';
    parentSelector = '';
    styleTemplateStr = '';

    constructor(parentSelector = 'body', isAbsolute = false, styleTemplateStr = _getDefaultAlertStyle()) {
        this.parentSelector = parentSelector;
        this.id = A_Alert.counter++;

        if (isAbsolute) this.pasitionClass = 'alert-absolute';

        this.styleTemplateStr = styleTemplateStr;

        this.idClass = 'ALERT' + this.id;
    }

    state = {
        type: '',
        msg: '',
        placeHolder: '',
    
        reject: undefined,
        resolve: undefined,
    }

    Confirm = (msg = '') => {
        return this._seStatePromise('confirm', msg, '');
    }
    Alert = (msg = '') => {
        return this._seStatePromise('alert', msg, '');
    }
    Prompt = (msg = '', placeHolder = '') => {
        return this._seStatePromise('prompt', msg, placeHolder);
    }

    _render() {
        var {msg, type, placeHolder} = this.state;
        return `
            ${this.styleTemplateStr}
            <div class="alert-screen"></div>
            <section class="alert-modal">
                <p class="msg">${msg}</p>
                ${type === 'prompt' && `
                    <form class="a-alert-prompt-form">
                        <input type="text" placeholder="${placeHolder}"/>
                        <button>Submit</button>
                    </form>
                    <button class="a-alert-reject-btn">Close</button>
                ` || `
                    <div class="a-alert-buttons-container">
                        ${type === 'confirm' && `
                            <button class="a-alert-confirm-btn">Confirm</button>
                            <button class="a-alert-reject-btn">Cancel</button>
                        ` || `
                            <button class="a-alert-reject-btn">Close</button>
                        `}
                    </div>
                `}
            </section>
            `
    }

    _show = () => {
        const alertHtmlStr = this._render();
        var elAlert = document.querySelector('.' + this.idClass);
        if (!elAlert) {
            elAlert = document.createElement('div');
            elAlert.classList = `${this.RootClass} ${this.idClass} ${this.pasitionClass}`;

            let elParent = document.querySelector(this.parentSelector);
            if (elParent.offsetWidth < 400) elAlert.classList.add(this.compactClass);
            elParent.appendChild(elAlert);
        }
        elAlert.innerHTML = alertHtmlStr;
        elAlert.classList.add(this.state.type);
        try {elAlert.querySelector('.a-alert-prompt-form').onsubmit = event => this._promptResolve(event);} catch(err) {}
        try {elAlert.querySelector('.a-alert-reject-btn').onclick = this.state.type === 'confirm' ? 
                                                                                this._alertResolveFalse : 
                                                                                this._alertResolveUndefined ;
                                                                    } catch(err) {}
        try {elAlert.querySelector('.a-alert-confirm-btn').onclick = this._alertResolveTrue;} catch(err) {}
    }
    
    _hide = (prmCbFunc, val = undefined) => {
        var currTypeClassName = this.state.type;
        this.state.isPending = false;
        this.state.msg = '';
        this.state.type = '';
        this.state.placeHolder = '';
        this.state.resolve = undefined;
        this.state.reject = undefined;

        var elAlert = document.querySelector('.' + this.idClass);
        elAlert.classList.remove(currTypeClassName);
        elAlert.innerHTML = null;
        return prmCbFunc(val);
    }

    _alertResolveTrue = () => {
        return this.state.resolve(true);
    }
    _alertResolveFalse = () => {
        return this.state.resolve(false);
    }
    _alertResolveUndefined = () => {
        this.state.resolve();
    }
    _alertReject = () => {
        return this.state.reject();
    }
    _promptResolve = (ev) => {
        ev.preventDefault();
        var value = ev.target.querySelector('input').value;
        if (!value.length) return;
        ev.target.querySelector('input').value = '';
        return this.state.resolve(value);
    }

    _seStatePromise = (type, msg = '', placeHolder = '') => {
        if (this.state.isPending) return Promise.reject(`NOTE: can not set new alert becouse another alert is already in pending state.`);
        this.state.isPending = true;
        this.state.type = type;
        this.state.msg = msg;
        this.state.placeHolder = placeHolder;
        this._show();
        return new Promise((resolve, reject) => {
            this.state.resolve = (val) => this._hide(val => resolve(val), val);
            this.state.reject = () => this._hide(reject);
        });
    }
}

var tryAlert = new A_Alert();
window.Alert = tryAlert.Alert;
window.Confirm = tryAlert.Confirm;
window.Prompt = tryAlert.Prompt;

function _getDefaultAlertStyle() {
    return  {
        name: 'alert-style',
        template: `
            <style>
                .A-Alert .alert-screen {
                    top: 0;
                    right: 0;
                    background-color: rgba(0, 0, 0, 0.05);
                    z-index: 29;
                }
                .A-Alert.alert-absolute .alert-screen {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                }
                .A-Alert.alert-fixed .alert-screen {
                    position: fixed;
                    width: 100%;
                    height: 100vh;
                }
    
                .A-Alert .alert-modal {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: #fff;
                    border: 1px solid rgb(165, 12, 12);
                    border-radius: 20px;
                    width: 350px;
                    padding: 20px;
                    z-index: 30 !important;
                    right: 50%;
                    bottom: 50%;
                    transform: translate(50%, 50%);
                    font-family: Verdana, Geneva, Tahoma, sans-serif;
                }
                .A-Alert.compact-alert.alert-absolute .alert-modal {
                    width: 75%;
                }
                .A-Alert.alert-absolute .alert-modal {
                    position: absolute;
                }
                .A-Alert.alert-fixed .alert-modal {
                    position: fixed;
                    top: 12vh;
                    bottom: unset;
                    transform: translate(50%, 0);
                }
    
                .A-Alert .alert-modal > * {
                    text-align: center;
                    width: 100%;
                    margin: 20px 0;
                }
    
                .A-Alert .alert-modal .a-alert-buttons-container, 
                .A-Alert .alert-modal .a-alert-prompt-form {
                    display: flex;
                    align-items: center;
                    justify-content: space-around;
                    flex-wrap: wrap;
                }
                .A-Alert .alert-modal .a-alert-buttons-container >*, 
                .A-Alert .alert-modal .a-alert-prompt-form >* {
                    margin: 5px;
                }
    
                .A-Alert .alert-modal button {
                    background: unset;
                    <!-- font-size: 1rem; -->
                    font-size: 0.8rem;
                    border: 1px solid rgb(165, 12, 12);
                    border-radius: 7.5px;
                    outline: unset;
                    color: rgb(165, 12, 12);
                    width: fit-content;
                }
                .A-Alert .alert-modal button:hover {
                    cursor: pointer;
                }
                .A-Alert .alert-modal button:active {
                    cursor: pointer;
                    border: 1px solid #eca1a1;
                    color: #eca1a1;
                }

                .A-Alert .alert-modal input {
                    width: 60%;
                    outline: none;
                    padding: 5px;
                    padding-left: none;
                    border: unset;
                    background: unset;
                    border-bottom: 1px solid black;
                }
    
                
                @media (max-width: 400px) {
                    .A-Alert.alert-fixed .alert-modal {
                        width: 80vw;
                    }
                }
    
            </style>
    `
    }.template
}