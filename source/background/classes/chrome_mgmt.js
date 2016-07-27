/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var Promise = require('es6-promise').Promise;
class ChromeMgmt {

    constructor(bgStore) {
        this.bgStore = bgStore;
        this.bgStore.on('decryptedPassword', (data) => this.fillLoginForm(data));
        this.bgStore.on('checkReopen', () => this.checkReopen());
        this.activeUrl = '';
        this.activeDomain = '';
        this.hasCredentials = false;
        this.accessTabId = 0;
        chrome.tabs.onActivated.addListener(() => this.detectActiveUrl());
        chrome.tabs.onUpdated.addListener(() => this.detectActiveUrl());
        chrome.commands.onCommand.addListener((c) => this.chromeCommands(c));
        chrome.browserAction.onClicked.addListener(() => this.openAppTab());
    }

    exists() {
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
    }

    checkReopen() {
        if (localStorage.getItem('tpmRestart') === 'reopen') {
            localStorage.setItem('tpmRestart', 'nope');
            this.openAppTab();
        }
    }

    openAppTab() {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({type: 'isAppOpen', content: ''}, (response) => {
                if (!!response) {
                    this.focusTab(response.tab.id).then(() => {
                        resolve(response.tab.id);
                    });
                } else {
                    chrome.tabs.create({'url': this.bgStore.appUrl, 'selected': true}, (tab) => {
                        this.focusTab(tab.id).then(() => {
                            resolve(tab.id);
                        });
                    });
                }
            });
        });
    }

    focusTab(tabId) {
        return new Promise((resolve, reject) => {
            chrome.tabs.update(tabId, {selected: true}, (tab) => {
                resolve(tab);
            });
        });
    }

    detectActiveUrl() {
        if (this.bgStore.phase === 'LOADED' && this.bgStore.decryptedContent) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (this.bgStore.isUrl(tabs[0].url)) {
                        this.activeUrl = tabs[0].url;
                        this.activeDomain = this.bgStore.decomposeUrl(this.activeUrl).domain;
                        if (this.matchingContent(this.activeDomain)) {
                            this.updateBadgeStatus(this.bgStore.phase);
                            this.hasCredentials = true;
                        } else {
                            this.updateBadgeStatus('ERROR');
                            this.hasCredentials = false;
                        }
                        this.createContextMenuItem(this.hasCredentials);
                    } else {
                        this.clearContextMenuItem();
                        this.updateBadgeStatus('ERROR');
                        this.hasCredentials = false;
                    }
                }
            });
        } else {
            this.hasCredentials = false;
        }
    }

    fillOrSave() {
        if (this.hasCredentials) {
            this.fillCredentials(this.activeDomain);
        } else {
            this.saveEntry();
        }
    }

    chromeCommands(command) {
        switch (command) {
            case 'fill_login_form':
                this.fillOrSave();
                break;

            case 'clear_session':
                this.bgStore.emit('clearSession');
                break;

            case 'restart_app':
                chrome.runtime.reload();
                break;
        }
    }

    fillCredentials(host) {
        let entry = false;
        if (this.bgStore.decryptedContent) {
            Object.keys(this.bgStore.decryptedContent.entries).map((key) => {
                let obj = this.bgStore.decryptedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (this.bgStore.isUrl(tabs[0].url)) {
                        if (this.bgStore.decomposeUrl(tabs[0].url).domain === this.activeDomain) {
                            this.accessTabId = tabs[0].id;
                            this.injectContentScript(tabs[0].id, 'showTrezorMsg', null);
                            this.bgStore.emit('decryptPassword', entry);
                        }
                    }
                }
            });
        }
    }

    saveEntry() {
        var domain = this.activeUrl;
        this.openAppTab().then((tabId) => {
            setTimeout(() => {
                chrome.runtime.sendMessage({type: 'saveEntry', content: domain}, (response) => {
                    if (!response) {
                        setTimeout(() => {
                            chrome.runtime.sendMessage({type: 'saveEntry', content: domain});
                        }, 800);
                    }
                });
            }, 300);
        });
    }

    updateBadgeStatus(status) {
        let badgeState = {
            LOADED: {color: [76, 175, 80, 255], defaultText: '\u0020'},
            STORAGE: {color: [237, 199, 85, 100], defaultText: '\u0020'},
            TREZOR: {color: [237, 199, 85, 100], defaultText: '\u0020'},
            ERROR: {color: [255, 173, 51, 255], defaultText: '\u0020'},
            OFF: {color: [255, 255, 0, 100], defaultText: ''}
        };
        chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
        chrome.browserAction.setBadgeBackgroundColor(
            {color: badgeState[status].color});
    }

    matchingContent(host) {
        let entry = false;
        if (this.bgStore.decryptedContent && typeof host !== 'undefined') {
            Object.keys(this.bgStore.decryptedContent.entries).map((key) => {
                let obj = this.bgStore.decryptedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
        }
        return entry;
    }

    setProtocolPrefix(url) {
        return url.indexOf('://') > -1 ? url : 'https://' + url;
    }

    injectContentScript(id, type, data) {
        var tabId = id;
        chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
            if (chrome.runtime.lastError) {
                chrome.tabs.insertCSS(tabId, {file: 'css/content_style.css', runAt: 'document_start'}, () => {
                    chrome.tabs.executeScript(tabId, {file: 'js/content_script.js', runAt: 'document_start'}, () => {
                        chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
                            if (response.type === 'scriptReady') {
                                this.sendTabMessage(tabId, type, data);
                            } else {
                                chrome.tabs.executeScript(tabId, {file: 'js/content_script.js'}, () => {
                                    if (chrome.runtime.lastError) {
                                        console.error(chrome.runtime.lastError);
                                        throw Error('Unable to inject script into tab ' + tabId);
                                    }
                                    this.sendTabMessage(tabId, type, data);
                                });
                            }
                        });
                    });
                });
            } else {
                if (response.type === 'scriptReady') {
                    this.sendTabMessage(tabId, type, data);
                }
            }
        });
    }

    fillLoginForm(data) {
        if (typeof data === 'undefined') {
            data = {content: null};
        }
        this.injectContentScript(parseInt(this.accessTabId), 'fillData', data.content);
        this.accessTabId = 0;
    }

    openTabAndLogin(data) {
        chrome.tabs.create({url: this.setProtocolPrefix(data.title)}, (tab) => {
            this.injectContentScript(tab.id, 'fillData', data);
        });
    }

    tryRefocusToAccessTab() {
        if (this.accessTabId !== 0) {
            this.focusTab(parseInt(this.accessTabId));
        }
    }

    sendMessage(msgType, msgContent) {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    }

    sendTabMessage(tabId, type, data) {
        chrome.tabs.sendMessage(tabId, {type: type, content: data});
    }

    clearContextMenuItem() {
        chrome.contextMenus.removeAll();
    }

    createContextMenuItem(hasItem) {
        chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
                "contexts": ["page", "selection", "image", "link"],
                "title": hasItem ? "Login to " + this.activeDomain : "Save " + this.activeDomain,
                "onclick": () => {
                    this.fillOrSave()
                }
            });

        });
    }
}

module.exports = ChromeMgmt;
