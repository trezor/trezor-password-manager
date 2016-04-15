'use strict';

var React = require('react'),
    tld = require('tldjs'),
    TableEntry = require('./table_entry/table_entry'),
    FilterInput = require('./filter_input/filter_input'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,

    PasswordTable = React.createClass({

        getInitialState() {
            return {
                active_id: 0,
                active_title: '',
                tags: window.myStore.data.tags,
                entries: window.myStore.data.entries,
                filter: '',
                newEntry: false,
                orderType: window.myStore.data.config.orderType || 'date'
            }
        },

        componentWillMount() {
            window.myStore.on('changeTag', this.changeTag);
            window.myStore.on('filter', this.setupFilter);
            window.myStore.on('toggleNewEntry', this.toggleNewEntry);
            window.myStore.on('update', this.updateTableContent);
        },

        componentWillUnmount() {
            window.myStore.removeListener('changeTag', this.changeTag);
            window.myStore.removeListener('filter', this.setupFilter);
            window.myStore.removeListener('toggleNewEntry', this.toggleNewEntry);
            window.myStore.removeListener('update', this.updateTableContent);
        },

        updateTableContent(data) {
            this.setState({
                tags: data.tags,
                entries: data.entries
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
                } if(this.state.orderType === 'note') {
                    let tempArray = Object.keys(this.state.entries).map((key) => {
                        let pattern = this.state.entries[key].note.length > 0 ? this.state.entries[key].note :  this.state.entries[key].title;
                        if(this.isUrl(pattern)) {
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
                } else {
                    let tempArray = Object.keys(this.state.entries).map((key) => {
                        let pattern = this.state.entries[key].title;
                        if(this.isUrl(pattern)) {
                            pattern = this.state.orderType === 'alphabetical' ? this.removeProtocolPrefix(pattern) : tld.getDomain(pattern);
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
                return rawArr;
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
            let findMatchingTag = false;
            window.myStore.getTagTitleArrayById(obj.tags).map((key) => {
               if(key.toLowerCase().indexOf(this.state.filter) > -1) findMatchingTag = true;
            });
            return findMatchingTag ||
                obj.title.toLowerCase().indexOf(this.state.filter) > -1 ||
                obj.note.toLowerCase().indexOf(this.state.filter) > -1 ||
                obj.username.toLowerCase().indexOf(this.state.filter) > -1;
        },

        activeTag(obj) {
            return obj.tags.indexOf(this.state.active_id) > -1 || this.state.active_id == 0;
        },

        filterIsSet() {
            return this.state.filter.length > 0;
        },

        openTagEditor() {
            window.myStore.emit('openEditTag', this.state.active_id);
        },

        openDeleteTagModal() {
            window.myStore.emit('openRemoveTag', this.state.active_id);
        },

        toggleNewEntry() {
            this.state.newEntry ? this.setState({newEntry: false}) : this.setState({newEntry: true})
        },

        render(){
            var raw_table = this.getProperOrderArr();
            var password_table = raw_table.map((key) => {
                    var obj = this.state.entries[key];
                    if (this.activeTag(obj)) {
                        if (this.filterIsSet()) {
                            if (this.checkFilterMatching(obj)) {
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
                                        />
                                )
                            }
                        } else {
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
                                    />
                            )
                        }
                    }
                }),
                dropdown = (
                    <DropdownButton title='' className='dropdown edit' noCaret pullRight id='edit-dropdown-no-caret'>
                        <MenuItem eventKey='1' onSelect={this.openTagEditor}><i className='ion-edit'></i> Edit
                            tag</MenuItem>
                        <MenuItem eventKey='2' onSelect={this.openDeleteTagModal}><i className='ion-close'></i> Remove
                            tag</MenuItem>
                    </DropdownButton>);

            return (
                <div className='wraper container-fluid'>
                    <div className='row page-title'>
                        <div className='col-md-3 col-sm-3 col-xs-2'>
                            <button type='button'
                                    onClick={this.toggleNewEntry}
                                    disabled={this.state.newEntry}
                                    className='blue-btn add'>Add entry
                            </button>
                        </div>
                        <div className='col-md-6 col-sm-8 col-xs-6'>
                            <FilterInput eventEmitter={this.props.eventEmitter}/>
                        </div>
                        <div className='col-md-3 col-sm-1 col-xs-2 text-right'>
                            {this.state.active_id != 0 ? dropdown : null}
                            <DropdownButton title='' className='dropdown order' noCaret pullRight
                                            id='order-dropdown-no-caret'>
                                <MenuItem eventKey='1' active={this.state.orderType === 'alphabetical'}
                                          onSelect={this.changeOrder.bind(null, 'alphabetical')}><i
                                    className='ion-at'></i>Alphabetical</MenuItem>
                                <MenuItem eventKey='1' active={this.state.orderType === 'domain_alphabetical'}
                                          onSelect={this.changeOrder.bind(null, 'domain_alphabetical')}><i
                                    className='ion-ios-world-outline'></i>Domain Alphabetical</MenuItem>
                                <MenuItem eventKey='2' active={this.state.orderType === 'date'}
                                          onSelect={this.changeOrder.bind(null, 'date')}><i
                                    className='ion-calendar'></i>Date</MenuItem>
                                <MenuItem eventKey='2' active={this.state.orderType === 'note'}
                                          onSelect={this.changeOrder.bind(null, 'note')}><i
                                    className='ion-ios-list-outline'></i>Note</MenuItem>
                            </DropdownButton>
                        </div>
                    </div>
                    <div className='row dashboard'>
                        {this.state.newEntry ?
                            <TableEntry key={undefined}
                                        key_value={undefined}
                                        title=''
                                        username=''
                                        password=''
                                        tags={[]}
                                        note=''
                                        nonce=''
                                        safe_note=''
                                        mode={'edit-mode'}
                                        content_changed={'edited'}
                                /> : null }
                        {password_table}

                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
