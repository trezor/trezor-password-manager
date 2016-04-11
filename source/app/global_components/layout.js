'use strict';

var React = require('react'),
    Router = require('react-router'),
    ErrorModal = require('./modal_dialogs/error_modal'),
    { RouteHandler } = Router,
    Layout = React.createClass({
        render() {
            return (
                <div>
                    <RouteHandler />
                    <ErrorModal />
                </div>
            )
        }
    });

module.exports = Layout;
