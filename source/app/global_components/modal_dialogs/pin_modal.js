'use strict';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    PinDialog = require('../pin_dialog/pin_dialog'),
    PinModal = React.createClass({

        getInitialState() {
            return {
                showPinModal: false
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromePinModalMsgHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromePinModalMsgHandler);
        },

        chromePinModalMsgHandler(request, sender, sendResponse) {

            switch (request.type) {
                case 'showPinDialog':
                    this.setState({
                        showPinModal: true
                    });
                    break;

                case 'trezorPin':
                    this.closePinModal();
                    break;
            }
        },

        closePinModal() {
            this.setState({
                showPinModal: false
            });
        },

        hiding(e) {
          e.preventDefault();
        },

        render(){
            return (
                <div>
                    <Modal show={this.state.showPinModal} backdrop={'static'} dialogClassName={'pin-modal-dialog'} enforceFocus={true} onHide={this.hiding}>
                        <Modal.Body>
                            <PinDialog />
                        </Modal.Body>
                    </Modal>
                </div>
            )
        }
    });

module.exports = PinModal;
