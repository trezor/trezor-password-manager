"use strict";

var React = require('react'),
    Router = require('react-router'),
    Modal = require('react-bootstrap').Modal,
    Popup = React.createClass({

        getInitialState() {
            return {
                contentStyle: 'add',
                showModal: false
            };
        },

        componentWillMount() {
            this.props.eventEmitter.on('openAddPopup', this.openNewContent);
            this.props.eventEmitter.on('openEditPopup', this.openEditContent);
        },

        openNewContent() {
            this.setState({
                contentStyle: 'add'
            });
            this.open();
        },

        openEditContent(entry_id) {
            this.setState({
                contentStyle: 'edit'
            });
            this.open();
        },

        close() {
            this.setState({ showModal: false });
        },

        open() {
            this.setState({ showModal: true });
        },


        render(){
            return (
                <div>

                    <Modal show={this.state.showModal} onHide={this.close}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Modal</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <h4>Text in a modal</h4>
                            <p>Duis mollis, est non commodo luctus, nisi erat porttitor ligula.</p>
                            <hr />
                            <h4>Overflowing text to show scroll behavior</h4>
                        </Modal.Body>
                        <Modal.Footer>
                        </Modal.Footer>
                    </Modal>
                </div>
            );
        }
    });

module.exports = Popup;
