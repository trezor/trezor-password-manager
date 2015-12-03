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

// DROPBOX PHASE

    dropboxClient = {},
    dropboxUsername = '',
    dropboxUsernameAccepted = false,
    dropboxUid = {},
    FILENAME = false,

    handleDropboxError = (error) => {
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                sendMessage('errorMsg', 'Dropbox User token expired');
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
                saveFile(JSON.stringify(basicObjectBlob));
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
                FILENAME = dropboxUid + fullKey.toString('utf8').substring(0, fullKey.length / 2) + '.txt';
            }

            dropboxClient.readFile(FILENAME, function (error, data) {
                if (error) {
                    return handleDropboxError(error);
                }
                console.log(data);
            });
        } catch (err) {

        }
    },

    saveFile = (data) => {
        dropboxClient.writeFile(FILENAME, encryptData(data), function (error, stat) {
            if (error) {
                return handleDropboxError(error);
            } else {

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
    ENC_VALUE = 'deadbeeffaceb00cc0ffee00fee1deadbaddeadbeeffaceb00cc0ffee00fee1e',
    CIPHER_IVSIZE = 96 / 8,
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
            // FIX ME down here! (hint: make nice hardended path:)
            trezorDevice.session.cipherKeyValue([(1047 | HD_HARDENED) >>> 0, 0, 0], ENC_KEY, ENC_VALUE, true, true, true).then((result) => {
                fullKey = result.message.value;
                encryptionKey = fullKey.toString('utf8').substring(fullKey.length / 2, fullKey.length);
                loadFile();
            });
        } catch (err) {

        }


    },

    encryptData = (data) => {

        return randomInputVector().then( (iv) => {
            var stringified = JSON.stringify(data),
                buffer = new Buffer(stringified, 'utf8'),
                cipher = crypto.createCipheriv(CIPHER_TYPE, encryptionKey, iv),
                startCText = cipher.update(buffer, 'utf8'),
                endCText = cipher.final(),
                authTag = cipher.getAuthTag(),
                res = Buffer.concat([iv, authTag, startCText, endCText]);
            console.log('iv lng ', iv.length);
            console.log('CIPHER_IVSIZE lng ', CIPHER_IVSIZE);
            console.log('authtag lng ', authTag.length);
            console.log('res ', res);
            return res.toArrayBuffer();
        });
    },

    decryptData = (data) => {

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
    }
});

