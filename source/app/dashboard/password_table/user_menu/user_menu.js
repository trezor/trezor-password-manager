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
                username: 'Peter Jensen',
                storageType: 'DRIVE'
            }
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
                        <MenuItem><i className='ion-power'></i>Logout</MenuItem>
                    </DropdownButton>
                </span>
            )
        }
    });

module.exports = UserMenu;
