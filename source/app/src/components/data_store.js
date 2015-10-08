"use strict";

class Store {

    constructor(data, eventEmitter) {
        this.data = data;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.emit('update', this.data);
    }

    toObject() {
        return this.data;
    }
}

module.exports = Store;