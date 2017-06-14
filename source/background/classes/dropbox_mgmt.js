/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const fullReceiverPath = 'chrome-extension://' + chrome.runtime.id + '/html/chrome_oauth_receiver.html',
    APIKEY = 's340kh3l0vla1nv',
    STORAGE = 'tpmDropboxToken',
    logoutUrl = 'https://www.dropbox.com/logout',
    Dropbox = require('dropbox');

class DropboxMgmt {

    constructor(bgStore) {
        this.bgStore = bgStore;
        this.dbc = new Dropbox({clientId: APIKEY});
        this.authToken = this.loadMetadataToken();
        this.authUrl = this.dbc.getAuthenticationUrl(fullReceiverPath);
    }

    isAuth() {
        return this.authToken !== '';
    }

    connect() {
        if (!this.isAuth()) {
            window.open(this.authUrl);
        } else {
            this.dbc.setAccessToken(this.authToken);
            this.getDropboxUsername();
        }
    }

    loadMetadataToken() {
        return window.localStorage[STORAGE] ? window.localStorage[STORAGE] : '';
    }

    saveToken(token) {
        this.authToken = this.parseQuery(token).access_token;
        window.localStorage[STORAGE] = this.authToken;
        this.connect();
    }

    getDropboxUsername() {
        this.dbc.usersGetCurrentAccount()
            .then((response) => {
                this.bgStore.setUsername(response.name.display_name, 'DROPBOX');
            })
            .catch((error) => {
                console.error(error);
            });
    }

    disconnect() {
        if (this.isAuth()) {
            this.authToken = '';
            window.open(logoutUrl, '_blank');
        } else {
            this.bgStore.emit('sendMessage', 'disconnected');
        }
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

        //
        // this metadata overengineering is here due to issue
        // https://github.com/dropbox/dropbox-sdk-js/issues/84
        //
        this.dbc.filesGetMetadata({path: '/' + this.bgStore.fileName})
            .then(() => {
                this.dbc.filesDownload({path: '/' + this.bgStore.fileName})
                    .then((res) => {
                        let myReader = new FileReader();
                        myReader.addEventListener('loadend', (e) => {
                            this.bgStore.setData(e.srcElement.result);
                        });
                        myReader.readAsArrayBuffer(res.fileBlob);
                    })
                    .catch((error) => {
                        console.error('err ', error);
                    });
            }).catch((error) => {
            console.error('err ', error);
            this.bgStore.emit('initStorageFile');
        });
    }

    saveFile(data) {
        let blob = new Blob([data.buffer], {type: 'text/plain;charset=UTF-8'});
        this.dbc.filesUpload({path: '/' + this.bgStore.fileName, contents: blob, mode: 'overwrite'})
            .then(() => {
                this.loadFile();
            })
            .catch((error) => {
                console.error(error);
                this.bgStore.emit('sendMessage', 'errorMsg', {
                    code: 'NETWORK_ERROR',
                    msg: error.status,
                    storage: 'Dropbox'
                });
            });
    }

    createNewDataFile(data) {
        this.saveFile(data);
    }

    parseQuery(qstr) {
        var query = Object.create(null);
        if (typeof qstr !== 'string') {
            return query;
        }
        qstr = qstr.trim().replace(/^(\?|#|&)/, '');
        let a = (qstr[0] === '?' ? qstr.substr(1) : qstr).split('&');
        for (let i = 0; i < a.length; i++) {
            let b = a[i].split('=');
            query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || '');
        }
        return query;
    }
}

module.exports = DropboxMgmt;
