/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const HD_HARDENED = 0x80000000,
    CIPHER_IVSIZE = 96 / 8,
    AUTH_SIZE = 128 / 8,
    CIPHER_TYPE = 'aes-256-gcm',
    PATH = [(10016 | HD_HARDENED) >>> 0, 0],
    WRONG_PIN = 'Failure_PinInvalid',

    URL_IFRAME = 'https://sisyfos.trezor.io/iframe.html',
    URL_POPUP = 'https://sisyfos.trezor.io/popup.html',

    DEFAULT_KEYPHRASE = 'Activate TREZOR Password Manager?',
    DEFAULT_NONCE = '2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee';

var crypto = require('crypto'),
    Clipboard = require('clipboard-js');

class TrezorMgmt {

    constructor(bgStore, tc) {
        this.bgStore = bgStore;
        this._activeTrezorDevice = null;
        this._deviceList = [];
        this._trezorConnected = false;
        this._retryWrongPin = false;
        this._clearClipboard = false;
        this._cryptoData = {
            'keyPhrase': DEFAULT_KEYPHRASE,
            'nonce': DEFAULT_NONCE,
            'enc': true,
            'askOnEnc': true
        };
        this.trezorConnect = tc;
    }

    _handleTrezorError(error, operation, fallback) {
        let never = new Promise(() => {
        });

        // remove after long time period - for example around Christmas .) as well in bg_store
        if (error instanceof SyntaxError && operation === 'decEntry') {
            this._cryptoData.keyPhrase = this.displayOldKey(this._cryptoData.title, this._cryptoData.username);
            this._retryWrongPin.op = 'decEntry';
            return;
        }
        switch (error.code) { // 'Failure' messages
            case WRONG_PIN:
              this.bgStore.emit('sendMessage', 'wrongPin');
              //TODO it smart asshole!
              this._retryWrongPin = {op: operation};
              return;
              break;
        }
        console.error('tmgm err: ', error);
        return never;
    }

    init() {
        console.warn('PATH: ', PATH);
        this.trezorConnect.on('DEVICE_EVENT', msg => this.deviceEvent(msg));
        this.trezorConnect.on('UI_EVENT', msg => this.uiEvent(msg));
        let ts = new Date().getTime();
        this.trezorConnect.init({
            iframe_src: URL_IFRAME + '?r=' + ts,
            popup_src: URL_POPUP,
        }).then(() => {
            this.bgStore.emit('sendMessage', 'trezorConnected');
        });
    }

    deviceEvent(msg) {
        console.warn('device EVENT : ', msg);
        let device = msg.data;
        switch(msg.type) {
            case 'device__connect':
                this._addDevice(device);
                break;

            case 'device__disconnect':
                this._removeDevice(device);
                break;
        }
    }

    uiEvent(msg) {
        console.warn('ui EVENT : ', msg);
    }

    _addDevice(d) {
        console.log('yaya', d);
        let device = d;
        if (!this._deviceList.includes(device)) {
            this._deviceList.push(device);
            this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
        }
    }

    _removeDevice(d) {
        let device = d;
        let i = this._deviceList.findIndex(e => e.path === device.path);
        if (i > -1) {
            this._deviceList.splice(i, 1);
            this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
            if (!this._deviceList.length) {
                this._disconnect();
            }
        }
    }

    useDevice(p) {
        let path = p;
        let i = this._deviceList.findIndex(e => e.path === path);
        this._activeTrezorDevice = this._deviceList[i];
        this.getEncryptionKey(TrezorConnect);
        /*
        TrezorConnect.cipherKeyValue({
        path: "m/1'/2'/3'",
        key: "My key",
        value: "1c0ffeec0ffeec0ffeec0ffeec0ffee1",
        encrypt: true,
        askOnEncrypt: true,
        askOnDecrypt: true
        }).then(function(resp){
            console.log("cipherKeyValue Response", resp)
        })
        */
    }


    /*
    checkTransport(transport) {
        this.current_ext_version = transport.version;
        this.transportLoading = false;
        this.checkVersions();
    }

    versionCompare(a, b) {
        let pa = a.split('.');
        let pb = b.split('.');
        for (let i = 0; i < 3; i++) {
            let na = Number(pa[i]);
            let nb = Number(pb[i]);
            if (na > nb) return true;
            if (nb > na) return false;
            if (!isNaN(na) && isNaN(nb)) return true;
            if (isNaN(na) && !isNaN(nb)) return false;
        }
        return false;
    }

    checkVersions() {
        this.bgStore.emit('checkReopen');
        if (!this.transportLoading) {
            if (this.current_ext_version !== '') {
                if (!this.versionCompare(this.current_ext_version, MINIMAL_EXTENSION_VERSION)) {
                    // bad version
                    this.bgStore.emit('sendMessage', 'errorMsg', {
                        code: 'T_OLD_VERSION',
                        msg: this.current_ext_version
                    });
                }
            } else {
                // no extension
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NO_TRANSPORT', msg: this.current_ext_version});
            }
        }
    }

    connectedNew(device) {
        this.trezorDevice = device;
        this.connect();
    }

    connectedUnacquiredTrezor(unacquiredDevice) {
        this.unacquiredDevice = unacquiredDevice;
        this.unacquiredDevice.once('disconnect', () => this.disconnectedUnacquiredTrezor());
        this.unacquiredDevice.once('connect', () => this.disconnectedUnacquiredTrezor());
    }

    disconnectedUnacquiredTrezor() {
        this.unacquiredDevice = null;
    }

    stealTrezor() {
        if (this.unacquiredDevice !== null) {
            this.unacquiredDevice.steal().then(device => {
                this.trezorDevice = device;
            }); // no need to run connectTrezor again, will run automatically
        }
    }

    userSwitch() {
        this._cryptoData = {
            'keyPhrase': DEFAULT_KEYPHRASE,
            'nonce': DEFAULT_NONCE,
            'enc': true,
            'askOnEnc': true
        };
    }

    connect() {
        if (this.bgStore.phase === 'TREZOR') {
            var doSteal = this.trezorDevice === null;
            if (doSteal) {
                this.stealTrezor();
                return;
            }
            try {
                this.bgStore.emit('sendMessage', 'trezorConnected');
                this.trezorDevice.on('pin', (type, callback) => this.pinCallback(type, callback));
                this.trezorDevice.on('passphrase', (callback) => this.passphraseCallback(callback));
                this.trezorDevice.on('button', (type, callback) => this.buttonCallback(type, callback));
                this.trezorDevice.on('changedSessions', () => this.changedSessions());
                this.trezorDevice.once('disconnect', () => this.disconnectCallback());

                if (this.trezorDevice.isBootloader()) {
                    this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_BOOTLOADER'});
                    throw new Error('Device is in bootloader mode, re-connected it');
                }

                this.trezorDevice.runAggressive((session) => this.getEncryptionKey(session));

            } catch (error) {
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_DEVICE', msg: error});
                console.error('Device error:', error);
                //TODO
            }
        }
    }

    changedSessions() {
        if (!this.trezorDevice.isStolen() && this._retryWrongPin) {
            let op = this._retryWrongPin.op;
            this._retryWrongPin = false;
            switch (op) {
                case 'encKey':
                    this.trezorDevice.runAggressive((session) => this.getEncryptionKey(session));
                    break;
                case 'encEntry':
                    this.trezorDevice.runAggressive((session) => this.sendEncryptCallback(session));
                    break;
                case 'decEntry':
                    this.trezorDevice.runAggressive((session) => this.sendDecryptCallback(session));
                    break;
            }
        }
    }

    clearSession() {
        this.trezorDevice.waitForSessionAndRun((session) => {
            return session.clearSession()
        });
    }

    pinCallback(type, callback) {
        this.trezorDevice.pinCallback = callback;
        this.bgStore.emit('showPinDialog');
    }

    pinEnter(pin) {
        this.trezorDevice.pinCallback(null, pin);
    }

    passphraseCallback(callback) {
        callback(null, '');
    }

    buttonCallback(type, callback) {
        this.bgStore.emit('sendMessage', 'showButtonDialog');
        this.trezorDevice.buttonCallback = callback;
    }

    buttonEnter(code) {
        this.trezorDevice.buttonCallback(null, code);
    }


    */

    _disconnect() {
        this.bgStore.masterKey = '';
        this.bgStore.encryptionKey = '';
        this._activeTrezorDevice = null;
        this._cryptoData = {
            'keyPhrase': DEFAULT_KEYPHRASE,
            'nonce': DEFAULT_NONCE,
            'enc': true,
            'askOnEnc': true
        };
        this.bgStore.emit('disconnectedTrezor');
    }

    randomInputVector() {
        return new Promise((resolve, reject) => {
            try {
                crypto.randomBytes(CIPHER_IVSIZE, (err, buf) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(buf);
                    }
                })
            } catch (err) {
                reject(err);
                //TODO
            }
        });
    }

    encrypt(data, key) {
        return this.randomInputVector().then((iv) => {
            let stringified = JSON.stringify(data),
                buffer = new Buffer(stringified, 'utf8'),
                cipher = crypto.createCipheriv(CIPHER_TYPE, key, iv),
                startCText = cipher.update(buffer),
                endCText = cipher.final(),
                auth_tag = cipher.getAuthTag();
            return Buffer.concat([iv, auth_tag, startCText, endCText]);
        });
    }

    decrypt(data, key) {
        try {
            let iv = data.slice(0, CIPHER_IVSIZE),
                auth_tag = data.slice(CIPHER_IVSIZE, CIPHER_IVSIZE + AUTH_SIZE),
                cText = data.slice(CIPHER_IVSIZE + AUTH_SIZE),
                decipher = crypto.createDecipheriv(CIPHER_TYPE, key, iv),
                start = decipher.update(cText);
            decipher.setAuthTag(auth_tag);
            let end = decipher.final();
            return Buffer.concat([start, end]).toString('utf8');
        } catch (error) {
            console.error('error ', error);
            return new Buffer([]).toString('utf8');
            //TODO
        }
    }

    displayKey(title, username) {
        title = this.bgStore.isUrl(title) ? this.bgStore.decomposeUrl(title).domain : title;
        return 'Unlock ' + title + ' for user ' + username + '?';
    }

    // remove after long time period - for example around Christmas .) as well in bg_store
    displayOldKey(title, username) {
        title = this.bgStore.isUrlOldVal(title) ? this.bgStore.decomposeUrl(title).domain : title;
        return 'Unlock ' + title + ' for user ' + username + '?';
    }

    encryptFullEntry(data, responseCallback) {
        crypto.randomBytes(32, (ex, buf) => {
            this._cryptoData = {
                'title': data.title,
                'username': data.username,
                'password': data.password,
                'safe_note': data.safe_note,
                'keyPhrase': this.displayKey(data.title, data.username),
                'nonce': buf.toString('hex'),
                'callback': responseCallback,
                'enc': true,
                'askOnEnc': false
            };
            this.trezorDevice.runAggressive((session) => this.sendEncryptCallback(session));
        });
    }

    sendEncryptCallback(session) {
        return session.cipherKeyValue(PATH, this._cryptoData.keyPhrase, this._cryptoData.nonce, this._cryptoData.enc, this._cryptoData.askOnEnc, true).then((result) => {
            let enckey = new Buffer(this._cryptoData.nonce, 'hex');
            this.encrypt(this._cryptoData.password, enckey).then((password)=> {
                this.encrypt(this._cryptoData.safe_note, enckey).then((safenote)=> {
                    this._cryptoData.callback({
                        content: {
                            title: this._cryptoData.title,
                            username: this._cryptoData.username,
                            password: password,
                            safe_note: safenote,
                            nonce: result.message.value
                        }
                    });
                });
            });
        }).catch((error) => this._handleTrezorError(error, 'encEntry', this._cryptoData.callback));
    }

    decryptFullEntry(data, responseCallback, clipboardClear) {
        this._clearClipboard = clipboardClear;
        this._cryptoData = {
            'title': data.title,
            'username': data.username,
            'password': data.password,
            'safe_note': data.safe_note,
            'keyPhrase': this.displayKey(data.title, data.username),
            'nonce': data.nonce,
            'callback': responseCallback,
            'enc': false,
            'askOnEnc': false
        };
        this.trezorDevice.runAggressive((session) => this.sendDecryptCallback(session));
    }

    sendDecryptCallback(session) {
        return session.cipherKeyValue(PATH, this._cryptoData.keyPhrase, this._cryptoData.nonce, this._cryptoData.enc, this._cryptoData.askOnEnc, true).then((result) => {
            let enckey = new Buffer(result.message.value, 'hex'),
                password = new Buffer(this._cryptoData.password),
                safenote = new Buffer(this._cryptoData.safe_note);
            // clear clipboard after 20 seconds
            if (this._clearClipboard) {
                setTimeout(()=> {
                    Clipboard.copy("");
                }, 20 * 1000);
            }
            this._cryptoData.callback({
                content: {
                    title: this._cryptoData.title,
                    username: this._cryptoData.username,
                    password: JSON.parse(this.decrypt(password, enckey)),
                    safe_note: JSON.parse(this.decrypt(safenote, enckey)),
                    nonce: this._cryptoData.nonce
                }
            });
        }).catch((error) => this._handleTrezorError(error, 'decEntry', this._cryptoData.callback));
    }

    getEncryptionKey(session) {
        return session.cipherKeyValue({device: this._activeTrezorDevice, path: PATH, key: this._cryptoData.keyPhrase, value: this._cryptoData.nonce, encrypt: this._cryptoData.enc, askOnEncrypt: this._cryptoData.askOnEnc, askOnDencrypt: true}).then((result) => {
            this.bgStore.emit('sendMessage', 'loading', 'We\'re getting there ...');
            console.warn('RESULT : ', result, result.data.resp.message.value);
            this.bgStore.masterKey = result.data.resp.message.value;
            let temp = this.bgStore.masterKey;
            this.bgStore.encryptionKey = new Buffer(temp.substring(temp.length / 2, temp.length), 'hex');
            this.bgStore.emit('loadFile');
        }).catch((error) => this._handleTrezorError(error, 'encKey', null));
    }
}
module.exports = TrezorMgmt;
