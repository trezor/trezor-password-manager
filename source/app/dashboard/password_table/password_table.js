/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    tld = require('tldjs'),
    TableEntry = require('./table_entry/table_entry'),
    FilterInput = require('./filter_input/filter_input'),
    UserMenu = require('./user_menu/user_menu'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    Button = require('react-bootstrap').Button,
    MenuItem = require('react-bootstrap').MenuItem,

    PasswordTable = React.createClass({

        getInitialState() {
            return {
                active_id: 0,
                active_title: '',
                tags: window.myStore.data.tags,
                entries: this.addExportTag(window.myStore.data.entries),
                filter: '',
                newEntry: false,
                newEntryUrl: '',
                exportStorage: false,
                orderType: window.myStore.data.config.orderType || 'note',
                exportedEntries: [],
                _isMounted: false
            }
        },

        componentWillMount() {
            window.myStore.on('changeTag', this.changeTag);
            window.myStore.on('filter', this.setupFilter);
            window.myStore.on('toggleNewEntry', this.toggleNewEntry);
            window.myStore.on('update', this.updateTableContent);
            window.myStore.on('storageExport', this.exportStateChange);
            chrome.runtime.onMessage.addListener(this.chromeTableMsgHandler);
        },

        componentDidMount() {
            this.setState({
                _isMounted: true
            });
        },

        componentWillUnmount() {
            window.myStore.removeListener('changeTag', this.changeTag);
            window.myStore.removeListener('filter', this.setupFilter);
            window.myStore.removeListener('toggleNewEntry', this.toggleNewEntry);
            window.myStore.removeListener('update', this.updateTableContent);
            chrome.runtime.onMessage.removeListener(this.chromeTableMsgHandler);
        },

        addExportTag(entries) {
            Object.keys(entries).forEach((entryId) => {
                entries[entryId].export = false;
            });
            return entries;
        },

        chromeTableMsgHandler(request, sender, sendResponse) {
            switch (request.type) {
                case 'saveEntry':
                    this.openNewEntry(request.content);
                    sendResponse({type:'entrySaving'});
                    break;
            }
            return true;
        },

        updateTableContent(data) {
            this.setState({
                tags: data.tags,
                entries: this.addExportTag(data.entries)
            });
        },

        setupFilter(filterVal) {
            this.setState({
                filter: filterVal.toLowerCase()
            });
        },

        changeOrder(newOrderType) {
            window.myStore.changedOrder(newOrderType);
            this.setState({
                orderType: newOrderType
            });
        },

        getProperOrderArr() {
            var rawArr = Object.keys(this.state.entries);
            if (rawArr.length > 0) {
                if (this.state.orderType === 'date') {
                    return rawArr.reverse();
                } else {
                    let tempArray = Object.keys(this.state.entries).map((key) => {
                        let pattern = this.state.entries[key].note.length > 0 ? this.state.entries[key].note : this.state.entries[key].title;
                        if (this.isUrl(pattern)) {
                            pattern = this.removeProtocolPrefix(pattern);
                        }
                        return {
                            'key': key,
                            'pattern': pattern
                        }
                    }).sort((a, b) => {
                        return a.pattern.localeCompare(b.pattern);
                    });
                    return Object.keys(tempArray).map((obj) => {
                        return tempArray[obj].key
                    });
                }
            } else {
                return false;
            }
        },

        changeTag(e) {
            if (e === undefined) {
                this.setState({
                    active_id: parseInt(this.state.active_id),
                    active_title: this.state.active_title
                });
            } else {
                this.setState({
                    active_id: parseInt(e),
                    active_title: window.myStore.getTagTitleById(e)
                });
            }
        },

        removeProtocolPrefix(url) {
            return url.indexOf('://') > -1 ? url.substring(url.indexOf('://') + 3, url.length).split('/')[0] : url.split('/')[0];
        },

        isUrl(url){
            return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
        },

        checkFilterMatching(obj) {
            let filterArr = this.state.filter.match(/[^ ]+/g);
            let filterMatch = 0;
            filterArr.map((term) => {
                let tempVal = false;
                window.myStore.getTagTitleArrayById(obj.tags).map((key) => {
                    if (key.toLowerCase().indexOf(term) > -1) tempVal = true;
                });
                if (obj.title.toLowerCase().indexOf(term) > -1 ||
                    obj.note.toLowerCase().indexOf(term) > -1 ||
                    obj.username.toLowerCase().indexOf(term) > -1) {
                    tempVal = true;
                }
                filterMatch += tempVal;
            });
            return filterMatch >= filterArr.length;
        },

        activeTag(obj) {
            return obj.tags.indexOf(this.state.active_id) > -1 || this.state.active_id === 0;
        },

        filterIsSet() {
            return this.state.filter.length > 0;
        },

        openNewEntry(url) {
            this.setState({
                newEntryUrl: url,
                newEntry: true
            });
        },

        toggleNewEntry() {
            this.setState({
                newEntryUrl: '',
                newEntry: !this.state.newEntry
            });
        },

        exportToggleAll() {
            var exportAll = true,
                allSelected = true,
                entries = this.state.entries;

            Object.keys(entries).forEach(entryId => {
                if (!entries[entryId].export) allSelected = false;
            });

            if (allSelected) exportAll = false;

            Object.keys(entries).forEach(entryId => {
                entries[entryId].export = exportAll;
            });

            this.setState({
                entries: entries
            });
        },

        onExportedEntry(decryptedEntry, entryId) {
            let exportedEntries = this.state.exportedEntries;

            if (decryptedEntry) {
                decryptedEntry.tags = window.myStore.getTagTitleArrayById(this.state.entries[entryId].tags).join('|');
                exportedEntries.push(decryptedEntry);
                
                this.setState({
                    exportedEntries: exportedEntries
                });
            }
        },

        onToggleEntry(entryId) {
            var entries = this.state.entries;
                entries[entryId].export = !entries[entryId].export;

            this.setState({
                entries: entries
            });
        },

        exportStateChange(storageExport) {
            if (!this.state._isMounted) return;

            this.setState({
                exportStorage: (storageExport ? true : false)
            });

            if (typeof storageExport === 'object' && storageExport.status !== 'pending') {
                let nextEntryKey = storageExport.key + 1;
                this.exportEntry(nextEntryKey);
            }
        },

        exportEntry(n) {
            if (!this.state._isMounted) return;

            if (typeof n !== 'number') {
                this.setState({
                    exportedEntries: []
                });
                n = 0;
            }

            let entries = this.getProperOrderArr();
            
            if (entries[n]) {
                window.myStore.emit('storageExport', {
                    entryId: entries[n],
                    key: n,
                    status: 'pending'
                });
            } else {
                this.exportDownload();
                this.exportEnd();
            }
        },

        exportDownload() {
            if (this.state.exportedEntries.length == 0) return;
            
            var fields = ['title', 'note', 'username', 'password', 'tags', 'safe_note'];
            var text = String();
            
            this.state.exportedEntries.forEach(entry => {
                var values = [];
                fields.forEach((field, key) => {
                    values[key] = entry[field] ? entry[field] : '';
                });
                text = text + values.join(',') + '\n';
            });

            var blob = new Blob([text], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob),
                a = document.createElement("a");

            document.body.appendChild(a);
            a.style = "display: none";
            a.href = url;
            a.download = 'trezor-export.csv';
            a.click();
            a.remove();
        },

        exportEnd() {
            this.setState({
                exportedEntries: []
            });
            setTimeout(function() {
                window.myStore.emit('storageExport', false);
            });
        },

        render(){
            let raw_table = this.getProperOrderArr(),
                count = !!raw_table.length ? 0 : 1,
                allSelected = true,
                selectedCount = 0,
                newTagArr = this.state.active_id === 0 ? [] : [this.state.active_id],
                password_table = !!raw_table.length ? raw_table.map((key) => {
                    let obj = this.state.entries[key];
                    let actTag = this.activeTag(obj);
                    if (obj.export) {
                        selectedCount++;
                    } else {
                        allSelected = false;
                    }
                    if (actTag) {
                        if (this.filterIsSet()) {
                            if (this.checkFilterMatching(obj)) {
                                count++;
                                return (
                                    <TableEntry key={key}
                                                key_value={key}
                                                title={obj.title}
                                                username={obj.username}
                                                password={obj.password}
                                                nonce={obj.nonce}
                                                tags={obj.tags}
                                                safe_note={obj.safe_note}
                                                note={obj.note}
                                                exportEntry={obj.export}
                                                onExported={this.onExportedEntry}
                                                onToggle={this.onToggleEntry}
                                        />
                                )
                            }
                        } else {
                            count++;
                            return (
                                <TableEntry key={key}
                                            key_value={key}
                                            title={obj.title}
                                            username={obj.username}
                                            password={obj.password}
                                            nonce={obj.nonce}
                                            tags={obj.tags}
                                            safe_note={obj.safe_note}
                                            note={obj.note}
                                            exportEntry={obj.export}
                                            onExported={this.onExportedEntry}
                                            onToggle={this.onToggleEntry}
                                    />
                            )
                        }
                    }
                }) : (<div className='no-entries'><img src='dist/app-images/nopwd.svg' alt='no passwords'/><div className='headline'>Add your first password.</div><div>Click to “Add entry” or use “Import”</div></div>);

            return (
                <div className='wraper container-fluid'>
                    <div className='row page-title'>
                        {this.state.exportStorage &&
                        <div className='col-sm-12'>
                            <div className={'export'}>
                                <label className={'checkbox ' + (allSelected ? ' active' : '')} onClick={this.exportToggleAll}>
                                    <i>
                                        {allSelected && (<img src='./images/checkbox_checked.svg' />)}
                                    </i> Select all
                                </label>
                                <span className='info'>({selectedCount}) entries selected</span>
                                <Button onClick={this.exportEnd} className='btn-link'>Cancel</Button>
                                <Button onClick={this.exportEntry} bsStyle={'primary'} className={'btn-export'} disabled={selectedCount > 0 ? false : true}>Export selected</Button>
                            </div>
                        </div>}
                        {!this.state.exportStorage &&
                        <div className='col-sm-8 col-xs-9'>
                            <button type='button'
                                    onClick={this.toggleNewEntry}
                                    disabled={this.state.newEntry}
                                    className='blue-btn add'>Add entry
                            </button>
                            <FilterInput eventEmitter={this.props.eventEmitter}/>
                        </div>}
                        {!this.state.exportStorage &&
                        <div className="col-sm-4 col-xs-3 text-right">
                            <DropdownButton title='Sort' className='dropdown order' noCaret pullRight
                                            id='order-dropdown-no-caret'>
                                <MenuItem active={this.state.orderType === 'note'}
                                          onSelect={this.changeOrder.bind(null, 'note')}><i
                                    className='ion-ios-list-outline'></i>Title</MenuItem>
                                <MenuItem active={this.state.orderType === 'date'}
                                          onSelect={this.changeOrder.bind(null, 'date')}><i
                                    className='ion-calendar'></i>Date</MenuItem>
                            </DropdownButton>
                            <UserMenu />
                        </div>}
                    </div>
                    <div className='row dashboard'>
                        {this.state.newEntry &&
                        <TableEntry key={undefined}
                                    key_value={undefined}
                                    title={this.state.newEntryUrl}
                                    username=''
                                    password=''
                                    tags={newTagArr}
                                    note={this.state.newEntryUrl.length ? tld.getDomain(this.state.newEntryUrl) : ''}
                                    nonce=''
                                    safe_note=''
                                    mode={'edit-mode'}
                                    content_changed={'edited'}
                            />}
                        {count !== 0 ? password_table : (<div className='no-entries'><img src='dist/app-images/nosearch.svg' alt='no passwords'/><div className='headline'>No results.</div><div>Consider your criteria.</div></div>)}
                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
