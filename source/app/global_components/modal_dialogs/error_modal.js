'use strict';

var React = require('react'),
    Modal = require('react-bootstrap').Modal,
    ErrorModal = React.createClass({

        getInitialState() {
            return {
                showErrorModal: false,
                errorText: ''
            }
        },

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeErrorModalMsgHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromeErrorModalMsgHandler);
        },

        chromeErrorModalMsgHandler(request, sender, sendResponse) {
            switch (request.type) {
                case 'errorMsg':
                    this.setState({
                        showErrorModal: true,
                        errorText: request.content
                    });
                    break;
            }
        },

        closeErrorModal() {
            this.setState({
                showErrorModal: false
            });
        },

        render(){
            return (
                <div>
                    <Modal show={this.state.showErrorModal} onHide={this.closeErrorModal} bsSize="small">
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title-sm">{this.state.errorText}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            It seems, we have some problem here.
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.closeErrorModal}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
        }
    });

module.exports = ErrorModal;
