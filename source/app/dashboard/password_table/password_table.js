'use strict';

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../global_components/data_service'),
    Table_Entry = require('./table_entry/table_entry'),
    Filter_Input = require('./filter_input/filter_input'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    {Link} = Router,

    PasswordTable = React.createClass({

        getInitialState() {
            return {
                active_id: 0,
                active_title: '',
                tags: {},
                entries: {},
                filter: '',
                context: {},
                newEntry: false,
                orderType: 'date'
            }
        },

        componentDidMount() {
            window.eventEmitter.on('changeTag', this.changeTag);
            window.eventEmitter.on('contextInit', this.saveContext);
            window.eventEmitter.on('filter', this.setupFilter);
            window.eventEmitter.on('hideNewEntry', this.addNewEntry);
            window.eventEmitter.on('hideOpenNewEntry', this.hideOpenNewEntry);
        },

        componentWillUnmount() {
            window.eventEmitter.removeListener('changeTag', this.changeTag);
            window.eventEmitter.removeListener('contextInit', this.saveContext);
            window.eventEmitter.removeListener('filter', this.setupFilter);
            window.eventEmitter.removeListener('hideNewEntry', this.addNewEntry);
            window.eventEmitter.removeListener('hideOpenNewEntry', this.hideOpenNewEntry);
        },

        setupFilter(filterVal) {
            this.setState({
                filter: filterVal.toLowerCase()
            });
        },

        changeOrder(newOrderType) {
            this.state.context.changedOrder(newOrderType);
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
                    var tempArray = Object.keys(this.state.entries).map((key) => {
                        return {
                            'key': key,
                            'title': this.state.entries[key].title
                        }
                    }).sort((a, b) => {
                        return a.title.localeCompare(b.title);
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
                    active_id: this.state.active_id,
                    active_title: this.state.active_title
                });
            } else {
                this.setState({
                    active_id: parseInt(e),
                    active_title: this.state.context.getTagTitleById(e)
                });
            }
        },

        checkFilterMatching(obj) {
            return obj.title.toLowerCase().indexOf(this.state.filter) > -1 ||
                obj.note.toLowerCase().indexOf(this.state.filter) > -1 ||
                obj.username.toLowerCase().indexOf(this.state.filter) > -1;
        },

        saveContext(context) {
            this.setState({
                context: context,
                tags: context.data.tags,
                entries: context.data.entries,
                orderType: context.data.config.orderType || 'date',
                active_title: context.getTagTitleById(this.state.active_id)
            });
        },

        activeTag(obj) {
            return obj.tags.indexOf(this.state.active_id) > -1 || this.state.active_id == 0;
        },

        filterIsSet() {
            return this.state.filter.length > 0;
        },

        openTagEditor() {
            window.eventEmitter.emit('openEditTag', this.state.active_id);
        },

        openDeleteTagModal() {
            window.eventEmitter.emit('openRemoveTag', this.state.active_id);
        },

        addNewEntry() {
            this.state.newEntry ? this.setState({newEntry: false}) : this.setState({newEntry: true})
        },

        hideOpenNewEntry() {
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
                                    <Table_Entry context={this.state.context}
                                                 key={key}
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
                                <Table_Entry context={this.state.context}
                                             key={key}
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
                                    onClick={this.addNewEntry}
                                    disabled={this.state.newEntry}
                                    className='blue-btn add'>Add entry
                            </button>
                        </div>
                        <div className='col-md-6 col-sm-8 col-xs-6'>
                            <Filter_Input eventEmitter={this.props.eventEmitter}/>
                        </div>
                        <div className='col-md-3 col-sm-1 col-xs-2 text-right'>
                            {this.state.active_id != 0 ? dropdown : null}
                            <DropdownButton title='' className='dropdown order' noCaret pullRight
                                            id='order-dropdown-no-caret'>
                                <MenuItem eventKey='1' active={this.state.orderType === 'alphabetical'}
                                          onSelect={this.changeOrder.bind(null, 'alphabetical')}><i
                                    className='ion-at'></i> Alphabetical</MenuItem>
                                <MenuItem eventKey='2' active={this.state.orderType === 'date'}
                                          onSelect={this.changeOrder.bind(null, 'date')}><i
                                    className='ion-calendar'></i>Date added</MenuItem>
                            </DropdownButton>
                        </div>
                    </div>
                    <div className='row dashboard'>
                        {this.state.newEntry ?
                            <Table_Entry context={this.state.context}
                                         key={undefined}
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
