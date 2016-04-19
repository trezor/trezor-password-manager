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
                dropboxReady: false,
                dropboxUsername: '',
                deviceStatus: 'disconnected',
                dialog: 'preloading',
                loadingText: 'Doing math ...'
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
                // DROPBOX PHASE
                case 'dropboxInitialized':
                    this.setState({
                        dialog: 'connect_dropbox',
                        dropboxReady: true
                    });
                    break;

                case 'dropboxDisconnected':
                    this.setState({
                        dialog: 'connect_dropbox',
                        dropboxUsername: '',
                        dropboxReady: false
                    });
                    break;

                case 'setDropboxUsername':
                    this.setState({
                        dialog: 'accept_dropbox_user',
                        dropboxUsername: request.content
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

                case 'trezorPin':
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
                    window.myStore = new Store(request.content);
                    this.transitionTo('dashboard');
                    break;
            }
            return true;
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

        disconnectDropbox() {
            this.sendMessage('disconnectDropbox');
        },

        initTrezorPhase() {
            this.sendMessage('initTrezorPhase');
        },

        checkStates() {
            if (this.state.trezorReady && this.state.dropboxReady) {
                this.transitionTo('dashboard');
            }
        },

        restartBackground() {
            chrome.runtime.reload();
        },

        render() {
            return (
                <div>
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>

                        <div className={this.state.dialog === 'connect_dropbox' ? 'connect_dropbox' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor.svg' className='no-circle'/>

                            <div className='dialog-content'>
                                <h1><b></b>Password Manager</h1>
                                <button className='dropbox-login' onClick={this.connectDropbox}>Sign in with Dropbox
                                </button>
                                <br />
                                <button className='no-style'><a href='https://www.dropbox.com' target='_blank'>I don't
                                    have a Dropbox account.</a></button>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'preloading' ? 'preloading' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor.svg' className='no-circle'/>

                            <div className='dialog-content'>
                                <h1><b></b>Password Manager</h1>
                                <span className='spinner'></span>
                            </div>
                        </div>

                        <div
                            className={this.state.dialog === 'accept_dropbox_user' ? 'accept_dropbox_user' : 'hidden_dialog'}>
                            <img src='dist/app-images/dropbox.svg'/>

                            <div>
                                <button onClick={this.initTrezorPhase} className='accept-btn'>Continue as
                                    <b> {this.state.dropboxUsername}</b>
                                </button>
                                <br />
                                <button className='no-style' onClick={this.disconnectDropbox}>Use different
                                    account.
                                </button>
                                <i>(Manage your accounts via Dropbox.com)</i>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'connect_trezor' ? 'connect_trezor' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor_connect.png'/>

                            <h1>Connect your <br/> <b className='smallcaps'>TREZOR</b> device.</h1>
                            <br />
                            <button className='no-style'><a href='https://www.buytrezor.com?a=tpm' target='_blank'>I don't
                                have a TREZOR device.</a></button>
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
