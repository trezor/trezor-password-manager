'use strict';
var EventEmitter = require('events');

class StorageMgmt extends EventEmitter {

    constructor() {
        super();
        /* DROPBOX, TREZOR, LOADED */
        this.phase = 'DROPBOX';
        this.decryptedContent = false;
        this.masterKey = '';
        this.encryptionKey = '';
        this.decryptedContent = false;
        this.appUrl = chrome.extension.getURL('index.html');

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

}

module.exports = StorageMgmt;