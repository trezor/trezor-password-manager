'use strict';

var Service = require('./data_service');

class Store {

    constructor(data) {
        this.data = typeof data === 'object' ? data : JSON.parse(data);
        window.eventEmitter.emit('update', this.data);
    }

    getTagTitleById(tagId) {
        tagId = tagId ? parseInt(tagId) : 0;
        return Object.getOwnPropertyDescriptor(this.data.tags, tagId).value.title
    }

    getTagIdByTitle(title) {
        var resultId = [];
        Object.keys(this.data.tags).map((key) => {
            if (this.data.tags[key].title === title) resultId = key;
        });
        return parseInt(resultId);
    }

    getTagIconById(tagId) {
        tagId = tagId ? parseInt(tagId) : 0;
        return Object.getOwnPropertyDescriptor(this.data.tags, tagId).value.icon
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

    changeTagTitleById(tagId, newTagTitle) {
        var tagData = Object.getOwnPropertyDescriptor(this.data.tags, tagId).value,
            oldTagTitleArray = this.getTagTitleArray();
        if (oldTagTitleArray.indexOf(newTagTitle) == -1) {
            tagData.title = newTagTitle;
            this.saveDataToTagById(tagId, tagData);
            window.eventEmitter.emit('update', this.data);
            Service.saveContext(this.data);
            return true;
        } else {
            return false;
        }
    }

    changeTagIconById(tagId, newTagIcon) {
        var tagData = Object.getOwnPropertyDescriptor(this.data.tags, tagId).value;
        tagData.icon = newTagIcon;
        this.saveDataToTagById(tagId, tagData);
        window.eventEmitter.emit('update', this.data);
        Service.saveContext(this.data);
    }

    saveDataToTagById(tagId, data) {
        return Object.defineProperty(this.data.tags, tagId, {value: data});
    }

    addNewTag(newTitle, newIcon) {
        var data = {
                "title": newTitle,
                "icon": newIcon
            },
            newId = parseInt(Object.keys(this.data.tags)[parseInt(Object.keys(this.data.tags).length) - 1]) + 1,
            oldTagTitleArray = this.getTagTitleArray();
        if (oldTagTitleArray.indexOf(newTitle) == -1) {
            this.data.tags[newId] = data;
            window.eventEmitter.emit('update', this.data);
            Service.saveContext(this.data);
            return true;
        } else {
            return false;
        }
    }

    removeTag(tagId) {
        Object.keys(this.data.entries).map((key) => {
            var tags = this.data.entries[key].tags;
            if (tags.indexOf(parseInt(tagId)) > -1) {
                this.removeTagFromEntry(tagId, key);
            }
        });
        window.eventEmitter.emit('changeTag', 0);
        delete this.data.tags[tagId];
        window.eventEmitter.emit('update', this.data);
        Service.saveContext(this.data);
    }

    getEntryValuesById(entryId) {
        var entry = Object.getOwnPropertyDescriptor(this.data.entries, entryId);
        return entry ? entry.value : false;
    }

    getEntryTitleById(entryId) {
        return Object.getOwnPropertyDescriptor(this.data.entries, entryId).value.title
    }

    getEntriesIdArray() {
        return Object.keys(this.data.entries).map((key) => {
            return parseInt(key)
        });
    }

    saveDataToEntryById(entryId, data) {
        Object.defineProperty(this.data.entries, entryId, {value: data});
        window.eventEmitter.emit('changeTag');
        return Service.saveContext(this.data);
    }

    addTagToEntry(tagId, entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
        entryData.tags.push(parseInt(tagId));
        this.saveDataToEntryById(entryId, entryData);
        return Service.saveContext(this.data);
    }

    removeTagFromEntry(tagId, entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
        var index = entryData.tags.indexOf(parseInt(tagId));
        entryData.tags.splice(index, 1);
        this.saveDataToEntryById(entryId, entryData);
        return Service.saveContext(this.data);
    }

    getPossibleToAddTagsForEntry(entryId) {
        var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId),
            allTags = this.getTagIdArray(),
            resultTagArray = [];
        if (!entryData) {
            var temp = this.getTagTitleArray();
            temp.splice(0, 1);
            resultTagArray = temp;
        } else {
            entryData = entryData.value;
            allTags.splice(0, 1);
            allTags.map((key) => {
                if (entryData.tags.indexOf(key) === -1) {
                    resultTagArray.push(this.getTagTitleById(key));
                }
            });
        }
        return resultTagArray;
    }

    addNewEntry(data) {
        var newId = parseInt(Object.keys(this.data.entries)[parseInt(Object.keys(this.data.entries).length) - 1]) + 1;
        newId = isNaN(newId) ? 0 : newId;
        this.data.entries[newId] = data;
        Service.saveContext(this.data);
        return window.eventEmitter.emit('hideOpenNewEntry', newId);
    }

    removeEntry(entryId) {
        delete this.data.entries[entryId];
        Service.saveContext(this.data);
        window.eventEmitter.emit('update', this.data);
    }

    getAllEntries() {
        return Object.keys(this.data.entries).map((key) => {
            return this.data.entries[key]
        });
    }

    toObject() {
        return this.data;
    }

    hideNewEntry() {
        return window.eventEmitter.emit('hideNewEntry');
    }
}

module.exports = Store;