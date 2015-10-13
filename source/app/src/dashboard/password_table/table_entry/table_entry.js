"use strict";

var React = require('react'),
    Router = require('react-router'),
    OverlayTrigger = require('react-bootstrap').OverlayTrigger,
    Tooltip = require('react-bootstrap').Tooltip,
    TableEntry = React.createClass({

        render(){
            var titleTooltip = (
                    <Tooltip id="title-tooltip">Click to <strong>open</strong> URL.</Tooltip>
                ),

                usernameTooltip = (
                    <Tooltip id="username-tooltip"><strong>Copy</strong> username to clipboard.</Tooltip>
                ),

                passwordTooltip = (
                    <Tooltip id="password-tooltip"><strong>Copy</strong> password to clipboard.</Tooltip>
                ),

                editTooltip = (
                    <Tooltip id="edit-tooltip"><strong>Edit</strong> entry.</Tooltip>
                );


            return (
                <tr key={this.props.key}>

                    <td>
                        <OverlayTrigger placement="top" overlay={titleTooltip}>
                            <span>{this.props.title}</span>
                        </OverlayTrigger>
                    </td>

                    <td>
                        <OverlayTrigger placement="top" overlay={usernameTooltip}>
                            <span>{this.props.username}</span>
                        </OverlayTrigger>
                    </td>
                    <td>
                        <OverlayTrigger placement="top" overlay={passwordTooltip}>
                            <span>{this.props.password}</span>
                        </OverlayTrigger>
                    </td>
                </tr>
            )
        }
    });

module.exports = TableEntry;
