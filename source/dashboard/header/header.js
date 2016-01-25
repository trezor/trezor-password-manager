"use strict";

var React = require('react'),
    Router = require('react-router'),
    NavDropdown = require('react-bootstrap').NavDropdown,
    MenuItem = require('react-bootstrap').MenuItem,
    Header = React.createClass({

        handleSelect(event, selectedKey) {
            event.preventDefault();
            alert('selected ' + selectedKey);
        },

        render(){
            return (
                <header className="top-head container-fluid">
                    <ul className="list-inline navbar-right top-menu top-right-menu">
                        <NavDropdown eventKey={1} title="Trezor User" id="nav-dropdown" onSelect={this.handleSelect}>
                            <MenuItem eventKey="1.1"><i className="ion-gear-a"></i> Settings</MenuItem>
                            <MenuItem divider/>
                            <MenuItem eventKey="1.2"><i className="ion-log-out"></i> Logout</MenuItem>
                        </NavDropdown>
                    </ul>
                </header>
            )
        }
    });

module.exports = Header;
