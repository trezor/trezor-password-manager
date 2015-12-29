'use strict';

require('whatwg-fetch');
var React = require('react'),
    Router = require('react-router'),
    DropdownButton = require('react-bootstrap').DropdownButton,
    MenuItem = require('react-bootstrap').MenuItem,
    Tooltip = require('react-bootstrap').Tooltip,
    OverlayTrigger = require('react-bootstrap').OverlayTrigger,
    Textarea = require('react-textarea-autosize'),
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

        getInitialState: function () {
            return {
                context: this.props.context || {},
                image_src: 'dist/app-images/transparent.png',
                mode: this.props.mode || 'list-mode',
                key_value: this.props.key_value,
                title: this.props.title,
                username: this.props.username,
                password: this.props.password,
                tags_id: this.props.tags,
                tags_titles: this.props.context.getTagTitleArrayById(this.props.tags) || [],
                note: this.props.note,
                tag_globa_title_array: this.props.context.getTagTitleArray(),
                tags_available: this.props.context.getPossibleToAddTagsForEntry(this.props.key_value),
                show_available: false,
                content_changed: this.props.content_changed || ''
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

        isURL(str) {
            var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
                '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
                '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
                '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
                '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
                '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
            return pattern.test(str);
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
            if (this.state.mode === 'list-mode') {
                console.log('switch to edit mode');
                var data = {
                    title: this.state.title,
                    username: this.state.username,
                    password: this.state.password
                };
                chrome.runtime.sendMessage({type: 'decryptPassword', content: data}, (response) => {
                    this.setState({
                        password: response.content,
                        mode: 'edit-mode'
                    });
                });
            } else {
                console.log('switch to list mode');
                var oldValues = this.state.context.getEntryValuesById(this.state.key_value);
                if (this.state.title.indexOf('.') > -1) {
                    this.setState({
                        image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                    });
                }
                this.setState({
                    mode: 'list-mode',
                    password: oldValues.password
                })
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
                tags: tags_id,
                note: this.state.note
            };


            if (this.state.key_value) {
                var oldValues = this.state.context.getEntryValuesById(this.state.key_value);

                if (oldValues.username !== data.username || oldValues.title !== data.title) {
                    data.oldUsername = oldValues.username;
                    data.oldTitle = oldValues.title;
                }

                chrome.runtime.sendMessage({type: 'encryptPassword', content: data}, (response) => {
                    data.password = response.content;
                    console.log('password 0 ', response);
                    console.log('password 1 ', data.password);
                    this.state.context.saveDataToEntryById(this.state.key_value, data);
                    this.setState({
                        content_changed: '',
                        tags_available: this.state.context.getPossibleToAddTagsForEntry(this.state.key_value),
                        show_available: false

                    });
                });

            } else {
                chrome.runtime.sendMessage({type: 'encryptPassword', content: data}, (response) => {
                    data.password = response.content;
                    this.state.context.addNewEntry(data);
                    this.setState({
                        mode: 'list-mode'
                    });
                });
            }
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
                    note: oldValues.note
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
            if (this.state.mode === 'list-mode') {
                /*if (this.isURL(this.state.title)) {
                 chrome.tabs.create({url: this.state.title});
                 }*/
            }
        },

        removeEntry() {
            this.state.context.removeEntry(this.state.key_value);
        },

        revertHistory() {

        },

        render() {
            var showPassword = (<Tooltip id='show'>Show/hide password.</Tooltip>),
                generatePassword = (<Tooltip id='generate'>Generate password.</Tooltip>),
                interator = 0,
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

            return (
                <div className={ this.state.mode + ' entry col-xs-12 ' + this.state.content_changed}
                     onClick={this.openTab}>
                    <form onSubmit={this.saveEntry}>
                        <div className='avatar'>
                            <img src={this.state.image_src}
                                 onError={this.handleError}/>
                            <i className={'icon ion-' + this.state.context.getTagIconById(this.state.tags_id[this.state.tags_id.length-1])}></i>
                        </div>

                        <div className='title'>
                            <span>Title </span>
                            <input type='text'
                                   autoComplete='off'
                                   value={this.state.title}
                                   name='title'
                                   onChange={this.handleChange}
                                   onKeyUp={this.keyPressed}
                                   onBlur={this.titleOnBlur}
                                   disabled={this.state.mode === 'list-mode' ? 'disabled' : false}/>
                        </div>

                        <div className='username'>
                            <span>Username </span>
                            <input type='text'
                                   autoComplete='off'
                                   value={this.state.username}
                                   name='username'
                                   onChange={this.handleChange}
                                   onKeyUp={this.keyPressed}
                                   disabled={this.state.mode === 'list-mode' ? 'disabled' : false}/>
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
                            <OverlayTrigger placement='top'
                                            overlay={showPassword}>
                                <i className='button ion-eye'
                                   onClick={this.showPassword}></i>
                            </OverlayTrigger>
                            <OverlayTrigger placement='top'
                                            overlay={generatePassword}>
                                <i className='button ion-loop'
                                   onClick={this.generatePassword}></i>
                            </OverlayTrigger>
                        </div>

                        <div className='tags'>
                            <span>Tags </span>
                            <span ref='tags'
                                  className='tagsinput'>{tags}
                            </span>
                        </div>

                        <div className='available-tags'>{tags_available}</div>


                        <div className='note'>
                            <span>Note </span>
                            <Textarea type='text'
                                      autoComplete='off'
                                      onChange={this.handleChange}
                                      onKeyUp={this.keyPressed}
                                      value={this.state.note}
                                      defaultValue={''}
                                      name='note'></Textarea>
                        </div>

                        <div className='form-buttons'>
                            <span className='close-btn' onClick={this.changeMode}>
                                <i className='ion-ios-locked-outline'></i>
                            </span>

                            {null != this.state.key_value &&
                            <DropdownButton title='' noCaret pullRight id='dropdown-no-caret'>
                                <MenuItem eventKey='1' onSelect={this.removeEntry}><i className='ion-close'></i> Remove
                                    entry</MenuItem>
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
            )
        }
    });

module.exports = TableEntry;
