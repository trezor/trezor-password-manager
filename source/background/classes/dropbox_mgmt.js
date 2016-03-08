'use strict';

const FILENAME_MESS = '5f91add3fa1c3c76e90c90a3bd0999e2bd7833d06a483fe884ee60397aca277a',
    receiverRelativePath = '/html/chrome_oauth_receiver.html',
    APIKEY = 's340kh3l0vla1nv';

var crypto = require('crypto'),
    client = new Dropbox.Client({key: APIKEY}),
    username = '',
    filname = false,
    loadedData = '';

class Dropbox_mgmt {

    constructor(phase) {
        this.PHASE = phase;
        this.polling = false;
        this.cursor = null;
    }

    sendMessage(msgType, msgContent) {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    }

    isAuth() {
        return client.isAuthenticated();
    }

    getName() {
        return username;
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

    initCursor() {
        return new Promise((resolve, reject) => {
            client.pullChanges(this.cursor, (error, cursor) => {
                if (error) {
                    reject(error);
                }
                this.cursor = cursor;
                resolve(undefined);
            });
        });
    }

    connectToDropbox() {
        client.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
        client.onError.addListener((error) => {
            this.handleDropboxError(error);
        });
        client.authenticate((error, data) => {
            if (error) {
                return this.handleDropboxError(error);
            } else {
                if (client.isAuthenticated()) {
                    this.setDropboxUsername();
                    this.sendMessage('dropboxConnected');
                }
            }
        });
    }

    setDropboxUsername() {
        if (this.cursor == null) {
            this.initCursor().then(() => this.poll()).catch((e) => console.error(e));
        }
        client.getAccountInfo((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
                this.connectToDropbox();
            } else {
                username = accountInfo.name;
                this.sendMessage('setDropboxUsername', accountInfo.name);
            }
        });
    }

    signOutDropbox() {
        client.signOut((error, accountInfo) => {
            if (error) {
                this.handleDropboxError(error);
            }
            this.sendMessage('dropboxDisconnected');
            username = '';
            filname = false;
            loadedData = '';
            this.sendMessage('bg-changePhase', 'DROPBOX');

        });
    }

    singlePull(pullCursor) {
        return new Promise((resolve, reject) => {
            try {
                client.pullChanges(pullCursor, (error, changes) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    this.cursor = changes;
                    changes.changes.forEach(change => {
                        this.notifyChange(change.path);
                    });
                    if (changes.shouldPullAgain) {
                        resolve(this.singlePull(pullCursor));
                    } else {
                        resolve(changes.shouldBackOff);
                    }
                })
            } catch (e) {
                reject(e);
            }
        });
    }

    singlePoll(pullCursor) {
        return new Promise((resolve, reject) => {
            try {
                client.pollForChanges(pullCursor, {}, (error, pollResult) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(pollResult);
                    }
                });
            } catch (e) {
                reject(e);
            }
        });
    }


    poll() {
        if (this.polling) {
            return;
        }
        this.polling = true;
        const pullCursorNull = this.cursor;
        if (pullCursorNull == null) {
            throw new Error("Pull error is null where it shouldn't be");
        }
        const pullCursor = pullCursorNull;
        this.singlePoll(pullCursor).then((pollResult) => {
            if (pollResult.hasChanges) {
                return this.singlePull(pullCursor).then(() => pollResult);
            }
            return pollResult;
        }).then((pollResult) => {
            this.polling = false;
            const retryAfter = pollResult.retryAfter;
            if (client.isAuthenticated()) {
                window.setTimeout(() => this.poll(), retryAfter);
            }
            return pollResult;
        }, (e) => {
            throw e;
        }).catch((e) => {
            console.error(e);
        });
    }

    notifyChange(path) {
        if (path.substr(0, 1) === "/") {
            path = path.substr(1);
        }
        if (path === filname) {
            this.loadFile();
        }
    }


    loadFile(masterKey) {
        try {
            if (!filname) {
                try {
                    let fileKey = masterKey.substring(0, masterKey.length / 2);
                    filname = crypto.createHmac('sha256', fileKey).update(FILENAME_MESS).digest('hex') + '.pswd';
                } catch (ex) {
                    console.log('Crypto failed: ', ex);
                }
            }
            client.readFile(filname, {arrayBuffer: true}, (error, data) => {
                if (error) {
                    return this.handleDropboxError(error);
                } else {
                    if (!(Buffer.isBuffer(data))) {
                        data = this.toBuffer(data);
                    }
                    loadedData = data;
                    return data;
                }
            });
        } catch (err) {
            return this.handleDropboxError(err);
        }
    }

    saveFile(data) {
        try {
            client.writeFile(filname, data, (error, stat) => {
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