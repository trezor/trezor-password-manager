/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
  MenuItem = require('react-bootstrap').MenuItem,
  DropdownButton = require('react-bootstrap').DropdownButton,
  DataService = require('../../global_components/data_service'),
  SidePanel = React.createClass({
    getInitialState() {
      return {
        tags: window.myStore.data.tags,
        active_id: 0,
        active_title: window.myStore.getTagTitleById(0),
        saving_entry: false,
        initAnimationDelay: true
      };
    },

    componentWillMount() {
      window.myStore.on('changeTag', this.changeTag);
      window.myStore.on('update', this.updateContent);
      chrome.runtime.onMessage.addListener(this.chromeTableMsgHandler);
    },

    componentWillUnmount() {
      window.myStore.removeListener('changeTag', this.changeTag);
      window.myStore.removeListener('update', this.updateContent);
      chrome.runtime.onMessage.removeListener(this.chromeTableMsgHandler);
    },

    chromeTableMsgHandler(request, sender, sendResponse) {
      switch (request.type) {
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
      }
      return true;
    },

    updateContent(data) {
      if (window.myStore.hasTagId(this.state.active_id) > -1) {
        this.setState({
          initAnimationDelay: false,
          tags: data.tags,
          active_title: window.myStore.getTagTitleById(this.state.active_id)
        });
      } else {
        this.changeTagAndEmitt(0);
        this.setState({
          tags: data.tags
        });
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

    changeTagAndEmitt(e) {
      this.setState({
        active_id: parseInt(e),
        active_title: window.myStore.getTagTitleById(e)
      });
      window.myStore.emit('changeTag', e);
    },

    addTag() {
      window.myStore.emit('openAddTag');
    },

    openTagEditor() {
      window.myStore.emit('openEditTag', this.state.active_id);
    },

    openDeleteTagModal() {
      window.myStore.emit('openRemoveTag', this.state.active_id);
    },

    render() {
      var editDropdown = (
          <DropdownButton
            title=""
            className="dropdown edit"
            noCaret
            pullRight
            id="edit-dropdown-no-caret"
          >
            <MenuItem eventKey="1" onSelect={this.openTagEditor}>
              Edit
            </MenuItem>
            <MenuItem eventKey="2" onSelect={this.openDeleteTagModal}>
              Delete
            </MenuItem>
          </DropdownButton>
        ),
        tag_array = Object.keys(this.state.tags).map((key, i = 0) => {
          const obj = this.state.tags[key];
          let classStyle = this.state.active_id === parseInt(key) ? 'active fadeIn' : 'fadeIn';
          classStyle += this.state.initAnimationDelay ? ' delayed' : '';
          return (
            <li key={i++} className={classStyle}>
              <a
                data-tag-key={key}
                data-tag-name={obj.title}
                onClick={this.changeTagAndEmitt.bind(null, key)}
                onTouchStart={this.changeTagAndEmitt.bind(null, key)}
              >
                <i className={'icon icon-' + obj.icon} />
                <span className="nav-label">{obj.title}</span>
              </a>
              {this.state.active_id !== 0 && editDropdown}
            </li>
          );
        });

      return (
        <aside className="left-panel">
          <div className="logo">
            <span className="logo-expanded">
              <img src="dist/app-images/t-logo.svg" alt="logo" />
            </span>
          </div>

          <nav className="navigation">
            <ul className="list-unstyled">
              {tag_array}

              <li className="add-tag-btn fadeIn">
                <a onClick={this.state.saving_entry ? false : this.addTag} onTouchStart={this.state.saving_entry ? false : this.addTag} className={this.state.saving_entry ? 'disabled' : ''}>
                  <i className="icon icon-add" />
                  <span className="nav-label">Add tag</span>
                </a>
              </li>
            </ul>
          </nav>
        </aside>
      );
    }
  });

module.exports = SidePanel;
