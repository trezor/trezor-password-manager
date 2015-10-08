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
                tags: {},
                passwords: {}
            }
        },

        componentWillMount() {
            this.props.eventEmitter.on('changeTag', this.changeTag);
            this.props.eventEmitter.on('contextInit', this.saveContext);
        },

        changeTag(e) {
            this.setState({
                active_id: parseInt(e),
                active_name: Context.getTagById(e)
            });
        },

        saveContext(context) {
            Context = context;
            this.setState({
                tags: Context.data.tags,
                passwords: Context.data.passwords,
                active_name: Context.getTagById(this.state.active_id)
            });
        },


        render(){
            var password_table = Object.keys(this.state.passwords).map((key) => {
                var obj = this.state.passwords[key];
                if(obj.tags.indexOf(this.state.active_id) > -1){
                    return (
                        <tr key={key}>
                            <td>{obj.name}</td>
                            <td>{obj.username}</td>
                            <td>{obj.password}</td>
                            <td>{
                                Object.keys(obj.tags).map((key) => {
                                    return ' '+Context.getTagById(obj.tags[key])
                                })
                            }</td>
                        </tr>)
                }
            });

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
                                    {password_table}
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
