'use strict';

var React = require('react'),
    Router = require('react-router'),
    Trezor = require('trezor.js'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        getInitialState() {
            return {
                trezorReady: false,
                dropboxReady: false
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                if (request === 'trezorReady') {
                    this.setState({
                        trezorReady: true
                    });
                }
                if (request === 'dropboxReady') {
                    this.setState({
                        dropboxReady: true
                    });
                }
                this.checkStates();
            });

            chrome.runtime.sendMessage('initPlease');
        },

        connectDropbox() {
            chrome.runtime.sendMessage('connectDropbox');
        },

        connectTrezor() {
            chrome.runtime.sendMessage('connectTrezor');
        },

        checkStates() {
            if (this.state.trezorReady && this.state.dropboxReady) {
                this.transitionTo('dashboard');
            }
        },

        render() {
            var dropboxStatus = this.state.dropboxReady ? 'Connected' : 'Disconnected',
                trezorReady = this.state.trezorReady ? 'Connected' : 'Disconnected';

            return (
                <div>
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>
                        <div className='panel dropbox' onClick={this.connectDropbox}>
                            <img src="dist/app-images/dropbox.svg"/>
                            <span>{dropboxStatus}</span>
                        </div>
                        <div className='panel trezor' onClick={this.connectTrezor}>
                            <img src="dist/app-images/trezor.svg"/>
                            <span>{trezorReady}</span>
                        </div>
                    </div>
                </div>
            )
        }
    });

module.exports = Home;
