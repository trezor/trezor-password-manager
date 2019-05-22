/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  Footer = React.createClass({
    componentDidMount() {},

    render() {
      let date = new Date();

      return (
        <div className={'footer ' + this.props.footerStyle}>
          TREZOR Password Manager © {date.getFullYear()} |{' '}
          <a href="https://trezor.io/support/" rel="noopener noreferrer" target="_blank">
            Support Center
          </a>{' '}
          | Logos provided by Clearbit
        </div>
      );
    }
  });

module.exports = Footer;
