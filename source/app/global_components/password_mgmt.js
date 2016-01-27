'use strict';

var Password_mgmt = {

    pattern: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',

    getRandomByte() {
        if (window.crypto && window.crypto.getRandomValues) {
            var result = new Uint8Array(1);
            window.crypto.getRandomValues(result);
            return result[0];
        } else if (window.msCrypto && window.msCrypto.getRandomValues) {
            result = new Uint8Array(1);
            window.msCrypto.getRandomValues(result);
            return result[0];
        } else {
            return Math.floor(Math.random() * 256);
        }
    },

    generate(length) {
        return Array.apply(null, {'length': length})
            .map(function () {
                var result;
                while (true) {
                    result = String.fromCharCode(this.getRandomByte());
                    if (this.pattern.indexOf(result) >= 0) {
                        return result;
                    }
                }
            }, this)
            .join('');
    }
};

module.exports = Password_mgmt;