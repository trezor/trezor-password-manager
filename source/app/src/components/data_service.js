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
        var pubkey = localStorage.getItem('public_key');
        return localStorage.setItem(pubkey, JSON.stringify(data));
    },

    getContext() {
        var pubkey = localStorage.getItem('public_key');
        return JSON.parse(localStorage.getItem(pubkey));
    }
};

module.exports = Service;
