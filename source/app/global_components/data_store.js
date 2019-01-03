/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var Service = require('./data_service'),
  EventEmitter = require('events');

class Store extends EventEmitter {
  constructor(data, username, storageType) {
    super();
    this.username = username;
    this.storageType = storageType;
    this.data = typeof data === 'object' ? data : JSON.parse(data);
    this.validateData(this.data).then(c => {
      if (!!c.length) {
        this.sendMsg('errorMsg', { code: 'T_CORRUPTED', cEntries: c.join(', ') });
      }
    });
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) =>
      this.chromeStoreMsgHandler(request, sender, sendResponse)
    );
    this.emit('update', this.data);
  }

  updateData(data) {
    data = typeof data === 'object' ? data : JSON.parse(data);
    this.emit('update', data);
    this.data = data;
  }

  validateData(data) {
    return new Promise(resolve => {
      let corruptedEntries = [];
      Object.keys(data.entries).map(key => {
        let o = data.entries[key];
        if (
          o.hasOwnProperty('nonce') &&
          o.hasOwnProperty('title') &&
          o.hasOwnProperty('password') &&
          o.hasOwnProperty('username')
        ) {
          return true;
        } else {
          corruptedEntries.push(o.title);
        }
      });
      resolve(corruptedEntries);
    });
  }

  chromeStoreMsgHandler(request, sender, sendResponse) {
    switch (request.type) {
      case 'decryptedContent':
        if (request.content.data !== JSON.stringify(this.data)) {
          this.updateData(request.content.data);
        }
        break;
    }
  }

  getTagTitleById(tagId) {
    tagId = tagId ? parseInt(tagId) : 0;
    return Object.getOwnPropertyDescriptor(this.data.tags, tagId).value.title;
  }

  getTagIdByTitle(title) {
    var resultId = [];
    Object.keys(this.data.tags).map(key => {
      if (this.data.tags[key].title === title) resultId = key;
    });
    return parseInt(resultId);
  }

  getTagIconById(tagId) {
    tagId = tagId ? parseInt(tagId) : 0;
    let tagIcon = Object.getOwnPropertyDescriptor(this.data.tags, tagId);
    if (tagIcon && tagIcon.value) {
      return tagIcon.value.icon;
    } else {
      return false;
    }
  }

  getTagTitleArrayById(tag_array) {
    return Object.keys(tag_array).map(key => {
      return this.data.tags[tag_array[key]] ? this.data.tags[tag_array[key]].title : false;
    });
  }

  getTagTitleArray() {
    return Object.keys(this.data.tags).map(key => {
      return this.data.tags[key].title;
    });
  }

  getTagIdArray() {
    return Object.keys(this.data.tags).map(key => {
      return parseInt(key);
    });
  }

  changeTagById(tagId, newTagTitle, newTagIcon, save = true) {
    var tagData = Object.getOwnPropertyDescriptor(this.data.tags, tagId).value;
    tagData.title = newTagTitle;
    tagData.icon = newTagIcon;
    this.saveDataToTagById(tagId, tagData);
    this.emit('update', this.data);
    save && Service.saveContext(this.data);
  }

  saveDataToTagById(tagId, data) {
    return Object.defineProperty(this.data.tags, tagId, { value: data });
  }

  addNewTag(newTitle, newIcon) {
    let data = {
        title: newTitle,
        icon: newIcon
      },
      newId =
        parseInt(Object.keys(this.data.tags)[parseInt(Object.keys(this.data.tags).length) - 1]) + 1;
    this.data.tags[newId] = data;
    this.emit('update', this.data);
    Service.saveContext(this.data);
    return newId;
  }

  removeTag(tagId, save = true) {
    this.emit('changeTag', 0);
    Object.keys(this.data.entries).map(key => {
      var tags = this.data.entries[key].tags;
      if (tags.indexOf(parseInt(tagId)) > -1) {
        this.removeTagFromEntry(tagId, key, false);
      }
    });
    delete this.data.tags[tagId];
    this.emit('update', this.data);
    save && Service.saveContext(this.data);
  }

  hasTagId(tagId) {
    let arr = this.getTagIdArray();
    return arr.indexOf(parseInt(tagId));
  }

  getEntryValuesById(entryId) {
    var entry = Object.getOwnPropertyDescriptor(this.data.entries, entryId);
    return entry ? entry.value : false;
  }

  getEntryTitleById(entryId) {
    return Object.getOwnPropertyDescriptor(this.data.entries, entryId).value.title;
  }

  getEntriesIdArray() {
    return Object.keys(this.data.entries).map(key => {
      return parseInt(key);
    });
  }

  saveDataToEntryById(entryId, data, save = true) {
    Object.defineProperty(this.data.entries, entryId, { value: data });
    this.emit('changeTag');
    save && Service.saveContext(this.data);
  }

  addTagToEntry(tagId, entryId) {
    var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
    entryData.tags.push(parseInt(tagId));
    this.saveDataToEntryById(entryId, entryData, false);
    Service.saveContext(this.data);
  }

  removeTagFromEntry(tagId, entryId, save = true) {
    var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId).value;
    var index = entryData.tags.indexOf(parseInt(tagId));
    entryData.tags.splice(index, 1);
    this.saveDataToEntryById(entryId, entryData, save);
    save && Service.saveContext(this.data);
  }

  getPossibleToAddTagsForEntry(entryId, tempTagArr) {
    var allTags = this.getTagIdArray(),
      resultTagArray = [];
    if (typeof entryId === 'undefined') {
      allTags.splice(0, 1);
      allTags.map(key => {
        if (tempTagArr.indexOf(key) === -1) {
          resultTagArray.push(this.getTagTitleById(key));
        }
      });
    } else {
      var entryData = Object.getOwnPropertyDescriptor(this.data.entries, entryId);
      if (entryData && entryData.value) {
        allTags.splice(0, 1);
        allTags.map(key => {
          if (entryData.value.tags.indexOf(key) === -1) {
            resultTagArray.push(this.getTagTitleById(key));
          }
        });
      }
    }
    return resultTagArray;
  }

  addNewEntry(data, toggleNewEntry) {
    var newId =
      parseInt(
        Object.keys(this.data.entries)[parseInt(Object.keys(this.data.entries).length) - 1]
      ) + 1;
    newId = isNaN(newId) ? 0 : newId;
    this.data.entries[newId] = data;
    this.emit('update', this.data);
    Service.saveContext(this.data);
    if (toggleNewEntry) this.emit('toggleNewEntry');
  }

  addNewEntries(entries) {
    entries = entries.reverse();
    entries.forEach(entry => {
      var newId =
        parseInt(
          Object.keys(this.data.entries)[parseInt(Object.keys(this.data.entries).length) - 1]
        ) + 1;
      newId = isNaN(newId) ? 0 : newId;
      this.data.entries[newId] = entry;
    });
    this.emit('update', this.data);
    Service.saveContext(this.data);
  }

  removeEntry(entryId) {
    delete this.data.entries[entryId];
    this.emit('update', this.data);
    Service.saveContext(this.data);
  }

  changedOrder(newOrder) {
    this.data.config.orderType = newOrder;
    Service.saveContext(this.data);
  }

  getAllEntries() {
    return Object.keys(this.data.entries).map(key => {
      return this.data.entries[key];
    });
  }

  cleanStorage() {
    return new Promise(resolve => {
      Object.keys(this.data.entries).map(key => {
        let o = this.data.entries[key];
        if (
          o.hasOwnProperty('nonce') &&
          o.hasOwnProperty('title') &&
          o.hasOwnProperty('password') &&
          o.hasOwnProperty('username')
        ) {
          return true;
        } else {
          delete this.data.entries[key];
        }
      });
      Service.saveContext(this.data);
      this.emit('update', this.data);
      resolve();
    });
  }

  toObject() {
    return this.data;
  }

  hideNewEntry() {
    return this.emit('toggleNewEntry');
  }

  sendMsg(type, content = null) {
    chrome.runtime.sendMessage({ type: type, content: content });
  }

  userSwitch() {
    this.sendMsg('userSwitch');
  }
}

module.exports = Store;
