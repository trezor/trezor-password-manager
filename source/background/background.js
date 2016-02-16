'use strict';

let PHASE = 'DROPBOX', /* DROPBOX, TREZOR, LOADED */
    Buffer = require('buffer/').Buffer,
    crypto = require('crypto'),
    activeHost = '',
    hasCredentials = false,
    unlockedContent = false,
    windowOpener = '',

// GENERAL STUFF

    basicObjectBlob = {
        'version': '0.0.1',
        'config': {
            'orderType': 'date'
        },
        'tags': {
            '0': {
                'title': 'All',
                'icon': 'home'
            }
        },
        'entries': {}
    },

    badgeState = {
        LOADED: {color: [59, 192, 195, 255], defaultText: '\u0020'},
        DROPBOX: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        TREZOR: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        ERROR: {color: [255, 255, 0, 100], defaultText: '\u0020'},
        OFF: {color: [255, 255, 0, 100], defaultText: ''}
    },

    updateBadgeStatus = (status) => {
        chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
        chrome.browserAction.setBadgeBackgroundColor(
            {color: badgeState[status].color});
    },

    sendMessage = (msgType, msgContent) => {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    },

    sendTabMessage = (tabId, type, data) => {
        chrome.tabs.sendMessage(tabId, {type: type, content: data});
    },

    init = () => {
        checkVersions();
        switch (PHASE) {
            case 'LOADED':
                loadFile();
                break;
            case 'DROPBOX':
                if (dropboxClient.isAuthenticated() && !dropboxUsername) {
                    setDropboxUsername();
                } else if (!dropboxClient.isAuthenticated()) {
                    sendMessage('dropboxInitialized');
                } else if (dropboxClient.isAuthenticated() && dropboxUsername) {
                    sendMessage('setDropboxUsername', dropboxUsername);
                }
                break;
            case 'TREZOR':
                if (masterKey === '') {
                    PHASE = 'DROPBOX';
                    init();
                } else {
                    PHASE = 'LOADED'
                }
                break;
        }
    },

    chromeExists = () => {
        if (typeof chrome === 'undefined') {
            return Promise.reject(new Error('Global chrome does not exist; probably not running chrome'));
        }
        if (typeof chrome.runtime === 'undefined') {
            return Promise.reject(new Error('Global chrome.runtime does not exist; probably not running chrome'));
        }
        if (typeof chrome.runtime.sendMessage === 'undefined') {
            return Promise.reject(new Error('Global chrome.runtime.sendMessage does not exist; probably not whitelisted website in extension manifest'));
        }
        return Promise.resolve();
    },

    chromeCommands = (command) => {
        switch (command) {
            case 'fill_login_form':
                if (hasCredentials && PHASE === 'LOADED') {
                    fillCredentials(activeHost);
                }
                break;
        }
    },

    chromeMessaging = (request, sender, sendResponse) => {
        switch (request.type) {

            case 'initPlease':
                windowOpener = request.content.substring(1);
                init();
                break;

            case 'connectDropbox':
                connectToDropbox();
                break;

            case 'initTrezorPhase':
                PHASE = 'TREZOR';
                dropboxUsernameAccepted = true;
                sendMessage('trezorDisconnected');
                connectTrezor(trezorDevice);
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
                encrypt(request.content, encryptionKey).then((res) => {
                    saveFile(res);
                });
                break;

            case 'encryptFullEntry':
                encryptFullEntry(request.content, sendResponse);
                break;

            case 'decryptPassword':
                decryptPassword(request.content, sendResponse);
                break;

            case 'decryptFullEntry':
                decryptFullEntry(request.content, sendResponse);
                break;

            case 'openTab':
                openTab(request.content);
                break;

            case 'openTabAndLogin':
                openTabAndLogin(request.content);
                break;
        }
        return true;
    },

    versionCompare = (a, b) => {
        let pa = a.split('.');
        let pb = b.split('.');
        for (let i = 0; i < 3; i++) {
            let na = Number(pa[i]);
            let nb = Number(pb[i]);
            if (na > nb) return true;
            if (nb > na) return false;
            if (!isNaN(na) && isNaN(nb)) return true;
            if (isNaN(na) && !isNaN(nb)) return false;
        }
        return false;
    },

    toBuffer = (ab) => {
        let buffer = new Buffer(ab.byteLength),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    },

    setProtocolPrefix = (url) => {
        return url.indexOf('://') > -1 ? url : 'https://' + url;
    },

    isUrl = (url) => {
        return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
    },

    decomposeUrl = (url) => {
        let parsed_url = {};
        if (url == null || url.length == 0) return parsed_url;
        let protocol_i = url.indexOf('://');
        parsed_url.protocol = protocol_i != -1 ? url.substr(0, protocol_i) : '';
        let remaining_url = protocol_i != -1 ? url.substr(protocol_i + 3, url.length) : url;
        let domain_i = remaining_url.indexOf('/');
        domain_i = domain_i == -1 ? remaining_url.length : domain_i;
        parsed_url.domain = remaining_url.substr(0, domain_i);
        parsed_url.path = domain_i == -1 || domain_i + 1 == remaining_url.length ? null : remaining_url.substr(domain_i + 1, remaining_url.length);
        let domain_parts = parsed_url.domain.split('.');
        switch (domain_parts.length) {
            case 2:
                parsed_url.subdomain = null;
                parsed_url.host = domain_parts[0];
                parsed_url.tld = domain_parts[1];
                break;
            case 3:
                parsed_url.subdomain = domain_parts[0];
                parsed_url.host = domain_parts[1];
                parsed_url.tld = domain_parts[2];
                break;
            case 4:
                parsed_url.subdomain = domain_parts[0];
                parsed_url.host = domain_parts[1];
                parsed_url.tld = domain_parts[2] + '.' + domain_parts[3];
                break;
        }

        parsed_url.parent_domain = parsed_url.host + '.' + parsed_url.tld;

        return parsed_url;
    },

    matchingContent = (host) => {
        let entry = false;
        if (unlockedContent) {
            Object.keys(unlockedContent.entries).map((key) => {
                let obj = unlockedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
        }
        return entry;
    },

    detectActiveUrl = () => {
        if (PHASE === 'LOADED' && unlockedContent) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (isUrl(tabs[0].url)) {
                        activeHost = decomposeUrl(tabs[0].url).host;
                        if (matchingContent(activeHost)) {
                            updateBadgeStatus(PHASE);
                            hasCredentials = true;
                        } else {
                            updateBadgeStatus('ERROR');
                            hasCredentials = false;
                        }
                    } else {
                        updateBadgeStatus('ERROR');
                        hasCredentials = false;
                    }
                }
            });
        }
    },


    fillCredentials = (host) => {
        let entry = false;
        if (unlockedContent) {
            Object.keys(unlockedContent.entries).map((key) => {
                let obj = unlockedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
        }
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (typeof tabs[0] !== 'undefined') {
                if (isUrl(tabs[0].url)) {
                    if (decomposeUrl(tabs[0].url).host === activeHost) {
                        injectContentScript(tabs[0].id, sendTabMessage, 'showTrezorMsg', null);
                        decryptPassword(entry, fillLoginForm);
                    }
                }
            }
        });
    },

    fillLoginForm = (data) => {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (typeof tabs[0] !== 'undefined') {
                if (isUrl(tabs[0].url)) {
                    if (typeof data === 'undefined') {
                        data = {};
                        data.content = null;
                    }
                    if (decomposeUrl(tabs[0].url).host === activeHost) {
                        injectContentScript(tabs[0].id, sendTabMessage, 'fillData', data.content);
                    }
                }
            }
        });
    },

    openTab = (data) => {
        if (windowOpener === 'newtab') {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    var tabId = tabs[0].id;
                    chrome.tabs.update(tabId, {
                        url: setProtocolPrefix(data.title)
                    });
                }
            });
        } else {
            chrome.tabs.create({url: setProtocolPrefix(data.title)});
        }
    },

    openTabAndLogin = (data) => {
        if (windowOpener === 'newtab') {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    var tabId = tabs[0].id;
                    chrome.tabs.update(tabId, {
                        url: setProtocolPrefix(data.title)
                    }, (tab) => {
                        var injectionListener = (tabId, changeInfo, tab)  => {
                            chrome.tabs.onUpdated.removeListener(injectionListener);
                            injectContentScript(tab.id, sendTabMessage, 'fillData', data);
                        };
                        chrome.tabs.onUpdated.addListener(injectionListener);
                    });
                }
            });
        } else {
            chrome.tabs.create({url: setProtocolPrefix(data.title)}, (tab) => {
                injectContentScript(tab.id, sendTabMessage, 'fillData', data);
            });
        }
    },


    injectContentScript = (id, callback, type, data) => {
        var tabId = id;
        chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
            if (chrome.runtime.lastError) {
                chrome.tabs.executeScript(tabId, {file: 'js/content_script.js', runAt: "document_start"}, () => {
                    chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
                        if (response.type === 'scriptReady') {
                            callback(tabId, type, data);
                        } else {
                            chrome.tabs.executeScript(tabId, {file: 'js/content_script.js'}, () => {
                                if (chrome.runtime.lastError) {
                                    console.error(chrome.runtime.lastError);
                                    throw Error("Unable to inject script into tab " + tabId);
                                }
                                callback(tabId, type, data);
                            });
                        }
                    });
                });
            } else {
                if (response.type === 'scriptReady') {
                    callback(tabId, type, data);
                }
            }
        });

    };


// DROPBOX PHASE

const FILENAME_MESS = '5f91add3fa1c3c76e90c90a3bd0999e2bd7833d06a483fe884ee60397aca277a',
    receiverRelativePath = '/html/chrome_oauth_receiver.html',
    dropboxApiKey = 's340kh3l0vla1nv';

let dropboxClient = new Dropbox.Client({key: dropboxApiKey}),
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

                encrypt(basicObjectBlob, encryptionKey).then((res) => {
                    saveFile(res);
                });
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
        dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: receiverRelativePath}));
        dropboxClient.onError.addListener(function (error) {
            handleDropboxError(error);
        });
        dropboxClient.authenticate((error, data) => {
            if (error) {
                return handleDropboxError(error);
            } else {
                if (dropboxClient.isAuthenticated()) {
                    sendMessage('dropboxConnected');
                    setDropboxUsername();
                }
            }
        });
    },

    setDropboxUsername = () => {
        dropboxClient.getAccountInfo(function (error, accountInfo) {
            if (error) {
                handleDropboxError(error);
                connectToDropbox();
            } else {
                dropboxUsername = accountInfo.name;
                sendMessage('setDropboxUsername', accountInfo.name);
            }
        });

    },

    signOutDropbox = () => {
        dropboxClient.signOut(function (error, accountInfo) {
            if (error) {
                handleDropboxError(error);
            }
            sendMessage('dropboxDisconnected');
            dropboxUsername = '';
            dropboxUsernameAccepted = false;
            PHASE = 'DROPBOX';
        });
    },

    loadFile = () => {
        try {
            // creating filename
            if (!FILENAME) {
                let fileKey = masterKey.substring(0, masterKey.length / 2);
                FILENAME = crypto.createHmac('sha256', fileKey).update(FILENAME_MESS).digest('hex') + '.pswd';
            }
            dropboxClient.readFile(FILENAME, {arrayBuffer: true}, (error, data) => {
                if (error) {
                    return handleDropboxError(error);
                } else {
                    if (!(Buffer.isBuffer(data))) {
                        data = toBuffer(data);
                    }

                    let decrypted = decrypt(data, encryptionKey);
                    unlockedContent = typeof decrypted === 'object' ? decrypted : JSON.parse(decrypted);
                    sendMessage('decryptedContent', decrypted);
                    PHASE = 'LOADED';
                }
            });
        } catch (err) {
            return handleDropboxError(err);
        }
    },

    saveFile = (data) => {
        dropboxClient.writeFile(FILENAME, data, function (error, stat) {
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
    ENC_VALUE = '2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee',
    CIPHER_IVSIZE = 96 / 8,
    AUTH_SIZE = 128 / 8,
    CIPHER_TYPE = 'aes-256-gcm',
    MINIMAL_EXTENSION_VERSION = '1.0.6',

//errors
    NO_TRANSPORT = new Error('No trezor.js transport is available'),
    NO_CONNECTED_DEVICES = new Error('No connected devices'),
    DEVICE_IS_BOOTLOADER = new Error('Connected device is in bootloader mode'),
    DEVICE_IS_EMPTY = new Error('Connected device is not initialized'),
    FIRMWARE_IS_OLD = new Error('Firmware of connected device is too old'),
    INSUFFICIENT_FUNDS = new Error('Insufficient funds');

let deviceList = '',
    trezorDevice = false,
    masterKey = '',
    encryptionKey = '',
    trezorConnected = false,
    current_ext_version = '',

    checkTransport = (transport)  => {
        current_ext_version = transport.version;
        checkVersions();
    },

    checkVersions = () => {
        if (current_ext_version) {
            if (!versionCompare(current_ext_version, MINIMAL_EXTENSION_VERSION)) {
                // bad version
                sendMessage('showAlert', 'OLD_VERSION');
            }
        }
    },

    displayPhrase = (title, username) => {
        title = isUrl(title) ? decomposeUrl(title).host : title;
        return 'Unlock ' + title + ' for user ' + username + '?'
    },

    getEncryptionKey = (session) => {
        return session.cipherKeyValue(getPath(), ENC_KEY, ENC_VALUE, true, true, true).then((result) => {
            masterKey = result.message.value;
            encryptionKey = new Buffer(masterKey.substring(masterKey.length / 2, masterKey.length), 'hex');
            loadFile();
        }).catch(handleTrezorError(getEncryptionKey, disconnectCallback));
    },

    handleTrezorError = (retry, fallback) => {
        return (error) => {

            let never = new Promise(() => {
            });

            console.warn(error);

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
                case 'Failure_NotInitialized':
                    sendMessage('notInitialized');
                    break;

                case 'Failure_ActionCancelled':
                    fallback();
                    break;

                case 'Failure_PinInvalid':
                    sendMessage('wrongPin');
                    trezorDevice.waitForSessionAndRun((session) => retry(session));
                    break;
            }
        }
    },

    connectTrezor = (device) => {
        trezorDevice = !!device && device;
        if (PHASE === 'TREZOR' && trezorDevice) {
            try {
                sendMessage('trezorConnected');
                trezorDevice.on('pin', pinCallback);
                trezorDevice.on('passphrase', passphraseCallback);
                trezorDevice.on('button', buttonCallback);
                trezorDevice.on('disconnect', disconnectCallback);
                if (trezorDevice.isBootloader()) {
                    throw new Error('Device is in bootloader mode, re-connected it');
                }
                trezorDevice.waitForSessionAndRun((session) => getEncryptionKey(session));

            } catch (error) {
                console.error('Device error:', error);
            }
        }
    },

    encrypt = (data, key) => {
        return randomInputVector().then((iv) => {
            let stringified = JSON.stringify(data),
                buffer = new Buffer(stringified, 'utf8'),
                cipher = crypto.createCipheriv(CIPHER_TYPE, key, iv),
                startCText = cipher.update(buffer),
                endCText = cipher.final(),
                auth_tag = cipher.getAuthTag();
            return Buffer.concat([iv, auth_tag, startCText, endCText]);
        });
    },

    decrypt = (data, key) => {
        try {
            let iv = data.slice(0, CIPHER_IVSIZE),
                auth_tag = data.slice(CIPHER_IVSIZE, CIPHER_IVSIZE + AUTH_SIZE),
                cText = data.slice(CIPHER_IVSIZE + AUTH_SIZE),
                decipher = crypto.createDecipheriv(CIPHER_TYPE, key, iv),
                start = decipher.update(cText);
            decipher.setAuthTag(auth_tag);
            let end = decipher.final();
            return Buffer.concat([start, end]).toString('utf8');
        } catch (error) {
            console.log('error ', error);
        }
    },

    encryptFullEntry = (data, responseCallback) => {
        crypto.randomBytes(32, function (ex, buf) {
            let key = displayPhrase(data.title, data.username),
                nonce = buf.toString('hex');
            trezorDevice.waitForSessionAndRun((session) => {
                return session.cipherKeyValue(getPath(), key, nonce, true, false, true).then((result) => {
                    let enckey = new Buffer(nonce, 'hex');
                    encrypt(data.password, enckey).then((password)=> {
                        encrypt(data.safe_note, enckey).then((safenote)=> {
                            responseCallback({
                                content: {
                                    title: data.title,
                                    username: data.username,
                                    password: password,
                                    safe_note: safenote,
                                    nonce: result.message.value
                                }
                            });
                        });
                    });
                });
            });
        });
    },

    decryptFullEntry = (data, responseCallback) => {
        let key = displayPhrase(data.title, data.username);
        trezorDevice.waitForSessionAndRun((session) => {
            return session.cipherKeyValue(getPath(), key, data.nonce, false, false, true).then((result) => {
                let enckey = new Buffer(result.message.value, 'hex'),
                    password = new Buffer(data.password),
                    safenote = new Buffer(data.safe_note);
                responseCallback({
                    content: {
                        title: data.title,
                        username: data.username,
                        password: JSON.parse(decrypt(password, enckey)),
                        safe_note: JSON.parse(decrypt(safenote, enckey)),
                        nonce: data.nonce
                    }
                });
            }).catch(handleTrezorError(null, responseCallback));
        });
    },

    decryptPassword = (data, responseCallback) => {
        let key = displayPhrase(data.title, data.username);
        trezorDevice.waitForSessionAndRun((session) => {
            return session.cipherKeyValue(getPath(), key, data.nonce, false, false, true).then((result) => {
                let enckey = new Buffer(result.message.value, 'hex'),
                    password = new Buffer(data.password);
                responseCallback({
                    content: {
                        title: data.title,
                        username: data.username,
                        password: JSON.parse(decrypt(password, enckey))
                    }
                });
            }).catch(handleTrezorError(null, responseCallback));
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
        dropboxUsernameAccepted = false;
        sendMessage('trezorDisconnected');
        masterKey = '';
        encryptionKey = '';
        unlockedContent = '';
        FILENAME = '';
        updateBadgeStatus('OFF');
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
        });
    };

chromeExists().then(() => {
    chrome.tabs.onUpdated.addListener(detectActiveUrl);
    chrome.tabs.onActivated.addListener(detectActiveUrl);
    chrome.commands.onCommand.addListener(chromeCommands);
    chrome.runtime.onMessage.addListener(chromeMessaging);
    return new trezor.DeviceList();
}).then((list) => {
    deviceList = list;
    deviceList.on('transport', checkTransport);
    deviceList.on('connect', connectTrezor);
    deviceList.on('error', (error) => {
        console.error('List error:', error);
    });
});

