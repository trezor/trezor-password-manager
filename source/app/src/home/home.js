'use strict';

var React = require('react'),
    Router = require('react-router'),
    Trezor = require('trezor.js'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        componentWillMount() {
            window.trezorConnect = this.trezorLogged;
        },

        trezorLogged(trezorResponse){
            if (trezorResponse.success) {
                window.trezorResponse = trezorResponse;
                sessionStorage.setItem('public_key', window.trezorResponse.public_key);
                this.transitionTo('dashboard');
            }
        },

        render(){
            return (
                <div >
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>
                        <h1>< img src='dist/img/logo.png'/></h1>
                        <a onClick={TrezorConnect.requestLogin.bind(null, '', '', '', 'trezorConnect')}>
                            <div className='dot'></div>
                            <div className='pulse'></div>
                        </a>
                    </div>
                </div>
            )
        }
    });

module.exports = Home;
