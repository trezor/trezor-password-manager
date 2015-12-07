'use strict';

var Service = {

    getContextTest() {
        var pubkey = localStorage.getItem('public_key');
        if (localStorage) {
            return JSON.parse(localStorage.getItem(pubkey));
        } else {
            alert('localstorage not supported');
        }
    },

    saveContext(data) {
        chrome.runtime.sendMessage({type: 'saveContent', content: data});
    },

    getContext() {
        return JSON.parse(window.decryptedContent);
    }
};

module.exports = Service;
