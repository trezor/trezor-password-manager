/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  Modal = require('react-bootstrap').Modal,
  Button = require('react-bootstrap').Button,
  InitModal = React.createClass({
    getInitialState() {
      return {
        showInitModal: false
      };
    },

    componentDidMount() {
      chrome.runtime.onMessage.addListener(this.chromeInitModalMsgHandler);
    },

    componentWillUnmount() {
      chrome.runtime.onMessage.removeListener(this.chromeInitModalMsgHandler);
    },

    isOnline() {
      return navigator.onLine;
    },

    sendMessage(msgType, msgContent) {
      chrome.runtime.sendMessage({ type: msgType, content: msgContent });
    },

    chromeInitModalMsgHandler(request, sender, sendResponse) {
      if (request.type === 'initMsg') {
        this.setState({ showInitModal: true });
      }
      if (request.type === 'trezorDisconnected') {
        this.setState({ showInitModal: false });
      }
    },

    initNewStorage() {
      this.sendMessage('initNewFile');
      this.setState({ showInitModal: false });
    },

    retryStorage() {
      this.sendMessage('retryInitFile');
      this.setState({ showInitModal: false });
    },

    closeInitModal(e) {
      if (!!e) e.preventDefault();
    },

    render() {
      return (
        <div>
          <Modal
            show={this.state.showInitModal}
            onHide={this.closeInitModal}
            dialogClassName="error-modal-dialog"
            enforceFocus={true}
          >
            <Modal.Header>
              <Modal.Title id="contained-modal-title-sm">
                <i className="ion-upload" /> Hello!
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Welcome to TREZOR Password Manager! It looks like you don't have any passwords saved
                yet. Would you like to setup your new password database?
              </p>
            </Modal.Body>
            <div className="btn-controls">
              <Button className="button shadow white-btn" onClick={this.retryStorage}>
                I'm not new, try again
              </Button>
              <Button className="button shadow blue-btn" onClick={this.initNewStorage}>
                Yes, start now!
              </Button>
            </div>
          </Modal>
        </div>
      );
    }
  });

module.exports = InitModal;
