/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  tld = require('tldjs'),
  TableEntry = require('./table_entry/table_entry'),
  FilterInput = require('./filter_input/filter_input'),
  UserMenu = require('./user_menu/user_menu'),
  DropdownButton = require('react-bootstrap').DropdownButton,
  Button = require('react-bootstrap').Button,
  MenuItem = require('react-bootstrap').MenuItem,
  PasswordTable = React.createClass({
    getInitialState() {
      return {
        active_id: 0,
        active_title: '',
        tags: window.myStore.data.tags,
        entries: this.addExportTag(window.myStore.data.entries),
        filter: '',
        newEntry: false,
        newEntryUrl: '',
        orderType: window.myStore.data.config.orderType || 'note',
        exportMode: false,
        exportProgress: -1,
        exportedEntries: [],
        saving_entry: false,
        _isMounted: false
      };
    },

    componentWillMount() {
      window.myStore.on('changeTag', this.changeTag);
      window.myStore.on('filter', this.setupFilter);
      window.myStore.on('toggleNewEntry', this.toggleNewEntry);
      window.myStore.on('update', this.updateTableContent);
      window.myStore.on('export', this.setExport);
      chrome.runtime.onMessage.addListener(this.chromeTableMsgHandler);
    },

    componentWillUnmount() {
      window.myStore.removeListener('changeTag', this.changeTag);
      window.myStore.removeListener('filter', this.setupFilter);
      window.myStore.removeListener('toggleNewEntry', this.toggleNewEntry);
      window.myStore.removeListener('update', this.updateTableContent);
      window.myStore.removeListener('export', this.setExport);
      chrome.runtime.onMessage.removeListener(this.chromeTableMsgHandler);
    },

    setExport(value) {
      switch(value.eventType) {
        case 'mode':
          this.setExportMode(value.value);
          break;
        case 'progress':
          this.updateExportProgress(value.value);
          break;
      }
    },

    componentDidMount() {
      this.setState({
        _isMounted: true
      });
    },

    updateExportProgress(progress) {
      this.setState({
        exportProgress: progress
      });
    },

    setExportMode(mode) {
      if (mode) {
        this.addExportTag(this.state.entries);
      }

      this.setState({
        exportMode: mode
      });
    },

    addExportTag(entries) {
      Object.keys(entries).forEach(entryId => {
        entries[entryId].export = false;
      });
      return entries;
    },

    chromeTableMsgHandler(request, sender, sendResponse) {
      switch (request.type) {
        case 'saveEntry':
          this.openNewEntry(request.content);
          sendResponse({ type: 'entrySaving' });
          break;

        case 'fileSaving':
          this.setState({
            saving_entry: true
          });
          break;

        case 'fileSaved':
          this.setState({
            saving_entry: false
          });
          break;

        case 'exportProgress':
          window.myStore.emit('export', {
            eventType: 'progress', 
            value: (request.content.progress + 1)
          });
          break;
      }
      return true;
    },

    updateTableContent(data) {
      this.setState({
        tags: data.tags,
        entries: this.addExportTag(data.entries)
      });
    },

    setupFilter(filterVal) {
      this.setState({
        filter: filterVal.toLowerCase()
      });
    },

    changeOrder(newOrderType) {
      window.myStore.changedOrder(newOrderType);
      this.setState({
        orderType: newOrderType
      });
    },

    getProperOrderArr() {
      var rawArr = Object.keys(this.state.entries);
      if (rawArr.length > 0) {
        if (this.state.orderType === 'date') {
          return rawArr.reverse();
        } else {
          let tempArray = Object.keys(this.state.entries)
            .map(key => {
              let pattern =
                this.state.entries[key].note.length > 0
                  ? this.state.entries[key].note
                  : this.state.entries[key].title;
              if (this.isUrl(pattern)) {
                pattern = this.removeProtocolPrefix(pattern);
              }
              return {
                key: key,
                pattern: pattern
              };
            })
            .sort((a, b) => {
              return a.pattern.localeCompare(b.pattern);
            });
          return Object.keys(tempArray).map(obj => {
            return tempArray[obj].key;
          });
        }
      } else {
        return false;
      }
    },

    changeTag(e) {
      if (e === undefined) {
        this.setState({
          active_id: parseInt(this.state.active_id),
          active_title: this.state.active_title
        });
      } else {
        this.setState({
          active_id: parseInt(e),
          active_title: window.myStore.getTagTitleById(e)
        });
      }
    },

    removeProtocolPrefix(url) {
      return url.indexOf('://') > -1
        ? url.substring(url.indexOf('://') + 3, url.length).split('/')[0]
        : url.split('/')[0];
    },

    isUrl(url) {
      return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null;
    },

    checkFilterMatching(obj) {
      let filterArr = this.state.filter.match(/[^ ]+/g);
      let filterMatch = 0;
      filterArr.map(term => {
        let tempVal = false;
        window.myStore.getTagTitleArrayById(obj.tags).map(key => {
          if (key.toLowerCase().indexOf(term) > -1) tempVal = true;
        });
        if (
          obj.title.toLowerCase().indexOf(term) > -1 ||
          obj.note.toLowerCase().indexOf(term) > -1 ||
          obj.username.toLowerCase().indexOf(term) > -1
        ) {
          tempVal = true;
        }
        filterMatch += tempVal;
      });
      return filterMatch >= filterArr.length;
    },

    activeTag(obj) {
      return obj.tags.indexOf(this.state.active_id) > -1 || this.state.active_id === 0;
    },

    filterIsSet() {
      return this.state.filter.length > 0;
    },

    openNewEntry(url) {
      this.setState({
        newEntryUrl: url,
        newEntry: true
      });
    },

    toggleNewEntry() {
      this.setState({
        newEntryUrl: '',
        newEntry: !this.state.newEntry
      });
    },

    exportToggleAll() {
      var exportAll = true,
        allSelected = true,
        entries = this.state.entries;

      Object.keys(entries).forEach(entryId => {
        if (this.activeTag(entries[entryId])) {
          if (this.filterIsSet()) {
            if (this.checkFilterMatching(entries[entryId])) {
              if (!entries[entryId].export) allSelected = false;  
            }
          } else {
            if (!entries[entryId].export) allSelected = false;
          }
        }
      });

      if (allSelected) exportAll = false;

      Object.keys(entries).forEach(entryId => {
        if (this.activeTag(entries[entryId])) {
          if (this.filterIsSet()) {
            if (this.checkFilterMatching(entries[entryId])) {
              entries[entryId].export = exportAll;
            }
          } else {
            entries[entryId].export = exportAll;
          }
        }
      });

      this.setState({
        entries: entries
      });
    },

    onToggleEntry(entryId) {
      var entries = this.state.entries;
      entries[entryId].export = !entries[entryId].export;

      this.setState({
        entries: entries
      });
    },

    exportEntries(event) {
      if (!this.state._isMounted) return;
      event.preventDefault();

      window.myStore.emit('export', {
        eventType: 'progress', 
        value: 0
      });

      this.setState({
        exportedEntries: []
      });

      var entriesToExport = [];
      let entries = this.getProperOrderArr();
      entries.forEach(entry => {
        if (this.state.entries[entry].export) {
          if (this.activeTag(this.state.entries[entry])) {
            if (this.filterIsSet()) {
              if (this.checkFilterMatching(entries[entryId])) {
                entriesToExport.push(this.state.entries[entry]);
              }
            } else {
              entriesToExport.push(this.state.entries[entry]);
            }
          }
        }
      });

      chrome.runtime.sendMessage(
        { type: 'exportEntries', content: entriesToExport, clipboardClear: false },
        response => {
          if (response && response.content && response.content.success) {
            this.setState(
              {
                exportedEntries: response.content.entries
              },
              function() {
                this.exportDownload();
                this.exportEnd();
              }
            );
          } else {
            this.exportEnd();
          }
        }
      );
    },

    escapeExportField(value) {
      if (value.match(/\"/g)) {
        return '"' + value.replace(/\"/g, '""') + '"';
      } else if (value.match(/\,/g)) {
        return '"' + value + '"';
      } else {
        return value;
      }
    },

    exportDownload() {
      if (this.state.exportedEntries.length == 0) return;

      var fields = ['title', 'note', 'username', 'password', 'tags', 'safe_note'];
      var text = String();

      this.state.exportedEntries.forEach(entry => {
        var values = [];
        fields.forEach((field, key) => {
          if (field === 'tags') {
            values[key] = entry[field]
              ? this.escapeExportField(window.myStore.getTagTitleArrayById(entry[field]).join('|'))
              : '';
          } else {
            values[key] = entry[field] ? this.escapeExportField(entry[field]) : '';
          }
        });
        text = text + values.join(',') + '\n';
      });

      var blob = new Blob([text], { type: 'octet/stream' }),
        url = window.URL.createObjectURL(blob),
        a = document.createElement('a');

      document.body.appendChild(a);
      a.style = 'display: none';
      a.href = url;
      a.download = 'trezor-export.csv';
      a.click();
      a.remove();
    },

    exportEnd() {
      this.setState(
        {
          exportedEntries: []
        },
        function() {
          window.myStore.emit('export', {
            eventType: 'mode', 
            value: false
          });
          window.myStore.emit('export', {
            eventType: 'progress', 
            value: -1
          });
        }
      );
    },

    exportCancel() {
      this.exportEnd();
      chrome.runtime.sendMessage({ type: 'getFeatures' });
    },

    render() {
      let raw_table = this.getProperOrderArr(),
        count = !!raw_table.length ? 0 : 1,
        allSelected = true,
        selectedCount = 0,
        newTagArr = this.state.active_id === 0 ? [] : [this.state.active_id],
        password_table = !!raw_table.length ? (
          raw_table.map(key => {
            let obj = this.state.entries[key];
            let actTag = this.activeTag(obj);
            let exporting = obj.export && selectedCount === this.state.exportProgress;

            if (actTag) {
              if (this.filterIsSet()) {
                if (this.checkFilterMatching(obj)) {

                  if (obj.export) {
                    selectedCount++;
                  } else {
                    allSelected = false;
                  }

                  count++;
                  return (
                    <TableEntry
                      key={key}
                      key_value={key}
                      title={obj.title}
                      username={obj.username}
                      password={obj.password}
                      nonce={obj.nonce}
                      tags={obj.tags}
                      safe_note={obj.safe_note}
                      note={obj.note}
                      exportEntry={obj.export}
                      exportProgress={this.state.exportProgress}
                      exportMode={this.state.exportMode}
                      exportingEntry={exporting}
                      onToggle={this.onToggleEntry}
                      saving_entry={this.state.saving_entry}
                    />
                  );
                }
              } else {

                if (obj.export) {
                  selectedCount++;
                } else {
                  allSelected = false;
                }

                count++;
                return (
                  <TableEntry
                    key={key}
                    key_value={key}
                    title={obj.title}
                    username={obj.username}
                    password={obj.password}
                    nonce={obj.nonce}
                    tags={obj.tags}
                    safe_note={obj.safe_note}
                    note={obj.note}
                    exportEntry={obj.export}
                    exportProgress={this.state.exportProgress}
                    exportMode={this.state.exportMode}
                    exportingEntry={exporting}
                    onToggle={this.onToggleEntry}
                    saving_entry={this.state.saving_entry}
                  />
                );
              }
            }
          })
        ) : (
          <div className="no-entries">
            <img src="dist/app-images/nopwd.svg" alt="no passwords" />
            <div className="headline">Add your first password.</div>
            <div>Click to “Add entry” or use “Import”</div>
          </div>
        );

      return (
        <div className="wraper container-fluid">
          <div className="row page-title">
            {this.state.exportMode && (
              <div className="col-sm-12">
                <div className={'export'}>
                  {this.state.exportProgress === -1 && (<label
                    className={'checkbox ' + (allSelected && count > 0 ? ' active' : '') + (count === 0 ? ' disabled' : '')}
                    onClick={this.exportToggleAll}
                  >
                    <i>{allSelected && <img src="./images/checkbox_checked.svg" />}</i> Select all
                  </label>)}
                  <span className="info">({selectedCount} entries selected)</span>
                  <Button onClick={this.exportCancel} className="btn-link">
                    Cancel
                  </Button>
                  <Button
                    onClick={this.exportEntries}
                    bsStyle={'primary'}
                    className={'btn-export'}
                    disabled={selectedCount > 0 ? false : true}
                  >
                    Export selected
                  </Button>
                </div>
              </div>
            )}
            {!this.state.exportMode && (
              <div className="col-sm-8 col-xs-9">
                <button
                  type="button"
                  onClick={this.toggleNewEntry}
                  disabled={this.state.newEntry || this.state.saving_entry}
                  className="blue-btn add"
                >
                  Add entry
                </button>
                <FilterInput eventEmitter={this.props.eventEmitter} />
              </div>
            )}
            {!this.state.exportMode && (
              <div className="col-sm-4 col-xs-3 text-right">
                <DropdownButton
                  title="Sort"
                  className="dropdown order"
                  noCaret
                  pullRight
                  id="order-dropdown-no-caret"
                >
                  <MenuItem
                    active={this.state.orderType === 'note'}
                    onSelect={this.changeOrder.bind(null, 'note')}
                  >
                    <i className="ion-ios-list-outline" />
                    Title
                  </MenuItem>
                  <MenuItem
                    active={this.state.orderType === 'date'}
                    onSelect={this.changeOrder.bind(null, 'date')}
                  >
                    <i className="ion-calendar" />
                    Date
                  </MenuItem>
                </DropdownButton>
                <UserMenu />
              </div>
            )}
          </div>
          <div className="row dashboard">
            {this.state.newEntry && (
              <TableEntry
                key={undefined}
                key_value={undefined}
                title={this.state.newEntryUrl}
                username=""
                password=""
                tags={newTagArr}
                note={this.state.newEntryUrl.length ? tld.getDomain(this.state.newEntryUrl) : ''}
                nonce=""
                safe_note=""
                mode={'edit-mode'}
                content_changed={'edited'}
              />
            )}
            {count !== 0 ? (
              password_table
            ) : (
              <div className="no-entries">
                <img src="dist/app-images/nosearch.svg" alt="no passwords" />
                <div className="headline">No results.</div>
                <div>Consider your criteria.</div>
              </div>
            )}
          </div>
          <div className={"data-loader" + (this.state.saving_entry ? " active" : "")}>
            {this.state.saving_entry && (<div>
                <span className="spinner" />
                Saving
              </div>)}
            {!this.state.saving_entry && (<div>
              <i className={"icon icon-checkmark"}></i>
              Saved
            </div>)}
          </div>
        </div>
      );
    }
  });

module.exports = PasswordTable;
