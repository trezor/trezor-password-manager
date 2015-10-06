"use strict";

var React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Header = require('./header/header'),
    events = require('events'),
    eventEmitter = new events.EventEmitter(),
    {Link} = Router,

    DashboardLayout = React.createClass({
        mixins: [Router.Navigation],

        componentWillMount() {
            if (!this.isLogged(sessionStorage.getItem("public_key"))) {
                this.transitionTo('home');
            }
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
                    <SidePanel eventEmitter={eventEmitter}/>

                    <section className="content">
                        <Header eventEmitter={eventEmitter}/>
                        <PasswordTable eventEmitter={eventEmitter}/>
                    </section>
                </div>
            )
        }
    });

module.exports = DashboardLayout;
