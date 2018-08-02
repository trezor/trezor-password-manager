/*
 * Copyright (c) Jan Czibula, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  DropdownButton = require('react-bootstrap').DropdownButton,
  MenuItem = require('react-bootstrap').MenuItem,
  ImportSelect = React.createClass({
    displayName: 'ImportSelect',

    propTypes: {
      onChange: React.PropTypes.func,
      name: React.PropTypes.string,
      value: React.PropTypes.string,
      options: React.PropTypes.array,
      disabled: React.PropTypes.bool
    },

    componentWillReceiveProps(nextProps) {
      this.setState({
        disabled: nextProps.disabled
      });
    },

    getInitialState() {
      return {
        name: 'dropdown',
        value: '',
        options: []
      };
    },

    onChange(event, key) {
      if (typeof this.props.onChange == 'function') {
        this.props.onChange(key, this.props.col);
      }
    },

    render() {
      let title,
        selected = this.props.value,
        options = this.props.options.map(function(option) {
          let key = option.name + option.value;
          if (option.value === selected) {
            title = option.name;
          }
          return (
            <MenuItem key={key} eventKey={option.value}>
              {option.name}
            </MenuItem>
          );
        });

      if (!title) {
        title = '- select -';
      }

      return (
        <DropdownButton
          className={'btn-block'}
          onSelect={this.onChange}
          bsStyle={'default'}
          title={title}
          disabled={this.state.disabled}
          id={'dropdown-' + selected}
        >
          {options}
        </DropdownButton>
      );
    }
  });

module.exports = ImportSelect;
