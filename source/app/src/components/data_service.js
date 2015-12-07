'use strict';

var Service = {

    saveContext(data) {
        chrome.runtime.sendMessage({type: 'saveContent', content: data});
    },

    getContext() {
        return JSON.parse(window.decryptedContent);
    }
};

module.exports = Service;
