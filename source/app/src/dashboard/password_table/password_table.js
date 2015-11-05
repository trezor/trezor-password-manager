'use strict';

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),
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
                newIdToOpen: ''
            }
        },

        componentWillMount() {
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

        changeTag(e) {
            if (e === undefined) {
                this.setState({
                    active_id: this.state.active_id,
                    active_title: this.state.active_title,
                    newIdToOpen: ''
                });
            } else {
                this.setState({
                    active_id: parseInt(e),
                    active_title: this.state.context.getTagTitleById(e),
                    newIdToOpen: ''
                });
            }

        },

        saveContext(context) {
            this.setState({
                context: context,
                tags: context.data.tags,
                entries: context.data.entries,
                active_title: context.getTagTitleById(this.state.active_id)
            });
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

        hideOpenNewEntry(newId) {
            this.state.newEntry ? this.setState({newEntry: false, newIdToOpen: newId}) : this.setState({newEntry: true})
        },

        render(){
            var password_table = Object.keys(this.state.entries).map((key) => {
                    var obj = this.state.entries[key];
                    if (obj.tags.indexOf(this.state.active_id) > -1 || this.state.active_id == 0) {
                        if (this.state.filter.length > 0) {
                            if (obj.title.toLowerCase().indexOf(this.state.filter) > -1 ||
                                obj.username.toLowerCase().indexOf(this.state.filter) > -1) {
                                return (
                                    <Table_Entry context={this.state.context}
                                                 key={key}
                                                 key_value={key}
                                                 title={obj.title}
                                                 username={obj.username}
                                                 password={obj.password}
                                                 tags={obj.tags}
                                                 note={obj.note}
                                                 mode={parseInt(key) === this.state.newIdToOpen ? 'edit-mode' : 'list-mode'}
                                        />
                                )
                            }
                        } else {
                            return (
                                <Table_Entry context={this.state.context}
                                             key={key}
                                             key_value={key}
                                             password={obj.password}
                                             title={obj.title}
                                             username={obj.username}
                                             tags={obj.tags}
                                             note={obj.note}
                                             mode={parseInt(key) === this.state.newIdToOpen ? 'edit-mode' : 'list-mode'}
                                    />
                            )
                        }
                    }
                }),
                dropdown = (<DropdownButton title='' className='dropdown' noCaret pullRight id='dropdown-no-caret'>
                    <MenuItem eventKey='1' onSelect={this.openTagEditor}><i className='ion-edit'></i> Edit
                        tag</MenuItem>
                    <MenuItem eventKey='2' onSelect={this.openDeleteTagModal}><i className='ion-close'></i> Remove
                        tag</MenuItem>
                </DropdownButton>);

            return (
                <div className='wraper container-fluid'>
                    <div className='row page-title'>
                        <div className='col-sm-3 col-xs-3'>
                            <button type='button'
                                    onClick={this.addNewEntry}
                                    disabled={this.state.newEntry}
                                    className='blue-btn add'>Add entry
                            </button>
                        </div>
                        <div className='col-sm-6 col-xs-9'>
                            <Filter_Input eventEmitter={this.props.eventEmitter}/>
                        </div>
                        <div className='col-sm-3 col-xs-3 text-right'>
                            {this.state.active_id != 0 ? dropdown : null}
                        </div>
                    </div>
                    <div className='row dashboard'>
                        {this.state.newEntry ?
                            <Table_Entry context={this.state.context}
                                         key={undefined}
                                         key_value={undefined}
                                         title={''}
                                         username={''}
                                         password={''}
                                         tags={[]}
                                         note={''}
                                         mode={'edit-mode'}
                                         content_changed={'edited'}
                                /> : null }
                        {password_table.reverse()}

                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
