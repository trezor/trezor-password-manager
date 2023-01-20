/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  Router = require('react-router'),
  PasswordTable = require('./password_table/password_table'),
  SidePanel = require('./side_panel/side_panel'),
  Footer = require('../global_components/footer/footer'),
  TagModal = require('../global_components/modal_dialogs/tag_modal'),
  ImportModal = require('../global_components/modal_dialogs/import_modal'),
  EntryModal = require('../global_components/modal_dialogs/entry_modal'),
  PinModal = require('../global_components/modal_dialogs/pin_modal'),
  DashboardLayout = React.createClass({
    mixins: [Router.Navigation],

    getInitialState() {
      return {
        ready: false
      };
    },

    componentDidMount() {
      if (this.storeExists()) {
        this.setState({ ready: true });
        chrome.runtime.onMessage.addListener(this.chromeDashboardMsgHandler);
      } else {
        this.transitionTo('home');
      }
    },

    componentWillUnmount() {
      chrome.runtime.onMessage.removeListener(this.chromeDashboardMsgHandler);
    },

    chromeDashboardMsgHandler(request, sender, sendResponse) {
      switch (request.type) {
        case 'trezorDisconnected':
        case 'disconnected':
          this.setState({
            ready: false
          });
          window.myStore = undefined;
          this.transitionTo('home');
          break;
      }
    },

    storeExists() {
      return typeof window.myStore !== 'undefined';
    },

    render() {
      return (
        <div className="dashboard-layout">
          {this.state.ready ? (
            <div>
              <TagModal />
              <ImportModal />
              <EntryModal />
              <PinModal />
              <SidePanel />
              <section className="content">
             /*   <div
                  style={{
                    backgroundColor: 'red',
                    color: 'white !important',
                    padding: '8px',
                    lineHeight: 1.4
                  }}
                >
                  Trezor password manager will be deprecated by the end of June 2023. Please follow
                  &#160;
                  <a
                    href="https://trezor.io/learn/a/trezor-password-manager"
                    target="_blank"
                    style={{
                      color: 'white',
                      textDecoration: 'underline'
                    }}
                  >
                    our guide
                  </a>
                  &#160; to learn how to move all your data.
                </div>
               */
            
                <PasswordTable />
                <Footer footerStyle="black" />
              </section>
            </div>
          ) : (
            <div>
              <div className="background" />
              <div className="loading_dialog">
                <span className="spinner" />
              </div>
            </div>
          )}
        </div>
      );
    }
  });

module.exports = DashboardLayout;
