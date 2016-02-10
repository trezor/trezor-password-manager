'use strict';

var React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Header = require('./header/header'),
    Store = require('../global_components/data_store'),
    Service = require('../global_components/data_service'),
    Footer = require('../global_components/footer/footer'),
    Tag_Modal = require('../global_components/modal_dialogs/tag_modal'),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    {Link} = Router,

    DashboardLayout = React.createClass({
        mixins: [Router.Navigation],

        getInitialState() {
            return {
                ready: false
            }
        },

        componentWillMount() {
            eventEmitter.on('update', this.contextReady);
            window.eventEmitter = eventEmitter;
            if (!this.hasContext()) {
                this.transitionTo('home');
            } else {
                var responseData = Service.getContext();
                this.contextStore = new Store(responseData);
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                switch (request.type) {
                    case 'trezorDisconnected':
                        window.decryptedContent = null;
                        this.setState({
                            ready: false
                        });
                        this.transitionTo('home');
                        break;
                }
            });
            eventEmitter.emit('contextInit', this.contextStore);
        },

        componentWillUnmount() {
            eventEmitter.removeListener('update', this.contextReady);
        },

        contextReady() {
            this.setState({
                ready: true
            });
        },

        hasContext() {
            return window.decryptedContent != null;
        },

        render(){

            return (
                <div className='dashboard-layout'>
                    {this.state.ready ?
                        <div>
                            <Tag_Modal />
                            <SidePanel />

                            <section className='content'>
                                <PasswordTable />
                            </section>
                            <Footer footerStyle='black'/>
                        </div>
                        :
                        <div>Loading</div>
                    }
                </div>
            )
        }
    });

module.exports = DashboardLayout;
