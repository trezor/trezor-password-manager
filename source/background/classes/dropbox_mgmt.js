'use strict';

const FILENAME_MESS = '5f91add3fa1c3c76e90c90a3bd0999e2bd7833d06a483fe884ee60397aca277a',
    receiverRelativePath = '/html/chrome_oauth_receiver.html',
    dropboxApiKey = 's340kh3l0vla1nv';

var crypto = require('crypto'),
    dropboxClient = new Dropbox.Client({key: dropboxApiKey}),
    dropboxUsername = '',
    FILENAME = false,
    loadedData = '';

class Dropbox_mgmt {

    constructor(phase) {
        this.PHASE = phase;
    }

    sendMessage(msgType, msgContent) {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    }

    isAuth() {
        return dropboxClient.isAuthenticated();
    }

    getName() {
        return dropboxUsername
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
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                this.sendMessage('errorMsg', 'Dropbox User token expired');
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                this.sendMessage('bg-noStorage');
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('Dropbox quota overreached ', error.status);
                this.sendMessage('errorMsg', 'Dropbox quota overreached.');
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('Too many API calls ', error.status);
                this.sendMessage('errorMsg', 'Too many Dropbox API calls.');
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('Network error, check connection ', error.status);
                this.sendMessage('errorMsg', 'Dropbox Network error, check connection.');
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
            default:
                console.warn('Network error, check connection ', error.status);
                this.sendMessage('errorMsg', 'Network error, check connection.');
        }
    }

    connectToDropbox() {
        dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
        dropboxClient.onError.addListener((error) => {
            this.handleDropboxError(error);
        });
        dropboxClient.authenticate((error, data) => {
            if (error) {
                return this.handleDropboxError(error);
            } else {
                if (dropboxClient.isAuthenticated()) {
                    this.sendMessage('dropboxConnected');
                    this.setDropboxUsername();
                }
            }
        });
    }

    setDropboxUsername() {
        dropboxClient.getAccountInfo((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
                this.connectToDropbox();
            } else {
                dropboxUsername = accountInfo.name;
                this.sendMessage('setDropboxUsername', accountInfo.name);
            }
        });
    }

    signOutDropbox() {
        dropboxClient.signOut((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
            }
            this.sendMessage('dropboxDisconnected');
            dropboxUsername = '';
            this.sendMessage('bg-changePhase', 'DROPBOX');

        });
    }

    loadFile(masterKey) {
        try {
            if (!FILENAME) {
                try {
                    let fileKey = masterKey.substring(0, masterKey.length / 2);
                    FILENAME = crypto.createHmac('sha256', fileKey).update(FILENAME_MESS).digest('hex') + '.pswd';
                } catch (ex) {
                    console.log('Crypto failed: ', ex);
                }
            }

            dropboxClient.readFile(FILENAME, {arrayBuffer: true}, (error, data) => {
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
        dropboxClient.writeFile(FILENAME, data, (error, stat) => {
            if (error) {
                return this.handleDropboxError(error);
            } else {
                this.loadFile();
            }
        });
    }

    saveLoadedData(data) {
        loadedData = data;
        this.sendMessage('bg-decryptContent');
    }

    getLoadedData() {
        return loadedData;
    }

    changePhase(phase) {
        this.PHASE = phase
    }
}

module.exports = Dropbox_mgmt;