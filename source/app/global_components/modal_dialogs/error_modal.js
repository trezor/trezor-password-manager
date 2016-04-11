'use strict';

const mailHeaderTemplate = 'Hi Vojtech,%0D%0A%0D%0AI have experienced some errors with TREZOR Password Manager. It\'s impossible to solve it by your "Simple steps solution".%0D%0A%0D%0AProblem is titled and described as:%0D%0A%0D%0A',
    mailFooterTemplate = '%0D%0A%0D%0ALooking forward for your reply and thank you for your time!%0D%0A%0D%0ABest regards,%0D%0A[MY NAME]';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    Button = require('react-bootstrap').Button,
    ErrorModal = React.createClass({

        getInitialState() {
            return {
                showErrorModal: false,
                errorTitle: 'Error! It\'s all peter\'s fault ...',
                errorSolutionSteps: [
                    'It seems, you are online, but check your connection.',
                    'Make sure you have installed TREZOR Chrome Extension from chrome web store.',
                    'Try to restart the App - TREZOR password manager.',
                    'Get in touch with our support specialists.'
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
                                'It seems, you are online, but check your connection.',
                                'Make sure you have installed TREZOR Chrome Extension from chrome web store.',
                                'Try to restart the App - TREZOR password manager.',
                                'Write to our support specialists.'
                            ],
                            restartAction: true,
                            supportAction: true,
                            redirectAction: true,
                            redirectText: 'Chrome Extension',
                            redirectTo: 'https://chrome.google.com/webstore/detail/trezor-chrome-extension/jcjjhjgimijdkoamemaghajlhegmoclj?hl=en',
                            supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                        };
                    }
                    return {
                        errorTitle: 'D\'oh, you are offline ...',
                        solution: [
                            'Connect to Internet.',
                            'Then restart the App - TREZOR password manager.'
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
                        errorTitle: 'Excuse me, initialize TREZOR first!',
                        solution: [
                            'Go to mytrezor.com.',
                            'Initialize TREZOR.',
                            'Try again.'
                        ],
                        restartAction: false,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'MyTrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_OLD_VERSION':
                    return {
                        errorTitle: 'Old firmware version!',
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
                        errorTitle: 'Missing TREZOR Chrome Extension!',
                        solution: [
                            'Go to Chrome web store.',
                            'Download and install TREZOR Chrome Extension.',
                            'Restart app - TREZOR Password Manager.',
                            'Have fun!'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'Chrome Extension',
                        redirectTo: 'https://chrome.google.com/webstore/detail/trezor-chrome-extension/jcjjhjgimijdkoamemaghajlhegmoclj?hl=en',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_BOOTLAODER':
                    return {
                        errorTitle: 'You are in BOOTLOADER mode ...',
                        solution: [
                            'Go to MyTrezor.com and setup device.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: 'MyTrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: ''
                    };
                    break;

                case 'T_DEVICE':
                    return {
                        errorTitle: 'Houston, we have device problem ...',
                        solution: [
                            'Try to visit MyTrezor.com if your device works fine.',
                            'In case of problems contact our support specialist.',
                            'Try to restart the App - TREZOR Password Manager.',

                        ],
                        restartAction: true,
                        supportAction: true,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: 'MyTrezor.com',
                        redirectTo: 'https://mytrezor.com',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_INVALIED_TOKEN':
                    return {
                        errorTitle: 'Houston, we have DROPBOX problem ...',
                        solution: [
                            'Clear browser cache and restart Chrome.',
                            'Try to re-login to your dropbox account.',
                            'Restart App - TREZOR Password Manager.',
                            'Get in touch with our Support specialist.'
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
                        errorTitle: 'WOW, not enough Dropbox space ...',
                        solution: [
                            'You have reached your Dropbox quota.',
                            'Clean up your dropbox or buy more space.'
                        ],
                        restartAction: false,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: 'Dropbox.com',
                        redirectTo: 'https://www.dropbox.com/',
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + mailFooterTemplate
                    };
                    break;

                case 'DB_RATE_LIMITED':
                    return {
                        errorTitle: 'WOW, Dropbox rate limit ...',
                        solution: [
                            'You have reached Dropbox limits.',
                            'Check Dropbox.com if service is running.',
                            'Get in touch with our Support specialist.'
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
                            errorTitle: 'Houston, Dropbox is down (or slow) ...',
                            solution: [
                                'It seems, you are online, but check your internet connection.',
                                'Try Dropbox and check their service status.'
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
                            errorTitle: 'D\'oh, you are offline ...',
                            solution: [
                                'Connect to Internet.',
                                'Re-Login to TREZOR password manager.'
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
                errorTitle: 'Error! It\'s all peter\'s fault ...',
                errorSolutionSteps: [
                    'It seems, you are online, but check your connection.',
                    'Make sure you have installed TREZOR Chrome Extension from chrome web store.',
                    'Try to restart the App - TREZOR password manager.',
                    'Get in touch with our Support specialist.'
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
                            {this.state.supportAction ? <a className='button shadow green-btn' target='_blank'
                                                           href={'mailto:support@satohilabs.com?subject=TREZOR Password Manager bug report&body=' + this.state.supportDefaultMailText}>Contact
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
