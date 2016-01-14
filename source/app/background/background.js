'use strict';

let PHASE = 'DROPBOX', /* DROPBOX, TREZOR, LOADED */
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
        loaded: {color: [59, 192, 195, 100], defaultText: '\u0020'},
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
        switch (PHASE) {
            case 'LOADED':
                loadFile();
                break;
            case 'DROPBOX':
                if (dropboxUsername !== '') {
                    setDropboxUsername();
                }
                break;
            case 'TREZOR':
                if (trezorKey === '') {
                    connectTrezor();
                } else {
                    PHASE = 'LOADED'
                }
                break;
        }
    },

    toArrayBuffer = (buffer) => {
        let ab = new ArrayBuffer(buffer.length),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    },

    toBuffer = (ab) => {
        let buffer = new Buffer(ab.byteLength),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    },

    toHex = (pwd)  => {
        try {
            let result = new Buffer(pwd, 'utf8').toString('hex'),
                check = new Buffer(result, 'hex').toString('utf8');
            if (check === pwd) {
                return result;
            } else {
                // fix later!
                throw new Error('Whoops!');
            }
        } catch (error) {
            console.log(error);
        }
    },

    fromHex = (hex) => {
        try {
            let pwd = new Buffer(hex, 'hex').toString('utf8'),
                check = new Buffer(pwd, 'utf8').toString('hex');
            if (hex === check) {
                return pwd;
            } else {
                // fix later!
                throw new Error('Whoops!');
            }
        } catch (error) {
            console.log(error);
        }
    },

    addPaddingTail = (hex) => {
        let paddingNumber = 16 - (hex.length % 16),
            tail = new Array(paddingNumber + 1).join((paddingNumber - 1).toString(16));
        return hex + tail;
    },

    removePaddingTail = (hex) => {
        let paddingNumber = parseInt(hex.charAt(hex.length - 1), 16) + 1;
        return hex.slice(0, -paddingNumber);
    },

    setProtocolPrefix = (url) => {
        return url.indexOf('://') > -1 ? url : 'https://' + url;
    },

    openTab = (data) => {
        var tabId;
        chrome.tabs.create({url: setProtocolPrefix(data.title)}, (tab) => {
            var tabId = tab.id;
            chrome.tabs.executeScript(tab.id, {file: 'js/content_script.js', runAt: "document_start"}, () => {
                chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
                    if (response.type === 'scriptReady') {
                        chrome.tabs.sendMessage(tabId, {type: 'fillData', content: data});
                    } else {
                        chrome.tabs.executeScript(tabId, {file: 'js/content_script.js'}, () => {
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                throw Error("Unable to inject script into tab " + tabId);
                            }
                            chrome.tabs.sendMessage(tabId, {type: 'fillData', content: data});
                        });
                    }
                });
            });
        });
    };


// DROPBOX PHASE

const FILENAME_MESS = 'deadbeeffaceb00cc0ffee00fee1deadbaddeadbeeffaceb00cc0ffee00fee1e',
    receiverRelativePath = '/html/chrome_oauth_receiver.html',
    dropboxApiKey = 'k1qq2saf035rn7c';

let dropboxClient = {},
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
                encryptData(basicObjectBlob);
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
        dropboxClient = new Dropbox.Client({key: dropboxApiKey});
        dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
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
            trezorDevice = null;
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
                FILENAME = crypto.createHmac('sha256', key).update(FILENAME_MESS).digest('hex') + '.txt';
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
    };

// TREZOR PHASE

const HD_HARDENED = 0x80000000,
    ENC_KEY = 'Activate TREZOR Guard?',
    ENC_VALUE = 'deadbeec1cada53301f001edc1a551f1edc0de51111ea11c1afee1fee1fade51',
    CIPHER_IVSIZE = 96 / 8,
    AUTH_SIZE = 128 / 8,
    CIPHER_TYPE = 'aes-256-gcm',

//errors
    NO_TRANSPORT = new Error('No trezor.js transport is available'),
    NO_CONNECTED_DEVICES = new Error('No connected devices'),
    DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode'),
    DEVICE_IS_EMPTY = new Error('Connected device is not initialized'),
    FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old'),
    INSUFFICIENT_FUNDS = new Error('Insufficient funds');

let deviceList = new trezor.DeviceList(),
    trezorDevice = null,
    fullKey = '',
    encryptionKey = '',

    isUrl = (url) => {
        return url.indexOf('.') > -1
    },

    decomposeUrl = (url) => {
        var title = {index: url.indexOf('://')};
        if (title.index > -1) {
            title.protocol = url.substring(0, title.index + 3);
            title.domain = url.split('/')[2];
            title.path = url.slice(title.protocol.length + title.domain.length, url.length);
        } else {
            title.protocol = false;
            title.domain = url.split('/')[0];
            title.path = url.slice(title.domain.length, url.length);
        }
        return title;
    },

    displayPhrase = (title, username) => {
        if (isUrl(title)) {
            title = decomposeUrl(title).domain;
        }
        return 'Unlock ' + title + ' under ' + username + ' username?'
    },

    handleTrezorError = (retry) => {
        return (error) => {

            let never = new Promise(() => {
            });

            switch (error) {
                case NO_TRANSPORT:
                    return never;
                    break;

                case DEVICE_IS_EMPTY:
                    return never;
                    break;

                case FIRMWARE_IS_OLD:
                    return never;
                    break;

                case NO_CONNECTED_DEVICES:
                    return never;
                    break;

                case DEVICE_IS_BOOTLOADER:
                    return never;
                    break;

                case INSUFFICIENT_FUNDS:
                    return never;
                    break;
            }
            switch (error.code) {
                case 'Failure_PinInvalid':
                    sendMessage('wrongPin');

                    break;
            }
        }
    },

    connectTrezor = () => {
        deviceList.on('connect', initTrezorDevice);
        deviceList.on('error', (error) => {
            console.error('List error:', error);
        });
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
            let result = trezorDevice.session.cipherKeyValue(getPath(), ENC_KEY, ENC_VALUE, true, true, true).then((result) => {
                fullKey = result.message.value;
                encryptionKey = fullKey.toString('utf8').substring(fullKey.length / 2, fullKey.length);
                loadFile();
            });
            return result.catch(handleTrezorError(result));
        } catch (error) {
            console.error('Device error:', error);
        }
    },

    encryptData = (data) => {
        randomInputVector().then((iv) => {
            let stringified = JSON.stringify(data),
                buffer = new Buffer(stringified, 'utf8'),
                cipher = crypto.createCipheriv(CIPHER_TYPE, encryptionKey, iv),
                startCText = cipher.update(buffer),
                endCText = cipher.final(),
                auth_tag = cipher.getAuthTag();
            saveFile(Buffer.concat([iv, auth_tag, startCText, endCText]));
        });
    },

    decryptData = (data) => {
        let iv = data.slice(0, CIPHER_IVSIZE),
            auth_tag = data.slice(CIPHER_IVSIZE, CIPHER_IVSIZE + AUTH_SIZE),
            cText = data.slice(CIPHER_IVSIZE + AUTH_SIZE),
            decipher = crypto.createDecipheriv(CIPHER_TYPE, encryptionKey, iv),
            start = decipher.update(cText);
        decipher.setAuthTag(auth_tag);
        let end = decipher.final(),
            res = Buffer.concat([start, end]),
            stringifiedContent = res.toString('utf8');
        sendMessage('decryptedContent', stringifiedContent);
        PHASE = 'LOADED';
    },

    encryptEntry = (data, callback) => {
        let key = displayPhrase(data.title, data.username),
            tailedHex = toHex(addPaddingTail(toHex(data.password)));
        trezorDevice.session.cipherKeyValue(getPath(), key, tailedHex, true, false, true).then((result) => {
            callback({content: {title: data.title, username: data.username, password: result.message.value}});
        });
    },

    decryptEntry = (data, callback) => {
        let key = displayPhrase(data.title, data.username);
        trezorDevice.session.cipherKeyValue(getPath(), key, data.password, false, false, true).then((result) => {
            callback({
                content: {
                    title: data.title,
                    username: data.username,
                    password: fromHex(removePaddingTail(fromHex(result.message.value)))
                }
            });
        });
    },

// FIX ME down here! (hint: make nice hardended path:)
    getPath = () => {
        return [(1047 | HD_HARDENED) >>> 0, (1047 | HD_HARDENED) >>> 0, 0]
    },

    pinCallback = (type, callback) => {
        trezorDevice.pinCallback = callback;
        sendMessage('showPinDialog');
    },

    pinEnter = (pin) => {
        trezorDevice.pinCallback(null, pin);
    },

    passphraseCallback = (callback) => {
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
        deviceList.removeListener('connect', initTrezorDevice);
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

        case 'encryptPassword':
            encryptEntry(request.content, sendResponse);
            break;

        case 'decryptPassword':
            decryptEntry(request.content, sendResponse);
            break;

        case 'openTab':
            openTab(request.content);
            break;
    }
    return true;
});

