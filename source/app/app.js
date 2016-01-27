'use strict';

var React = require('react'),
    Router = require('react-router'),
    { Route } = Router,
    Promise = require('es6-promise').Promise,
    Layout = require('./global_components/layout'),
    Home = require('./home/home'),
    DashboardLayout = require('./dashboard/dashboard_layout'),
    routes = (
        <Route handler={Layout}>
            <Route name='home' path='/' handler={Home}/>
            <Route name='dashboard' path='/dasboard' handler={DashboardLayout}/>
        </Route>
    );


if (typeof window !== 'undefined') {
    window.React = React;
}

Router.run(routes, Handler => {
    React.render(<Handler />, document.body)
});
