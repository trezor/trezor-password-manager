"use strict";
require('whatwg-fetch');
var Service = {

    getContextTest() {
        return fetch('./data.json', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .catch(function (e) {
                console.log('getTags err: ' + e);
            });
    }

};

module.exports = Service;
