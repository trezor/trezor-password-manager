'use strict';

var Promise = require('es6-promise').Promise
class Chrome_mgmt {

    constructor(storage) {
        this.storage = storage;
        this.storage.on('decryptedPassword', (data) => this.fillLoginForm(data));
        this.activeHost = '';
        this.hasCredentials = false;
        chrome.tabs.onUpdated.addListener(() => this.detectActiveUrl());
        chrome.tabs.onActivated.addListener(() => this.detectActiveUrl());
        chrome.commands.onCommand.addListener((c) => this.chromeCommands(c));
        chrome.browserAction.onClicked.addListener(() => {
            chrome.tabs.create({'url': chrome.extension.getURL('index.html'), 'selected': true});
        });
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

    detectActiveUrl() {
        if (this.storage.phase === 'LOADED' && this.storage.decryptedContent) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                if (typeof tabs[0] !== 'undefined') {
                    if (this.isUrl(tabs[0].url)) {
                        this.activeHost = this.decomposeUrl(tabs[0].url).host;
                        if (this.matchingContent(this.activeHost)) {
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
                    this.fillCredentials(this.activeHost);
                }
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
        }
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (typeof tabs[0] !== 'undefined') {
                if (this.isUrl(tabs[0].url)) {
                    if (this.decomposeUrl(tabs[0].url).host === this.activeHost) {
                        this.injectContentScript(tabs[0].id, 'showTrezorMsg', null);
                        this.storage.emit('decryptPassword', entry);
                    }
                }
            }
        });
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

    isUrl(url) {
        return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
    }

    decomposeUrl(url) {
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
    }

    injectContentScript(id, type, data) {
        var tabId = id;
        chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
            if (chrome.runtime.lastError) {
                chrome.tabs.executeScript(tabId, {file: 'js/content_script.js', runAt: "document_start"}, () => {
                    chrome.tabs.sendMessage(tabId, {type: 'isScriptExecuted'}, (response) => {
                        if (response.type === 'scriptReady') {
                            this.sendTabMessage(tabId, type, data);
                        } else {
                            chrome.tabs.executeScript(tabId, {file: 'js/content_script.js'}, () => {
                                if (chrome.runtime.lastError) {
                                    console.error(chrome.runtime.lastError);
                                    throw Error("Unable to inject script into tab " + tabId);
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
        console.log('FILL LOGIN FORM! ', data);
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            if (typeof tabs[0] !== 'undefined') {
                if (this.isUrl(tabs[0].url)) {
                    if (typeof data === 'undefined') {
                        data = {};
                        data.content = null;
                    }
                    if (this.decomposeUrl(tabs[0].url).host === this.activeHost) {
                        this.injectContentScript(tabs[0].id, 'fillData', data.content);
                    }
                }
            }
        });
    }

    openTabAndLogin(data) {
        chrome.tabs.create({url: this.setProtocolPrefix(data.title)}, (tab) => {
            this.injectContentScript(tab.id, 'fillData', data);
        });
    }


    sendMessage(msgType, msgContent) {
        chrome.runtime.sendMessage({type: msgType, content: msgContent});
    }

    sendTabMessage(tabId, type, data) {
        chrome.tabs.sendMessage(tabId, {type: type, content: data});
    }
}

module.exports = Chrome_mgmt;