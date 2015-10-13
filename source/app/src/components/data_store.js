"use strict";

class Store {

    constructor(data, eventEmitter) {
        this.data = data;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.emit('update', this.data);
    }

    getTagById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id).value.title
    }

    toObject() {
        return this.data;
    }
}

module.exports = Store;