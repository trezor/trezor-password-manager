'use strict';
var EventEmitter = require('events');

class Storage_mgmt extends EventEmitter {

    constructor() {
        super();
        /* DROPBOX, TREZOR, LOADED */
        this.phase = 'DROPBOX';
        this.decryptedContent = false;
        this.masterKey = '';
        this.encryptionKey = '';
        this.decryptedContent = false;
    }
}

module.exports = Storage_mgmt;