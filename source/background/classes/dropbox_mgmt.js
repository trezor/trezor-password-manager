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
                this.storage.emit('sendMessage', 'errorMsg', 'Dropbox User token expired');
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                this.storage.emit('initStorageFile');
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('Dropbox quota overreached ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', 'Dropbox quota overreached.');
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('Too many API calls ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', 'Too many Dropbox API calls.');
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('Network error, check connection ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', 'Dropbox Network error, check connection.');
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
            default:
                console.warn('Network error, check connection ', error.status);
                this.storage.emit('sendMessage', 'errorMsg', 'Network error, check connection.');
        }
    }

    connectToDropbox() {
        this.client.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
        this.client.onError.addListener((error) => {
            this.handleDropboxError(error);
        });
        this.client.authenticate((error, data) => {
            if (error) {
                return this.handleDropboxError(error);
            } else {
                if (this.isAuth()) {
                    this.setDropboxUsername();
                    this.storage.emit('sendMessage', 'dropboxConnected');
                }
            }
        });
    }

    setDropboxUsername() {
        this.client.getAccountInfo((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
                this.connectToDropbox();
            } else {
                this.username = accountInfo.name;
                this.storage.emit('sendMessage', 'setDropboxUsername', accountInfo.name);
            }
        });
    }

    signOutDropbox() {
        this.client.signOut((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
            }
            this.storage.emit('sendMessage', 'dropboxDisconnected');
            this.username = false;
            this.filename = false;
            this.loadedData = '';
            this.storage.phase = 'DROPBOX';
        });
    }

    loadFile() {
        try {
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
                if (error) {
                    return this.handleDropboxError(error);
                } else {
                    if (!(Buffer.isBuffer(data))) {
                        data = this.toBuffer(data);
                    }
                    this.saveLoadedData(data);
                }
            });
        } catch (err) {
            return this.handleDropboxError(err);
        }
    }

    saveFile(data) {
        try {
            this.client.writeFile(this.filename, data, (error, stat) => {
                if (error) {
                    console.error('Dropbox problem: ', error);
                    return this.handleDropboxError(error);
                } else {
                    this.loadFile();
                }
            });
        } catch (err) {
            return this.handleDropboxError(err);
        }
    }

    saveLoadedData(data) {
        this.loadedData = data;
        this.storage.emit('decryptContent');
    }
}

module.exports = DropboxMgmt;