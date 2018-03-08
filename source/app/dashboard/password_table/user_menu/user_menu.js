/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Papa = require('papaparse'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    UserMenu = React.createClass({

        getInitialState() {
            return {
                username: window.myStore.username,
                storageType: window.myStore.storageType
            }
        },

        importClick() {
            var fileUploadDom = React.findDOMNode(this.refs.fileUploader);
            fileUploadDom.click();
        },

        userSwitch() {
            window.myStore.userSwitch();
        },

        onChangeFile(event) {
            event.stopPropagation();
            event.preventDefault();
            var file = event.target.files[0];
            Papa.parse(file, {
                complete: function(results) {
                    console.warn(results);
                }
            });
        },

        componentDidMount() {

        },

        render(){
            return (
                <span className='user-menu'>
                    <input id="myInput"
                           type="file"
                           accept=".csv"
                           ref={'fileUploader'}
                           style={{display: 'none'}}
                           onChange={this.onChangeFile}
                    />
                    <DropdownButton title={this.state.username.split(' ')[0]}
                                    className={'dropdown user ' + this.state.storageType.toLowerCase()}
                                    pullRight
                                    noCaret
                                    id='user-dropdown'>
                        <MenuItem onSelect={this.importClick}><i className='ion-document'></i>Import storage</MenuItem>
                        <MenuItem onSelect={this.userSwitch}><i className='ion-log-out'></i>Switch user</MenuItem>
                    </DropdownButton>
                </span>
            )
        }
    });

module.exports = UserMenu;
