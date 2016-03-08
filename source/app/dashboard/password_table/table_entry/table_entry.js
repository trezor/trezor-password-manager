'use strict';

require('whatwg-fetch');

var React = require('react'),
    Router = require('react-router'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    Tooltip = require('react-bootstrap').Tooltip,
    OverlayTrigger = require('react-bootstrap').OverlayTrigger,
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
                nonce: this.props.nonce,
                tags_id: this.props.tags,
                tags_titles: window.myStore.getTagTitleArrayById(this.props.tags) || [],
                note: this.props.note,
                safe_note: this.props.safe_note,
                tag_globa_title_array: window.myStore.getTagTitleArray(),
                tags_available: window.myStore.getPossibleToAddTagsForEntry(this.props.key_value),
                show_available: false,
                content_changed: this.props.content_changed || '',
                waiting_trezor: '',
                waiting_trezor_msg: '',
                clipboard_pwd: false,
                clipboard_usr: false,
                saving_entry: false
            };
        },

        componentWillReceiveProps(nextProps){
            this.setState({
                tags_id: nextProps.tags,
                tags_titles: window.myStore.getTagTitleArrayById(nextProps.tags),
                tag_globa_title_array: window.myStore.getTagTitleArray(),
                tags_available: window.myStore.getPossibleToAddTagsForEntry(this.state.key_value)

            });
        },

        componentDidMount() {
            if (this.isUrl(this.decomposeUrl(this.state.title).domain)) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.decomposeUrl(this.state.title).domain
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
            return url.match(/[a-z]+\.[a-z][a-z]+(\/.*)?$/i) != null
        },

        decomposeUrl(url) {
            var title = {index: url.indexOf('://')};
            if (title.index > -1) {
                title.protocol = url.substring(0, title.index + 3);
                title.domain = url.split('/')[2];
                title.path = url.slice(title.protocol.length + title.domain.length, url.length);
            } else {
                title.protocol = false;
                title.domain = url.split('/')[0];
                title.path = url.slice(title.domain.length, url.length);
            }
            return title;
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

        openTab() {
            var data = {
                title: this.state.title
            };
            chrome.runtime.sendMessage({type: 'openTab', content: data});
        },

        openTabAndLogin() {
            this.setTrezorWaitingBackface('Opening Tab');
            var data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
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
            var data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
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
                            mode: 'edit-mode'
                        });
                    }
                    this.setTrezorWaitingBackface(false);

                });
            } else {
                var oldValues = window.myStore.getEntryValuesById(this.state.key_value);
                if (this.isUrl(this.decomposeUrl(this.state.title).domain)) {
                    this.setState({
                        image_src: 'https://logo.clearbit.com/' + this.decomposeUrl(this.state.title).domain
                    });
                }
                this.setState({
                    mode: 'list-mode',
                    password: oldValues.password,
                    safe_note: oldValues.safe_note
                })
            }
        },

        saveEntry(e) {
            e.preventDefault();
            if (!this.state.saving_entry) {
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
                    tags_available: window.myStore.getPossibleToAddTagsForEntry(this.state.key_value),
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
            if (this.isUrl(this.decomposeUrl(this.state.title).domain)) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.decomposeUrl(this.state.title).domain
                });
            } else {
                this.setState({
                    image_src: 'dist/app-images/transparent.png'
                });
            }
        },

        togglePassword() {
            var input = React.findDOMNode(this.refs.password);
            if (input.getAttribute('type') === 'text') {
                input.setAttribute('type', 'password');
            } else {
                input.setAttribute('type', 'text');
            }
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
            window.myStore.removeEntry(this.state.key_value);
        },

        render() {
            var showPassword = (<Tooltip id='show'>Show/hide password</Tooltip>),
                generatePassword = (<Tooltip id='generate'>Generate password</Tooltip>),
                openEntryTab = (<Tooltip id='open'>Open and login</Tooltip>),
                copyClipboardPwd = (
                    <Tooltip id='clipboard-pwd'>{this.state.clipboard_pwd ? 'Copied!' : 'Copy to clipboard'}</Tooltip>),
                copyClipboardUsr = (
                    <Tooltip id='clipboard-usr'>{this.state.clipboard_usr ? 'Copied!' : 'Copy to clipboard'}</Tooltip>),
                entryTitle = 'Item/URL',
                noteArea = null,
                unlockEntry = this.state.mode === 'list-mode' ? (<Tooltip id='unlock'>Edit entry</Tooltip>) : (
                    <Tooltip id='unlock'>Close entry</Tooltip>),
                interator = 0,
                title = this.state.mode === 'list-mode' ?
                    (<input type='text'
                            autoComplete='off'
                            value={this.decomposeUrl(this.state.title).domain}
                            name='title'
                            onClick={this.openTab}
                            className='title-input'
                            disabled='disabled'/>) : (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.title}
                           name='title'
                           onChange={this.handleChange}
                           onKeyUp={this.keyPressed}
                           onBlur={this.titleOnBlur}/>),

                username = this.state.mode === 'list-mode' ?
                    (<OverlayTrigger placement='bottom' overlay={copyClipboardUsr}>
                        <input type='text'
                               autoComplete='off'
                               value={this.state.username}
                               onClick={this.copyUsernameToClipboard}
                               name='username'
                               disabled='disabled'/>
                    </OverlayTrigger>) : (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.username}
                           name='username'
                           onChange={this.handleChange}
                           onKeyUp={this.keyPressed}
                        />),


                tags = this.state.tags_titles.map((key) => {
                    return (<span className='tagsinput-tag'
                                  onClick={this.switchTag.bind(null , key)}
                                  key={key}>{key}<i className='icon ion-close'></i></span>)
                });

            if (this.state.show_available) {
                var tags_available = this.state.tags_available.map((key) => {
                    interator++;
                    return (<span className='tagsinput-available-tag'
                                  onClick={this.switchTag.bind(null , key)}
                                  key={key}>{ key }</span>)
                });
            } else if (this.state.tag_globa_title_array.length !== this.state.tags_titles.length + 1) {
                tags.push(<span key={'tagsinput-input'+0}
                                name='taginput'
                                ref='taginput'
                                onClick={this.addPossibleTags}
                                className='tagsinput-input'>+ Add</span>);
            }

            if (this.state.title.length) {
                if (this.isUrl(this.decomposeUrl(this.state.title).domain)) {
                    entryTitle = 'URL'
                } else {
                    entryTitle = 'Item'
                }
            }

            if (this.state.mode === 'list-mode' && this.state.note.length) {
                noteArea = (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.note}
                           disabled='disabled'
                           spellCheck='false'
                           name='note'/>)

            } else if (this.state.mode === 'edit-mode') {
                noteArea = (
                    <TextareaAutosize type='text'
                                      autoComplete='off'
                                      onChange={this.handleChange}
                                      onKeyUp={this.keyPressed}
                                      value={this.state.note}
                                      name='note'/>)
            }

            return (
                <div className={'card ' + this.state.waiting_trezor}>
                    <div className={ this.state.mode + ' entry col-xs-12 ' + this.state.content_changed}>
                        <form onSubmit={this.state.saving_entry ? false : this.saveEntry}>
                            <div className='avatar'>
                                <img src={this.state.image_src}
                                     onError={this.handleError}/>
                                <i className={'icon ion-' + window.myStore.getTagIconById(this.state.tags_id[this.state.tags_id.length-1])}></i>
                            </div>

                            <div className='title'>
                                {entryTitle}
                                {title}
                            </div>

                            <div className='username'>
                                <span>Username </span>
                                {username}
                            </div>

                            <div className='password'>
                                <span>Password </span>
                                <input type='password'
                                       autoComplete='off'
                                       ref='password'
                                       name='password'
                                       onChange={this.handleChange}
                                       onKeyUp={this.keyPressed}
                                       value={this.state.password}/>
                                <OverlayTrigger placement='top' overlay={showPassword}>
                                    <i className='button ion-eye' onClick={this.togglePassword}></i>
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


                            <div className='note'>
                                <span>Note </span>
                                {noteArea}
                            </div>

                            <div className='safe-note'>
                                <span>Secret Note </span>
                                <TextareaAutosize type='text'
                                                  autoComplete='off'
                                                  onChange={this.handleChange}
                                                  onKeyUp={this.keyPressed}
                                                  value={this.state.safe_note.toString()}
                                                  spellCheck='false'
                                                  name='safe_note'/>
                            </div>

                            <div className='form-buttons'>

                                {this.state.key_value != null &&
                                <OverlayTrigger placement='top' overlay={unlockEntry}>
                                    <span className='btn lock-btn' onClick={this.changeMode}>
                                        <i></i>
                                    </span>
                                </OverlayTrigger>
                                }

                                {this.state.key_value != null &&
                                <OverlayTrigger placement='top' overlay={copyClipboardPwd}>
                                    <span
                                        className={ this.state.clipboard_pwd ? 'btn clipboard-btn copied' : 'btn clipboard-btn'}
                                        onClick={this.copyPasswordToClipboard}>
                                        <i></i>
                                    </span>
                                </OverlayTrigger>
                                }

                                {this.isUrl(this.state.title) && this.state.key_value != null &&
                                <OverlayTrigger placement='top' overlay={openEntryTab}>
                                    <span className='btn open-tab-btn' onClick={this.openTabAndLogin}>
                                        <i></i>
                                    </span>
                                </OverlayTrigger>
                                }


                                {this.state.key_value != null &&
                                <DropdownButton title='' noCaret pullRight id='dropdown-no-caret'>
                                    <MenuItem eventKey='1' onSelect={this.removeEntry}><i className='ion-close'></i>
                                        Remove entry</MenuItem>
                                </DropdownButton>
                                }

                                <div className='content-btns'>
                                    <span className='button green-btn'
                                          onClick={this.state.saving_entry ? false : this.saveEntry}>{this.state.saving_entry ? 'Saving' : 'Save'}</span>
                                    <span className='button red-btn'
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
