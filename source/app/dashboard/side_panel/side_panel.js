"use strict";

var React = require('react'),
    DataService = require('../../global_components/data_service'),
    SidePanel = React.createClass({


        getInitialState() {
            return {
                tags: window.myStore.data.tags,
                active_id: 0,
                active_title: window.myStore.getTagTitleById(0)
            }
        },

        componentWillMount() {
            window.myStore.on('changeTag', this.changeTag);
            window.myStore.on('update', this.updateContent);
        },

        componentWillUnmount() {
            window.myStore.removeListener('changeTag', this.changeTag);
            window.myStore.removeListener('update', this.updateContent);
        },

        updateContent(data) {
            if (window.myStore.hasTagId(this.state.active_id) > -1) {
                this.setState({
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
            //chrome.runtime.sendMessage({type: 'clearSession', content: ''});
            window.myStore.emit('openAddTag');
        },

        render(){
            var tag_array = Object.keys(this.state.tags).map((key, i=0) => {
                var obj = this.state.tags[key];
                return (
                    <li key={i++} className={this.state.active_id == key ? 'active' : ''}>
                        <a data-tag-key={key}
                           data-tag-name={obj.title}
                           onClick={this.changeTagAndEmitt.bind(null, key)}
                           onTouchStart={this.changeTagAndEmitt.bind(null, key)}>
                            <i className={"icon ion-" + obj.icon}></i>
                            <span className="nav-label">{obj.title}</span>
                        </a></li>)
            });

            return (
                <aside className="left-panel">
                    <div className="logo">
                        <span className="logo-expanded">
                            <img src="dist/app-images/logo-mini.png" alt="logo"/>
                            <span className="nav-label">
                                <b>PASSWORD</b>
                                <span>Manager</span>
                            </span>
                        </span>
                    </div>

                    <nav className="navigation">
                        <ul className="list-unstyled">
                            {tag_array}

                            <li className="add-tag-btn">
                                <a onClick={this.addTag} onTouchStart={this.addTag}>
                                    <i className="icon ion-plus-circled"></i>
                                    <span className="nav-label">Add tag</span>
                                </a>
                            </li>
                        </ul>
                    </nav>

                </aside>
            )
        }
    });

module.exports = SidePanel;
