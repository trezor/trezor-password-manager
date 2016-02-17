'use strict';

var React = require('react'),
    Footer = React.createClass({

        componentDidMount() {

        },

        render(){
            return (<div className={'footer ' + this.props.footerStyle}>
                TREZOR Password Manager © 2016 | <a href='mailto:support@satoshilabs.com'>support@satoshilabs.com</a>
            </div>)
        }
    });

module.exports = Footer;
