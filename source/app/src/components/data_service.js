'use strict';
require('whatwg-fetch');
var tempStorage = {
    "tags": {
        "0": {
            "title": "All",
            "icon": "home"
        }
    },
    "entries": {}
};
var Service = {

    getContextTest() {
        return fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(function () {
            var pubkey = sessionStorage.getItem('public_key');
            if (localStorage) {
                if (!localStorage.getItem(pubkey)) {
                    localStorage.setItem(pubkey, JSON.stringify(tempStorage));
                }
                return JSON.parse(localStorage.getItem(pubkey));
            } else {
                alert('localstorage not supported');
            }
        }).catch(function (e) {
            console.log('getTags err: ' + e);
        });
    },

    saveContext(data) {
        var pubkey = sessionStorage.getItem('public_key');
        return localStorage.setItem(pubkey, JSON.stringify(data));
    },

    getContext() {
        var pubkey = sessionStorage.getItem('public_key');
        return JSON.parse(localStorage.getItem(pubkey));
    }
};

module.exports = Service;
