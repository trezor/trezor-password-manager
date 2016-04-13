'use strict';

const mailHeaderTemplate = 'Hi SatoshiLabs,%0D%0A%0D%0AI have experienced some errors with TREZOR Password Manager. It\'s impossible to solve it by your "Simple steps solution".%0D%0A%0D%0AProblem is titled and described as:%0D%0A%0D%0A',
    mailFooterTemplate = '%0D%0A%0D%0ALooking forward for your reply and thank you for your time!%0D%0A%0D%0ABest regards,%0D%0A[MY NAME]';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    Button = require('react-bootstrap').Button,
    ErrorModal = React.createClass({

        getInitialState() {
            return {
                showErrorModal: false,
                errorTitle: 'Error!',
                errorSolutionSteps: [
                    'Check your connection.',
                    'Make sure you have TREZOR Chrome Extension installed.',
                    'Try to restart TREZOR Password Manager.',
                    'In case of ongoing problems contact our support.'
                ],
                restartAction: true,
                supportAction: true,
                redirectAction: false,
                closeAction: true,
                supportDefaultMailText: mailHeaderTemplate + window.tpmErroLog + mailFooterTemplate
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeErrorModalMsgHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromeErrorModalMsgHandler);
        },

        isOnline() {
            return navigator.onLine
        },

        errorHandler(content) {
            switch (content.code) {
                case 'T_LIST':
                    if (this.isOnline()) {
                        return {
                            errorTitle: 'Houston, we have a problem ...',
                            solution: [
                                'Check your connection.',
                                'Make sure you have TREZOR Chrome Extension installed.',
                                'Try to restart TREZOR Password Manager.',
                                'In case of ongoing problems contact our support.'
                            ],
                            restartAction: true,
                            supportAction: true,
                            redirectAction: true,
                            redirectText: 'Chrome Extension',
                            redirectTo: 'https://chrome.google.com/webstore/detail/trezor-chrome-extension/jcjjhjgimijdkoamemaghajlhegmoclj',
                            supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                        };
                    }
                    return {
                        errorTitle: 'You are offline',
                        solution: [
                            'Connect to the Internet.',
                            'Try to restart TREZOR Password Manager.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: false,
                        closeAction: false,
                        redirectText: '',
                        redirectTo: '',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_NOT_INIT':
                    return {
                        errorTitle: 'TREZOR not initialized',
                        solution: [
                            'Go to mytrezor.com.',
                            'Initialize TREZOR device.',
                            'Try again.'
                        ],
                        restartAction: false,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'mytrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_OLD_VERSION':
                    return {
                        errorTitle: 'Old firmware version',
                        solution: [
                            'Go to mytrezor.com.',
                            'Check and update your firmware.',
                            'Try again.'
                        ],
                        restartAction: false,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: 'MyTrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_NO_TRANSPORT':
                    return {
                        errorTitle: 'TREZOR Chrome Extension not installed',
                        solution: [
                            'Go to Chrome web store.',
                            'Download and install TREZOR Chrome Extension.',
                            'Restart TREZOR Password Manager.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'Chrome Extension',
                        redirectTo: 'https://chrome.google.com/webstore/detail/trezor-chrome-extension/jcjjhjgimijdkoamemaghajlhegmoclj',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_BOOTLOADER':
                    return {
                        errorTitle: 'You are in bootloader mode',
                        solution: [
                            'If you really want to upgrade firmware go to mytrezor.com.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: 'mytrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_DEVICE':
                    return {
                        errorTitle: 'Device problem detected',
                        solution: [
                            'Try using mytrezor.com to check whether your device works fine.',
                            'In case of ongoing problems contact our support.',
                            'Try restarting TREZOR Password Manager.'
                        ],
                        restartAction: true,
                        supportAction: true,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'mytrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_INVALID_TOKEN':
                    return {
                        errorTitle: 'Problem with Dropbox detected',
                        solution: [
                            'Clear browser cache and restart Chrome.',
                            'Try to re-login to your Dropbox account.',
                            'Restart TREZOR Password Manager.',
                            'In case of ongoing problems contact our support.'
                        ],
                        restartAction: true,
                        supportAction: true,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'Dropbox.com',
                        redirectTo: 'https://www.dropbox.com/',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_OVER_QUOTA':
                    return {
                        errorTitle: 'Not enough Dropbox space',
                        solution: [
                            'Clean up your Dropbox folder or buy more space.',
                            'Sign in with a different account.',
                            'Restart TREZOR Password Manager.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'Dropbox.com',
                        redirectTo: 'https://www.dropbox.com/',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_RATE_LIMITED':
                    return {
                        errorTitle: 'Dropbox rate limit reached',
                        solution: [
                            'You have reached Dropbox limits.',
                            'Check Dropbox.com if service is running.',
                            'Get in touch with Dropbox support.'
                        ],
                        restartAction: false,
                        supportAction: true,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: 'Dropbox.com',
                        redirectTo: 'https://www.dropbox.com/',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_NETWORK_ERROR':
                    if (this.isOnline()) {
                        return {
                            errorTitle: 'Dropbox is down (or very slow)',
                            solution: [
                                'Check your internet connection.',
                                'Check Dropbox service status.'
                            ],
                            restartAction: false,
                            supportAction: false,
                            redirectAction: true,
                            closeAction: true,
                            redirectText: 'Dropbox.com',
                            redirectTo: 'https://www.dropbox.com/',
                            supportDefaultMailText: ''
                        };
                    } else {
                        return {
                            errorTitle: 'You are offline',
                            solution: [
                                'Connect to the Internet.',
                                'Re-Login to TREZOR Password Manager.'
                            ],
                            restartAction: true,
                            supportAction: false,
                            redirectAction: false,
                            closeAction: true,
                            redirectText: '',
                            redirectTo: '',
                            supportDefaultMailText: ''
                        };
                    }
                    break;
            }
            return {
                errorTitle: 'Error',
                errorSolutionSteps: [
                    'Check your connection.',
                    'Make sure you have TREZOR Chrome Extension installed.',
                    'Try to restart TREZOR Password Manager.',
                    'In case of ongoing problems contact our support.'
                ],
                restartAction: true,
                supportAction: true,
                supportDefaultMailText: mailHeaderTemplate + JSON.stringify(content) + window.tpmErroLog + mailFooterTemplate
            };
        },

        chromeErrorModalMsgHandler(request, sender, sendResponse) {
            if (request.type === 'errorMsg') {
                let error = this.errorHandler(request.content);
                this.setState({
                    showErrorModal: true,
                    errorTitle: error.errorTitle,
                    errorSolutionSteps: error.solution,
                    restartAction: error.restartAction,
                    supportAction: error.supportAction,
                    closeAction: error.closeAction,
                    redirectAction: error.redirectAction,
                    redirectText: error.redirectText,
                    redirectTo: error.redirectTo,
                    supportDefaultMailText: error.supportDefaultMailText
                });
            }
        },

        closeErrorModal(e) {
            if (this.state.closeAction) {
                this.setState({
                    showErrorModal: false
                });
            } else {
                e.preventDefault();
            }

        },

        restartApp() {
            chrome.runtime.reload();
        },

        render(){
            let solution = this.state.errorSolutionSteps.map((key, i = 0) => {
                i++;
                return (<li key={i}>{key}</li>)
            });
            return (
                <div>
                    <Modal show={this.state.showErrorModal} onHide={this.closeErrorModal}
                           dialogClassName='error-modal-dialog'>
                        <Modal.Header>
                            <Modal.Title id='contained-modal-title-sm'><i
                                className='ion-bug'></i> {this.state.errorTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <b>Simple step solution:</b>
                            <ul>
                                {solution}
                            </ul>
                        </Modal.Body>

                        <div className='btn-controls'>
                            {this.state.redirectAction ? <a href={this.state.redirectTo} target='_blank'
                                                            className='button shadow blue-btn'>{this.state.redirectText}</a> : ''}
                            {this.state.supportAction ? <a className='button shadow green-btn'
                                                           href={'mailto:support@satoshilabs.com?subject=TREZOR Password Manager bug report&body=' + this.state.supportDefaultMailText}>Contact
                                support</a> : ''}
                            {this.state.restartAction ?
                                <Button className='button shadow red-btn' onClick={this.restartApp}>Restart
                                    App</Button> : ''}
                            {this.state.closeAction ? <Button className='button shadow white-btn'
                                                              onClick={this.closeErrorModal}>Close</Button> : ''}
                        </div>
                    </Modal>
                </div>
            )
        }
    });

module.exports = ErrorModal;
