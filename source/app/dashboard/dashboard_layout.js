/*
 * Copyright (c) Peter Privalinec, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Service = require('../global_components/data_service'),
    Footer = require('../global_components/footer/footer'),
    TagModal = require('../global_components/modal_dialogs/tag_modal'),
    PinModal = require('../global_components/modal_dialogs/pin_modal'),

    DashboardLayout = React.createClass({
        mixins: [Router.Navigation],

        getInitialState() {
            return {
                ready: false
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeDashboardMsgHandler);
            if (this.storeExists()) {
                this.setState({ready: true});
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
                    this.setState({
                        ready: false
                    });
                    window.myStore = null;
                    this.transitionTo('home');
                    break;
            }
        },

        contextReady() {
            this.setState({
                ready: true
            });
        },

        storeExists() {
            return window.myStore != null;
        },

        render(){
            return (
                <div className='dashboard-layout'>
                    {this.state.ready ?
                        <div>
                            <TagModal />
                            <PinModal />
                            <SidePanel />
                            <section className='content'>
                                <PasswordTable />
                                <Footer footerStyle='black'/>
                            </section>
                        </div>
                        :
                        <div>Loading</div>
                    }
                </div>
            )
        }
    });

module.exports = DashboardLayout;
