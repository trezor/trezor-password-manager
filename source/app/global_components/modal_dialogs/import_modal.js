/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  Papa = require('papaparse'),
  Table = require('react-bootstrap').Table,
  Modal = require('react-bootstrap').Modal,
  Button = require('react-bootstrap').Button,
  ImportSelect = require('../import_select'),
  ImportModal = React.createClass({
    getInitialState() {
      return {
        showImportModal: false,
        uploading: true,
        dropdownOptions: [
          {
            name: 'URL (required)',
            value: 'title',
            selectedCol: 0
          },
          {
            name: 'Title',
            value: 'note',
            selectedCol: 1
          },
          {
            name: 'Username',
            value: 'username',
            selectedCol: 2
          },
          {
            name: 'Password',
            value: 'password',
            selectedCol: 3
          },
          {
            name: 'Tags',
            value: 'tags',
            selectedCol: 4
          },
          {
            name: 'Secret note',
            value: 'safe_note',
            selectedCol: 5
          }
        ],
        storage: false,
        storageFile: false,
        firstRowHeader: false,
        importStatus: [],
        dropZoneActive: false
      };
    },

    componentDidMount() {
      window.myStore.on('storageImport', this.importModalMsgHandler);
      window.addEventListener('mouseup', this.fileOnDragLeave);
      window.addEventListener('dragleave', this.fileOnDragLeave);
      window.addEventListener('dragenter', this.fileOnDragOver);
      window.addEventListener('drop', this.fileOnDrop);
    },

    componentWillUnmount() {
      window.myStore.removeListener('storageImport', this.importModalMsgHandler);
    },

    importModalMsgHandler(data) {
      var importStatus = [];
      if (data && data.data) {
        importStatus = data.data.map(function(value, key) {
          return 'pending';
        });

        this.setState({
          showImportModal: true,
          storage: data,
          importStatus: importStatus
        });
      } else {
        this.showImportModal();
      }
    },

    showImportModal() {
      this.setState({
        showImportModal: true
      });
    },

    closeImportModal() {
      this.setState({
        showImportModal: false,
        storage: false,
        importStatus: []
      });
    },

    importStorage(n) {
      if (typeof n !== 'number') n = 0;
      let entry = this.state.storage.data[n];

      if (entry) {
        entry = this.sortEntryData(entry);
        this.saveEntry(entry, n);
      }
    },

    sortEntryData(entry) {
      let r = {};
      this.state.dropdownOptions.forEach(function(option) {
        r[option.value] = Object.values(entry)[option.selectedCol];
      });
      return r;
    },

    saveEntry(entry, n) {
      let tags = [];
      if (entry.tags) {
        let tags_titles = entry.tags.split('|');
        tags_titles.map(key => {
          let tag = window.myStore.getTagIdByTitle(key);
          if (tag) tags.push(tag);
        });
      }

      this.setImportEntryStatus(n, 'importing');

      if (entry.title && entry.title.length > 0) {
        let data = {
          title: String(entry.title ? entry.title : ''),
          username: String(entry.username ? entry.username : ''),
          password: String(entry.password ? entry.password : ''),
          nonce: String(''),
          tags: tags,
          safe_note: String(entry.safe_note ? entry.safe_note : ''),
          note: String(entry.note ? entry.note : '')
        };

        chrome.runtime.sendMessage({ type: 'encryptFullEntry', content: data }, response => {
          data.password = response.content.password;
          data.safe_note = response.content.safe_note;
          data.nonce = response.content.nonce;
          data.success = response.content.success;
          if (data.success) {
            window.myStore.addNewEntry(data);
            this.setImportEntryStatus(n, 'success');
            console.log('success');
          } else {
            this.setImportEntryStatus(n, 'error');
            console.warn('inconsistent entry');
          }
          this.importStorage(n + 1);
        });
      } else {
        this.setImportEntryStatus(n, 'warning');
        this.importStorage(n + 1);
        console.warn('missing title');
      }
    },

    setImportEntryStatus(entryKey, status) {
      let importStatus = this.state.importStatus;
      importStatus[entryKey] = status;
      this.setState({
        importStatus: importStatus
      });
    },

    handleChange(value, selectedCol) {
      let dropdownOptions = Object.assign(this.state.dropdownOptions);

      dropdownOptions.forEach(function(option, key) {
        if (option.selectedCol == selectedCol) {
          dropdownOptions[key].selectedCol = -1;
        }
        if (option.value == value) {
          dropdownOptions[key].selectedCol = selectedCol;
        }
      });

      this.setState({
        dropdownOptions: dropdownOptions
      });
    },

    fileChange(event) {
      var file = null,
        firstRowHeader = this.state.firstRowHeader;

      if (event) {
        file = event.target.files[0];
        this.setState({
          storageFile: file
        });
      } else {
        file = this.state.storageFile;
      }

      window.myStore.emit('storageImport', false);
      Papa.parse(file, {
        worker: false,
        header: firstRowHeader,
        skipEmptyLines: true,
        complete: results => {
          window.myStore.emit('storageImport', results);
        }
      });
    },

    fileOnDrop(event) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({
        dropZoneActive: false
      });
      this.fileChange({
        target: {
          files: event.dataTransfer.files
        }
      });
    },

    fileOnDragOver(event) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({
        dropZoneActive: true
      });
    },

    fileOnDragLeave(event) {
      event.stopPropagation();
      event.preventDefault();
      this.setState({
        dropZoneActive: false
      });
    },

    browseFile(event) {
      event.preventDefault();
      document.getElementById('importInput').click();
    },

    setFirstRow(event) {
      event.preventDefault();
      this.setState(
        {
          firstRowHeader: !this.state.firstRowHeader
        },
        function() {
          this.fileChange();
        }
      );
    },

    render() {
      if (this.state.storage) {
        var table_body,
          table_head = [],
          storageData = this.state.storage.data,
          fields = this.state.storage.meta.fields,
          dropdownOptions = this.state.dropdownOptions,
          importStatus = this.state.importStatus,
          showImportButtons = true,
          importIsDone = true,
          importedCound = 0,
          notImportedCound = 0;

        importStatus.forEach(status => {
          if (status == 'pending' || status == 'importing') {
            importIsDone = false;
          }
          if (status !== 'pending') {
            showImportButtons = false;
          }
        });

        if (importIsDone) {
          importedCound = importStatus.filter(item => {
            return item == 'success';
          }).length;
          notImportedCound = importStatus.filter(item => {
            return item !== 'success';
          }).length;
        }

        // table body
        let n = 0;
        table_body = storageData.map(item => {
          let i = 0;
          let cols = Object.values(item).map(col => {
            let key = n.toString() + i.toString();
            var selected = dropdownOptions.find(option => {
              return option.selectedCol == i;
            });

            if (n == 0) {
              // table header
              let selectKey = 'select' + i;
              let pendingItems = this.state.importStatus.filter(function(val) {
                return val === 'pending';
              });
              let selectDisabled = this.state.importStatus.length !== pendingItems.length;

              table_head.push(
                <th key={i}>
                  <ImportSelect
                    name={selectKey}
                    value={selected ? selected.value : ''}
                    col={i}
                    onChange={this.handleChange}
                    options={dropdownOptions}
                    disabled={selectDisabled}
                  />
                </th>
              );
            }

            if (selected && (selected.value === 'password' || selected.value === 'safe_note')) {
              col = (
                <span>
                  <i className="icon ion-asterisk" />
                  <i className="icon ion-asterisk" />
                  <i className="icon ion-asterisk" />
                  <i className="icon ion-asterisk" />
                  <i className="icon ion-asterisk" />
                </span>
              );
            }

            if (selected && selected.value === 'tags') {
              col = col.split('|').join(', ');
            }

            i++;
            return <td key={key}>{col}</td>;
          });
          let statusKey = 'status' + i;
          cols.push(
            <td key={statusKey}>
              {importStatus[n] == 'importing' && (
                <div className={'loading'}>
                  <span className="spinner" />
                </div>
              )}
              {importStatus[n] == 'success' && (
                <div className={'success'}>
                  <img src="./images/success_blue.svg" />
                </div>
              )}
              {(importStatus[n] == 'warning' || importStatus[n] == 'error') && (
                <div className={'warning'}>
                  <img src="./images/cancel_red.svg" />
                </div>
              )}
            </td>
          );

          n++;
          return (
            <tr key={n.toString()} className={importStatus[n - 1]}>
              {cols}
            </tr>
          );
        });
        if (table_head) {
          table_head.push(
            <th key={'status'} className={'status-col'}>
              <span>Status</span>
            </th>
          );
        }
      }

      return (
        <div>
          <Modal
            show={this.state.showImportModal}
            backdrop={'static'}
            dialogClassName={'import-modal-dialog'}
            autoFocus={true}
            enforceFocus={true}
            onHide={this.closeImportModal}
          >
            <Modal.Header>
              <button className="close" onClick={this.closeImportModal}>
                <img src="./images/cancel.svg" />
              </button>
              <Modal.Title id="contained-modal-title-sm">Import keys</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {!this.state.storage && (
                <form className={'file-form'}>
                  <div
                    className={this.state.dropZoneActive ? 'active' : ''}
                    id={'drop-area'}
                    onDrop={this.fileOnDrop}
                    onDragOver={this.fileOnDragOver}
                  >
                    <img src="./images/csv_file.svg" />
                    <br />
                    <label htmlFor={'importInput'}>
                      Drop file here or{' '}
                      <a href="#" onClick={this.browseFile}>
                        browse
                      </a>{' '}
                      to upload.
                    </label>
                    <input
                      id="importInput"
                      className="hide"
                      type="file"
                      accept=".csv"
                      ref={'fileUploader'}
                      onChange={event => {
                        this.fileChange(event);
                        event.target.value = null;
                      }}
                    />
                  </div>
                </form>
              )}
              {this.state.storage && <p className={'help'}>Sort your .CSV columns by type.</p>}
              {this.state.storage && (
                <div className={'storage_content'}>
                  <Table>
                    <thead>
                      <tr>{table_head}</tr>
                    </thead>
                    <tbody>{table_body}</tbody>
                  </Table>
                </div>
              )}
            </Modal.Body>
            {showImportButtons && (
              <Modal.Footer>
                <label
                  className={'checkbox' + (this.state.firstRowHeader ? ' active' : '')}
                  onClick={this.setFirstRow}
                >
                  <i>{this.state.firstRowHeader && <img src="./images/checkbox_checked.svg" />}</i>
                  Clear first row in the table.
                </label>
                <button type="button" className={'btn btn-link'} onClick={this.closeImportModal}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={'blue-btn add btn-wide'}
                  onClick={this.importStorage}
                >
                  Import keys
                </button>
              </Modal.Footer>
            )}
            {importIsDone && (
              <Modal.Footer>
                <span className="info">
                  <i className="icon ion-information-circled" /> Imported {importedCound} entries,
                  skipped {notImportedCound}.
                </span>
                <button
                  type="button"
                  className={'blue-btn add btn-wide'}
                  onClick={this.closeImportModal}
                >
                  Continue
                </button>
              </Modal.Footer>
            )}
          </Modal>
        </div>
      );
    }
  });

module.exports = ImportModal;
