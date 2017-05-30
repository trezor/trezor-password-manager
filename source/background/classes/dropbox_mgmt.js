/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const fullReceiverPath = 'chrome-extension://imloifkgjagghnncjkhggdhalmcnfklk/html/chrome_oauth_receiver.html',
    APIKEY = 'k1qq2saf035rn7c',
    logoutUrl = 'https://www.dropbox.com/logout',
    Dropbox = require('dropbox');

class DropboxMgmt {

    constructor(bgStore) {
        this.bgStore = bgStore;
        this.dbc = new Dropbox({clientId: APIKEY});
        this.authToken = '';
        this.authUrl = this.dbc.getAuthenticationUrl(fullReceiverPath);
    }

    isAuth() {
        return this.authToken !== '';
    }

    handleDropboxError(error) {
        console.warn('Dropbox error: ', error);
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                this.client.reset();
                this.connect();
                //this.bgStore.emit('sendMessage', 'errorMsg', {code: 'INVALID_TOKEN', msg: error.status, storage:'Dropbox'});
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                this.bgStore.emit('initStorageFile');
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('Dropbox quota overreached ', error.status);
                this.bgStore.emit('sendMessage', 'errorMsg', {
                    code: 'OVER_QUOTA',
                    msg: error.status,
                    storage: 'Dropbox'
                });
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('Too many API calls ', error.status);
                this.bgStore.emit('sendMessage', 'errorMsg', {
                    code: 'RATE_LIMITED',
                    msg: error.status,
                    storage: 'Dropbox'
                });
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('Network error, check connection ', error.status);
                this.bgStore.emit('sendMessage', 'errorMsg', {
                    code: 'NETWORK_ERROR',
                    msg: error.status,
                    storage: 'Dropbox'
                });
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
                console.warn('Network error, check connection ', error.status);
                this.bgStore.emit('sendMessage', 'errorMsg', {
                    code: 'NETWORK_ERROR',
                    msg: error.status,
                    storage: 'Dropbox'
                });
                break;
        }

        if (error.code === 'access_denied') {
            this.bgStore.emit('disconnectDropbox');
            this.bgStore.emit('sendMessage', 'errorMsg', {
                code: 'ACCESS_DENIED',
                msg: error.description,
                storage: 'Dropbox'
            });
            this.client.reset();
        }
    }

    connect() {
        if (!this.isAuth()) {
            window.open(this.authUrl);
        } else {
            this.dbc = new Dropbox({ accessToken: this.authToken });
            this.getDropboxUsername();
        }
        /*
         this.client.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverPath}));
         this.client.authenticate((error, data) => {
         if (!error) {
         if (this.isAuth()) {
         this.getDropboxUsername();
         }
         } else {
         this.client.reset();
         this.bgStore.emit('sendMessage', 'disconnected');
         }
         });
         */
    }

    saveToken(token) {
        this.authToken = this.parseQuery(token).access_token;
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
        console.warn('1 filename ', this.bgStore.fileName);

        /*
        this.client.readFile(this.bgStore.fileName, {arrayBuffer: true}, (error, data) => {
            if (!error) {
                this.bgStore.setData(data);
            }
        });
        */
    }

    saveFile(data) {
        this.client.writeFile(this.bgStore.fileName, data, (error, stat) => {
            if (!error) {
                this.loadFile();
            }
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
