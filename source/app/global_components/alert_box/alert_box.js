'use strict';

var React = require('react'),
    Alert = require('react-bootstrap').Alert,

    Alert_Box = React.createClass({

        getInitialState() {
            return {
                alertVisible: false,
                alertTitle: '',
                alertText: ''
            };
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeMsgHandler);
        },

        restartBackground() {
            chrome.runtime.reload();
        },

        chromeMsgHandler(request, sender, sendResponse) {
            if (request.type === 'showAlert') {
                this.setState({
                    alertType: request.content,
                    alertVisible: true

                });
            }
        },

        handleAlertDismiss() {
            this.setState({alertVisible: false});
        },

        render(){
            if (this.state.alertVisible) {
                return (
                    <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                        {this.state.alertType === 'OLD_VERSION' &&
                        <span>
                            <h4>Update TREZOR Chrome Extension</h4>
                            <p>You are using unsupported TREZOR Extension. Please, update your TREZOR EXTENSION to
                                version 1.0.10 or higher and <a href="#" onClick={this.restartBackground}>restart Password Manager</a>.</p>
                            </span>
                        }

                        {this.state.alertType === 'NO_TRANSPORT' &&
                        <span>
                            <h4>Missing TREZOR Chrome Extension!</h4>
                            <p>You are missing importatnt dependency TREZOR Chrome Extension, go to Chrome web store,
                                install it and <a href="#" onClick={this.restartBackground}>restart Password Manager</a>.</p>
                            </span>
                        }

                    </Alert>
                );
            } else {
                return null;
            }
        }
    });

module.exports = Alert_Box;
