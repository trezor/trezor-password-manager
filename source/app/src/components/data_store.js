'use strict';

class Store {

    constructor(data, eventEmitter) {
        this.data = data;
        this.eventEmitter = eventEmitter;
        this.eventEmitter.emit('update', this.data);
    }

    ///////////
    //
    // TAGS
    //
    //////////

    getTagTitleById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id ? id : 0).value.title
    }

    getTagIconById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id ? id : 0).value.icon
    }

    getTagTitleArrayById(tag_array){
        return Object.keys(tag_array).map((key) => {
            return this.data.tags[tag_array[key]].title
        });
    }

    getTagTitleArray() {
        return Object.keys(this.data.tags).map((key) => {
            return this.data.tags[key].title
        });
    }

    getTagIdArray() {
        return Object.keys(this.data.tags).map((key) => {
            return this.data.tags[key]
        });
    }

    ///////////
    //
    // ENTRIES
    //
    //////////

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