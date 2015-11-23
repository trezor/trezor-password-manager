'use strict';

var React = require('react'),
    Router = require('react-router'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        getInitialState() {
            return {
                trezorReady: false,
                dropboxReady: false,
                deviceStatus: 'disconnected',
                dialog: 'connect_trezor'
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

                if (request.type === 'trezorConnected') {
                    this.setState({
                       dialog: 'pin_dialog'
                    });
                }

                if (request.type === 'trezorDisconnected') {
                    console.log('trezorDisconnected');
                    this.setState({
                        trezorReady: false,
                        dialog: 'connect_trezor'
                    });
                }

                if (request.type === 'dropboxConnected') {
                    this.setState({
                        dropboxReady: true
                    });
                }

                this.checkStates();
            });

            chrome.runtime.sendMessage({type: 'initPlease'});
        },

        connectDropbox() {
            chrome.runtime.sendMessage({type: 'connectDropbox'});
        },

        connectTrezor() {
            chrome.runtime.sendMessage({type: 'connectTrezor'});
        },

        checkStates() {
            if (this.state.trezorReady && this.state.dropboxReady) {
                this.transitionTo('dashboard');
            }
        },

        render() {

            //find proper dialog and show it

            return (
                <div>
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>

                        <div className={this.state.dialog === 'connect_trezor' ? 'connect_trezor' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor_connect.png'/>

                            <div>Connect your<br/> <strong className='smallcaps'>TREZOR</strong> device.</div>
                        </div>

                        <div className={this.state.dialog === 'pin_dialog' ? 'pin_dialog' : 'hidden_dialog'}>
                            <div className='pin_table'>
                                <div>
                                    <button type='button' key='7' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='8' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='9' onclick='pinAdd(this);'>&#8226;</button>
                                </div>
                                <div>
                                    <button type='button' key='4' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='5' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='6' onclick='pinAdd(this);'>&#8226;</button>
                                </div>
                                <div>
                                    <button type='button' key='1' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='2' onclick='pinAdd(this);'>&#8226;</button>
                                    <button type='button' key='3' onclick='pinAdd(this);'>&#8226;</button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )
        }
    });

module.exports = Home;
