"use strict";

let React = require('react'),
    Router = require('react-router'),
    { RouteHandler } = Router,
    Layout = React.createClass({
        render() {
            return (
                <div>
                    <RouteHandler />
                </div>
            )
        }
    });

module.exports = Layout;
