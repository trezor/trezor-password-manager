/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';


var React = require('react'),
    tld = require('tldjs'),
    Modal = require('react-bootstrap').Modal,

    EntryModal = React.createClass({

        getInitialState() {
            return {
                showRemoveModal: false,
                image_src: 'dist/app-images/transparent.png',
                title: '',
                entryId: ''
            };
        },

        componentWillMount() {
            window.myStore.on('openRemoveEntry', this.openRemoveEntry);
        },

        componentWillUnmount() {
            window.myStore.removeListener('openRemoveEntry', this.openRemoveEntry);
        },

        openRemoveEntry(entryId) {
            var title = window.myStore.getEntryTitleById(parseInt(entryId));
            this.setState({
                entryId: entryId,
                title: title,
                image_src: 'https://logo.clearbit.com/' + tld.getDomain(title) + '?size=100',
                showRemoveModal: true
            });
        },

        removeEntryCloseModal() {
            window.myStore.removeEntry(this.state.entryId);
            this.setState({
                showRemoveModal: false
            });
        },

        handleError() {
            this.setState({
                image_src: 'dist/app-images/transparent.png'
            });
        },

        closeRemoveModal() {
            this.setState({
                showRemoveModal: false
            });
        },

        render() {
            return (
                <div className='remove-modal'>
                    <Modal show={this.state.showRemoveModal} onHide={this.closeRemoveModal}>
                        <Modal.Body>
                            <div>
                                <a className='icon ion-close-round close-btn' onClick={this.closeRemoveModal}/>

                                <div className='avatar'>
                                <span>
                                <img src={this.state.image_src}
                                     onError={this.handleError}/>
                                <i className={'icon ion-work'}></i>
                                </span>
                                </div>
                                <span className='title edited'>
                                    <input type='text'
                                           autoComplete='off'
                                           name='removeEntry'
                                           ref='removeEntry'
                                           disabled
                                           value={'Remove ' + this.state.title + ' ?'}/>
                                    <div className='btn-controls'>
                                        <button className='btn shadow red-btn' onClick={this.removeEntryCloseModal}>Yes,
                                            remove
                                        </button>
                                        <button className='btn shadow white-btn' onClick={this.closeRemoveModal}>No
                                        </button>
                                    </div>
                                </span>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    });

module.exports = EntryModal;
