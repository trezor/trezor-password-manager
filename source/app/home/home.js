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
  { Link } = Router,
  Home = React.createClass({
    mixins: [Router.Navigation],

    getInitialState() {
      return {
        trezorReady: false,
        storageReady: false,
        username: '',
        userDetails: false,
        storageType: 'DROPBOX',
        activeDevice: {},
        devices: [],
        deviceStatus: 'disconnected',
        dialog: 'preloading',
        loadingText: 'Waking up ...',
        passphrase: false,
        transportType: false,
        isOnline: navigator.onLine
      };
    },

    componentDidMount() {
      chrome.runtime.onMessage.addListener(this.chromeMsgHandler);
      window.addEventListener('online', this.updateOnlineStatus);
      window.addEventListener('offline', this.updateOnlineStatus);
      // RUN INIT!
      this.sendMessage('initPlease');
    },

    componentWillUnmount() {
      chrome.runtime.onMessage.removeListener(this.chromeMsgHandler);
      window.removeEventListener('online', this.updateOnlineStatus);
      window.removeEventListener('offline', this.updateOnlineStatus);
    },

    componentDidUpdate() {
      if (this.state.transportType === 'ParallelTransport' && this.state.isOnline) {
        var button = this.webusbButton.getDOMNode();
        if (button && button.getElementsByTagName('iframe').length < 1) {
          chrome.runtime.sendMessage({
            type: 'renderWebUSBButton'
          }, (innerHTML) => {
            button.innerHTML = innerHTML;
            
            let iframe = button.getElementsByTagName('iframe')[0];
            let connectUrl = iframe.getAttribute('src');

            iframe.onload = () => {
              iframe.contentWindow.postMessage({}, connectUrl);
            }
          });
        }
      }
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

        case 'trezorTransport':
          this.setState({
            transportType: request.content.transport
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
          chrome.tabs.getCurrent(tab => {
            sendResponse({ type: 'pinVisible', tab: tab });
          });
          break;

        case 'cancelPinDialog':
          this.setState({
            dialog: 'accept_user',
            storageReady: true
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

        case 'trezorPassphrase':
          if (this.state.activeDevice.version === 2) {
            this.setState({
              passphrase: true
            });
          }
          break;

        case 'decryptedContent':
          window.myStore = new Store(
            request.content.data,
            request.content.username,
            request.content.storageType
          );
          this.transitionTo('dashboard');
          break;
      }
      return true;
    },
    
    updateOnlineStatus() {
      let status = navigator.onLine;
      this.setState({
          isOnline: status
      });
    },

    toggleDetails() {
      this.setState({
        userDetails: !this.state.userDetails
      });
    },

    activateDevice(d) {
      if (this.state.devices[d].path === "unreadable-device") {
        // install bridge
        this.sendMessage('errorMsg', { code: 'T_NO_TRANSPORT' });
      } else if (!this.state.devices[d].accquired) {
        chrome.runtime.sendMessage({
            type: 'getDeviceState',
            content: this.state.devices[d]
        }, (a) => {
          if (a.success) {
            this.setState({
                dialog: 'loading_dialog',
                activeDevice: this.state.devices[d]
            });
            this.sendMessage('activateTrezor', this.state.devices[d].path);
          } else {
            this.sendMessage('hidePinModal');
          }
        });
      } else {
        // activate device
        this.setState({
          dialog: 'loading_dialog',
          activeDevice: this.state.devices[d]
        });
        this.sendMessage('activateTrezor', this.state.devices[d].path);
      }
    },

    sendMessage(msgType, msgContent) {
      chrome.runtime.sendMessage({ type: msgType, content: msgContent });
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
      var showInstallBridge = false;
      var device_list = Object.keys(this.state.devices).map((key, i = 0) => {
        if (this.state.devices[key].path === "unreadable-device") {
          showInstallBridge = true;
        }
        return (
          <li key={i++}>
            <a
              data-tag-key={this.state.devices[key].path}
              data-tag-name={this.state.devices[key].label}
              onClick={this.activateDevice.bind(null, key)}
              onTouchStart={this.activateDevice.bind(null, key)}
            >
              <span className={'icon t' + this.state.devices[key].version} />
              <span className="nav-label">{this.state.devices[key].label}</span>
            </a>
          </li>
        );
      });

      return (
        <div>
          <div className="background" />
          <div className="home">
            <div
              className={
                this.state.dialog === 'connect_storage' ? 'connect_storage' : 'hidden_dialog'
              }
            >
              <img src="dist/app-images/t-logo.svg" className="no-circle spaced" />

              <div className="dialog-content">
                <button className="dropbox-login" onClick={this.connectDropbox}>
                  Sign in with Dropbox
                </button>
                <br />
                <button className="drive-login" onClick={this.connectDrive}>
                  Sign in with Drive
                </button>
              </div>
            </div>

            <div className={this.state.dialog === 'preloading' ? 'preloading' : 'hidden_dialog'}>
              <img src="dist/app-images/t-logo.svg" className="no-circle spaced" />

              <div className="dialog-content">
                <span className="spinner" />
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
                <div className={this.state.userDetails ? 'desc' : 'hidden'}>
                  <button className="half-transparent no-style" onClick={this.disconnect}>
                    {this.state.storageType === 'DROPBOX' ? (
                      <p>Logout and use different account.</p>
                    ) : (
                      <p>Switch to different service.</p>
                    )}
                  </button>
                  <br />
                  <div>
                    {this.state.storageType === 'DROPBOX' ? (
                      <i className="desc">(Manage your accounts via Dropbox.com)</i>
                    ) : (
                      <div className="desc">
                        <b>For logout or switch user follow instructions:</b>
                        <ol>
                          <li>
                            In the upper right corner of the browser window, click the button for
                            the current person.
                          </li>
                          <li>Click Switch person.</li>
                          <li>Choose the person you want to switch to.</li>
                          <a
                            href="https://support.google.com/chrome/answer/2364824?hl=en"
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            More info
                          </a>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
                {this.state.transportType === 'bridge' &&
                  !this.state.devices.length && (
                    <span className="connect_trezor">
                      {this.state.isOnline ? (
                          <span>
                              <img src="dist/app-images/connect-trezor.svg" /> Connect TREZOR to continue
                          </span>) : (<span>
                              <span className="connect_trezor">You are offline, please connect to internet.</span>
                          </span>)}
                    </span>
                  )}
                {this.state.transportType === 'ParallelTransport' && (
                  <div>
                      {this.state.isOnline ? (
                          <div>
                            <span className="connect_trezor inline">
                      <img src="dist/app-images/connect-trezor.svg" /> Connect TREZOR
                      </span>{' '} and {' '}
                          <button className="webusb no-style half-transparent trezor-webusb-button"
                              ref={f => {this.webusbButton = f;}}>Check for devices</button>
                          </div>
                      ) : (<span><span className="connect_trezor">You are offline, please connect to internet.</span></span>)}
                  </div>
                )}
                <div className={this.state.devices.length ? '' : 'hidden'}>
                  <span>Choose from device</span>
                  {showInstallBridge && <p style={{marginTop: "15px"}}>TREZOR bridge not installed.</p>}
                  <ul className="dev-list">{device_list}</ul>
                </div>
                <div className={this.state.devices.length ? 'hidden' : 'desc'}>
                  <div className="desc">
                    <small>
                      Don't have a TREZOR? <a href="https://shop.trezor.io/">Get one</a>
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className={this.state.dialog === 'pin_dialog' ? 'pin_dialog' : 'hidden_dialog'}>
              <PinDialog />
            </div>

            <div
              className={
                this.state.dialog === 'loading_dialog' ? 'loading_dialog' : 'hidden_dialog'
              }
            >
              <span className="spinner" />
              <h1>{this.state.loadingText}</h1>
            </div>

            <div
              className={this.state.dialog === 'button_dialog' ? 'button_dialog' : 'hidden_dialog'}
            >
              <h1>
                <span className="icon icon-device" />
                <div className={!this.state.passphrase ? 'desc' : 'hidden'}>
                  Follow instructions on your <br />{' '}
                  <b className="smallcaps">{this.state.activeDevice.label}</b> device.
                </div>
                <div className={this.state.passphrase ? 'desc' : 'hidden'}>
                  Select <span className="badge">Host</span> on the device to continue.
                  <br /> <small>TREZOR Password Manager does not support passphrase yet.</small>
                </div>
              </h1>
            </div>

            <Footer footerStyle="white" />
          </div>
        </div>
      );
    }
  });

module.exports = Home;
