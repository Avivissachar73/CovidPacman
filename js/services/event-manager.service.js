'use strict';

import utils from './utils.service.js';


export default class EventManager {
    Events = {};
    
    on = (eventName, cbFunc, id) => {
        if (!this.Events[eventName]) this.Events[eventName] = [];
        if (!id) id = utils.getRandomId();
        var disConnectFunc = () => this.off(eventName, id);
        var funcObj = {cbFunc, id, off: disConnectFunc};
    
        this.Events[eventName].push(funcObj);
        return disConnectFunc;
    }
    
    off = (eventName, id) => {
        var idx = this.Events[eventName].find(curr => curr.id === id);
        if (idx === -1) throw new Error('Something went wrong');
        this.Events[eventName].splice(idx, 1);
    }
    
    emit = (eventName, ...args) => {
        // if (!this.Events[eventName]) throw new Error(`${eventName} is not a known event`);
        if (!this.Events[eventName]) return;
        this.Events[eventName].forEach(curr => {
            try {
                curr.cbFunc(...args);
            } catch(err) {
                throw new Error(`Something went wrong, couldnt emit '${eventName}': ${err}`);
            }
        });
    }
}
