/*
 * Copyright (c) Peter Privalinec, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    NavDropdown = require('react-bootstrap').NavDropdown,
    FilterInput = React.createClass({

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
            window.myStore.emit('filter', event.target.value);
        },

        submitForm(event) {
            event.preventDefault();
        },

        render(){
            return (
                <span>
                    <form role='filter' className='filter' onSubmit={this.submitForm}>
                        <input type='text' ref='filter' placeholder='Quick filter ...' value={this.state.filter}
                               onChange={this.handleChange} className='form-control'/>
                    </form>
                </span>
            )
        }
    });

module.exports = FilterInput;
