/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    NavDropdown = require('react-bootstrap').NavDropdown,
    time = 0,
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
            this.stopTimer();
            if (event.target.value.length == 0) {
                this.clearFilter();
            } else {
                this.setState({filter: event.target.value});
                this.startTimer();
            }
        },

        submitForm(event) {
            event.preventDefault();
            this.stopTimer();
            window.myStore.emit('filter',  this.state.filter);
        },

        startTimer() {
            this.timer = setInterval(this.tick, 100);
        },

        tick() {
            time += 100;
            if (time > 600) {
                this.stopTimer();
                window.myStore.emit('filter', this.state.filter);
            }
        },

        stopTimer() {
            clearInterval(this.timer);
            time = 0;
        },

        clearFilter() {
            this.stopTimer();
            this.setState({filter: ''});
            window.myStore.emit('filter', '');
        },

        render(){
            return (
                <span>
                    <form role='filter' className={this.state.filter.length > 0 ? 'filter active' : 'filter'}
                          onSubmit={this.submitForm}>
                        <input type='text' ref='filter' placeholder='Quick filter ...' value={this.state.filter}
                               onChange={this.handleChange} className='form-control'/>
                        <i className='icon ion-close-round clear' onClick={this.clearFilter}></i>
                    </form>
                </span>
            )
        }
    });

module.exports = FilterInput;
