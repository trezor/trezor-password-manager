/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.appdata"
    ],
    API_Key = 'AIzaSyDNcyX6piYuaG0oW0P0kc6e_mgdyLrxFrg';

class DriveMgmt {

    constructor(bgStore) {
        this.bgStore = bgStore;
        this.token = false;
    }

    createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
        return xhr;
    }

    connectToDrive() {
        chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
            this.token = token;
            this.setDriveUsername();
        });
    }

    setDriveUsername() {
        var url = 'https://www.googleapis.com/drive/v2/about';
        var xhr = this.createCORSRequest('GET', url);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }
        xhr.onerror = () => {
            alert('Woops, there was an error making the request.');
        };
        xhr.onload = () => {
            console.log(JSON.parse(xhr.responseText).name);
        };
        xhr.send();
    }
}

module.exports = DriveMgmt;