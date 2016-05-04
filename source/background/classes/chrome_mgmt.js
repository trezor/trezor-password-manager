'use strict';

var Promise = require('es6-promise').Promise;
class ChromeMgmt {

    constructor(storage) {
        this.storage = storage;
        this.storage.on('decryptedPassword', (data) => this.fillLoginForm(data));
        this.storage.on('checkReopen', () => this.checkReopen());
        this.activeDomain = '';
        this.hasCredentials = false;
        this.accessTabId = 0;
        chrome.tabs.onUpdated.addListener(() => this.detectActiveUrl());
        chrome.tabs.onActivated.addListener(() => this.detectActiveUrl());
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
        chrome.runtime.sendMessage({type: 'isAppOpen', content: ''}, (response) => {
            if (!!response) {
                this.focusTab(response.tab.id);
            } else {
                chrome.tabs.create({'url': this.storage.appUrl, 'selected': true}, (tab) => {
                    this.focusTab(tab.id);
                });
            }
        });
    }

    focusTab(tabId) {
        chrome.tabs.update(tabId, {selected: true});
    }

    detectActiveUrl() {
        if (this.storage.phase === 'LOADED' && this.storage.decryptedContent) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (this.storage.isUrl(tabs[0].url)) {
                        this.activeDomain = this.storage.decomposeUrl(tabs[0].url).domain;
                        if (this.matchingContent(this.activeDomain)) {
                            this.updateBadgeStatus(this.storage.phase);
                            this.hasCredentials = true;
                        } else {
                            this.updateBadgeStatus('ERROR');
                            this.hasCredentials = false;
                        }
                    } else {
                        this.updateBadgeStatus('ERROR');
                        this.hasCredentials = false;
                    }
                }
            });
        } else {
            this.hasCredentials = false;
        }
    }

    chromeCommands(command) {
        switch (command) {
            case 'fill_login_form':
                if (this.hasCredentials) {
                    this.fillCredentials(this.activeDomain);
                }
                break;

            case 'clear_session':
                this.storage.emit('clearSession');
                break;

            case 'restart_app':
                chrome.runtime.reload();
                break;
        }
    }

    fillCredentials(host) {
        let entry = false;
        if (this.storage.decryptedContent) {
            Object.keys(this.storage.decryptedContent.entries).map((key) => {
                let obj = this.storage.decryptedContent.entries[key];
                if (obj.title.indexOf(host) > -1 || host.indexOf(obj.title) > -1) {
                    entry = obj;
                }
            });
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (this.storage.isUrl(tabs[0].url)) {
                        if (this.storage.decomposeUrl(tabs[0].url).domain === this.activeDomain) {
                            this.accessTabId = tabs[0].id;
                            this.injectContentScript(tabs[0].id, 'showTrezorMsg', null);
                            this.storage.emit('decryptPassword', entry);
                        }
                    }
                }
            });
        }
    }

    updateBadgeStatus(status) {
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
    }

    matchingContent(host) {
        let entry = false;
        if (this.storage.decryptedContent && typeof host !== 'undefined') {
            Object.keys(this.storage.decryptedContent.entries).map((key) => {
                let obj = this.storage.decryptedContent.entries[key];
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
}

module.exports = ChromeMgmt;