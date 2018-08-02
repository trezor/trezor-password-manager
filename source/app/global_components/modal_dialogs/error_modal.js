/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

const mailHeaderTemplate =
    "Hi SatoshiLabs,%0D%0A%0D%0AI have experienced some errors with my TREZOR Password Manager and I wasn't able to resolve them by following your instructions.%0D%0A%0D%0ADetail of the issue:%0D%0A%0D%0A",
  mailFooterTemplate =
    '%0D%0A%0D%0ALooking forward to your reply.%0D%0A%0D%0ABest regards,%0D%0A[MY NAME]',
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
          'Make sure you have the latest version of TREZOR Bridge.',
          'Try to restart TREZOR Password Manager.',
          'In case of ongoing problems contact our support.'
        ],
        restartAction: true,
        supportAction: true,
        redirectAction: false,
        closeAction: true,
        cleanupAction: false,
        supportDefaultMailText: mailHeaderTemplate + window.tpmErroLog + mailFooterTemplate
      };
    },

    componentDidMount() {
      chrome.runtime.onMessage.addListener(this.chromeErrorModalMsgHandler);
      chrome.runtime.getPlatformInfo(info => {
        this.setState({
          userInfo: '%0D%0A%0D%0APlatform info:%0D%0A' + JSON.stringify(info) + '%0D%0A'
        });
      });
    },

    componentWillUnmount() {
      chrome.runtime.onMessage.removeListener(this.chromeErrorModalMsgHandler);
    },

    isOnline() {
      return navigator.onLine;
    },

    errorHandler(content) {
      switch (content.code) {
        case 'T_LIST':
          if (this.isOnline()) {
            return {
              showModal: true,
              errorTitle: 'Houston, we have a problem ...',
              solution: [
                'Check your connection.',
                'Make sure you have TREZOR Bridge installed.',
                'Try to restart TREZOR Password Manager.',
                'In case of ongoing problems contact our support.'
              ],
              restartAction: true,
              supportAction: true,
              redirectAction: true,
              cleanupAction: false,
              redirectText: 'TREZOR Bridge',
              redirectTo: 'https://wallet.trezor.io/#/bridge/',
              supportDefaultMailText:
                mailHeaderTemplate +
                content.code +
                ' : ' +
                content.msg.message +
                window.tpmErroLog +
                this.state.userInfo +
                mailFooterTemplate
            };
          } else {
            return {
              showModal: true,
              errorTitle: 'You are offline.',
              solution: ['Connect to the Internet.', 'Try to restart TREZOR Password Manager.'],
              restartAction: true,
              supportAction: false,
              redirectAction: false,
              closeAction: false,
              cleanupAction: false,
              redirectText: '',
              redirectTo: '',
              supportDefaultMailText: ''
            };
          }
          break;

        case 'T_NOT_INIT':
          return {
            showModal: true,
            errorTitle: 'TREZOR is not initialized.',
            solution: ['Go to wallet.trezor.io', 'Initialize TREZOR device.', 'Try again.'],
            restartAction: false,
            supportAction: false,
            redirectAction: true,
            closeAction: true,
            cleanupAction: false,
            redirectText: 'TREZOR Wallet',
            redirectTo: 'https://wallet.trezor.io/',
            supportDefaultMailText: ''
          };
          break;

        case 'T_OLD_VERSION':
          return {
            showModal: true,
            errorTitle: 'Old firmware version.',
            solution: ['Go to TREZOR Wallet.', 'Check and update your firmware.', 'Try again.'],
            restartAction: false,
            supportAction: false,
            redirectAction: true,
            closeAction: true,
            cleanupAction: false,
            redirectText: 'TREZOR Wallet',
            redirectTo: 'https://wallet.trezor.io/',
            supportDefaultMailText: ''
          };
          break;

        case 'T_OLD_TRANSPORT':
          return {
            showModal: true,
            errorTitle: 'New TREZOR Bridge is available.',
            solution: [
              'Please, go to wallet.trezor.io/#/bridge/',
              'Download and install latest TREZOR Bridge.',
              'Restart TREZOR Password Manager.'
            ],
            restartAction: true,
            supportAction: false,
            redirectAction: true,
            closeAction: false,
            cleanupAction: false,
            redirectText: 'Update TREZOR Bridge',
            redirectTo: 'https://wallet.trezor.io/#/bridge/',
            supportDefaultMailText: ''
          };
          break;

        case 'T_OK_TRANSPORT':
          return {
            showModal: false,
            errorTitle: 'TREZOR Bridge is ready!',
            solution: [''],
            restartAction: false,
            supportAction: false,
            redirectAction: false,
            closeAction: true,
            cleanupAction: false,
            redirectText: '',
            redirectTo: '',
            supportDefaultMailText: ''
          };
          break;

        case 'T_NO_TRANSPORT':
          if (this.isOnline()) {
            return {
              showModal: true,
              errorTitle: 'TREZOR Bridge not installed.',
              solution: [
                'Go to wallet.trezor.io/#/bridge/',
                'Download and install TREZOR Bridge.',
                'Restart TREZOR Password Manager.'
              ],
              restartAction: true,
              supportAction: false,
              redirectAction: true,
              closeAction: false,
              cleanupAction: false,
              redirectText: 'Install TREZOR Bridge',
              redirectTo: 'https://wallet.trezor.io/#/bridge/',
              supportDefaultMailText: ''
            };
          } else {
            return {
              showModal: true,
              errorTitle: 'You are offline.',
              solution: ['Connect to the Internet.', 'Try to restart TREZOR Password Manager.'],
              restartAction: true,
              supportAction: false,
              redirectAction: false,
              closeAction: false,
              cleanupAction: false,
              redirectText: '',
              redirectTo: '',
              supportDefaultMailText: ''
            };
          }
          break;

        case 'T_BOOTLOADER':
          return {
            showModal: true,
            errorTitle: 'TREZOR in bootloader mode.',
            solution: [
              'To upgrade firmware go to TREZOR Wallet.',
              'Otherwise restart Password Manager.'
            ],
            restartAction: true,
            supportAction: false,
            redirectAction: true,
            closeAction: true,
            cleanupAction: false,
            redirectText: 'TREZOR Wallet',
            redirectTo: 'https://wallet.trezor.io',
            supportDefaultMailText: ''
          };
          break;

        case 'T_CORRUPTED':
          return {
            showModal: true,
            errorTitle: 'Corrupted entries detected.',
            solution: [
              'TREZOR Password Manager will cleanup storage from corrupted entries: ' +
                content.cEntries
            ],
            cleanupAction: true,
            restartAction: false,
            supportAction: false,
            redirectAction: false,
            closeAction: false
          };
          break;

        case 'T_ENCRYPTION':
          return {
            showModal: true,
            errorTitle: 'TREZOR device is busy.',
            solution: [
              'Please, confirm the action on the device or reconnect TREZOR device.',
              'If the issue persists, restart TREZOR Password Manager and try again.'
            ],
            restartAction: true,
            supportAction: false,
            redirectAction: false,
            closeAction: true,
            cleanupAction: false
          };
          break;

        case 'T_DEVICE':
          return {
            showModal: true,
            errorTitle: 'Device problem detected.',
            solution: [
              'Try using TREZOR Wallet to check whether your device works fine.',
              'Try restarting TREZOR Password Manager.',
              'In case of ongoing problems contact our support.'
            ],
            restartAction: true,
            supportAction: true,
            redirectAction: true,
            closeAction: false,
            cleanupAction: false,
            redirectText: 'TREZOR Wallet',
            redirectTo: 'https://wallet.trezor.io',
            supportDefaultMailText:
              mailHeaderTemplate +
              content.code +
              ' : ' +
              content.msg.message +
              window.tpmErroLog +
              this.state.userInfo +
              mailFooterTemplate
          };
          break;

        // INVALID TOKEN error only for dropbox, cos Drive is handling it itself in CHROME.identity API
        case 'INVALID_TOKEN':
          return {
            showModal: true,
            errorTitle: 'There is a problem with storage.',
            solution: [
              'Clear cache and restart browser.',
              'Try to re-login to your Dropbox account.',
              'Restart TREZOR Password Manager.',
              'In case of ongoing problems contact our support.'
            ],
            restartAction: true,
            supportAction: true,
            redirectAction: true,
            closeAction: false,
            cleanupAction: false,
            redirectText: content.storage + '.com',
            redirectTo: DB_homepage,
            supportDefaultMailText:
              mailHeaderTemplate +
              content.code +
              ' : ' +
              content.msg.message +
              window.tpmErroLog +
              this.state.userInfo +
              mailFooterTemplate
          };
          break;

        case 'OVER_QUOTA':
          return {
            showModal: true,
            errorTitle: 'Not enough storage space.',
            solution: [
              'Clean up your ' + content.storage + ' storage folder or buy more space.',
              'Sign in with a different account.',
              'Restart TREZOR Password Manager.'
            ],
            restartAction: true,
            supportAction: false,
            redirectAction: true,
            closeAction: false,
            cleanupAction: false,
            redirectText: content.storage === 'Dropbox' ? 'Dropbox.com' : 'Drive.google.com',
            redirectTo: content.storage === 'Dropbox' ? DB_homepage : GD_homepage,
            supportDefaultMailText:
              mailHeaderTemplate +
              content.code +
              ' : ' +
              content.msg.message +
              window.tpmErroLog +
              this.state.userInfo +
              mailFooterTemplate
          };
          break;

        case 'RATE_LIMITED':
          return {
            showModal: true,
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
            cleanupAction: false,
            redirectText: content.storage + ' status',
            redirectTo: content.storage === 'Dropbox' ? DB_status : GD_status,
            supportDefaultMailText:
              mailHeaderTemplate +
              content.code +
              ' : ' +
              content.msg.message +
              window.tpmErroLog +
              this.state.userInfo +
              mailFooterTemplate
          };
          break;

        case 'NETWORK_ERROR':
          if (this.isOnline()) {
            return {
              showModal: true,
              errorTitle: content.storage + ' is down (or very slow)',
              solution: [
                'Check your internet connection.',
                'Check ' + content.storage + ' service status.'
              ],
              restartAction: false,
              supportAction: false,
              redirectAction: true,
              closeAction: true,
              cleanupAction: false,
              redirectText: content.storage + ' status',
              redirectTo: content.storage === 'Dropbox' ? DB_status : GD_status,
              supportDefaultMailText: ''
            };
          } else {
            return {
              showModal: true,
              errorTitle: 'You are offline',
              solution: ['Connect to the Internet.', 'Re-Login to TREZOR Password Manager.'],
              restartAction: true,
              supportAction: false,
              redirectAction: false,
              closeAction: true,
              cleanupAction: false,
              redirectText: '',
              redirectTo: '',
              supportDefaultMailText: ''
            };
          }
          break;

        case 'ACCESS_DENIED':
          return {
            showModal: true,
            errorTitle: 'Missing permissions',
            solution: ['Sign to ' + content.storage + ' and allow access permissions'],
            restartAction: false,
            supportAction: false,
            redirectAction: false,
            closeAction: true,
            cleanupAction: false,
            redirectText: '',
            redirectTo: '',
            supportDefaultMailText: ''
          };
          break;
      }
      return {
        showModal: true,
        errorTitle: 'Error',
        errorSolutionSteps: [
          'Check your connection.',
          'Make sure you have TREZOR Bridge installed.',
          'Try to restart TREZOR Password Manager.',
          'In case of ongoing problems contact our support.'
        ],
        restartAction: true,
        supportAction: true,
        cleanupAction: false,
        supportDefaultMailText:
          mailHeaderTemplate +
          JSON.stringify(content) +
          window.tpmErroLog +
          this.state.userInfo +
          mailFooterTemplate
      };
    },

    chromeErrorModalMsgHandler(request, sender, sendResponse) {
      if (request.type === 'errorMsg') {
        let error = this.errorHandler(request.content);
        this.setState({
          showErrorModal: error.showModal,
          errorTitle: error.errorTitle,
          errorSolutionSteps: error.solution,
          restartAction: error.restartAction,
          supportAction: error.supportAction,
          closeAction: error.closeAction,
          redirectAction: error.redirectAction,
          redirectText: error.redirectText,
          redirectTo: error.redirectTo,
          cleanupAction: error.cleanupAction,
          supportDefaultMailText: error.supportDefaultMailText
        });
      }
    },

    closeErrorModal() {
      if (this.state.closeAction) {
        this.setState({
          showErrorModal: false
        });
      } else {
        return false;
      }
    },

    restartApp() {
      localStorage.setItem('tpmRestart', 'reopen');
      chrome.runtime.reload();
    },

    cleanStorage() {
      window.myStore.cleanStorage().then(() => {
        this.setState({
          showErrorModal: false
        });
      });
    },

    render() {
      let solution = this.state.errorSolutionSteps.map((key, i = 0) => {
        i++;
        return <li key={i}>{key}</li>;
      });
      return (
        <div>
          <Modal
            show={this.state.showErrorModal}
            onHide={this.closeErrorModal}
            dialogClassName="error-modal-dialog"
          >
            <Modal.Header closeButton={this.state.closeAction}>
              <Modal.Title id="contained-modal-title-sm">{this.state.errorTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <b>Solution:</b>
              <ul>{solution}</ul>
            </Modal.Body>
            <div className="btn-controls">
              {this.state.cleanupAction ? (
                <Button className="button red-btn" onClick={this.cleanStorage}>
                  Clean storage
                </Button>
              ) : (
                ''
              )}
              {this.state.redirectAction ? (
                <a
                  href={this.state.redirectTo}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="button shadow blue-btn"
                >
                  {this.state.redirectText}
                </a>
              ) : (
                ''
              )}
              {this.state.supportAction ? (
                <a
                  className="button shadow green-btn"
                  rel="noopener noreferrer"
                  target="_blank"
                  href={
                    'mailto:support@satoshilabs.com?subject=TREZOR Password Manager bug report&body=' +
                    this.state.supportDefaultMailText
                  }
                >
                  Contact support
                </a>
              ) : (
                ''
              )}
              {this.state.restartAction ? (
                <Button className="button shadow red-btn" onClick={this.restartApp}>
                  Restart App
                </Button>
              ) : (
                ''
              )}
            </div>
          </Modal>
        </div>
      );
    }
  });

module.exports = ErrorModal;
