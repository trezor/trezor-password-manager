/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    UserMenu = React.createClass({

        getInitialState() {
            return {
                username: window.myStore.username,
                storageType: window.myStore.storageType
            }
        },

        logout() {
            window.myStore.logout();
        },

        componentDidMount() {
        },

        render(){
            return (
                <span className='user-menu'>
                    <DropdownButton title={this.state.username.split(' ')[0]}
                                    className={'dropdown user ' + this.state.storageType.toLowerCase()}
                                    pullRight
                                    noCaret
                                    id='user-dropdown'>
                        <MenuItem onSelect={this.logout}><i className='ion-person-stalker'></i>Switch user</MenuItem>
                    </DropdownButton>
                </span>
            )
        }
    });

module.exports = UserMenu;
