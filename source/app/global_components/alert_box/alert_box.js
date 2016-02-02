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

        chromeMsgHandler(request, sender, sendResponse) {
            if (request.type === 'showAlert') {
                switch (request.content) {
                    case 'OLD_VERSION':
                        this.setState({
                            alertVisible: true,
                            alertTitle: 'Update TREZOR EXTENSION!',
                            alertText: 'You are using unsupported TREZOR Extension. Please, update your TREZOR EXTENSION to version 1.0.7 or higher.'
                        });
                        break;
                }
            }

        },

        handleAlertDismiss() {
            this.setState({alertVisible: false});
        },

        render(){
            if (this.state.alertVisible) {
                return (
                    <Alert bsStyle="danger" onDismiss={this.handleAlertDismiss}>
                        <h4>{this.state.alertTitle}</h4>

                        <p>{this.state.alertText}</p>
                    </Alert>
                );
            } else {
                return null;
            }
        }
    });

module.exports = Alert_Box;
