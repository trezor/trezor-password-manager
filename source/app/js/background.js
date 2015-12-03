'use strict';

var PHASE = 'DROPBOX', /* DROPBOX, TREZOR, READY */

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

    fillTestData = () => {
        let pubkey = localStorage.getItem('public_key');
        if (localStorage) {
            if (!localStorage.getItem(pubkey)) {
                localStorage.setItem(pubkey, JSON.stringify(basicObjectBlob));
            }
        }
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

    handleDropboxError = (error) => {
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('User token expired ', error.status);
                sendMessage('errorMsg', 'Dropbox User token expired');
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('File or dir not found ', error.status);
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

    },

    saveFile = () => {

    },

// TREZOR PHASE

    deviceList = null,
    trezorDevice = null,
    trezorKey = '',
    HD_HARDENED = 0x80000000,
    ENC_KEY = 'Activate TREZOR Guard?',
    ENC_VALUE = 'deadbeeffaceb00cc0ffee00fee1dead',


    connectTrezor = () => {
        deviceList = new trezor.DeviceList();
        deviceList.on('connect', initTrezorDevice);
    },

    initTrezorDevice = (device) => {
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
        trezorDevice.session.cipherKeyValue([(1047 | HD_HARDENED) >>> 0, 0, 0], ENC_KEY, ENC_VALUE, true, true, true).then( (result) => {
            trezorKey = result.message.value;
        });

    },

    encryptFile = () => {

    },

    decryptFile = () => {

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

