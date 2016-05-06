/*
 * Copyright (c) Peter Privalinec, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

window.tpmErroLog = [];
// Storage will be used for background internal messaging (extends EventEmitter) ...
var StorageMgmt = require('./classes/storage_mgmt'),
    storage = new StorageMgmt(),
// Chrome manager will maintain most of injection and other (tab <-> background <-> app) context manipulation
    ChromeMgmt = require('./classes/chrome_mgmt'),
    chromeManager = new ChromeMgmt(storage),
    TrezorMgmt = require('./classes/trezor_mgmt'),
    trezorManager = {},
    DropboxMgmt = require('./classes/dropbox_mgmt'),
    dropboxManager = {},

// GENERAL STUFF

    init = () => {
        trezorManager.checkVersions();
        switch (storage.phase) {
            case 'LOADED':
                chromeManager.sendMessage('decryptedContent', JSON.stringify(storage.decryptedContent));
                break;
            case 'DROPBOX':
                if (dropboxManager.isAuth() && !dropboxManager.username) {
                    dropboxManager.setDropboxUsername();
                } else if (!dropboxManager.isAuth()) {
                    chromeManager.sendMessage('dropboxInitialized');
                } else if (dropboxManager.isAuth() && !!dropboxManager.username) {
                    chromeManager.sendMessage('setDropboxUsername', dropboxManager.username);
                }
                break;
            case 'TREZOR':
                if (storage.masterKey === '') {
                    storage.phase = 'DROPBOX';
                    init();
                } else {
                    storage.phase = 'LOADED';
                }
                break;
        }
    },

    initNewFile = () => {
        let basicObjectBlob = {
            'version': '0.0.1',
            'config': {
                'orderType': 'date'
            },
            'tags': {
                '0': {
                    'title': 'All',
                    'icon': 'home'
                },
                '1': {
                    'title': 'Social',
                    'icon': 'person-stalker'
                },
                '2': {
                    'title': 'Bitcoin',
                    'icon': 'social-bitcoin'
                }
            },
            'entries': {}
        };
        trezorManager.encrypt(basicObjectBlob, storage.encryptionKey).then((res) => {
            dropboxManager.saveFile(res);
        });
    },

    userLoggedOut = () => {
        storage.decryptedContent = false;
        chromeManager.updateBadgeStatus('OFF');
        chromeManager.sendMessage('trezorDisconnected');
        dropboxManager.disconnected();
        storage.phase = 'DROPBOX';
        init();
    },

    contentDecrypted = () => {
        let tempDecryptedData = trezorManager.decrypt(dropboxManager.loadedData, storage.encryptionKey);
        chromeManager.sendMessage('decryptedContent', tempDecryptedData);
        storage.decryptedContent = typeof tempDecryptedData === 'object' ? tempDecryptedData : JSON.parse(tempDecryptedData);
        storage.phase = 'LOADED';
    },

    decryptAndInject = (entry) => {
        trezorManager.decryptFullEntry(entry, (data) => chromeManager.fillLoginForm(data));
    },

    saveErroLog = (errorMsg, url, lineNumber, column, errorObj) => {
        console.log(errorMsg, url, lineNumber, column, errorObj);
        window.tpmErroLog.push('%0D%0A Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
    },

    showPinDialog = () => {
        chrome.runtime.sendMessage({type: 'showPinDialog', content: ''}, (response) => {
            if (!!response) {
                if (response.type === 'pinVisible') {
                    chromeManager.focusTab(response.tab.id);
                }
            } else {
                chromeManager.openAppTab();
                setTimeout(() => {
                    showPinDialog();
                }, 1300);
            }
        });
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
                storage.phase = 'TREZOR';
                chromeManager.sendMessage('trezorDisconnected');
                trezorManager.connectTrezor();
                break;

            case 'trezorPin':
                trezorManager.pinEnter(request.content);
                chromeManager.tryRefocusToAccessTab();
                break;

            case 'disconnectDropbox':
                dropboxManager.signOutDropbox();
                break;

            case 'saveContent':
                trezorManager.encrypt(request.content, storage.encryptionKey).then((res) => {
                    dropboxManager.saveFile(res);
                });
                break;

            case 'encryptFullEntry':
                trezorManager.encryptFullEntry(request.content, sendResponse);
                break;

            case 'decryptPassword':
                trezorManager.decryptFullEntry(request.content, sendResponse);
                break;

            case 'decryptFullEntry':
                trezorManager.decryptFullEntry(request.content, sendResponse);
                break;

            case 'openTabAndLogin':
                chromeManager.openTabAndLogin(request.content);
                break;

            case 'clearSession':
                trezorManager.clearSession();
                break;
        }
        return true;
    };

chromeManager.exists().then(() => {
    chrome.runtime.onMessage.addListener(chromeMessaging);
    return new trezor.DeviceList({clearSession: true /*clearSessionTime: 100 (by default, 15 minutes)*/});
}).then((list) => {
    trezorManager = new TrezorMgmt(storage, list);
    dropboxManager = new DropboxMgmt(storage);
    storage.on('decryptContent', contentDecrypted);
    storage.on('initStorageFile', initNewFile);
    storage.on('disconnectDropbox', init);
    storage.on('showPinDialog', showPinDialog);
    storage.on('clearSession', () => trezorManager.clearSession());
    storage.on('loadFile', () => dropboxManager.loadFile());
    storage.on('disconnectedTrezor', userLoggedOut);
    storage.on('decryptPassword', (entry) => decryptAndInject(entry));
    storage.on('sendMessage', (type, content) => chromeManager.sendMessage(type, content));
});

