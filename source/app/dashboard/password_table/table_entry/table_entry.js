/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    tld = require('tldjs'),
    validator = require('validator'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    Tooltip = require('react-bootstrap').Tooltip,
    OverlayTrigger = require('react-bootstrap').OverlayTrigger,
    Overlay = require('react-bootstrap').Overlay,
    TextareaAutosize = require('react-textarea-autosize'),
    Clipboard = require('clipboard-js'),
    Password = require('../../../global_components/password_mgmt'),
    TableEntry = React.createClass({
        getInitialState() {
            return {
                image_src: 'dist/app-images/transparent.png',
                mode: this.props.mode || 'list-mode',
                key_value: this.props.key_value,
                title: this.props.title,
                username: this.props.username,
                password: this.props.password,
                password_visible: false,
                nonce: this.props.nonce,
                tags_id: this.props.tags,
                tags_titles: window.myStore.getTagTitleArrayById(this.props.tags) || [],
                note: this.props.note,
                safe_note: this.props.safe_note,
                safe_note_visible: false,
                tag_globa_title_array: window.myStore.getTagTitleArray(),
                tags_available: window.myStore.getPossibleToAddTagsForEntry(this.props.key_value, this.props.tags),
                show_available: false,
                content_changed: this.props.content_changed || '',
                waiting_trezor: '',
                waiting_trezor_msg: '',
                clipboard_pwd: false,
                clipboard_usr: false,
                saving_entry: false,
                showMandatoryField: false
            };
        },

        componentWillReceiveProps(nextProps){
            this.setState({
                tags_id: nextProps.tags,
                tags_titles: window.myStore.getTagTitleArrayById(nextProps.tags),
                tag_globa_title_array: window.myStore.getTagTitleArray(),
                tags_available: window.myStore.getPossibleToAddTagsForEntry(this.state.key_value, nextProps.tags)
            });
        },

        componentDidMount() {
            if (this.isUrl(this.removeProtocolPrefix(this.state.title))) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + tld.getDomain(this.state.title) + '?size=100'
                });
            }
        },

        handleChange(e) {
            if (this.state.content_changed === '') {
                this.setState({
                    content_changed: 'edited',
                    [e.target.name]: e.target.value
                });
            } else {
                this.setState({
                    [e.target.name]: e.target.value
                });
            }
        },

        handleError() {
            this.setState({
                image_src: 'dist/app-images/transparent.png'
            });
        },

        isUrl(url){
            return validator.isURL(url);
        },

        removeProtocolPrefix(url) {
            return url.indexOf('://') > -1 ? url.substring(url.indexOf('://') + 3, url.length).split('/')[0] : url.split('/')[0];
        },

        setTrezorWaitingBackface(msg) {
            if (msg) {
                this.setState({
                    waiting_trezor: 'waiting',
                    waiting_trezor_msg: msg
                });
            } else {
                this.setState({waiting_trezor: ' '});
            }
        },

        openTabAndLogin() {
            this.setTrezorWaitingBackface('Opening Tab');
            let data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
                safe_note: this.state.safe_note,
                nonce: this.state.nonce
            };
            chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                if (response != null) {
                    chrome.runtime.sendMessage({type: 'openTabAndLogin', content: response.content});
                }
                this.setTrezorWaitingBackface(false);

            });
        },

        copyUsernameToClipboard() {
            Clipboard.copy(this.state.username);
            this.setState({
                clipboard_usr: true
            });
            setTimeout(()=> {
                this.setState({
                    clipboard_usr: false
                });
            }, 2500);
        },

        copyPasswordToClipboard() {
            this.setTrezorWaitingBackface('Copy password to clipboard');
            let data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
                safe_note: this.state.safe_note,
                nonce: this.state.nonce
            };
            chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                if (response != null) {
                    Clipboard.copy(response.content.password);
                    this.setState({
                        clipboard_pwd: true
                    });
                    setTimeout(()=> {
                        this.setState({
                            clipboard_pwd: false
                        });
                    }, 2500);
                }
                this.setTrezorWaitingBackface(false);
            });
        },

        changeMode() {
            this.hidePassword();
            if (this.state.mode === 'list-mode') {
                this.setTrezorWaitingBackface('Editing entry');
                var data = {
                    title: this.state.title,
                    username: this.state.username,
                    password: this.state.password,
                    safe_note: this.state.safe_note,
                    nonce: this.state.nonce
                };
                chrome.runtime.sendMessage({type: 'decryptFullEntry', content: data}, (response) => {
                    if (response != null) {
                        this.setState({
                            password: response.content.password,
                            safe_note: response.content.safe_note,
                            mode: 'edit-mode',
                            password_visible: false,
                            safe_note_visible: false,
                            tags_titles: window.myStore.getTagTitleArrayById(this.state.tags_id),
                            tag_globa_title_array: window.myStore.getTagTitleArray(),
                            tags_available: window.myStore.getPossibleToAddTagsForEntry(this.state.key_value, this.state.tags_id)
                        });
                    }
                    this.setTrezorWaitingBackface(false);

                });
            } else {
                var oldValues = window.myStore.getEntryValuesById(this.state.key_value);
                if (this.isUrl(this.removeProtocolPrefix(this.state.title))) {
                    this.setState({
                        image_src: 'https://logo.clearbit.com/' + tld.getDomain(this.state.title) + '?size=100'
                    });
                }
                this.setState({
                    mode: 'list-mode',
                    password_visible: false,
                    safe_note_visible: false,
                    password: oldValues.password,
                    safe_note: oldValues.safe_note
                })
            }
        },

        saveEntry(e) {
            e.preventDefault();
            if (!this.state.saving_entry) {
                if (this.state.title.length > 0) {
                    this.setState({
                        saving_entry: true
                    });
                    var tags_id = [];
                    this.state.tags_titles.map((key) => {
                        tags_id.push(window.myStore.getTagIdByTitle(key));
                    });

                    var data = {
                        title: this.state.title,
                        username: this.state.username,
                        password: this.state.password,
                        nonce: this.state.nonce,
                        tags: tags_id,
                        safe_note: this.state.safe_note,
                        note: this.state.note
                    };

                    chrome.runtime.sendMessage({type: 'encryptFullEntry', content: data}, (response) => {
                        data.password = response.content.password;
                        data.safe_note = response.content.safe_note;
                        data.nonce = response.content.nonce;
                        if (this.state.key_value) {
                            this.setState({
                                mode: 'list-mode',
                                content_changed: '',
                                password: response.content.password,
                                password_visible: false,
                                safe_note_visible: false,
                                safe_note: response.content.safe_note,
                                nonce: response.content.nonce,
                                saving_entry: false
                            });
                            this.titleOnBlur();
                            window.myStore.saveDataToEntryById(this.state.key_value, data);
                        } else {
                            window.myStore.addNewEntry(data);
                        }
                    });
                } else {
                    // TITLE (item/url) is mandatory field - so fill it
                    React.findDOMNode(this.refs.title).focus();
                    this.setState({
                        showMandatoryField: true
                    });

                }

            }
        },

        discardChanges() {
            var oldValues = window.myStore.getEntryValuesById(this.state.key_value);
            if (oldValues) {
                this.setState({
                    title: oldValues.title,
                    username: oldValues.username,
                    password: oldValues.password,
                    tags_id: oldValues.tags,
                    tags_titles: window.myStore.getTagTitleArrayById(oldValues.tags),
                    show_available: false,
                    tags_available: window.myStore.getPossibleToAddTagsForEntry(this.state.key_value, oldValues.tags),
                    safe_note: oldValues.safe_note,
                    note: oldValues.note,
                    mode: 'list-mode'
                });
                if (this.state.content_changed === 'edited') {
                    this.setState({
                        content_changed: ''
                    });
                }
            } else {
                window.myStore.hideNewEntry();
            }
        },

        titleOnBlur() {
            if (this.isUrl(this.removeProtocolPrefix(this.state.title))) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + tld.getDomain(this.state.title) + '?size=100'
                });
                if (this.state.note.length === 0) {
                    this.setState({
                        note: tld.getDomain(this.state.title)
                    });
                }
            } else {
                this.setState({
                    image_src: 'dist/app-images/transparent.png'
                });
                if (this.state.note.length === 0) {
                    this.setState({
                        note: this.state.title
                    });
                }
            }
        },

        setProtocolPrefix(url) {
            return url.indexOf('://') > -1 ? url : 'https://' + url;
        },

        togglePassword() {
            this.setState({
                password_visible: !this.state.password_visible
            });
        },

        toggleNote() {
            this.setState({
                safe_note_visible: !this.state.safe_note_visible
            });
        },

        hidePassword() {
            var input = React.findDOMNode(this.refs.password);
            input.setAttribute('type', 'password');
        },

        generatePassword() {
            if (this.state.content_changed === '') {
                this.setState({
                    password: Password.generate(16),
                    content_changed: 'edited'
                });
            } else {
                this.setState({
                    password: Password.generate(16)
                });
            }
        },

        addPossibleTags() {
            this.setState({
                show_available: true
            });
        },

        switchTag(tagTitle) {
            var tagTitleArray = this.state.tags_titles,
                tagAvailableTitleArray = this.state.tags_available,
                indexTitleArray = tagTitleArray.indexOf(tagTitle),
                indexAvailableArray = tagAvailableTitleArray.indexOf(tagTitle);
            if (indexTitleArray > -1) {
                tagTitleArray.splice(indexTitleArray, 1);
                tagAvailableTitleArray.push(tagTitle);
                this.setState({
                    show_available: true,
                    tags_titles: tagTitleArray,
                    tags_available: tagAvailableTitleArray
                });
            } else {
                tagAvailableTitleArray.splice(indexAvailableArray, 1);
                tagTitleArray.push(tagTitle);
                this.setState({
                    show_available: true,
                    tags_titles: tagTitleArray,
                    tags_available: tagAvailableTitleArray
                });
            }

            if (this.state.content_changed === '') {
                this.setState({
                    content_changed: 'edited'
                });
            }
        },

        keyPressed(event) {
            if (event.keyCode == 27) {
                if (this.state.content_changed === '') {
                    this.setState({
                        mode: 'list-mode'
                    })
                } else {
                    this.discardChanges();
                }
            }
        },

        removeEntry() {
            window.myStore.emit('openRemoveEntry', this.state.key_value);
        },

        render() {
            var showPassword = (<Tooltip id='show'>{this.state.password_visible ? 'Hide password': 'Show password'}</Tooltip>),
                showNote = (<Tooltip id='show'>{this.state.safe_note_visible ? 'Hide note': 'Show note'}</Tooltip>),
                generatePassword = (<Tooltip id='generate'>Generate password</Tooltip>),
                mandatoryField = (<Tooltip id='mandatory' placement='right'>This field is mandatory!</Tooltip>),
                copyClipboardPwd = (
                    <Tooltip id='clipboard-pwd'>{this.state.clipboard_pwd ? 'Copied!' : 'Copy password'}</Tooltip>),
                copyClipboardUsr = (
                    <Tooltip id='clipboard-usr'>{this.state.clipboard_usr ? 'Copied!' : 'Copy username'}</Tooltip>),
                entryTitle = 'Item/URL *',
                entryTitleVal = this.state.note.length === 0 ? this.removeProtocolPrefix(this.state.title) : this.state.note,
                title = this.state.mode === 'list-mode' ?
                    (this.state.username.length === 0 ?
                        <a href={this.isUrl(this.state.title) ? this.setProtocolPrefix(this.state.title) : null}>{entryTitleVal}</a> :
                        <a onClick={this.isUrl(this.state.title) ? this.openTabAndLogin : null}
                           className={this.isUrl(this.state.title) ? 'pointer' : null}>{entryTitleVal}</a>) : (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.title}
                           name='title'
                           ref={this.state.key_value ? 'title' : 'newTitle'}
                           onChange={this.handleChange}
                           onKeyUp={this.keyPressed}
                           onBlur={this.titleOnBlur}/>
                ),

                username = this.state.mode === 'list-mode' ?
                    (this.state.username.length !== 0 ? <OverlayTrigger placement='bottom' overlay={copyClipboardUsr}>
                        <a onClick={this.copyUsernameToClipboard}>{this.state.username}</a>
                    </OverlayTrigger> : null) : (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.username}
                           name='username'
                           onChange={this.handleChange}
                           onKeyUp={this.keyPressed}
                        />),

                passwordShadow = this.state.mode === 'list-mode' ? (
                    <OverlayTrigger placement='bottom' overlay={copyClipboardPwd}>
                        <a onClick={this.copyPasswordToClipboard} className='password-shadow'>
                            <i className='icon ion-asterisk'></i>
                            <i className='icon ion-asterisk'></i>
                            <i className='icon ion-asterisk'></i>
                            <i className='icon ion-asterisk'></i>
                            <i className='icon ion-asterisk'></i></a>
                    </OverlayTrigger>) : null,


                tags = this.state.tags_titles.map((key, i = 0) => {
                    return (<span className='tagsinput-tag'
                                  onClick={this.switchTag.bind(null , key)}
                                  key={i++}>{key}<i className='icon ion-close'></i></span>)
                });

            if (this.state.show_available) {
                var tags_available = this.state.tags_available.map((key, i = 0) => {
                    return (<span className='tagsinput-available-tag'
                                  onClick={this.switchTag.bind(null , key)}
                                  key={i++}>{ key }</span>)
                });
            } else if (this.state.tag_globa_title_array.length !== this.state.tags_titles.length + 1) {
                tags.push(<span key={'tagsinput-input'+0}
                                name='taginput'
                                ref='taginput'
                                onClick={this.addPossibleTags}
                                className='tagsinput-input'>+ Add</span>);
            }

            if (this.state.title.length) {
                entryTitle = this.isUrl(this.state.title) ? 'URL *' : 'Item *';
            }

            return (
                <div className={'card ' + this.state.waiting_trezor}>
                    <div className={ this.state.mode + ' entry col-xs-12 ' + this.state.content_changed}>
                        <form onSubmit={this.state.saving_entry ? false : this.saveEntry}>
                            <div className='avatar'>
                                <img src={this.state.image_src}
                                     onError={this.handleError}/>
                                <i className={'icon ion-' + window.myStore.getTagIconById(this.state.tags_id[this.state.tags_id.length-1])}></i>
                                {this.state.username.length === 0 ?
                                    <a href={this.isUrl(this.state.title) ? this.setProtocolPrefix(this.state.title) : null} className={this.isUrl(this.state.title) ? 'pointer' : null}></a> :
                                    <a onClick={this.isUrl(this.state.title) ? this.openTabAndLogin : null} className={this.isUrl(this.state.title) ? 'pointer' : null}></a>
                                }
                            </div>

                            <div className='title'>
                                <span>{entryTitle}</span>
                                {title}
                            </div>

                            <div className='title-label'>
                                <span>Title </span>
                                <input type='text'
                                       autoComplete='off'
                                       value={this.state.note}
                                       name='note'
                                       onChange={this.handleChange}
                                       onKeyUp={this.keyPressed}/>
                            </div>

                            <div className='username'>
                                <span>Username </span>
                                {username}
                                {passwordShadow}
                            </div>

                            <div className='password'>
                                <span>Password </span>
                                <input type={this.state.password_visible ? 'text' : 'password'}
                                       autoComplete='off'
                                       ref='password'
                                       name='password'
                                       onChange={this.handleChange}
                                       onKeyUp={this.keyPressed}
                                       value={this.state.password}/>
                                <OverlayTrigger placement='top' overlay={showPassword}>
                                    <i className={this.state.password_visible ? 'button ion-eye-disabled' : 'button ion-eye'} onClick={this.togglePassword}></i>
                                </OverlayTrigger>
                                <OverlayTrigger placement='top' overlay={generatePassword}>
                                    <i className='button ion-loop' onClick={this.generatePassword}></i>
                                </OverlayTrigger>
                            </div>

                            <div className='tags'>
                                <span>Tags </span>
                                <span ref='tags' className='tagsinput'>{tags}</span>
                            </div>

                            <div className='available-tags'>{tags_available}</div>

                            <div className='safe-note'>
                                <span>Secret Note </span>
                                {this.state.safe_note_visible ?

                                <TextareaAutosize type='text'
                                                  ref='safe_note'
                                                  autoComplete='off'
                                                  onChange={this.handleChange}
                                                  onKeyUp={this.keyPressed}
                                                  value={this.state.safe_note.toString()}
                                                  spellCheck='false'
                                                  name='safe_note'/> :
                                    <input type='password'
                                           ref='safe_note'
                                           autoComplete='off'
                                           onChange={this.handleChange}
                                           onKeyUp={this.keyPressed} value={this.state.safe_note.toString()} name='safe_note' />
                                }
                                <OverlayTrigger placement='top' overlay={showNote}>
                                    <i className={this.state.safe_note_visible ? 'button ion-eye-disabled' : 'button ion-eye'} onClick={this.toggleNote}></i>
                                </OverlayTrigger>
                            </div>
                            {this.state.key_value != null &&
                            <div className='actions'>
                                <span>Actions </span>

                                <div className='button close-btn red-btn icon ion-trash-a'
                                     onClick={this.removeEntry}><span>Remove entry</span></div>
                            </div>
                            }
                            <div className='form-buttons'>

                                {this.state.key_value != null &&
                                <span className='button edit-btn transparent-btn icon ion-edit'
                                      onClick={this.changeMode}><span>Edit</span></span>
                                }

                                {this.state.key_value != null &&
                                <span className='button close-btn transparent-btn icon ion-close-round'
                                      onClick={this.changeMode}><span>Close</span></span>
                                }

                                {this.state.mode === 'edit-mode' &&
                                <Overlay show={this.state.showMandatoryField}
                                         container={this}
                                         onHide={() => this.setState({ showMandatoryField: false })}
                                         target={() => React.findDOMNode(this.refs.title)}
                                         placement='right'>{mandatoryField}</Overlay>
                                }

                                <div className='content-btns'>
                                    <span className='button green-btn'
                                          onClick={this.state.saving_entry ? false : this.saveEntry}>{this.state.saving_entry ? 'Saving' : 'Save'}</span>
                                    <span className='button white-btn'
                                          onClick={this.state.saving_entry ? false : this.discardChanges}>Discard</span>
                                </div>
                            </div>
                            <button type='submit' className='submit-btn'></button>
                        </form>
                    </div>
                    <div className='backface'>
                        <span className='text'>
                            <img src='dist/app-images/trezor_button.png'/>
                            <strong>Look at TREZOR!</strong>
                            {this.state.waiting_trezor_msg}
                        </span>
                    </div>
                </div>
            )
        }
    });

module.exports = TableEntry;
