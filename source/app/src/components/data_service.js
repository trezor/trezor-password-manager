"use strict";

require('whatwg-fetch');
var dataService = {

    getUserTagsTest() {
        return fetch('./tags.json', {
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

module.exports = dataService;
