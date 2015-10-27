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
                newEntry: false
            }
        },

        componentWillMount() {
            this.props.eventEmitter.on('changeTag', this.changeTag);
            this.props.eventEmitter.on('contextInit', this.saveContext);
            this.props.eventEmitter.on('filter', this.setupFilter);
        },

        setupFilter(filterVal) {
            this.setState({
                filter: filterVal.toLowerCase()
            });
        },

        changeTag(e) {
            if (!e) {
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

        saveContext(context) {
            this.setState({
                context: context,
                tags: context.data.tags,
                entries: context.data.entries,
                active_title: context.getTagTitleById(this.state.active_id)
            });
        },

        openTagEditor() {
            this.props.eventEmitter.emit('openEditTag', this.state.active_id);
        },

        openDeleteTagModal() {
            this.props.eventEmitter.emit('openRemoveTag', this.state.active_id);
        },

        addNewEntry() {
            this.state.newEntry ? this.setState({newEntry: false}) : this.setState({newEntry: true})
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

            if (this.state.newEntry) {
                password_table.push(
                    <Table_Entry context={this.state.context}
                                 key={'00'}
                                 key_value={'00'}
                                 title={''}
                                 username={''}
                                 password={''}
                                 tags={this.state.active_id}
                                 note={''}
                                 mode={'edit-mode'}
                                 content_changed={'edited'}
                        />
                );
            }

            return (
                <div className='wraper container-fluid'>
                    <div className='row page-title'>
                        <div className='col-sm-3 col-xs-3'>
                            <button type='button'
                                    onClick={this.addNewEntry}
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
                        {password_table.reverse()}

                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
