/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Router = require('react-router'),
    Store = require('../global_components/data_store'),
    Footer = require('../global_components/footer/footer'),
    PinDialog = require('../global_components/pin_dialog/pin_dialog'),
    {Link} = Router,
    Home = React.createClass({
        mixins: [Router.Navigation],

        getInitialState() {
            return {
                trezorReady: false,
                storageReady: false,
                username: '',
                userDetails: false,
                storageType: 'DROPBOX',
                devices: [],
                deviceStatus: 'disconnected',
                dialog: 'preloading',
                loadingText: 'Waking up ...'
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeMsgHandler);
            // RUN INIT!
            this.sendMessage('initPlease');
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromeMsgHandler);
        },

        chromeMsgHandler(request, sender, sendResponse) {
            switch (request.type) {

                // STORAGE PHASE

                case 'initialized':
                    this.setState({
                        dialog: 'connect_storage',
                        storageReady: true
                    });
                    break;

                case 'setUsername':
                    this.setState({
                        dialog: 'accept_user',
                        username: request.content.username,
                        storageType: request.content.storageType
                    });
                    this.sendMessage('initTrezorPhase');
                    break;

                case 'updateDevices':
                    this.setState({
                        devices: request.content.devices
                    });
                    break;

                case 'disconnected':
                    this.setState({
                        dialog: 'connect_storage',
                        username: '',
                        storageType: '',
                        storageReady: false
                    });
                    break;

                // TREZOR PHASE

                case 'showPinDialog':
                    this.setState({
                        dialog: 'pin_dialog'
                    });
                    chrome.tabs.getCurrent((tab) => {
                        sendResponse({type:'pinVisible', tab: tab});
                    });
                    break;

                case 'hidePinModal':
                    this.setState({
                        dialog: 'loading_dialog'
                    });
                    break;

                case 'loading':
                    this.setState({
                        dialog: 'loading_dialog',
                        loadingText: request.content
                    });
                    break;

                case 'showButtonDialog':
                    this.setState({
                        dialog: 'button_dialog'
                    });
                    break;

                case 'trezorDisconnected':
                    this.setState({
                        trezorReady: false,
                        dialog: 'connect_trezor'
                    });
                    break;

                case 'decryptedContent':
                    window.myStore = new Store(request.content.data, request.content.username, request.content.storageType);
                    this.transitionTo('dashboard');
                    break;
            }
            return true;
        },

        toggleDetails() {
            this.setState({
                userDetails: !this.state.userDetails
            });
        },

        activateDevice(d) {
            this.setState({
                dialog: 'loading_dialog'
            });
            this.sendMessage('activateTrezor', this.state.devices[d].path);
        },

        sendMessage(msgType, msgContent) {
            chrome.runtime.sendMessage({type: msgType, content: msgContent});
        },

        connectDropbox() {
            this.setState({
                dialog: 'preloading'
            });
            this.sendMessage('connectDropbox');
        },

        connectDrive() {
            this.setState({
                dialog: 'preloading'
            });
            this.sendMessage('connectDrive');
        },

        disconnect() {
            this.sendMessage('disconnect');
        },

        checkStates() {
            if (this.state.trezorReady && this.state.storageReady) {
                this.transitionTo('dashboard');
            }
        },

        render() {
            var device_list = Object.keys(this.state.devices).map((key, i = 0) => {
                console.warn(this.state.devices);
                return (
                    <li key={i++}>
                        <a data-tag-key={this.state.devices[key].path}
                           data-tag-name={this.state.devices[key].label}
                           onClick={this.activateDevice.bind(null, key)}
                           onTouchStart={this.activateDevice.bind(null, key)}>
                            <span className={this.state.devices[key].features.major_version === 2 ? 'icon t2' : 'icon t1'}></span>
                            <span className="nav-label">{this.state.devices[key].label}</span>
                        </a>
                    </li>)
            });
            return (
                <div>
                    <div className='background'></div>
                    <div className='home'>
                        <div className={this.state.dialog === 'connect_storage' ? 'connect_storage' : 'hidden_dialog'}>
                            <img src='dist/app-images/t-logo.svg' className='no-circle spaced'/>

                            <div className='dialog-content'>
                                <button className='dropbox-login' onClick={this.connectDropbox}>Sign in with Dropbox
                                </button>
                                <br />
                                <button className='drive-login' onClick={this.connectDrive}>Sign in with Drive
                                </button>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'preloading' ? 'preloading' : 'hidden_dialog'}>
                            <img src='dist/app-images/t-logo.svg' className='no-circle spaced'/>

                            <div className='dialog-content'>
                                <span className='spinner'></span>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'accept_user' ? 'accept_user' : 'hidden_dialog'}>
                            <img src={'dist/app-images/' + this.state.storageType.toLowerCase() + '.svg'} />
                            <div>
                                <span>Signed as</span>
                                <h3 className={this.state.userDetails ? 'active' : ''}>
                                    <b onClick={this.toggleDetails}>{this.state.username}</b>
                                </h3>
                                <br />
                                <div className={this.state.userDetails ? '' : 'hidden'}>
                                    <br/>
                                    <button className='no-style' onClick={this.disconnect}>
                                        {this.state.storageType === 'DROPBOX' ? <p>Logout and use different account.</p> : <p>Switch to different service.</p>}
                                    </button>
                                    <div>
                                    {this.state.storageType === 'DROPBOX' ? <i>(Manage your accounts via Dropbox.com)</i> : <div><b>For logout or switch user follow instructions:</b><ol><li>In the upper right corner of the browser window, click the button for the current person.</li><li>Click Switch person.</li><li>Choose the person you want to switch to.</li><a href='https://support.google.com/chrome/answer/2364824?hl=en' rel='noopener noreferrer' target='_blank'>More info</a></ol></div>}
                                    </div>
                                </div>
                                <div className={this.state.devices.length ? '' : 'hidden'}>
                                    <span>Choose from devices</span>
                                    <ul className="dev-list">{device_list}</ul>
                                </div>
                                <div className={this.state.devices.length ? 'hidden' : ''}>
                                    <span className="connect_trezor"><img src='dist/app-images/connect-trezor.svg'/> Connect TREZOR to continue</span>
                                </div>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'pin_dialog' ? 'pin_dialog' : 'hidden_dialog'}>
                            <PinDialog />
                        </div>

                        <div className={this.state.dialog === 'loading_dialog' ? 'loading_dialog' : 'hidden_dialog'}>
                            <span className='spinner'></span>
                            <h1>{this.state.loadingText}</h1>
                        </div>

                        <div className={this.state.dialog === 'button_dialog' ? 'button_dialog' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor_button.png'/>

                            <h1>Follow instructions on your <br/> <b className='smallcaps'>TREZOR</b> device.</h1>
                        </div>

                        <Footer footerStyle='white'/>
                    </div>
                </div>
            )
        }
    });

module.exports = Home;
