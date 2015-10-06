"use strict";

let React = require('react'),
    Router = require('react-router'),
    PasswordTable = require('./password_table/password_table'),
    SidePanel = require('./side_panel/side_panel'),
    Header = require('./header/header'),

    DashboardLayout = React.createClass({

        render(){
            return (
                <div>
                    <SidePanel />

                    <section className="content">
                        <Header />
                        <PasswordTable />
                    </section>
                </div>
            )
        }
    });

module.exports = DashboardLayout;
