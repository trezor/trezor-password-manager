/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Table = require('react-bootstrap').Table,
    Modal = require('react-bootstrap').Modal,
    ImportModal = React.createClass({

        getInitialState() {
            return {
                showImportModal: false,
                uploading: true,
                storage: false
            }
        },

        componentDidMount() {
            window.myStore.on('storageImport', this.importModalMsgHandler);
        },

        componentWillUnmount() {
            window.myStore.removeListener('storageImport', this.importModalMsgHandler);
        },

        importModalMsgHandler(data) {
            this.setState({
                showImportModal: true,
                storage: data
            });
        },

        closeImportModal() {
            this.setState({
                showImportModal: false,
                storage: false
            });
        },

        render(){
            if (this.state.storage) {
                var columns = this.state.storage.data[0];
                console.warn('columns ', columns.length);
                var data_list = Object.keys(this.state.storage.data).map((key, i = 0) => {
                    let entry = this.state.storage.data[key].forEach((e) => {
                       return (<td>{e}</td>)
                    });
                    return (
                        <tr key={i++}>
                            {entry}
                        </tr>)
                });
            }
            return (
                <div>
                    <Modal show={this.state.showImportModal} backdrop={'static'} dialogClassName={'import-modal-dialog'} autoFocus={true} enforceFocus={true} onHide={this.closeImportModal}>
                        <Modal.Header closeButton={true}>
                            <Modal.Title id='contained-modal-title-sm'>Import storage</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div className={!this.state.storage ? 'loading' : 'hidden'}>
                                <span className='spinner'></span>
                            </div>
                            <div className={this.state.storage ? 'storage_content' : 'hidden'}>
                                <Table>{data_list}</Table>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            )
        }
    });

module.exports = ImportModal;
