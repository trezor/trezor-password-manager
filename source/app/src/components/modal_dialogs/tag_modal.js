'use strict';

var React = require('react'),
    Router = require('react-router'),
    Modal = require('react-bootstrap').Modal,
    icons = [
        'person',
        'social-bitcoin',
        'star',
        'flag',
        'heart',
        'settings',
        'email',
        'cloud',
        'alert-circled',
        'person-stalker',
        'android-cart',
        'image',
        'card',
        'earth',
        'wifi'
    ],
    Tag_Modal = React.createClass({

        getInitialState() {
            return {
                context: {},
                showEditModal: false,
                showRemoveModal: false,
                newTagId: '',
                newTagTitle: '',
                newIcon: icons[0],
                contentChanged: ''

            };
        },

        componentWillMount() {
            window.eventEmitter.on('openAddTag', this.openEditModal);
            window.eventEmitter.on('openEditTag', this.openEdit);
            window.eventEmitter.on('openRemoveTag', this.openRemoveModal);
            window.eventEmitter.on('contextInit', this.saveContext);
        },

        saveContext(context) {
            this.setState({
                context: context
            });
        },

        /////////
        //
        // ADD / EDIT TAG
        //
        ////////

        closeEditModal() {
            this.setState({
                showEditModal: false
            });
        },

        openEditModal() {
            this.setState({
                newTagId: '',
                newTagTitle: '',
                newIcon: icons[0],
                showEditModal: true,
                content_changed: ''
            });
        },

        openEdit(entryId) {
            var icon = this.state.context.getTagIconById(entryId);
            this.setState({
                newTagId: entryId,
                newTagTitle: this.state.context.getTagTitleById(entryId),
                newIcon: icons[icons.indexOf(icon)],
                showEditModal: true,
                contentChanged: ''
            });

        },

        handleChange: function (e) {
            this.setState({
                [e.target.name]: e.target.value
            });
            if (this.state.content_changed === '') {
                this.setState({
                    content_changed: 'edited'
                });
            }
        },

        nextIcon() {
            var index = icons.indexOf(this.state.newIcon) + 1;
            if (index >= icons.length) index = 0;
            this.setState({
                newIcon: icons[index]
            });
        },

        prevIcon() {
            var index = icons.indexOf(this.state.newIcon) - 1;
            if (index < 0) index = icons.length - 1;
            this.setState({
                newIcon: icons[index]
            });
        },

        saveTagChanges() {
            this.state.context.changeTagTitleById(parseInt(this.state.newTagId), this.state.newTagTitle);
            this.state.context.changeTagIconById(parseInt(this.state.newTagId), this.state.newIcon);
        },

        addNewTag() {
            this.state.context.addNewTag(this.state.newTagTitle, this.state.newIcon);
        },

        handleKeyDown(e) {
            var ENTER = 13;
            if (e.keyCode == ENTER) {
                this.saveEditModal();
            }
        },

        saveEditModal() {
            if (this.state.newTagId === '' && this.state.newTagTitle != '') {
                this.addNewTag();
            } else {
                this.saveTagChanges();
            }
            this.closeEditModal();
        },

        /////////
        //
        // ADD / EDIT TAG
        //
        ////////

        openRemoveModal(entryId) {
            var icon = this.state.context.getTagIconById(entryId);
            this.setState({
                newTagId: entryId,
                newTagTitle: this.state.context.getTagTitleById(entryId),
                newIcon: icons[icons.indexOf(icon)],
                showRemoveModal: true
            });

        },

        closeRemoveModal() {
            this.setState({
                showRemoveModal: false
            });
        },

        removeTagCloseModal() {
            this.state.context.removeTag(this.state.newTagId);
            this.setState({
                showRemoveModal: false
            });
        },

        render(){
            return (
                <div className='tag-modal'>
                    <Modal show={this.state.showEditModal} onHide={this.closeEditModal}>
                        <Modal.Body>
                            <div>
                                <a className='icon ion-close-round close-btn' onClick={this.closeEditModal}/>

                                <div className='avatar'>
                                    <a className='icon ion-chevron-left prev'
                                       onClick={this.prevIcon}></a>
                                    <span><i className={'icon ion-'+this.state.newIcon}></i></span>
                                    <a className='icon ion-chevron-right next'
                                       onClick={this.nextIcon}></a>
                                </div>
                                <span className={'title ' + this.state.content_changed}>
                                    <input type='text'
                                           autofocus
                                           autoComplete='off'
                                           name='newTagTitle'
                                           ref='newTagTitle'
                                           placeholder='New tag title'
                                           onChange={this.handleChange}
                                           onKeyDown={this.handleKeyDown}
                                           value={this.state.newTagTitle}/>
                                    <div className='btn-controls'>
                                        <button className="btn green-btn" onClick={this.saveEditModal}>Save</button>
                                        <button className="btn red-btn" onClick={this.closeEditModal}>Discard</button>
                                    </div>
                                </span>
                            </div>
                        </Modal.Body>
                    </Modal>

                    <Modal show={this.state.showRemoveModal} onHide={this.closeRemoveModal}>
                        <Modal.Body>
                            <div>
                                <a className='icon ion-close-round close-btn' onClick={this.closeRemoveModal}/>

                                <div className='avatar'>
                                    <span><i className={'icon ion-'+this.state.newIcon}></i></span>
                                </div>
                                <span className='title edited'>
                                    <input type='text'
                                           autoComplete='off'
                                           name='removeTag'
                                           ref='removeTag'
                                           disabled
                                           value={'Remove ' + this.state.newTagTitle + ' ?'}/>
                                    <div className='btn-controls'>
                                        <button className="btn  green-btn" onClick={this.removeTagCloseModal}>Yes,
                                            remove
                                        </button>
                                        <button className="btn red-btn" onClick={this.closeRemoveModal}>No</button>
                                    </div>
                                </span>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    });

module.exports = Tag_Modal;
