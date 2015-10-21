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
                image_src: 'dist/img/transparent.png',
                mode: this.props.mode || 'list-mode',
                key_value: this.props.key_value,
                title: this.props.title,
                username: this.props.username,
                password: this.props.password,
                tags_id: this.props.tags,
                tags_titles: this.props.context.getTagTitleArrayById(this.props.tags) || [],
                note: this.props.note,
                tag_globa_title_array: this.props.context.getTagTitleArray(),
                tags_available: ''
            };
        },

        componentWillReceiveProps(nextProps){
            this.setState({
                context: nextProps.context,
                tag_globa_title_array: nextProps.context.getTagTitleArray(),
                tags_titles: nextProps.context.getTagTitleArrayById(this.props.tags)
            });
            if (this.state.tags_available !== '') {
                this.setState({
                    tags_available: nextProps.context.getPossibleToAddTagsForEntry(this.state.key_value)
                });
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

        componentDidMount() {
            if (this.state.title.indexOf('.') > -1) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                });
            }
        },

        handleChange: function (e) {
            this.setState({[e.target.name]: e.target.value});
        },

        handleError() {
            this.setState({
                image_src: 'dist/img/transparent.png'
            });
        },

        changeMode() {
            if (this.state.mode === 'list-mode') {
                this.setState({
                    mode: 'edit-mode'
                })
            } else {
                if (this.state.title.indexOf('.') > -1) {
                    this.setState({
                        image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                    });
                }
                this.setState({
                    mode: 'list-mode'
                })
            }
        },

        saveEntry(e) {
            e.preventDefault();
            var data = {
                title: this.state.title,
                username: this.state.username,
                password: this.state.password,
                tags: this.state.tags_id,
                note: this.state.note
            };
            this.state.context.saveDataToEntryById(this.state.key_value, data);
            this.changeMode();
        },

        titleOnBlur() {
            if (this.state.title.indexOf('.') > -1
                && this.state.context.getEntryTitleById(this.state.key_value) != this.state.title) {
                this.setState({
                    image_src: 'https://logo.clearbit.com/' + this.extractDomain(this.state.title)
                });
            } else {
                this.setState({
                    image_src: 'dist/img/transparent.png'
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
            this.setState({
                password: Password.generate(16)
            });
        },

        addPossibleTags() {
            this.setState({
                tags_available: this.state.context.getPossibleToAddTagsForEntry(this.state.key_value)
            });
        },

        switchTag(tagTitle) {
            var tagId = this.state.context.getTagIdByTitle(tagTitle);
            if (this.state.tags_titles.indexOf(tagTitle) == -1) {
                // add tag
                this.state.context.addTagToEntry(tagId, this.state.key_value);
            } else {
                // remove tag
                this.state.context.removeTagFromEntry(tagId, this.state.key_value);
            }
            this.setState({
                tags_titles: this.state.context.getTagTitleArrayById(this.props.tags),
                tags_available: this.state.context.getPossibleToAddTagsForEntry(this.state.key_value)
            });
        },

        render() {
            var showPassword = (<Tooltip id='show'>Show/hide password.</Tooltip>),
                generatePassword = (<Tooltip id='generate'>Generate password.</Tooltip>),
                interator = 0,
                tags = this.state.tags_titles.map((key) => {
                    return (<span className='tagsinput-tag'
                                  onClick={this.switchTag.bind(null , key)}
                                  key={key}>{key}<i className="icon ion-close"></i></span>)
                });

            if (this.state.tags_available.length > 0) {
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
                <div className={'entry col-xs-12 ' + this.state.mode}>
                    <form onSubmit={this.saveEntry}>
                        <div className='avatar'>
                            <img src={this.state.image_src}
                                 onError={this.handleError}/>
                            <i className={'icon ion-' + this.state.context.getTagIconById(this.state.tags_id[this.state.tags_id.length-1] % 5)}></i>
                        </div>

                        <div className='title'>
                            <span>Title </span>
                            <input type='text'
                                   autoComplete='off'
                                   value={this.state.title}
                                   name='title'
                                   onChange={this.handleChange}
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
                                   disabled={this.state.mode === 'list-mode' ? 'disabled' : false}/>
                        </div>

                        <div className='password'>
                            <span>Password </span>
                            <input type='password'
                                   autoComplete='off'
                                   ref='password'
                                   name='password'
                                   onChange={this.handleChange}
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
                                      value={this.state.note}
                                      defaultValue={''}
                                      name='note'></Textarea>
                        </div>

                        <span className='edit-btn' onClick={this.changeMode}>
                        <i className='ion-chevron-down'></i>
                        </span>

                        <div className='form-buttons'>
                            <button action='submit' className='green-btn'>Save</button>
                        </div>

                    </form>
                </div>
            )
        }
    });

module.exports = TableEntry;
