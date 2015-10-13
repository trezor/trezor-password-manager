"use strict";

var React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Header = require('./header/header'),
    Store = require('../components/data_store'),
    Service = require('../components/data_service'),
    Popup = require('../components/modal_dialogs/entry_popup'),
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
            eventEmitter.setMaxListeners(0);
            eventEmitter.on('update', this.contextReady);
            if (!this.isLogged(sessionStorage.getItem("public_key"))) {
                this.transitionTo('home');
            } else {
                Service.getContextTest().then(response => {
                    var Context = new Store(response, eventEmitter);
                    eventEmitter.emit('contextInit', Context);
                });
            }
        },

        contextReady() {
            this.setState({
                ready: true
            });
        },

        isLogged(pubkey) {
            if (pubkey != null || pubkey != undefined) {
                return true
            } else {
                return false;
            }
        },

        render(){
            return (
                <div>
                    {this.state.ready ?
                        <div>
                            <Popup eventEmitter={eventEmitter} />
                            <SidePanel eventEmitter={eventEmitter} />

                            <section className="content">
                                <Header eventEmitter={eventEmitter} />
                                <PasswordTable eventEmitter={eventEmitter} />
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
