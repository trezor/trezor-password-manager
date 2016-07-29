/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

window.tpmErroLog = [];
// Storage will be used for background internal messaging (extends EventEmitter) ...
var Promise = require('es6-promise').Promise,
    setupReady = false,
    retriesOpening = 3,
    BgDataStore = require('./classes/bg_data_store'),
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
    preSetup = () => {
        chromeManager.exists().then(() => {
            return new trezor.DeviceList({clearSession: true /*clearSessionTime: 100 (by default, 15 minutes)*/});
        }).then((list) => {
            bgStore.on('decryptContent', contentDecrypted);
            bgStore.on('initStorageFile', initNewFile);
            bgStore.on('disconnect', init);
            bgStore.on('showPinDialog', showPinDialog);
            bgStore.on('retrySetup', setupRetry);
            bgStore.on('loadFile', loadFile);
            bgStore.on('disconnectedTrezor', userSwitch);

            trezorManager = new TrezorMgmt(bgStore, list, retriesOpening);
            dropboxManager = new DropboxMgmt(bgStore);
            driveManager = new DriveMgmt(bgStore);

            bgStore.on('clearSession', () => trezorManager.clearSession());
            bgStore.on('decryptPassword', (entry) => decryptAndInject(entry));
            bgStore.on('sendMessage', (type, content) => chromeManager.sendMessage(type, content));
            setupReady = true;
            init();
        });
    },

    init = () => {
        if (!setupReady) {
            preSetup();
        } else {
            trezorManager.checkVersions();
            switch (bgStore.phase) {
                case 'LOADED':
                    chromeManager.createContextMenuItem();
                    chromeManager.sendMessage('decryptedContent', {
                        data: JSON.stringify(bgStore.decryptedContent),
                        username: bgStore.username,
                        storageType: bgStore.storageType
                    });
                    break;
                case 'STORAGE':
                    if (!!bgStore.storageType && !!bgStore.username) {
                        chromeManager.sendMessage('setUsername', {
                            username: bgStore.username,
                            storageType: bgStore.storageType
                        });
                    } else {
                        chromeManager.sendMessage('initialized');
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
        }
    },

    setupRetry = () => {
        setupReady = false;
        if (retriesOpening-- != 0) {
            setTimeout(() => {
                init();
            }, 1500);
        } else {
            setupReady = true;
            init();
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
            if (bgStore.storageType === 'DROPBOX') {
                dropboxManager.createNewDataFile(res);
            } else {
                driveManager.createNewDataFile(res);
            }
        });
    },

    userSwitch = () => {
        bgStore.userSwitch();
        chromeManager.updateBadgeStatus('OFF');
        chromeManager.clearContextMenuItem();
        chromeManager.sendMessage('trezorDisconnected');
        init();
    },

    userLoggedOut = () => {
        bgStore.disconnect();
        chromeManager.updateBadgeStatus('OFF');
        chromeManager.clearContextMenuItem();
        chromeManager.sendMessage('trezorDisconnected');
        init();
    },

    contentDecrypted = () => {
        let tempDecryptedData = trezorManager.decrypt(bgStore.loadedData, bgStore.encryptionKey);
        chromeManager.sendMessage('decryptedContent', {
            data: tempDecryptedData,
            username: bgStore.username,
            storageType: bgStore.storageType
        });
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

    saveContent = (data) => {
        if (bgStore.storageType === 'DROPBOX') {
            dropboxManager.saveFile(data);
        } else {
            driveManager.updateFile(data);
        }
    },

    loadFile = () => {
        if (bgStore.storageType === 'DROPBOX') {
            dropboxManager.loadFile();
        } else {
            driveManager.loadFile();
        }
    },

    showPinDialog = () => {
        chrome.runtime.sendMessage({type: 'showPinDialog', content: ''}, (response) => {
            if (!!response) {
                if (response.type === 'pinVisible') {
                    chromeManager.focusTab(response.tab.id);
                }
            } else {
                chromeManager.openAppTab().then(() => {
                    setTimeout(() => {
                        showPinDialog();
                    }, 1300);
                });
            }
        });
    },

    windowClose = () => {
        chrome.windows.getAll((windows) => {
            if (windows.length == 0) {
                bgStore.disconnect();
                chromeManager.updateBadgeStatus('OFF');
                chromeManager.clearContextMenuItem();
            }
        })
    },

    disconnect = () => {
        if (bgStore.storageType === 'DROPBOX') {
            dropboxManager.disconnect();
        } else {
            driveManager.disconnect();
        }
        userLoggedOut();
    },

    chromeMessaging = (request, sender, sendResponse) => {
        switch (request.type) {
            case 'initPlease':
                init();
                break;

            case 'connectDropbox':
                dropboxManager.connect();
                break;

            case 'connectDrive':
                driveManager.connect();
                break;

            case 'initTrezorPhase':
                bgStore.phase = 'TREZOR';
                chromeManager.sendMessage('trezorDisconnected');
                trezorManager.connect();
                break;

            case 'trezorPin':
                trezorManager.pinEnter(request.content);
                chromeManager.tryRefocusToAccessTab();
                break;

            case 'disconnect':
                disconnect();
                break;

            case 'saveContent':
                trezorManager.encrypt(request.content, bgStore.encryptionKey).then((res) => {
                    saveContent(res);
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

            case 'userSwitch':
                userSwitch();
                break;
        }
        return true;
    };

chrome.runtime.onMessage.addListener(chromeMessaging);

//handling when all windows are closed to clear context etc ...
chrome.windows.onRemoved.addListener(() => windowClose());

// check if app shouldnt reopen after software restart
if (localStorage.getItem('tpmRestart') === 'reopen') {
    setTimeout(() => {
        init();
    }, 1500);
}


