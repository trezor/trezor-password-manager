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
    this.bgStore.on('decryptedPassword', data => this.fillLoginForm(data));
    this.bgStore.on('checkReopen', () => this._checkReopen());
    this.activeUrl = '';
    this.activeDomain = '';
    this.hasCredentials = false;
    this.accessTabId = 0;
    chrome.tabs.onActivated.addListener(() => this._detectActiveUrl());
    chrome.tabs.onUpdated.addListener(() => this._detectActiveUrl());
    chrome.commands.onCommand.addListener(c => this._chromeCommands(c));
    chrome.browserAction.onClicked.addListener(() => this.openAppTab());
  }

  exists() {
    if (typeof chrome === 'undefined') {
      return Promise.reject(new Error('Global chrome does not exist; probably not running chrome'));
    }
    if (typeof chrome.runtime === 'undefined') {
      return Promise.reject(
        new Error('Global chrome.runtime does not exist; probably not running chrome')
      );
    }
    if (typeof chrome.runtime.sendMessage === 'undefined') {
      return Promise.reject(
        new Error(
          'Global chrome.runtime.sendMessage does not exist; probably not whitelisted website in extension manifest'
        )
      );
    }
    return Promise.resolve();
  }

  _checkReopen() {
    if (localStorage.getItem('tpmRestart') === 'reopen') {
      localStorage.setItem('tpmRestart', 'nope');
      this.openAppTab();
    }
  }

  openAppTab() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'isAppOpen', content: '' }, response => {
        if (!!response) {
          this.focusTab(response.tab.id).then(() => {
            resolve(response.tab.id);
          });
        } else {
          chrome.tabs.create({ url: this.bgStore.appUrl, selected: true }, tab => {
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
      chrome.tabs.update(tabId, { highlighted: true }, tab => {
        resolve(tab);
        this.sendTabMessage(tabId, 'focus');
      });
    });
  }

  _detectActiveUrl() {
    if (this.bgStore.phase === 'LOADED' && this.bgStore.decryptedContent) {
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (typeof tabs[0] !== 'undefined') {
          if (this.bgStore.isUrl(tabs[0].url)) {
            this.activeUrl = tabs[0].url;
            let newActiveDomain = this.bgStore.decomposeUrl(this.activeUrl).domain;
            if (this.activeDomain !== newActiveDomain) {
              this.activeDomain = newActiveDomain;
              if (this._matchingContent(this.activeDomain)) {
                this.updateBadgeStatus(this.bgStore.phase);
                this.hasCredentials = true;
              } else {
                this.updateBadgeStatus('ERROR');
                this.hasCredentials = false;
              }
              this._createContextMenuItem(this.hasCredentials);
            }
          } else {
            this.activeUrl = '';
            this.activeDomain = '';
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

  _fillOrSave() {
    if (this.activeDomain !== '') {
      if (this.hasCredentials) {
        this._fillCredentials(this.activeDomain);
      } else {
        this._saveEntry();
      }
    }
  }

  _chromeCommands(command) {
    switch (command) {
      case 'fill_login_form':
        this._fillOrSave();
        break;

      case 'restart_app':
        chrome.runtime.reload();
        break;
    }
  }

  _fillCredentials(host) {
    let entry = false;
    if (this.bgStore.decryptedContent) {
      entry = this._matchingContent(host);
      chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
        if (typeof tabs[0] !== 'undefined') {
          if (this.bgStore.isUrl(tabs[0].url)) {
            if (this.bgStore.decomposeUrl(tabs[0].url).domain === this.activeDomain) {
              this.accessTabId = tabs[0].id;
              this._injectContentScript(tabs[0].id, 'showTrezorMsg', null);
              this.bgStore.emit('decryptPassword', entry);
            }
          }
        }
      });
    }
  }

  _saveEntry() {
    var domain = this.activeUrl;
    this.openAppTab().then(tabId => {
      setTimeout(() => {
        chrome.runtime.sendMessage({ type: 'saveEntry', content: domain }, response => {
          if (!response) {
            setTimeout(() => {
              chrome.runtime.sendMessage({ type: 'saveEntry', content: domain });
            }, 800);
          }
        });
      }, 300);
    });
  }

  updateBadgeStatus(status) {
    let badgeState = {
      LOADED: { color: [76, 175, 80, 255], defaultText: '\u0020' },
      STORAGE: { color: [237, 199, 85, 100], defaultText: '\u0020' },
      TREZOR: { color: [237, 199, 85, 100], defaultText: '\u0020' },
      ERROR: { color: [255, 173, 51, 255], defaultText: '\u0020' },
      OFF: { color: [255, 255, 0, 100], defaultText: '' }
    };
    chrome.browserAction.setBadgeText({ text: badgeState[status].defaultText });
    chrome.browserAction.setBadgeBackgroundColor({ color: badgeState[status].color });
  }

  _matchingContent(host) {
    let entry = false;
    if (this.bgStore.decryptedContent && typeof host !== 'undefined') {
      host = host.split('.').reverse();

      Object.keys(this.bgStore.decryptedContent.entries).map(key => {
        let obj = this.bgStore.decryptedContent.entries[key];
        let urlRegex = /^((http[s]?):\/)?\/?([^:\/\s]+)((\/\w+)*\/)?([\w\-\.]*[^#?\s]+)?(.*)?(#[\w\-]+)?$/;
        let title = obj.title.match(urlRegex);
        let titleUrl = title[3].split('.').reverse();
        let matches = [];

        titleUrl.forEach(function(item, k) {
          matches.push(item === host[k]);
        });

        if (matches.every(function(v) { return v === true })) {
          entry = obj;
        }
      });
    }
    return entry;
  }

  _setProtocolPrefix(url) {
    return url.indexOf('://') > -1 ? url : 'https://' + url;
  }

  _injectContentScript(id, type, data) {
    var tabId = id;
    chrome.tabs.sendMessage(tabId, { type: 'isScriptExecuted' }, response => {
      if (chrome.runtime.lastError) {
        chrome.tabs.insertCSS(
          tabId,
          { file: 'css/content_style.css', runAt: 'document_start' },
          () => {
            chrome.tabs.executeScript(
              tabId,
              { file: 'js/content_script.js', runAt: 'document_start' },
              () => {
                chrome.tabs.sendMessage(tabId, { type: 'isScriptExecuted' }, response => {
                  if (response.type === 'scriptReady') {
                    this.sendTabMessage(tabId, type, data);
                  } else {
                    chrome.tabs.executeScript(tabId, { file: 'js/content_script.js' }, () => {
                      if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        throw Error('Unable to inject script into tab ' + tabId);
                      }
                      this.sendTabMessage(tabId, type, data);
                    });
                  }
                });
              }
            );
          }
        );
      } else {
        if (response.type === 'scriptReady') {
          this.sendTabMessage(tabId, type, data);
        }
      }
    });
  }

  fillLoginForm(data) {
    if (typeof data === 'undefined' || data.content.success === false) {
      this.sendTabMessage(this.accessTabId, 'cancelData');
    } else {
      this._injectContentScript(parseInt(this.accessTabId), 'fillData', {
        username: data.content.username,
        password: data.content.password
      });
      this.accessTabId = 0;
    }
  }

  openTabAndLogin(data) {
    chrome.tabs.create({ url: this._setProtocolPrefix(data.title) }, tab => {
      let sendObj = { username: data.username, password: data.password };
      this._injectContentScript(tab.id, 'fillData', sendObj);
    });
  }

  tryRefocusToAccessTab() {
    if (this.accessTabId !== 0) {
      this.focusTab(parseInt(this.accessTabId));
    }
  }

  sendMessage(msgType, msgContent) {
    chrome.runtime.sendMessage({ type: msgType, content: msgContent });
  }

  sendTabMessage(tabId, type, data) {
    chrome.tabs.sendMessage(tabId, { type: type, content: data });
  }

  clearContextMenuItem() {
    chrome.contextMenus.removeAll();
  }

  _createContextMenuItem(hasItem) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: this.activeDomain,
        contexts: ['page', 'selection', 'image', 'link'],
        title: hasItem ? 'Login to ' + this.activeDomain : 'Save ' + this.activeDomain,
        onclick: () => {
          this._fillOrSave();
        }
      });
    });
  }
}

module.exports = ChromeMgmt;
