'use strict';

var PHASE = 'DROPBOX', /* DROPBOX, TREZOR, READY */
    Buffer = require('buffer/').Buffer,
    crypto = require('crypto'),

// GENERAL STUFF

    basicObjectBlob = {
        'tags': {
            '0': {
                'title': 'All',
                'icon': 'home'
            }
        },
        'entries': {}
    },

    badgeState = {
        ready: {color: [59, 192, 195, 100], defaultText: '\u0020'},
        waiting: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        disconnected: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        throttled: {color: [255, 255, 0, 100], defaultText: '!'}
    },

    updateBadgeStatus = (status) => {
        chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
        chrome.browserAction.setBadgeBackgroundColor(
            {color: badgeState[status].color});
    },

    sendMessage = (msgType, msgContent) => {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    },

    init = () => {
        if (PHASE === 'READY') {
            loadFile();
        }

        if (PHASE === 'DROPBOX') {
            if (dropboxUsername !== '') {
                setDropboxUsername();
            }
        }

        if (PHASE === 'TREZOR') {
            if (trezorKey === '') {
                connectTrezor();
            } else {
                PHASE = 'READY'
            }
        }
    },

    toArrayBuffer = (buffer) => {
        var ab = new ArrayBuffer(buffer.length);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    },

    toBuffer = (ab) => {
        var buffer = new Buffer(ab.byteLength);
        var view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    },


// DROPBOX PHASE

    dropboxClient = {},
    dropboxUsername = '',
    dropboxUsernameAccepted = false,
    dropboxUid = {},
    FILENAME_MESS = 'deadbeeffaceb00cc0ffee00fee1deadbaddeadbeeffaceb00cc0ffee00fee1e',
    FILENAME = false,

    handleDropboxError = (error) => {
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                sendMessage('errorMsg', 'Dropbox User token expired');
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                encryptData(basicObjectBlob);
                sendMessage('errorMsg', 'File or dir not found.');
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('Dropbox quota overreached ', error.status);
                sendMessage('errorMsg', 'Dropbox quota overreached.');
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('Too many API calls ', error.status);
                sendMessage('errorMsg', 'Too many Dropbox API calls.');
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('Network error, check connection ', error.status);
                sendMessage('errorMsg', 'Dropbox Network error, check connection.');
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
            default:
                console.warn('Network error, check connection ', error.status);
                sendMessage('errorMsg', 'Network error, check connection.');
        }
    },

    connectToDropbox = () => {
        dropboxClient = new Dropbox.Client({key: 'k1qq2saf035rn7c'});
        dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: '/html/chrome_oauth_receiver.html'}));
        dropboxClient.onError.addListener(function (error) {
            handleDropboxError(error);
        });
        dropboxClient.authenticate((error, data) => {
            if (error) {
                return handleDropboxError(error);
            } else {
                if (dropboxClient.isAuthenticated()) {
                    setDropboxUsername();
                    sendMessage('dropboxConnected');
                }
            }
        });
    },

    setDropboxUsername = () => {
        dropboxClient.getAccountInfo(function (error, accountInfo) {
            if (error) {
                handleDropboxError(error);
                connectToDropbox();
            }
            dropboxUsername = accountInfo.name;
            dropboxUid = accountInfo.uid;
            trezorDevice = null;
            deviceList = null;
            sendMessage('setDropboxUsername', accountInfo.name);
        });
    },

    signOutDropbox = () => {
        dropboxClient.signOut(function (error, accountInfo) {
            if (error) {
                handleDropboxError(error);
            }
            sendMessage('dropboxDisconnected');
            dropboxClient = {};
            dropboxUsername = '';
            dropboxUsernameAccepted = false;
            PHASE = 'DROPBOX';
        });
    },

    loadFile = () => {
        try {
            // creating filename
            if (!FILENAME) {
                let key = fullKey.toString('utf8').substring(0, fullKey.length / 2);
                FILENAME = crypto.createHmac('sha1', key).update(dropboxUid + FILENAME_MESS).digest('hex') + '.txt';
            }

            dropboxClient.readFile(FILENAME, {arrayBuffer: true}, (error, data) => {
                if (error) {
                    return handleDropboxError(error);
                } else {
                    var res = toBuffer(data);
                    if (!(Buffer.isBuffer(res))) {
                        reject("Not a buffer");
                    }
                    decryptData(res);
                }
            });
        } catch (err) {

        }
    },

    saveFile = (data) => {
        dropboxClient.writeFile(FILENAME, toArrayBuffer(data), function (error, stat) {
            if (error) {
                return handleDropboxError(error);
            } else {
                loadFile();
            }
        });
    },

// TREZOR PHASE

    deviceList = null,
    trezorDevice = null,
    fullKey = '',
    encryptionKey = '',
    HD_HARDENED = 0x80000000,
    ENC_KEY = 'Activate TREZOR Guard?',
    ENC_VALUE = 'deadbeec1cada53301f001edc1a551f1edc0de51111ea11c1afee1fee1fade51',
    CIPHER_IVSIZE = 96 / 8,
    AUTH_SIZE = 128 / 8,
    CIPHER_TYPE = 'aes-256-gcm',

    connectTrezor = () => {
        deviceList = new trezor.DeviceList();
        deviceList.on('connect', initTrezorDevice);
    },

    initTrezorDevice = (device) => {
        try {
            trezorDevice = device;
            sendMessage('trezorConnected');
            trezorDevice.on('pin', pinCallback);
            trezorDevice.on('passphrase', passphraseCallback);
            trezorDevice.on('button', buttonCallback);
            trezorDevice.on('disconnect', disconnectCallback);
            if (trezorDevice.isBootloader()) {
                throw new Error('Device is in bootloader mode, re-connected it');
            }

            trezorDevice.session.cipherKeyValue(getPath(), ENC_KEY, ENC_VALUE, true, true, true).then((result) => {
                fullKey = result.message.value;
                encryptionKey = fullKey.toString('utf8').substring(fullKey.length / 2, fullKey.length);
                loadFile();
            });
        } catch (err) {

        }


    },

    encryptData = (data) => {

        randomInputVector().then((iv) => {
            var stringified = JSON.stringify(data),
                buffer = new Buffer(stringified, 'utf8'),
                cipher = crypto.createCipheriv(CIPHER_TYPE, encryptionKey, iv),
                startCText = new Buffer(cipher.update(buffer), 'utf8'),
                endCText = new Buffer(cipher.final(), 'utf8'),
                auth_tag = new Buffer(cipher.getAuthTag(), 'utf8');
            saveFile(Buffer.concat([iv, auth_tag, startCText, endCText]));
        });
    },

    decryptData = (data) => {
        var iv = data.slice(0, CIPHER_IVSIZE),
            auth_tag = data.slice(CIPHER_IVSIZE, CIPHER_IVSIZE + AUTH_SIZE),
            cText = data.slice(CIPHER_IVSIZE + AUTH_SIZE),
            decipher = crypto.createDecipheriv(CIPHER_TYPE, encryptionKey, iv),
            start = decipher.update(cText);
        decipher.setAuthTag(auth_tag);
        var end = decipher.final(),
            res = Buffer.concat([start, end]),
            stringifiedContent = res.toString('utf8');
        sendMessage('decryptedContent', stringifiedContent);
        PHASE = 'READY';
    },

    // FIX ME down here! (hint: make nice hardended path:)
    getPath = () => {
        return [(1047 | HD_HARDENED) >>> 0, (1047 | HD_HARDENED) >>> 0, 0]
    },

    pinCallback = (type, callback) => {
        sendMessage('showPinDialog');
        trezorDevice.pinCallback = callback;
    },

    pinEnter = (pin) => {
        trezorDevice.pinCallback(null, pin);
    },

    passphraseCallback = (type, callback) => {
        callback(null, '');
    },

    buttonCallback = (type, callback) => {
        sendMessage('showButtonDialog');
        trezorDevice.buttonCallback = callback;
    },

    buttonEnter = (code) => {
        trezorDevice.buttonCallback(null, code);
    },

    disconnectCallback = () => {
        trezorDevice.removeListener('pin', pinCallback);
        trezorDevice.removeListener('passphrase', passphraseCallback);
        trezorDevice.removeListener('button', buttonCallback);
        trezorDevice.removeListener('disconnect', disconnectCallback);
        trezorDevice = {};
        deviceList.removeListener('connect', initTrezorDevice);
        deviceList = {};
        dropboxUsernameAccepted = false;
        sendMessage('trezorDisconnected');
        PHASE = 'DROPBOX';
        init();
    },

    randomInputVector = () => {
        return new Promise((resolve, reject) => {
            try {
                crypto.randomBytes(CIPHER_IVSIZE, (err, buf) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buf);
                    }
                })
            } catch (err) {
                reject(err);
            }
        })
    };


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {

        case 'initPlease':
            init();
            break;

        case 'connectDropbox':
            connectToDropbox();
            break;

        case 'initTrezorPhase':
            dropboxUsernameAccepted = true;
            sendMessage('trezorDisconnected');
            connectTrezor();
            break;

        case 'trezorPin':
            pinEnter(request.content);
            break;

        case 'trezorPassphrase':
            passphrasEnter(request.content);
            break;

        case 'disconnectDropbox':
            signOutDropbox();
            break;

        case 'loadContent':
            loadFile();
            break;

        case 'saveContent':
            encryptData(request.content);
            break;
    }
});

