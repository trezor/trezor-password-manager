'use strict';

var React = require('react'),
    Footer = React.createClass({

        componentDidMount() {

        },

        render(){
            return (<div className={'footer ' + this.props.footerStyle}>
                TREZOR Guard © 2016 | <a href='mailto:info@bitcointrezor.com'>info@bitcointrezor.com</a>
            </div>)
        }
    });

module.exports = Footer;
