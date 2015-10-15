"use strict";

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),
    Table_Entry = require('./table_entry/table_entry'),
    Filter_Input = require('./filter_input/filter_input'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    {Link} = Router,

    PasswordTable = React.createClass({

        context: {},

        getInitialState() {
            return {
                active_id: 0,
                active_title: '',
                tags: {},
                passwords: {},
                filter: ''
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
            this.setState({
                active_id: parseInt(e),
                active_title: this.context.getTagTitleById(e)
            });
        },

        saveContext(context) {
            this.context = context;
            this.setState({
                tags: this.context.data.tags,
                passwords: this.context.data.passwords,
                active_title: this.context.getTagTitleById(this.state.active_id)
            });
        },


        render(){
            var password_table = Object.keys(this.state.passwords).map((key) => {
                var obj = this.state.passwords[key];
                if (obj.tags.indexOf(this.state.active_id) > -1) {

                    if (this.state.filter.length > 0) {
                        if (obj.title.toLowerCase().indexOf(this.state.filter) > -1 ||
                            obj.username.toLowerCase().indexOf(this.state.filter) > -1) {
                            return (
                                <Table_Entry eventEmitter={this.props.eventEmitter} context={this.context} key={key}
                                             title={obj.title} username={obj.username}
                                             tag={obj.tags[obj.tags.length-1]}/>
                            )
                        }
                    } else {
                        return (
                            <Table_Entry eventEmitter={this.props.eventEmitter} context={this.context} key={key}
                                         title={obj.title} username={obj.username} tag={obj.tags[obj.tags.length-1]}/>
                        )
                    }


                }
            });

            return (
                <div className="wraper container-fluid">
                    <div className="row page-title">
                        <div className="col-sm-3 col-xs-3">
                            <DropdownButton title={this.state.active_title} className="title" id="bg-nested-dropdown">
                                <MenuItem eventKey="1"><i className="ion-pricetags"></i> Rename tag</MenuItem>
                                <MenuItem eventKey="2"><i className="ion-loop"></i> Change icon</MenuItem>
                                <MenuItem eventKey="3"><i className="ion-close"></i> Remove tag</MenuItem>
                            </DropdownButton>
                        </div>
                        <div className="col-sm-6 col-xs-9">
                            <Filter_Input eventEmitter={this.props.eventEmitter}/>
                        </div>
                        <div className="col-sm-3 col-xs-12 text-right">
                            <button type="button" onClick={this.addNewEntry} className="blue-btn">Add entry</button>
                        </div>
                    </div>
                    <div className="row dashboard">
                        {password_table}

                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
