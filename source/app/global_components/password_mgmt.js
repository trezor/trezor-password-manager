'use strict';

var PasswordMgmt = {

    letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    specials: '@&-():;!?,/.\';',

    shuffleArray(str, length) {
        var array = str.split('');
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array.slice(0, length).join('');
    },

    generate(length) {
        var newPwd = this.shuffleArray(this.specials, 2) + this.shuffleArray(this.numbers, 4) + this.shuffleArray(this.letters, length-6);
        return this.shuffleArray(newPwd, length);
    }
};

module.exports = PasswordMgmt;