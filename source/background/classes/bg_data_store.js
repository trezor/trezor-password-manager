/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';
var FILENAME_MESS = '5f91add3fa1c3c76e90c90a3bd0999e2bd7833d06a483fe884ee60397aca277a',
    EventEmitter = require('events'),
    crypto = require('crypto');

class BgDataStore extends EventEmitter {

    constructor() {
        super();
        /* STORAGE, TREZOR, LOADED */
        this.phase = 'STORAGE';
        this.storageType = false;
        this.username = false;
        this.decryptedContent = false;
        this.masterKey = '';
        this.encryptionKey = '';
        this.decryptedContent = false;
        this.fileName = false;
        this.fileId = false;
        this.tpmFolderId = false;
        this.appUrl = chrome.extension.getURL('index.html');

    }

    isUrl(url) {
        return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
    }

    setFileName() {
        let fileKey = this.masterKey.substring(0, this.masterKey.length / 2);
        this.fileName = crypto.createHmac('sha256', fileKey).update(FILENAME_MESS).digest('hex') + '.pswd';
    }

    setUsername(username, storageType) {
        this.username = username;
        this.storageType = storageType;
        this.emit('sendMessage', 'setUsername', {username: this.username, storageType: this.storageType});
    }

    disconnect() {
        this.phase = 'STORAGE';
        this.storageType = false;
        this.username = false;
        this.decryptedContent = false;
        this.masterKey = '';
        this.encryptionKey = '';
        this.fileName = false;
        this.fileId = false;
        this.decryptedContent = false;
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

}

module.exports = BgDataStore;
