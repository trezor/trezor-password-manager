"use strict";

var React = require('react'),
    Router = require('react-router'),
    Header = React.createClass({

        addNewEntry() {
            this.props.eventEmitter.emit('openEditPopup', {});
        },

        render(){
            return (
                <header className="top-head container-fluid">
                    <button type="button" onClick={this.addNewEntry}>Add entry</button>
                </header>
            )
        }
    });

module.exports = Header;
