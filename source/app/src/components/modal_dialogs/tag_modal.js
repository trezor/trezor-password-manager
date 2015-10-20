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

        context: {},

        getInitialState() {
            return {
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

        componentDidUpdate() {
            if(this.state.newTagTitle === '') this.refs.newTagTitle.getDOMNode().focus();
        },

        saveContext(context) {
            this.context = context;
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
            var icon = this.context.getTagIconById(entryId);
            this.setState({
                newTagId: entryId,
                newTagTitle: this.context.getTagTitleById(entryId),
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


        render(){
            return (
                <div className='add-tag'>
                    <Modal show={this.state.showModal} onHide={this.close}>
                        <Modal.Body>
                            <div>
                                <a className='icon ion-close-round close-btn' onClick={this.close} />
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
                                           name='newTagTitle'
                                           ref='newTagTitle'
                                           placeholder='New tag title'
                                           onChange={this.handleChange}
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
