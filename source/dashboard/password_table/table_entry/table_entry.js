'use strict';

require('whatwg-fetch');
var React = require('react'),
    Router = require('react-router'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    Tooltip = require('react-bootstrap').Tooltip,
    OverlayTrigger = require('react-bootstrap').OverlayTrigger,
    Textarea = require('react-textarea-autosize'),
    Clipboard = require('clipboard-js'),
    Password = {
        _pattern: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
        _getRandomByte: function () {
            if (window.crypto && window.crypto.getRandomValues) {
                var result = new Uint8Array(1);
                window.crypto.getRandomValues(result);
                return result[0];
            } else if (window.msCrypto && window.msCrypto.getRandomValues) {
                result = new Uint8Array(1);
                window.msCrypto.getRandomValues(result);
                return result[0];
            } else {
                return Math.floor(Math.random() * 256);
            }
        },
        generate: function (length) {
            return Array.apply(null, {'length': length})
                .map(function () {
                    var result;
                    while (true) {
                        result = String.fromCharCode(this._getRandomByte());
                        if (this._pattern.indexOf(result) >= 0) {
                            return result;
                        }
                    }
                }, this)
                .join('');
        }
    },

    TableEntry = React.createClass({

        getInitialState() {
            return {
                context: this.props.context || {},
                image_src: 'dist/app-images/transparent.png',
                mode: this.props.mode || 'list-mode',
                key_value: this.props.key_value,
                title: this.props.title,
                username: this.props.username,
                password: this.props.password,
                nonce: this.props.nonce,
                tags_id: this.props.tags,
                tags_titles: this.props.context.getTagTitleArrayById(this.props.tags) || [],
                note: this.props.note,
                safe_note: this.props.safe_note,
                tag_globa_title_array: this.props.context.getTagTitleArray(),
                tags_available: this.props.context.getPossibleToAddTagsForEntry(this.props.key_value),
                show_available: false,
                content_changed: this.props.content_changed || '',
                waiting_trezor: '',
                waiting_trezor_msg: ''
            };
        },

        componentWillReceiveProps(nextProps){
            this.setState({
                context: nextProps.context,
                tags_id: nextProps.tags,
                tags_titles: nextProps.context.getTagTitleArrayById(nextProps.tags),
                tag_globa_title_array: nextProps.context.getTagTitleArray(),
                tags_available: nextProps.context.getPossibleToAddTagsForEntry(this.state.key_value)

            });
        },

        componentDidMount() {
            if (this.state.title.indexOf('.') > -1) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
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

        changeMode() {
            this.hidePassword();
            if (this.state.mode === 'list-mode') {
                this.setTrezorWaitingBackface(true, 'Edit entry');
                var data = {
                    title: this.state.title,
                    username: this.state.username,
                    password: this.state.password,
                    safe_note: this.state.safe_note,
                    nonce: this.state.nonce
                };
                chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                    this.setTrezorWaitingBackface(false);
                    this.setState({
                        password: response.content.password,
                        safe_note: response.content.safe_note,
                        mode: 'edit-mode'
                    });
                });
            } else {
                var oldValues = this.state.context.getEntryValuesById(this.state.key_value);
                if (this.state.title.indexOf('.') > -1) {
                    this.setState({
                        image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                    });
                }
                this.setState({
                    mode: 'list-mode',
                    password: oldValues.password,
                    safe_note: oldValues.safe_note
                })
            }
        },

        extractDomain(url) {
            var domain;
            if (url.indexOf('://') > -1) {
                domain = url.split('/')[2];
            } else {
                domain = url.split('/')[0];
            }
            domain = domain.split(':')[0];
            return domain;
        },

        isUrl(url){
            return url.match(/[a-z]+\.[a-z][a-z]+$/i) != null
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

        setTrezorWaitingBackface(isWaiting, msg) {
            if (isWaiting) {
                this.setState({
                    waiting_trezor: 'waiting',
                    waiting_trezor_msg: msg
                });
            } else {
                this.setState({waiting_trezor: ' '});
            }
        },

        saveEntry(e) {
            e.preventDefault();
            var tags_id = [];
            this.state.tags_titles.map((key) => {
                tags_id.push(this.state.context.getTagIdByTitle(key));
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

            chrome.runtime.sendMessage({type: 'encryptPassword', content: data}, (response) => {
                data.password = response.content.password;
                data.safe_note = response.content.safe_note;
                data.nonce = response.content.nonce;
                if (this.state.key_value) {
                    this.setState({
                        mode: 'list-mode',
                        content_changed: '',
                        password: response.content.password,
                        safe_note: response.content.safe_note,
                        nonce: response.content.nonce
                    });
                    this.state.context.saveDataToEntryById(this.state.key_value, data);
                } else {
                    this.state.context.addNewEntry(data);
                }
            });
        },

        discardChanges() {
            var oldValues = this.state.context.getEntryValuesById(this.state.key_value);
            if (oldValues) {
                this.setState({
                    title: oldValues.title,
                    username: oldValues.username,
                    password: oldValues.password,
                    tags_id: oldValues.tags,
                    tags_titles: this.state.context.getTagTitleArrayById(oldValues.tags),
                    show_available: false,
                    tags_available: this.state.context.getPossibleToAddTagsForEntry(this.state.key_value),
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
                this.state.context.hideNewEntry();
            }
        },

        titleOnBlur() {
            if (this.state.title.indexOf('.') > -1) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                });
            } else {
                this.setState({
                    image_src: 'dist/app-images/transparent.png'
                });
            }
        },

        showPassword() {
            var input = React.findDOMNode(this.refs.password),
                inputAttr = input.getAttribute('type');
            if (inputAttr === 'text') {
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

        openTab() {
            this.setTrezorWaitingBackface(true, 'Open Tab');
            var data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
                nonce: this.state.nonce
            };
            chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                chrome.runtime.sendMessage({type: 'openTab', content: response.content});
                this.setTrezorWaitingBackface(false);
            });
        },

        copyUsernameToClipboard() {
            Clipboard.copy(this.state.username);
        },

        copyPasswordToClipboard() {
            this.setTrezorWaitingBackface(true, 'Copy password to clipboard');
            var data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
                nonce: this.state.nonce
            };
            chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                this.setTrezorWaitingBackface(false);
                Clipboard.copy(response.content.password);
            });
        },

        removeEntry() {
            // window.eventEmitter.emit(''); fix later
            this.state.context.removeEntry(this.state.key_value);
        },

        revertHistory() {

        },

        render() {
            var showPassword = (<Tooltip id='show'>Show/hide password</Tooltip>),
                generatePassword = (<Tooltip id='generate'>Generate password</Tooltip>),
                openEntryTab = (<Tooltip id='open'>Open and login</Tooltip>),
                copyClipboard = (<Tooltip id='clipboard'>Copy to clipboard</Tooltip>),
                entryTitle = 'Item/URL',
                unlockEntry = this.state.mode === 'list-mode' ? (<Tooltip id='unlock'>Unlock and edit</Tooltip>) : (
                    <Tooltip id='unlock'>Lock entry</Tooltip>),
                interator = 0,
                title = this.state.mode === 'list-mode' ?
                    (<input type='text'
                            autoComplete='off'
                            value={this.decomposeUrl(this.state.title).domain}
                            name='title'
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
                    (<OverlayTrigger placement='top' overlay={copyClipboard}>
                        <input type='text'
                               autoComplete='off'
                               value={this.state.username}
                               name='username'
                               onClick={this.copyUsernameToClipboard}
                               disabled='disabled'/>
                    </OverlayTrigger>) : (
                    <input type='text'
                           autoComplete='off'
                           value={this.state.username}
                           name='username'
                           onChange={this.handleChange}
                           onKeyUp={this.keyPressed}
                        />),

                noteArea = (this.state.mode === 'list-mode' && this.state.note.length) &&
                    (<Textarea type='text'
                               autoComplete='off'
                               onChange={this.handleChange}
                               onKeyUp={this.keyPressed}
                               value={this.state.note}
                               disabled='disabled'
                               defaultValue={''}
                               spellCheck='false'
                               name='note'></Textarea>),

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

            if (this.state.mode === 'edit-mode') {
                noteArea = (
                    <Textarea type='text'
                              autoComplete='off'
                              onChange={this.handleChange}
                              onKeyUp={this.keyPressed}
                              value={this.state.note}
                              defaultValue={''}
                              name='note'></Textarea>)
            }

            return (
                <div className={'card ' + this.state.waiting_trezor}>
                    <div className={ this.state.mode + ' entry col-xs-12 ' + this.state.content_changed}>
                        <form onSubmit={this.saveEntry}>
                            <div className='avatar'>
                                <img src={this.state.image_src}
                                     onError={this.handleError}/>
                                <i className={'icon ion-' + this.state.context.getTagIconById(this.state.tags_id[this.state.tags_id.length-1])}></i>
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
                                    <i className='button ion-eye' onClick={this.showPassword}></i>
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
                                <span>Safe Note </span>
                                <Textarea type='text'
                                          autoComplete='off'
                                          onChange={this.handleChange}
                                          onKeyUp={this.keyPressed}
                                          value={this.state.safe_note}
                                          defaultValue={''}
                                          spellCheck='false'
                                          name='safe_note'></Textarea>
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
                                <OverlayTrigger placement='top' overlay={copyClipboard}>
                                    <span className='btn clipboard-btn' onClick={this.copyPasswordToClipboard}>
                                        <i></i>
                                    </span>
                                </OverlayTrigger>
                                }

                                {this.isUrl(this.state.title) && this.state.key_value != null &&
                                <OverlayTrigger placement='top' overlay={openEntryTab}>
                                    <span className='btn open-tab-btn' onClick={this.openTab}>
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
                                    <span className='button green-btn' onClick={this.saveEntry}>Save</span>
                                    <span className='button red-btn' onClick={this.discardChanges}>Discard</span>
                                </div>
                            </div>
                            <button type='submit' className='submit-btn'></button>
                        </form>
                    </div>
                    <div className='backface'>
                        <span className='text'>
                            <span className='spinner'></span>
                            <strong>{this.state.waiting_trezor_msg}</strong> Waiting for TREZOR input
                        </span>
                    </div>
                </div>
            )
        }
    });

module.exports = TableEntry;
