/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    ImportModal = React.createClass({

        getInitialState() {
            return {
                showImportModal: false
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeImportModalMsgHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromeImportModalMsgHandler);
        },

        chromeImportModalMsgHandler(request, sender, sendResponse) {
            switch (request.type) {
                case 'showImportDialog':
                    this.setState({
                        showImportModal: true
                    });
                    chrome.tabs.getCurrent((tab) => {
                        sendResponse({type:'importVisible', tab: tab});
                    });
                    break;

                case 'hideImportModal':
                    this.closeImportModal();
                    break;
            }
            return true;
        },

        closeImportModal() {
            this.setState({
                showImportModal: false
            });
        },

        hiding(e) {
            e.preventDefault();
        },

        render(){
            return (
                <div>
                    <Modal show={this.state.showPinModal} backdrop={'static'} dialogClassName={'pin-modal-dialog'} autoFocus={true} enforceFocus={true} onHide={this.hiding}>
                        <Modal.Body>
                            Import
                        </Modal.Body>
                    </Modal>
                </div>
            )
        }
    });

module.exports = PinModal;
