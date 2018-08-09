/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  Modal = require('react-bootstrap').Modal,
  EntryModal = React.createClass({
    getInitialState() {
      return {
        showRemoveModal: false,
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
      let title = window.myStore.getEntryTitleById(parseInt(entryId));
      this.setState({
        entryId: entryId,
        title: title,
        showRemoveModal: true
      });
    },

    removeEntryCloseModal() {
      window.myStore.removeEntry(this.state.entryId);
      this.setState({
        showRemoveModal: false
      });
    },

    closeRemoveModal() {
      this.setState({
        showRemoveModal: false
      });
    },

    render() {
      return (
        <div className="entry-modal">
          <Modal
            show={this.state.showRemoveModal}
            onHide={this.closeRemoveModal}
            dialogClassName="entry-modal"
          >
            <Modal.Body>
              <div>
                <a className="icon ion-close-round close-btn" onClick={this.closeRemoveModal} />
                <div className="avatar">
                  <span>
                    <i className="icon ion-trash-a" />
                  </span>
                </div>
                <span className="title edited">
                  <input
                    type="text"
                    autoComplete="off"
                    name="removeEntry"
                    ref="removeEntry"
                    disabled
                    value={'Remove ' + this.state.title + ' ?'}
                  />
                  <div className="btn-controls">
                    <button className="btn shadow red-btn" onClick={this.removeEntryCloseModal}>
                      Yes, remove
                    </button>
                    <button className="btn shadow white-btn" onClick={this.closeRemoveModal}>
                      No
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
