/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    PinDialog = React.createClass({

        getInitialState() {
            return {
                pinDialogText: 'Please enter your PIN.',
                pin: ''
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromePinDialogMsgHandler);
            window.addEventListener('keydown', this.pinKeydownHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromePinDialogMsgHandler);
            window.removeEventListener('keydown', this.pinKeydownHandler);
        },

        sendMessage(msgType, msgContent) {
            chrome.runtime.sendMessage({type: msgType, content: msgContent});
        },

        chromePinDialogMsgHandler(request, sender, sendResponse) {
            switch (request.type) {
                case 'wrongPin':
                    this.setState({
                        pinDialogText: 'Wrong PIN!',
                        pin: ''
                    });
                    break;
            }
            return true;
        },

        pinKeydownHandler(ev) {
            ev.preventDefault();
            var keyCode = ev.keyCode;
            if (keyCode > 96 && keyCode < 106) {
                keyCode = keyCode - 48;
            }
            if (keyCode > 48 && keyCode < 58) {
                this.pinAdd(String.fromCharCode(keyCode));
            }
            if (keyCode === 8) {
                this.pinBackspace();
            }
            if (keyCode === 13) {
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

        highlightKeyPress(val) {
            var el = document.getElementById(val.toString());
            el.classList.add('active');
            setTimeout(() => {
                el.classList.remove('active');
            }, 140);
        },

        submitPin() {
            this.sendMessage('trezorPin', this.state.pin);
            this.setState({
                pin: ''
            });
        },

        pinBackspace() {
            this.setState({
                pin: this.state.pin.slice(0, -1)
            });
            this.highlightKeyPress('backspace');
        },

        hideText(text) {
            var stars = '';
            for (var i = 0; i < text.length; i++) {
                stars = stars + '•';
            }
            return stars;
        },

        render(){
            return (
                <div className='pin_dialog'>
                    <div className='pin_table_header'>
                        {this.state.pinDialogText}
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
                </div>)
        }
    });

module.exports = PinDialog;
