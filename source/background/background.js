'use strict';
let PHASE = 'DROPBOX', /* DROPBOX, TREZOR, LOADED */
    Buffer = require('buffer/').Buffer,
    TrezorMgmt = require('./classes/trezor_mgmt'),
    trezorManager = {},
    DropboxMgmt = require('./classes/dropbox_mgmt'),
    dropboxManager = {},
    activeHost = '',
    hasCredentials = false,
    masterKey = '',
    encryptionKey = '',
    decryptedContent = false,

// GENERAL STUFF

    updateBadgeStatus = (status) => {
        let badgeState = {
            LOADED: {color: [59, 192, 195, 255], defaultText: '\u0020'},
            DROPBOX: {color: [237, 199, 85, 100], defaultText: '\u0020'},
            TREZOR: {color: [237, 199, 85, 100], defaultText: '\u0020'},
            ERROR: {color: [255, 255, 0, 100], defaultText: '\u0020'},
            OFF: {color: [255, 255, 0, 100], defaultText: ''}
        };
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

    changePhase = (phase) => {
        PHASE = phase;
        trezorManager.changePhase(PHASE);
        dropboxManager.changePhase(PHASE);
    },


    toBuffer = (ab) => {
        let buffer = new Buffer(ab.byteLength),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
    },

    init = () => {
        trezorManager.checkVersions();
        switch (PHASE) {
            case 'LOADED':
                sendMessage('decryptedContent', JSON.stringify(decryptedContent));
                break;
            case 'DROPBOX':
                if (dropboxManager.isAuth() && !dropboxManager.getName()) {
                    dropboxManager.setDropboxUsername();
                } else if (!dropboxManager.isAuth()) {
                    sendMessage('dropboxInitialized');
                } else if (dropboxManager.isAuth() && dropboxManager.getName()) {
                    sendMessage('setDropboxUsername', dropboxManager.getName());
                }
                break;
            case 'TREZOR':
                if (masterKey === '') {
                    changePhase('DROPBOX');
                    init();
                } else {
                    changePhase('LOADED');
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
                init();
                break;

            case 'connectDropbox':
                dropboxManager.connectToDropbox();
                break;

            case 'initTrezorPhase':
                changePhase('TREZOR');
                sendMessage('trezorDisconnected');
                trezorManager.connectTrezor();
                break;

            case 'trezorPin':
                trezorManager.pinEnter(request.content);
                break;

            case 'disconnectDropbox':
                dropboxManager.signOutDropbox();
                break;

            case 'loadContent':
                dropboxManager.loadFile(masterKey);
                break;

            case 'saveContent':
                trezorManager.encrypt(request.content, encryptionKey).then((res) => {
                    dropboxManager.saveFile(res);
                });
                break;

            case 'encryptFullEntry':
                trezorManager.encryptFullEntry(request.content, sendResponse);
                break;

            case 'decryptPassword':
                trezorManager.decryptPassword(request.content, sendResponse);
                break;

            case 'decryptFullEntry':
                trezorManager.decryptFullEntry(request.content, sendResponse);
                break;

            case 'openTabAndLogin':
                openTabAndLogin(request.content);
                break;

            case 'bg-trezorDisconnected':
                decryptedContent = '';
                updateBadgeStatus('OFF');
                sendMessage('trezorDisconnected');
                changePhase('DROPBOX');
                init();
                break;

            case 'bg-decryptContent':
                let tempDecryptedData = trezorManager.decrypt(dropboxManager.getLoadedData(), encryptionKey);
                sendMessage('decryptedContent', tempDecryptedData);
                decryptedContent = typeof tempDecryptedData === 'object' ? tempDecryptedData : JSON.parse(tempDecryptedData);
                changePhase('LOADED');
                break;

            case 'bg-loadFile':
                let key = trezorManager.getKeys();
                masterKey = key[0];
                encryptionKey = key[1];
                dropboxManager.loadFile(masterKey);
                break;

            case 'bg-noStorage':
                let basicObjectBlob = {
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
                };
                trezorManager.encrypt(basicObjectBlob, encryptionKey).then((res) => {
                    dropboxManager.saveFile(res);
                });
                break;

            case 'bg-changePhase':
                changePhase(request.content);
                break;
        }
        return true;
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
        if (decryptedContent && typeof host !== 'undefined') {
            Object.keys(decryptedContent.entries).map((key) => {
                let obj = decryptedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
        }
        return entry;
    },

    detectActiveUrl = () => {
        if (PHASE === 'LOADED' && decryptedContent) {
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
        if (decryptedContent) {
            Object.keys(decryptedContent.entries).map((key) => {
                let obj = decryptedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
        }
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (typeof tabs[0] !== 'undefined') {
                if (isUrl(tabs[0].url)) {
                    if (decomposeUrl(tabs[0].url).host === activeHost) {
                        injectContentScript(tabs[0].id, this.sendTabMessage, 'showTrezorMsg', null);
                        trezorManager.decryptPassword(entry, fillLoginForm);
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
                        injectContentScript(tabs[0].id, this.sendTabMessage, 'fillData', data.content);
                    }
                }
            }
        });
    },

    openTabAndLogin = (data) => {
        chrome.tabs.create({url: setProtocolPrefix(data.title)}, (tab) => {
            injectContentScript(tab.id, this.sendTabMessage, 'fillData', data);
        });
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

chromeExists().then(() => {
    chrome.tabs.onUpdated.addListener(detectActiveUrl);
    chrome.tabs.onActivated.addListener(detectActiveUrl);
    chrome.commands.onCommand.addListener(chromeCommands);
    chrome.runtime.onMessage.addListener(chromeMessaging);
    chrome.browserAction.onClicked.addListener(() => {
        chrome.tabs.create({'url': chrome.extension.getURL('index.html'), 'selected': true});
    });
    return new trezor.DeviceList();
}).then((list) => {
    trezorManager = new TrezorMgmt(list, PHASE);
    dropboxManager = new DropboxMgmt(PHASE);
});

