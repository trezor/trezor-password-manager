/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

window.tpmErroLog = [];
// Storage will be used for background internal messaging (extends EventEmitter) ...
var BgDataStore = require('./classes/bg_data_store'),
    bgStore = new BgDataStore(),
// Chrome manager will maintain most of injection and other (tab <-> background <-> app) context manipulation
    ChromeMgmt = require('./classes/chrome_mgmt'),
    chromeManager = new ChromeMgmt(bgStore),
    TrezorMgmt = require('./classes/trezor_mgmt'),
    trezorManager = {},
    DropboxMgmt = require('./classes/dropbox_mgmt'),
    dropboxManager = {},
    DriveMgmt = require('./classes/drive_mgmt'),
    driveManager = {},

// GENERAL STUFF

    init = () => {
        trezorManager.checkVersions();
        switch (bgStore.phase) {
            case 'LOADED':
                chromeManager.sendMessage('decryptedContent', JSON.stringify(bgStore.decryptedContent));
                break;
            case 'STORAGE':
                if (dropboxManager.isAuth() && !dropboxManager.username) {
                    dropboxManager.setDropboxUsername();
                } else if (!dropboxManager.isAuth()) {
                    chromeManager.sendMessage('dropboxInitialized');
                } else if (dropboxManager.isAuth() && !!dropboxManager.username) {
                    chromeManager.sendMessage('setDropboxUsername', dropboxManager.username);
                }
                break;
            case 'TREZOR':
                if (bgStore.masterKey === '') {
                    bgStore.phase = 'STORAGE';
                    init();
                } else {
                    bgStore.phase = 'LOADED';
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
        trezorManager.encrypt(basicObjectBlob, bgStore.encryptionKey).then((res) => {
            dropboxManager.saveFile(res);
        });
    },

    userLoggedOut = () => {
        bgStore.decryptedContent = false;
        chromeManager.updateBadgeStatus('OFF');
        chromeManager.sendMessage('trezorDisconnected');
        dropboxManager.disconnected();
        bgStore.phase = 'STORAGE';
        init();
    },

    contentDecrypted = () => {
        let tempDecryptedData = trezorManager.decrypt(dropboxManager.loadedData, bgStore.encryptionKey);
        chromeManager.sendMessage('decryptedContent', tempDecryptedData);
        bgStore.decryptedContent = typeof tempDecryptedData === 'object' ? tempDecryptedData : JSON.parse(tempDecryptedData);
        bgStore.phase = 'LOADED';
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

            case 'connectDrive':
                driveManager.connectToDrive();
                break;

            case 'initTrezorPhase':
                bgStore.phase = 'TREZOR';
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
                trezorManager.encrypt(request.content, bgStore.encryptionKey).then((res) => {
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
    trezorManager = new TrezorMgmt(bgStore, list);
    dropboxManager = new DropboxMgmt(bgStore);
    driveManager = new DriveMgmt(bgStore);
    bgStore.on('decryptContent', contentDecrypted);
    bgStore.on('initStorageFile', initNewFile);
    bgStore.on('disconnectDropbox', init);
    bgStore.on('showPinDialog', showPinDialog);
    bgStore.on('clearSession', () => trezorManager.clearSession());
    bgStore.on('loadFile', () => dropboxManager.loadFile());
    bgStore.on('disconnectedTrezor', userLoggedOut);
    bgStore.on('decryptPassword', (entry) => decryptAndInject(entry));
    bgStore.on('sendMessage', (type, content) => chromeManager.sendMessage(type, content));
});

