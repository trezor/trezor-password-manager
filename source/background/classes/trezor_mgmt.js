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

    MINIMAL_VERSION = '2.0.11',
    URL_CONNECT = 'https://connect.trezor.io/tpm/',
    DEFAULT_KEYPHRASE = 'Activate TREZOR Password Manager?',
    DEFAULT_NONCE = '2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee';

var crypto = require('crypto'),
    tcMissing = false,
    Clipboard = require('clipboard-js');

class TrezorMgmt {

    constructor(bgStore, tc) {
        this.bgStore = bgStore;
        this._activeDevice = null;
        this._deviceList = [];
        this._retryWrongPin = false;
        this._clearClipboard = false;
        this._cryptoData = {
            'keyPhrase': DEFAULT_KEYPHRASE,
            'nonce': DEFAULT_NONCE,
            'enc': true,
            'askOnEnc': true
        };
        this._decryptProgress = false;
        this.trezorConnect = tc;
        this.trezorConnect.on('TRANSPORT_EVENT', msg => this._transportEvent(msg));
        this.trezorConnect.on('DEVICE_EVENT', msg => this._deviceEvent(msg));
        this.trezorConnect.on('UI_EVENT', msg => this._uiEvent(msg));
        this.trezorConnect.init({
            webusb: false,
            debug: true,
            transportReconnect: true,
            popup: false,
            connectSrc: URL_CONNECT
        });
        this.bgStore.emit('checkReopen');
    }

    _handleTrezorError(error, operation, fallback) {
        let never = new Promise(() => {
        });

        // remove after long time period - for example around Christmas .) as well in bg_store
        if (error instanceof SyntaxError && operation === 'decEntry') {
            this._cryptoData.keyPhrase = this._displayOldKey(this._cryptoData.title, this._cryptoData.username);
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
        this.bgStore.emit('sendMessage', 'trezorConnected');
        this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
    }

    checkReconnect() {
        if (tcMissing) {
            this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NO_TRANSPORT'});
        }
    }

    _transportEvent(msg) {
        switch (msg.type) {
            case 'transport__start':
                tcMissing = false;
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_OK_TRANSPORT'});
                this._validateTransport(msg.payload);
                break;

            case 'transport__error':
                if (!tcMissing) {
                    tcMissing = true;
                    this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NO_TRANSPORT'});
                }
                break;
        }
    }

    _deviceEvent(msg) {
        let device = this._getCleanDevice(msg.payload);
        switch (msg.type) {
            case 'device__connect':
                this._addDevice(device);
                break;

            case 'device__connect_unacquired':
                this._addDevice(device);
                break;

            case 'device__changed':
                this._updateDevice(device);
                break;

            case 'device__disconnect':
                this._removeDevice(device);
                break;
        }
    }

    _uiEvent(msg) {
        switch (msg.type) {
            case 'ui-request_pin':
                this.bgStore.emit('showPinDialog');
                break;

            case 'ui-button':
                this._buttonCallback();
                if (msg.payload.code === 'ButtonRequest_PassphraseType') {
                    this.bgStore.emit('sendMessage', 'trezorPassphrase');
                }
                break;

            case 'ui-no_transport':
                this._disconnect();
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NO_TRANSPORT'});
                break;
        }
    }

    _addDevice(d) {
        let device = d;
        if (device.accquired) {
            if (!this._hasDevice(device)) {
                if (device.initialized) {
                    this._deviceList.push(device);
                    this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
                } else {
                    if (!!device.bootloader_mode) {
                        this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_BOOTLOADER'});
                    } else {
                        this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NOT_INIT'});
                    }
                }
            }
        } else {
            if (!this._hasDevice(device)) {
                this._deviceList.push(device);
                this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
            }
        }
    }

    _removeDevice(d) {
        let device = d;
        if (this._hasDevice(device)) {
            let i = this._getIndexDevice(device);
            this._deviceList.splice(i, 1);
            if (this._activeDevice !== null) {
                if (this._activeDevice.path === device.path) {
                    this._disconnect();
                }
            }
            this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
        }
    }

    _updateDevice(d) {
        let device = d;
        // TBD
        if (this._hasDevice(device)) {
            this._deviceList[this._getIndexDevice(device)] = device;
            this.bgStore.emit('sendMessage', 'updateDevices', {devices: this._deviceList});
        }
    }

    _getCleanDevice(d) {
        let newDev = {
            label: d.label,
            path: d.path
        };
        if (typeof d.features !== 'undefined') {
            newDev.accquired = true;
            newDev.version = d.features.major_version;
            newDev.initialized = d.features.initialized;
            newDev.bootloader_mode = d.features.bootloader_mode;
        } else {
            newDev.accquired = false;
            newDev.version = 'unknown';
            newDev.initialized = false;
            newDev.bootloader_mode = false;
        }
        newDev.needReload = !!(d.featuresNeedsReload && typeof d.featuresNeedsReload !== 'undefined');
        return newDev;
    }

    _hasDevice(d) {
        let device = d;
        return this._getIndexDevice(device) > -1;
    }

    _getIndexDevice(d) {
        let device = d;
        return this._deviceList.findIndex(e => e.path === device.path);
    }

    useDevice(p) {
        let path = p;
        let i = this._deviceList.findIndex(e => e.path === path);
        this._activeDevice = this._deviceList[i];
        this._getEncryptionKey();
    }

    _disconnect() {
        this.bgStore.masterKey = '';
        this.bgStore.encryptionKey = '';
        this._activeDevice = null;
        this._cryptoData = {
            'keyPhrase': DEFAULT_KEYPHRASE,
            'nonce': DEFAULT_NONCE,
            'enc': true,
            'askOnEnc': true
        };
        this.bgStore.emit('disconnectedTrezor');
    }

    _validateTransport(payload) {
        if (typeof payload.type !== 'undefined' && typeof payload.version !== 'undefined') {
            if (payload.type !== 'bridge') {
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_NO_TRANSPORT'});
            } else if (!this._versionCompare(payload.version, MINIMAL_VERSION)) {
                this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_OLD_TRANSPORT'});
            }
        }
    }

    _versionCompare(a, b) {
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

    pinEnter(pin) {
        this.trezorConnect.uiResponse({type: 'ui-receive_pin', payload: pin});
    }

    _buttonCallback() {
        this.bgStore.emit('sendMessage', 'showButtonDialog');
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

    _displayKey(title, username) {
        title = this.bgStore.isUrl(title) ? this.bgStore.decomposeUrl(title).domain : title;
        return 'Unlock ' + title + ' for user ' + username + '?';
    }

    // remove after long time period - for example around Christmas .) as well in bg_store
    _displayOldKey(title, username) {
        title = this.bgStore.isUrlOldVal(title) ? this.bgStore.decomposeUrl(title).domain : title;
        return 'Unlock ' + title + ' for user ' + username + '?';
    }

    _isValidError(e) {
        return e.error === 'device not found';
    }

    encryptFullEntry(data, responseCallback) {
        crypto.randomBytes(32, (ex, buf) => {
            this._cryptoData = {
                'title': data.title,
                'username': data.username,
                'password': data.password,
                'safe_note': data.safe_note,
                'keyPhrase': this._displayKey(data.title, data.username),
                'nonce': buf.toString('hex'),
                'callback': responseCallback,
                'enc': true,
                'askOnEnc': false
            };
            this._sendEncryptCallback(responseCallback);
        });
    }

    _sendEncryptCallback(responseCallback) {
        this.trezorConnect.cipherKeyValue({
            device: {path: this._activeDevice.path},
            override: true,
            useEmptyPassphrase: true,
            path: PATH,
            key: this._cryptoData.keyPhrase,
            value: this._cryptoData.nonce,
            encrypt: this._cryptoData.enc,
            askOnEncrypt: this._cryptoData.askOnEnc,
            askOnDecrypt: true
        }).then((result) => {
            if (result.success) {
                let enckey = new Buffer(this._cryptoData.nonce, 'hex');
                this.encrypt(this._cryptoData.password, enckey).then((password) => {
                    this.encrypt(this._cryptoData.safe_note, enckey).then((safenote) => {
                        responseCallback({
                            content: {
                                title: this._cryptoData.title,
                                username: this._cryptoData.username,
                                password: password,
                                safe_note: safenote,
                                nonce: result.payload.value,
                                success: true
                            }
                        });
                    });
                });
            } else {
                responseCallback({
                    content: {
                        title: this._cryptoData.title,
                        success: false
                    }
                });
                if (this._isValidError(result.payload)) {
                    this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_ENCRYPTION'});
                }
            }
        }).catch((error) => this._handleTrezorError(error, 'encEntry', responseCallback));
    }

    decryptFullEntry(data, responseCallback, clipboardClear) {
        this._clearClipboard = clipboardClear;
        if (this._decryptProgress && typeof this._cryptoData.callback === 'function') {
            this._cryptoData.callback({
                content: {
                    nonce: this._cryptoData.nonce,
                    success: false
                }
            });
        }
        this._decryptProgress = true;
        this._cryptoData = {
            'title': data.title,
            'username': data.username,
            'password': data.password,
            'safe_note': data.safe_note,
            'keyPhrase': this._displayKey(data.title, data.username),
            'nonce': data.nonce,
            'callback': responseCallback,
            'enc': false,
            'askOnEnc': false
        };
        this._sendDecryptCallback(responseCallback);
    }

    _removedPwdClipboard(pwd) {
        try {
            let el = document.createElement('textarea');
            document.body.appendChild(el);
            el.focus();
            document.execCommand('paste');
            let value = el.value;
            document.body.removeChild(el);
            if (pwd === value) {
                Clipboard.copy("");
            }
        } catch (err) {
            throw err;
        }
    }

    _sendDecryptCallback(responseCallback) {
        this.trezorConnect.cipherKeyValue({
            device: {path: this._activeDevice.path},
            override: true,
            useEmptyPassphrase: true,
            path: PATH,
            key: this._cryptoData.keyPhrase,
            value: this._cryptoData.nonce,
            encrypt: this._cryptoData.enc,
            askOnEncrypt: this._cryptoData.askOnEnc,
            askOnDecrypt: true
        }).then((result) => {
            if (result.success) {
                let enckey = new Buffer(result.payload.value, 'hex'),
                    password = new Buffer(this._cryptoData.password),
                    safenote = new Buffer(this._cryptoData.safe_note);
                // clear clipboard after 20 seconds
                if (this._clearClipboard) {
                    setTimeout(() => {
                        let pwd = JSON.parse(this.decrypt(password, enckey));
                        this._removedPwdClipboard(pwd);
                    }, 20 * 1000);
                }
                responseCallback({
                    content: {
                        title: this._cryptoData.title,
                        username: this._cryptoData.username,
                        password: JSON.parse(this.decrypt(password, enckey)),
                        safe_note: JSON.parse(this.decrypt(safenote, enckey)),
                        nonce: this._cryptoData.nonce,
                        success: true
                    }
                });
            } else {
                responseCallback({
                    content: {
                        nonce: this._cryptoData.nonce,
                        success: false
                    }
                });
                if (this._isValidError(result.payload)) {
                    this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_ENCRYPTION'});
                }
            }
        }).catch((error) => this._handleTrezorError(error, 'decEntry', responseCallback));
    }

    _getEncryptionKey() {
        this.trezorConnect.cipherKeyValue({
            device: {path: this._activeDevice.path},
            override: true,
            useEmptyPassphrase: true,
            path: PATH,
            key: DEFAULT_KEYPHRASE,
            value: DEFAULT_NONCE,
            encrypt: true,
            askOnEncrypt: true,
            askOnDecrypt: true
        }).then((result) => {
            this.bgStore.emit('sendMessage', 'loading', 'We\'re getting there ...');
            if (result.success) {
                this.bgStore.masterKey = result.payload.value;
                let temp = this.bgStore.masterKey;
                this.bgStore.encryptionKey = new Buffer(temp.substring(temp.length / 2, temp.length), 'hex');
                this.bgStore.emit('loadFile');
            } else {
                this._disconnect();
                if (this._isValidError(result.payload)) {
                    this.bgStore.emit('sendMessage', 'errorMsg', {code: 'T_ENCRYPTION'});
                }
            }
        }).catch((error) => this._handleTrezorError(error, 'encKey', null));
    }
}
module.exports = TrezorMgmt;
