"use strict";

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),
    {Link} = Router,
    Context = {},

    PasswordTable = React.createClass({

        getInitialState() {
            return {
                active_id: 0,
                active_name: '',
                tags: {}
            }
        },

        componentWillMount() {
            this.props.eventEmitter.on('changeTag', this.changeTag);
            this.props.eventEmitter.on('contextInit', this.saveContext);
        },

        changeTag(e) {
            this.setState({
                active_id: e,
                active_name: Object.getOwnPropertyDescriptor(this.state.tags, e).value.name
            });
        },

        saveContext(context) {
            Context = context;
            this.setState({
                tags: Context.data.tags,
                active_name: Object.getOwnPropertyDescriptor(Context.data.tags, this.state.active_id).value.name
            });
        },


        render(){

            return (
                <div className="wraper container-fluid">
                    <div className="row">
                        <div className="col-sm-6">
                            <div className="page-title">
                                <h3 className="title">{this.state.active_name}</h3>
                            </div>
                        </div>
                        <div className="col-sm-6 text-right">
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <div className='dashboard'>
                                <table className="table">
                                    <thead>
                                    <tr>
                                        <th>Name / URL</th>
                                        <th>Username</th>
                                        <th>Password</th>
                                        <th>Tags</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>Facebook.com</td>
                                        <td>pietro.mak@gmail.com</td>
                                        <td>**********</td>
                                        <td>All Internet</td>
                                    </tr>
                                    <tr>
                                        <td>Kyberia.com</td>
                                        <td>Peter Jensen</td>
                                        <td>**********</td>
                                        <td>All Internet</td>
                                    </tr>
                                    <tr>
                                        <td>Mail</td>
                                        <td>pietro.mak@gmail.com</td>
                                        <td>**********</td>
                                        <td>All Email</td>
                                    </tr>
                                    </tbody>
                                </table>

                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    });

module.exports = PasswordTable;
