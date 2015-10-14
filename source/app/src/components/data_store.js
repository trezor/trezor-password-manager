"use strict";

class Store {

    constructor(data, eventEmitter) {
        this.data = data;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.emit('update', this.data);
    }

    getTagTitleById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id).value.title
    }

    getTagIconById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id).value.icon
    }

    toObject() {
        return this.data;
    }
}

module.exports = Store;