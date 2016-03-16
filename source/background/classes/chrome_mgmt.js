'use strict';

var EventEmitter = require('events');

class Chrome_mgmt {

    constructor() {
        this.emitter = new EventEmitter();
    }


    exists() {
        if (typeof chrome === 'undefined') {
            return Promise.reject(new Error('Global chrome does not exist; probably not running chrome'));
        }
        if (typeof chrome.runtime === 'undefined') {
            return Promise.reject(new Error('Global chrome.runtime does not exist; probably not running chrome'));
        }
        if (typeof chrome.runtime.sendMessage === 'undefined') {
            return Promise.reject(new Error('Global chrome.runtime.sendMessage does not exist; probably not whitelisted website in extension manifest'));
        }
        return Promise.resolve();
    }
}

module.exports = Chrome_mgmt;