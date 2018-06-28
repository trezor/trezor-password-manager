/*
 * Copyright (c) Jan Czibula, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
	ImportSelect = React.createClass({
		displayName: 'ImportSelect',

		propTypes: {
			obligatory: React.PropTypes.bool,
			onChange: React.PropTypes.func,
			name: React.PropTypes.string,
			value: React.PropTypes.string,
			options: React.PropTypes.array
		},

		getInitialState() {
			return {
				obligatory: false,
				name: 'dropdown',
				value: '',
				options: []
			};
		},

		onChange(event) {
			if (typeof this.props.onChange == "function") {
				this.props.onChange(event.target.value, this.props.col);
			}
		},

		render() {
			let options = this.props.options.map(function(option) {
				let key = option.name + option.value;
				return <option key={key} value={option.value}>{option.name}</option>
			});
			return (
				<select className="form-control" value={this.props.value} onChange={this.onChange}>
					{!this.props.obligatory ? <option value="">- select -</option> : null}
					{options}	
				</select>
			);
		}
	}
);

module.exports = ImportSelect;
