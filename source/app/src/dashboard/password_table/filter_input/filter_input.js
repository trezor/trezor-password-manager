'use strict';

var React = require('react'),
    Router = require('react-router'),
    NavDropdown = require('react-bootstrap').NavDropdown,
    Filter_Input = React.createClass({

        getInitialState() {
            return {
                filter: ''
            }
        },

        componentDidMount() {
            React.findDOMNode(this.refs.filter).focus();
        },

        handleChange(event) {
            this.setState({filter: event.target.value});
            window.eventEmitter.emit('filter', event.target.value);
        },

        render(){
            return (
                <span>
                    <form role='filter' className='filter'>
                        <input type='text' ref='filter' placeholder='Quick search ...' value={this.state.filter} onChange={this.handleChange} className='form-control' />
                    </form>
                </span>
            )
        }
    });

module.exports = Filter_Input;
