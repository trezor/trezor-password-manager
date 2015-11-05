'use strict';

var React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Header = require('./header/header'),
    Store = require('../components/data_store'),
    Service = require('../components/data_service'),
    Tag_Modal = require('../components/modal_dialogs/tag_modal'),
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
            if (!this.isLogged(localStorage.getItem('public_key'))) {
                this.transitionTo('home');
            } else {
                var responseData = Service.getContextTest();
                this.contextStore = new Store(responseData);
            }
        },

        componentDidMount() {
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

        isLogged(pubkey) {
            return pubkey != null;
        },

        render(){

            return (
                <div>
                    {this.state.ready ?
                        <div>
                            <Tag_Modal />
                            <SidePanel />

                            <section className='content'>
                                <PasswordTable />
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
