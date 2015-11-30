'use strict';
var PHASE = 'DROPBOX', /* DROPBOX, TREZOR, READY */

// GENERIC STUFF

    tempStorage = {
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

    fillTestData = () => {
        let pubkey = localStorage.getItem('public_key');
        if (localStorage) {
            if (!localStorage.getItem(pubkey)) {
                localStorage.setItem(pubkey, JSON.stringify(tempStorage));
            }
        }
    },

    updateBadgeStatus = (status) => {
        chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
        chrome.browserAction.setBadgeBackgroundColor(
            {color: badgeState[status].color});
    },

    sendMessage = (msgType, msgContent) => {
        console.log('[background] ' + PHASE + ': msg send : ', msgType, msgContent);
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    },

// DROPBOX PHASE

    dropboxClient = {},
    dropboxUsername = '',
    dropboxUsernameAccepted = false,

    handleDropboxError = (error) => {
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('user token expired ', error.status);
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('file or dir not found ', error.status);
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('dropbox quota overreached ', error.status);
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('too many API calls ', error.status);
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('network error, check connection ', error.status);
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
            default:
                console.warn('network error, check connection ', error.status);
        }
    },

    connectToDropbox = () => {
        dropboxClient = new Dropbox.Client({key: "k1qq2saf035rn7c"});
        dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: "/html/chrome_oauth_receiver.html"}));
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
            sendMessage('setDropboxUsername', accountInfo.name);
        });
    },

// TREZOR PHASE

    deviceList = new trezor.DeviceList(),
    trezorDevice = null,
    trezorKey = '',

    pinCallback = (type, callback) => {
        sendMessage('showPinDialog');
        trezorDevice.pinCallback = callback;
    },

    pinEnter = (pin) => {
        trezorDevice.pinCallback(null, pin);
    },

    passphraseCallback = (type, callback) => {
        sendMessage('showPassphraseDialog');
        trezorDevice.passphraseCallback = callback;
    },

    passphrasEnter = (phrase) => {
        trezorDevice.passphraseCallback(null, phrase);
    },

    buttonCallback = (type, callback) => {
        sendMessage('showButtonDialog');
        trezorDevice.buttonCallback = callback;
    },

    buttonEnter = (code) => {
        trezorDevice.buttonCallback(null, code);
    };


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'initPlease':
            if (PHASE === 'DROPBOX') {
                if (dropboxUsername === '' && !dropboxUsernameAccepted) {
                    connectToDropbox();
                } else {
                    PHASE = 'TREZOR';
                }
            }

            if (PHASE === 'TREZOR') {
                if (trezorKey === '') {
                    deviceList.on('connect', function (device) {
                        trezorDevice = device;
                        sendMessage('trezorConnected');
                        device.on('pin', pinCallback);
                        device.on('passphrase', passphraseCallback);
                        device.on('button', buttonCallback);
                        device.on('disconnect', function () {
                            console.log('[background] Disconnected an opened device');
                            trezorDevice = null;
                            sendMessage('trezorDisconnected');
                        });

                        if (device.isBootloader()) {
                            throw new Error('Device is in bootloader mode, re-connected it');
                        }

                        console.log('[background] Connected a device:', device);
                        console.log('[background] Devices:', deviceList.asArray());
                        device.session.cipherKeyValue([1047, 0, 0], "Activate TREZOR Guard?", "deadbeeffaceb00cc0ffee00fee1dead", true, true, true);
                    });
                } else {
                    PHASE = 'READY'
                }

            }

            if (PHASE === 'READY') {

            }

            break;

        case 'trezorPin':
            pinEnter(request.content);
            break;

        case 'trezorPassphrase':
            passphrasEnter(request.content);
            break;

        default:
            console.log('[background] ' + PHASE + ': unknown msg received : ', request.type, request.content);
            break;
    }
});

