/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const mailHeaderTemplate = 'Hi SatoshiLabs,%0D%0A%0D%0AI have experienced some errors with my TREZOR Password Manager and I wasn\'t able to resolve them by following your instructions.%0D%0A%0D%0ADetail of the issue:%0D%0A%0D%0A',
    mailFooterTemplate = '%0D%0A%0D%0ALooking forward to your reply.%0D%0A%0D%0ABest regards,%0D%0A[MY NAME]',
    DB_homepage = 'https://www.dropbox.com',
    DB_status = 'https://status.dropbox.com/',
    GD_homepage = 'https://drive.google.com',
    GD_status = 'http://www.google.com/appsstatus#hl=en&v=status';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    Button = require('react-bootstrap').Button,
    ErrorModal = React.createClass({

        getInitialState() {

            return {
                userInfo: '',
                showErrorModal: false,
                errorTitle: 'Error!',
                errorSolutionSteps: [
                    'Check your Internet connection.',
                    'Make sure you have the latest version of TREZOR Chrome Extension.',
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
            chrome.runtime.getPlatformInfo((info) => {
                this.setState({
                    userInfo: '%0D%0A%0D%0APlatform info:%0D%0A' + JSON.stringify(info) + '%0D%0A'
                })
            });
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
                            supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + this.state.userInfo + mailFooterTemplate
                        };
                    } else {
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
                    }
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
                    if (this.isOnline()) {
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
                    } else {
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
                    }
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
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + this.state.userInfo +  mailFooterTemplate
                    };
                    break;

                // INVALID TOKEN error only for dropbox, cos Drive is handling it itself in CHROME.identity API
                case 'INVALID_TOKEN':
                    return {
                        errorTitle: 'There is a problem with storage',
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
                        redirectText: content.storage + '.com',
                        redirectTo: DB_homepage,
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + this.state.userInfo +  mailFooterTemplate
                    };
                    break;

                case 'OVER_QUOTA':
                    return {
                        errorTitle: 'Not enough storage space',
                        solution: [
                            'Clean up your ' + content.storage + ' storage folder or buy more space.',
                            'Sign in with a different account.',
                            'Restart TREZOR Password Manager.'
                        ],
                        restartAction: true,
                        supportAction: false,
                        redirectAction: true,
                        closeAction: false,
                        redirectText: content.storage === 'Dropbox' ? 'Dropbox.com' : 'Drive.google.com',
                        redirectTo: content.storage === 'Dropbox' ? DB_homepage : GD_homepage,
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + this.state.userInfo +  mailFooterTemplate
                    };
                    break;

                case 'RATE_LIMITED':
                    return {
                        errorTitle: 'Storage limit reached',
                        solution: [
                            'You have reached ' + content.storage + ' limits.',
                            'Check ' + content.storage + ' status if service is running.',
                            'Get in touch with ' + content.storage + ' support.'
                        ],
                        restartAction: false,
                        supportAction: true,
                        redirectAction: true,
                        closeAction: true,
                        redirectText: content.storage + ' status',
                        redirectTo: content.storage === 'Dropbox' ? DB_status : GD_status,
                        supportDefaultMailText: mailHeaderTemplate + content.code + ' : ' + content.msg.message + window.tpmErroLog + this.state.userInfo +  mailFooterTemplate
                    };
                    break;

                case 'NETWORK_ERROR':
                    if (this.isOnline()) {
                        return {
                            errorTitle: content.storage + ' is down (or very slow)',
                            solution: [
                                'Check your internet connection.',
                                'Check ' + content.storage + ' service status.'
                            ],
                            restartAction: false,
                            supportAction: false,
                            redirectAction: true,
                            closeAction: true,
                            redirectText: content.storage + ' status',
                            redirectTo: content.storage === 'Dropbox' ? DB_status : GD_status,
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

                case 'ACCESS_DENIED':
                    return {
                        errorTitle: 'Missing permissions',
                        solution: [
                            'Sign to ' + content.storage + ' and allow access permissions'
                        ],
                        restartAction: false,
                        supportAction: false,
                        redirectAction: false,
                        closeAction: true,
                        redirectText: '',
                        redirectTo: '',
                        supportDefaultMailText: ''
                    };
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
                supportDefaultMailText: mailHeaderTemplate + JSON.stringify(content) + window.tpmErroLog + this.state.userInfo +  mailFooterTemplate
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
            localStorage.setItem('tpmRestart', 'reopen');
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
                            <b>Try this:</b>
                            <ul>
                                {solution}
                            </ul>
                        </Modal.Body>
                        <div className='btn-controls'>
                            {this.state.redirectAction ? <a href={this.state.redirectTo} target='_blank'
                                                            className='button shadow blue-btn'>{this.state.redirectText}</a> : ''}
                            {this.state.supportAction ? <a className='button shadow green-btn' target='_blank'
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
