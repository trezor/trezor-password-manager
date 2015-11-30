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
                dropboxUsername: '',
                deviceStatus: 'disconnected',
                dialog: 'connect_dropbox',
                pin: ''
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

                // DROPBOX PHASE

                if (request.type === 'dropboxConnected') {
                    this.setState({
                        dropboxReady: true
                    });
                }

                if(request.type === 'setDropboxUsername') {
                    this.setState({
                        dialog: 'accept_dropbox_user',
                        dropboxUsername: request.content
                    });
                }

                // TREZOR PHASE

                if (request.type === 'showPinDialog') {
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

            });

            // RUN INIT!

            this.sendMessage('initPlease');
        },

        sendMessage(msgType, msgContent) {
            console.log('[app] msg send:', msgType, msgContent);
            chrome.runtime.sendMessage({type: msgType, content: msgContent});
        },

        connectDropbox() {
            this.sendMessage('connectDropbox');
        },

        connectTrezor() {
            this.sendMessage('connectTrezor');
        },

        checkStates() {
            if (this.state.trezorReady && this.state.dropboxReady) {
                this.transitionTo('dashboard');
            }
        },

        pinKeydownHandler(ev) {
            if ((ev.keyCode > 48 && ev.keyCode < 58) || (ev.keyCode > 96 && ev.keyCode < 106)) {
                this.pinAdd(String.fromCharCode(ev.keyCode));
            }
            if (ev.keyCode == 8) {
                this.pinBackspace();
            }
            if (ev.keyCode == 13) {
                this.submitPin();
            }
        },

        pinAdd(val) {
            if (this.state.pin.length < 9) {
                this.setState({
                    pin: this.state.pin + val.toString()
                });
            }
            this.highlightKeyPress(val);
        },

        hideText(text) {
            var stars = '';
            for (var i = 0; i < text.length; i++) {
                stars = stars + '*';
            }
            return stars;
        },

        highlightKeyPress(val) {
            var el = document.getElementById(val.toString());
            el.classList.add('active');
            setTimeout(() => {
                el.classList.remove('active');
            }, 140);
        },

        pinBackspace() {
            this.setState({
                pin: this.state.pin.slice(0, -1)
            });
            this.highlightKeyPress('backspace');
        },

        submitPin() {
            this.sendMessage('trezorPin', this.state.pin);
        },

        render() {

            //add listener for input keys:
            if (this.state.dialog === 'pin_dialog') window.addEventListener('keydown', this.pinKeydownHandler);

            return (
                <div>
                    <div className='overlay-hill'></div>
                    <div className='overlay-color'></div>
                    <div className='home'>

                        <div className={this.state.dialog === 'connect_dropbox' ? 'connect_dropbox' : 'hidden_dialog'}>
                            <img src='dist/app-images/dropbox.svg'/>

                            <div>Connect with your<br/> <strong className='smallcaps'>Dropbox</strong> account.</div>
                        </div>

                        <div
                            className={this.state.dialog === 'accept_dropbox_user' ? 'connect_dropbox' : 'hidden_dialog'}>
                            <div>
                                <button>{'Continue as ' + this.state.dropboxUsername}</button>
                                <br />
                                <button>Switch user</button>
                            </div>
                        </div>

                        <div className={this.state.dialog === 'connect_trezor' ? 'connect_trezor' : 'hidden_dialog'}>
                            <img src='dist/app-images/trezor_connect.png'/>

                            <div>Connect your<br/> <strong className='smallcaps'>TREZOR</strong> device.</div>
                        </div>

                        <div className={this.state.dialog === 'pin_dialog' ? 'pin_dialog' : 'hidden_dialog'}>
                            <div className='pin_table_header'>
                                Please enter your PIN.
                            </div>
                            <div className="pin_table_subheader">
                                Look at the device for number positions.
                            </div>
                            <div className='pin_password'>
                                <span className='password_text'>{this.hideText(this.state.pin)}</span>
                                <span className='blinking_cursor'></span>
                            </div>
                            <div className='pin_table'>
                                <div>
                                    <button type='button' id='7' onClick={this.pinAdd.bind(null, 7)}>&#8226;</button>
                                    <button type='button' id='8' onClick={this.pinAdd.bind(null, 8)}>&#8226;</button>
                                    <button type='button' id='9' onClick={this.pinAdd.bind(null, 9)}>&#8226;</button>
                                </div>
                                <div>
                                    <button type='button' id='4' onClick={this.pinAdd.bind(null, 4)}>&#8226;</button>
                                    <button type='button' id='5' onClick={this.pinAdd.bind(null, 5)}>&#8226;</button>
                                    <button type='button' id='6' onClick={this.pinAdd.bind(null, 6)}>&#8226;</button>
                                </div>
                                <div>
                                    <button type='button' id='1' onClick={this.pinAdd.bind(null, 1)}>&#8226;</button>
                                    <button type='button' id='2' onClick={this.pinAdd.bind(null, 2)}>&#8226;</button>
                                    <button type='button' id='3' onClick={this.pinAdd.bind(null, 3)}>&#8226;</button>
                                </div>
                            </div>
                            <div className='pin_footer'>
                                <button type='button' id='enter' onClick={this.submitPin}>ENTER</button>
                                <button type='button' id='backspace' onClick={this.pinBackspace}>&#9003;</button>

                            </div>
                        </div>

                    </div>
                </div>
            )
        }
    });

module.exports = Home;
