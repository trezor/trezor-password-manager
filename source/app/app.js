'use strict';

var React = require('react'),
    Router = require('react-router'),
    { Route } = Router,
    Promise = require('es6-promise').Promise,
    Layout = require('./global_components/layout'),
    Home = require('./home/home'),
    DashboardLayout = require('./dashboard/dashboard_layout'),
    AlertBox = require('./global_components/alert_box/alert_box'),
    routes = (
        <Route handler={Layout}>
            <Route name='home' path='/' handler={Home}/>
            <Route name='dashboard' path='/dashboard' handler={DashboardLayout}/>
        </Route>
    );


if (typeof window !== 'undefined') {
    window.React = React;
}

Router.run(routes, Handler => {
    React.render(<div><AlertBox /><Handler /></div>, document.body)
});
