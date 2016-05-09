/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const FILENAME_MESS = '5f91add3fa1c3c76e90c90a3bd0999e2bd7833d06a483fe884ee60397aca277a',
    receiverRelativePath = '/html/chrome_oauth_receiver.html',
    APIKEY = 's340kh3l0vla1nv';

var crypto = require('crypto');

class DropboxMgmt {

    constructor(storage) {
        this.storage = storage;
        this.filename = false;
        this.username = false;
        this.loadedData = '';
        this.client = new Dropbox.Client({key: APIKEY});
        this.client.onError.addListener((error) => {
            this.handleDropboxError(error);
        });
    }

    disconnected() {
        this.filename = false;
        this.username = false;
        this.loadedData = '';
    }

    isAuth() {
        return this.client.isAuthenticated();
    }

    toBuffer(ab) {
        let buffer = new Buffer(ab.byteLength),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    }

    handleDropboxError(error) {
        console.warn('Dropbox error:', error);
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_INVALID_TOKEN', msg: error.status});
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                this.storage.emit('initStorageFile');
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('Dropbox quota overreached ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_OVER_QUOTA', msg: error.status});
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('Too many API calls ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_RATE_LIMITED', msg: error.status});
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('Network error, check connection ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_NETWORK_ERROR', msg: error.status});
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
                console.warn('Network error, check connection ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_NETWORK_ERROR', msg: error.status});
                break;
        }

        if (error.code === 'access_denied') {
            this.storage.emit('disconnectDropbox');
            this.storage.emit('sendMessage', 'errorMsg', {code: 'DB_ACCESS_DENIED', msg: error.description});
            this.client.reset();
        }
    }

    connectToDropbox() {
        this.client.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
        this.client.authenticate((error, data) => {
            if (!error) {
                if (this.isAuth()) {
                    this.setDropboxUsername();
                    this.storage.emit('sendMessage', 'dropboxConnected');
                }
            }
        });
    }

    setDropboxUsername() {
        this.client.getAccountInfo((error, accountInfo) => {
            if (!error) {
                this.username = accountInfo.name;
                this.storage.emit('sendMessage', 'setDropboxUsername', accountInfo.name);
            }
        });
    }

    signOutDropbox() {
        this.client.signOut((error, accountInfo) => {
            if (!error) {
                this.storage.emit('sendMessage', 'dropboxDisconnected');
                this.username = false;
                this.filename = false;
                this.loadedData = '';
                this.storage.phase = 'DROPBOX';
            }
        });
    }

    loadFile() {
        if (!this.filename) {
            try {
                let fileKey = this.storage.masterKey.substring(0, this.storage.masterKey.length / 2);
                this.filename = crypto.createHmac('sha256', fileKey).update(FILENAME_MESS).digest('hex') + '.pswd';
            } catch (ex) {
                console.log('Crypto failed: ', ex);
                //TODO soon please
            }
        }
        this.client.readFile(this.filename, {arrayBuffer: true}, (error, data) => {
            if (!error) {
                if (!(Buffer.isBuffer(data))) {
                    data = this.toBuffer(data);
                }
                this.saveLoadedData(data);
            }
        });
    }

    saveFile(data) {
        this.client.writeFile(this.filename, data, (error, stat) => {
            if (!error) {
                this.loadFile();
            }
        });
    }

    saveLoadedData(data) {
        this.loadedData = data;
        this.storage.emit('decryptContent');
    }
}

module.exports = DropboxMgmt;
