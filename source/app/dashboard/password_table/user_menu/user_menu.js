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
      };
    },

    importClick() {
      window.myStore.emit('storageImport', {});
    },

    exportClick() {
      window.myStore.emit('export', {
        eventType: 'mode',
        value: true
      });
    },

    userSwitch() {
      window.myStore.userSwitch();
    },

    componentDidMount() {},

    render() {
      return (
        <span className="user-menu">
          <DropdownButton
            title={this.state.username.split(' ')[0]}
            className={'dropdown user ' + this.state.storageType.toLowerCase()}
            pullRight
            noCaret
            id="user-dropdown"
          >
            <MenuItem onSelect={this.importClick}>
              <i className="ion-android-arrow-down" />
              Import storage
            </MenuItem>
            <MenuItem onSelect={this.exportClick}>
              <i className="ion-android-arrow-up" />
              Export storage
            </MenuItem>
            <MenuItem onSelect={this.userSwitch}>
              <i className="ion-log-out" />
              Switch user
            </MenuItem>
          </DropdownButton>
        </span>
      );
    }
  });

module.exports = UserMenu;
