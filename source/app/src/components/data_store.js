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

    getTagIdByTitle(title) {
        var resultId;
        Object.keys(this.data.tags).map((key) => {
            if (this.data.tags[key].title === title) resultId = key;
        });
        return resultId;
    }

    getTagIconById(id) {
        return Object.getOwnPropertyDescriptor(this.data.tags, id ? id : 0).value.icon
    }

    getTagTitleArrayById(tag_array) {
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
            return parseInt(key)
        });
    }

    ///////////
    //
    // ENTRIES
    //
    //////////

    getEntryTitleById(entryId) {
        return Object.getOwnPropertyDescriptor(this.data.entries, entryId).value.title
    }

    saveDataToId(entryId, data) {
        return Object.defineProperty(this.data.entries, entryId, {value: data});
    }

    addTagToEntry(tagId, entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
        entryData.tags.push(parseInt(tagId));
        this.saveDataToId(entryId, entryData);
    }

    removeTagFromEntry(tagId, entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
        var index = entryData.tags.indexOf(parseInt(tagId));
        entryData.tags.splice(index, 1);
        this.saveDataToId(entryId, entryData);
    }

    getPossibleToAddTagsForEntry(entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value,
            allTags = this.getTagIdArray(),
            resultTagArray = [];
        allTags.splice(0,1);
        allTags.map((key) => {
            if(entryData.tags.indexOf(key) === -1){
                resultTagArray.push(this.getTagTitleById(key));
            }
        });
        return resultTagArray;
    }

    toObject() {
        return this.data;
    }
}

module.exports = Store;