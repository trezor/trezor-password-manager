'use strict';

var React = require('react'),
    Router = require('react-router'),
    Trezor = require('trezor.js'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        componentDidMount() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request === 'trezorReady') {
                    this.trezorLoggedTest();
                }
                return true;
            });
            chrome.runtime.sendMessage('initTrezorPlease');
        },

        trezorLoggedTest() {
            this.transitionTo('dashboard');
        },

        render() {
            return (
                <div >
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>
                        <h1>< img src='dist/img/logo.png'/></h1>
                        <a>
                            <div className='dot'></div>
                            <div className='pulse'></div>
                        </a>
                    </div>
                </div>
            )
        }
    });

module.exports = Home;
