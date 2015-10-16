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

    getEntryTitleById(id) {
        return Object.getOwnPropertyDescriptor(this.data.entries, id).value.title
    }

    saveDataToId(id, data){
        return Object.defineProperty(this.data.entries, id, {value: data});
    }

    toObject() {
        return this.data;
    }
}

module.exports = Store;