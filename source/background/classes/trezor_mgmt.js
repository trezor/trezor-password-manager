'use strict';

const HD_HARDENED = 0x80000000,
    ENC_KEY = 'Activate TREZOR Password Manager?',
    ENC_VALUE = '2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee2d650551248d792eabf628f451200d7f51cb63e46aadcbb1038aacb05e8c8aee',
    CIPHER_IVSIZE = 96 / 8,
    AUTH_SIZE = 128 / 8,
    CIPHER_TYPE = 'aes-256-gcm',
    MINIMAL_EXTENSION_VERSION = '1.0.6',
    PATH = [(10016 | HD_HARDENED) >>> 0, 0],
    NO_TRANSPORT = 'No trezor.js transport is available',
    NO_CONNECTED_DEVICES = 'No connected devices',
    DEVICE_IS_BOOTLOADER = 'Connected device is in bootloader mode',
    DEVICE_IS_EMPTY = 'Connected device is not initialized',
    FIRMWARE_IS_OLD = 'Firmware of connected device is too old',
    INSUFFICIENT_FUNDS = 'Insufficient funds',
    CIPHER_CANCEL = 'CipherKeyValue cancelled',
    WRONG_PIN = 'Invalid PIN';

var crypto = require('crypto');

class Trezor_mgmt {

    constructor(storage, list) {
        this.storage = storage;
        this.trezorDevice = null;
        this.trezorConnected = false;
        this.current_ext_version = '';
        list.on('transport', (transport) => this.checkTransport(transport));
        list.on('connect', (device) => this.connectedNewTrezor(device));
        list.on('error', (error) => {
            console.error('List error:', error);
        });
    }

    handleTrezorError(error, fallback) {
        let never = new Promise(() => {
        });

        switch (error.message) {
            case NO_TRANSPORT:
                return never;
                break;

            case DEVICE_IS_EMPTY:
                return never;
                break;

            case FIRMWARE_IS_OLD:
                return never;
                break;

            case NO_CONNECTED_DEVICES:
                return never;
                break;

            case DEVICE_IS_BOOTLOADER:
                return never;
                break;

            case INSUFFICIENT_FUNDS:
                return never;
                break;

            case CIPHER_CANCEL:
                fallback(null);
                break;

            case WRONG_PIN:
                this.storage.emit('sendMessage', 'wrongPin');
                this.trezorDevice.waitForSessionAndRun((session) => this.getEncryptionKey(session));
                break;


        }
        switch (error.code) {
            case 'Failure_NotInitialized':
                this.storage.emit('sendMessage', 'notInitialized');
                return never;
                break;
        }
    }


    checkTransport(transport) {
        this.current_ext_version = transport.version;
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
        if (this.current_ext_version) {
            if (!this.versionCompare(this.current_ext_version, MINIMAL_EXTENSION_VERSION)) {
                // bad version
                this.storage.emit('sendMessage', 'showAlert', 'OLD_VERSION');
            }
        }
    }

    connectedNewTrezor(device) {
        this.trezorDevice = device;
        this.connectTrezor();
    }

    connectTrezor() {
        if (this.storage.phase === 'TREZOR' && this.trezorDevice != null) {
            try {
                this.storage.emit('sendMessage', 'trezorConnected');
                this.trezorDevice.on('pin', (type, callback) => this.pinCallback(type, callback));
                this.trezorDevice.on('passphrase', (callback) => this.passphraseCallback(callback));
                this.trezorDevice.on('button', (type, callback) => this.buttonCallback(type, callback));
                this.trezorDevice.on('disconnect', () => this.disconnectCallback());
                if (this.trezorDevice.isBootloader()) {
                    throw new Error('Device is in bootloader mode, re-connected it');
                }
                this.trezorDevice.waitForSessionAndRun((session) => this.getEncryptionKey(session));

            } catch (error) {
                console.error('Device error:', error);
            }
        }
    }

    pinCallback(type, callback) {
        this.trezorDevice.pinCallback = callback;
        this.storage.emit('sendMessage', 'showPinDialog');
    }

    pinEnter(pin) {
        this.trezorDevice.pinCallback(null, pin);
    }

    passphraseCallback(callback) {
        callback(null, '');
    }

    buttonCallback(type, callback) {
        this.storage.emit('sendMessage', 'showButtonDialog');
        this.trezorDevice.buttonCallback = callback;
    }

    buttonEnter(code) {
        this.trezorDevice.buttonCallback(null, code);
    }

    disconnectCallback() {
        // this.logOutCallback(); FIx by internatl messaging!
        this.storage.masterKey = '';
        this.storage.encryptionKey = '';
        this.storage.emit('disconnectedTrezor');

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
            }
        });
    }

    toBuffer(ab) {
        let buffer = new Buffer(ab.byteLength),
            view = new Uint8Array(ab);
        for (var i = 0; i < buffer.length; ++i) {
            buffer[i] = view[i];
        }
        return buffer;
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
        }
    }

    encryptFullEntry(data, responseCallback) {
        crypto.randomBytes(32, (ex, buf) => {
            let key = this.displayPhrase(data.title, data.username),
                nonce = buf.toString('hex');
            this.trezorDevice.waitForSessionAndRun((session) => {
                return session.cipherKeyValue(PATH, key, nonce, true, false, true).then((result) => {
                    let enckey = new Buffer(nonce, 'hex');
                    this.encrypt(data.password, enckey).then((password)=> {
                        this.encrypt(data.safe_note, enckey).then((safenote)=> {
                            responseCallback({
                                content: {
                                    title: data.title,
                                    username: data.username,
                                    password: password,
                                    safe_note: safenote,
                                    nonce: result.message.value
                                }
                            });
                        });
                    });
                });
            });
        });
    }

    displayPhrase(title, username) {
        title = this.isUrl(title) ? this.decomposeUrl(title).domain : title;
        return 'Unlock ' + title + ' for user ' + username + '?'
    }

    decryptFullEntry(data, responseCallback) {
        let key = this.displayPhrase(data.title, data.username);
        this.trezorDevice.waitForSessionAndRun((session) => {
            return session.cipherKeyValue(PATH, key, data.nonce, false, false, true).then((result) => {
                let enckey = new Buffer(result.message.value, 'hex'),
                    password = new Buffer(data.password),
                    safenote = new Buffer(data.safe_note);
                responseCallback({
                    content: {
                        title: data.title,
                        username: data.username,
                        password: JSON.parse(this.decrypt(password, enckey)),
                        safe_note: JSON.parse(this.decrypt(safenote, enckey)),
                        nonce: data.nonce
                    }
                });
            }).catch((error) => this.handleTrezorError(error, responseCallback));
        });
    }

    decryptPassword(data, responseCallback) {
        let key = this.displayPhrase(data.title, data.username);
        this.trezorDevice.waitForSessionAndRun((session) => {
            return session.cipherKeyValue(PATH, key, data.nonce, false, false, true).then((result) => {
                let enckey = new Buffer(result.message.value, 'hex'),
                    password = new Buffer(data.password);
                responseCallback({
                    content: {
                        title: data.title,
                        username: data.username,
                        password: JSON.parse(this.decrypt(password, enckey))
                    }
                });
            }).catch((error) => this.handleTrezorError(error, responseCallback));
        });
    }

    getEncryptionKey(session) {
        return session.cipherKeyValue(PATH, ENC_KEY, ENC_VALUE, true, true, true).then((result) => {
            this.storage.masterKey = result.message.value;
            let temp = this.storage.masterKey;
            this.storage.encryptionKey = new Buffer(temp.substring(temp.length / 2, temp.length), 'hex');
            this.storage.emit('loadFile');
        }).catch((error) => this.handleTrezorError(error, this.disconnectCallback));
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

    isUrl(url) {
        return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
    }
}
module.exports = Trezor_mgmt;