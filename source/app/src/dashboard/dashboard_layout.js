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
            eventEmitter.setMaxListeners(0);
            eventEmitter.on('update', this.contextReady);
            if (!this.isLogged(sessionStorage.getItem('public_key'))) {
                this.transitionTo('home');
            } else {
                Service.getContextTest().then(response => {
                    this.context = new Store(response, eventEmitter);
                    eventEmitter.emit('contextInit', this.context);
                });
            }
        },

        contextReady() {
            this.setState({
                ready: true
            });
        },

        isLogged(pubkey) {
            if (pubkey != null) {
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
                            <Tag_Modal eventEmitter={eventEmitter}/>
                            <SidePanel eventEmitter={eventEmitter}/>

                            <section className='content'>
                                <PasswordTable eventEmitter={eventEmitter}/>
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
