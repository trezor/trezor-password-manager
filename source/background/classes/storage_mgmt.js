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
    }
}

module.exports = StorageMgmt;