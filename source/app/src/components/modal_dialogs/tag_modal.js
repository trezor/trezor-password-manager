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
                showModal: false,
                newTagId: '',
                newTagTitle: '',
                newIcon: icons[0]
            };
        },

        componentWillMount() {
            this.props.eventEmitter.on('openAddTag', this.open);
            this.props.eventEmitter.on('openEditTag', this.openEdit);
            this.props.eventEmitter.on('contextInit', this.saveContext);
        },

        saveContext(context) {
            this.setState({
               context: context 
            });
        },

        close() {
            this.setState({
                showModal: false
            });
        },

        open() {
            this.setState({
                newTagId: '',
                newTagTitle: '',
                newIcon: icons[0],
                showModal: true
            });
        },

        openEdit(entryId) {
            var icon = this.state.context.getTagIconById(entryId);
            this.setState({
                newTagId: entryId,
                newTagTitle: this.state.context.getTagTitleById(entryId),
                newIcon: icons[icons.indexOf(icon)],
                showModal: true
            });

        },

        handleChange: function (e) {
            this.setState({[e.target.name]: e.target.value});
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

        handleKeyDown: function(e) {
            var ENTER = 13;
            if( e.keyCode == ENTER ) {
                if(this.state.newTagId === '' && this.state.newTagTitle != ''){
                    this.addNewTag();
                }else{
                    this.saveTagChanges();
                }
                this.close();
            }

        },


        render(){
            return (
                <div className='add-tag'>
                    <Modal show={this.state.showModal} onHide={this.close}>
                        <Modal.Body>
                            <div>
                                <a className='icon ion-close-round close-btn' onClick={this.close}/>

                                <div className='avatar'>
                                    <a className='icon ion-chevron-left prev'
                                       onClick={this.prevIcon}></a>
                                    <span><i className={'icon ion-'+this.state.newIcon}></i></span>
                                    <a className='icon ion-chevron-right next'
                                       onClick={this.nextIcon}></a>
                                </div>
                                <span className='title'>
                                    <input type='text'
                                           autofocus
                                           autoComplete='off'
                                           name='newTagTitle'
                                           ref='newTagTitle'
                                           placeholder='New tag title'
                                           onChange={this.handleChange}
                                           onKeyDown={this.handleKeyDown}
                                           value={this.state.newTagTitle}/>
                                </span>
                            </div>
                        </Modal.Body>
                    </Modal>
                </div>
            );
        }
    });

module.exports = Tag_Modal;
