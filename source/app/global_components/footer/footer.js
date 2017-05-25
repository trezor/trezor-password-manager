/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Footer = React.createClass({

        componentDidMount() {

        },

        render(){
            return (<div className={'footer ' + this.props.footerStyle}>
                TREZOR Password Manager © 2017 | <a href='mailto:support@satoshilabs.com'>support@satoshilabs.com</a>
            </div>)
        }
    });

module.exports = Footer;
