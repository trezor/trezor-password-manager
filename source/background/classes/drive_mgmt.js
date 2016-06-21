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

    createCORSRequest(method, url, authorize) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        if (authorize) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
        }
        return xhr;
    }

    connect() {
        chrome.identity.getAuthToken({'interactive': true}, (token) => {
            this.token = token;
            this.getDriveUsername();
        });
    }

    getDriveUsername() {
        let url = 'https://www.googleapis.com/drive/v2/about';
        let xhr = this.createCORSRequest('GET', url, true);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }
        xhr.onerror = () => {
            alert('Woops, there was an error making the request.');
        };
        xhr.onload = () => {
            let name = JSON.parse(xhr.responseText).name;
            this.bgStore.setUsername(name, 'DRIVE');
        };
        xhr.send();
    }

    setDataFileId() {
        let url = 'https://www.googleapis.com/drive/v2/files?maxResults=1000&spaces=appDataFolder&key=' + API_Key;
        let xhr = this.createCORSRequest('GET', url, true);
        if (!xhr) {
            alert('CORS not supported');
            return;
        }
        xhr.onerror = () => {
            alert('Woops, there was an error making the request.');
        };
        xhr.onload = () => {
            let allFiles = JSON.parse(xhr.responseText).items,
                fileId = false;
            Object.keys(allFiles).forEach((key) => {
                if(allFiles[key].title === this.bgStore.fileName) {
                    fileId = allFiles[key].id
                }
            });
            if(fileId) {
                console.log('FOUND', fileId);
            } else {
                this.bgStore.emit('initStorageFile');
            }

        };
        xhr.send();
    }

    loadFile() {
        if (!this.bgStore.fileName) {
            try {
                this.bgStore.setFileName();
            } catch (ex) {
                console.log('Crypto failed: ', ex);
                //TODO soon please
            }
        }

        if (!this.fileId) {
            this.setDataFileId();
        } else {
            this.loadFileContent();
        }


    }

    loadFileContent() {

    }

    createNewDataFile(data) {
        var uploader = new MediaUploader({
            file: data,
            token: this.token
        });
        uploader.upload();
    }

    updateDataFile() {

    }
}

module.exports = DriveMgmt;