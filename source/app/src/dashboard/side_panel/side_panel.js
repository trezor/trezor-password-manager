"use strict";

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),
    SidePanel = React.createClass({


        getInitialState() {
            return {
                context: {},
                tags: {},
                active_id: 0,
                active_title: ''
            }
        },

        componentWillMount() {
            this.props.eventEmitter.on('contextInit', this.saveContext);
        },

        changeTag(e) {
            this.props.eventEmitter.emit('changeTag', e);
            this.setState({
                active_id: parseInt(e),
                active_title: this.state.context.getTagTitleById(e)
            });
        },

        addTag() {
            this.props.eventEmitter.emit('openAddTag');
        },

        saveContext(context) {
            this.setState({
                context: context,
                tags: context.data.tags,
                active_title: context.getTagTitleById(this.state.active_id)
            });
        },

        render(){
            var tag_array = Object.keys(this.state.tags).map((key) => {
                var obj = this.state.tags[key];
                obj.active = this.state.active_id == key ? 'active' : '';
                return (
                    <li key={key} className={obj.active}>
                        <a data-tag-key={key}
                           data-tag-name={obj.title}
                           onClick={this.changeTag.bind(null, key)}
                           onTouchStart={this.changeTag.bind(null, key)}>
                            <i className={"icon ion-" + obj.icon}></i>
                            <span className="nav-label">{obj.title}</span>
                        </a></li>)
            });

            return (
                <aside className="left-panel">
                    <div className="logo">
                        <a href="." className="logo-expanded">
                            <img src="dist/img/logo-mini.png" alt="logo"/>
                            <span className="nav-label"><b>TREZOR</b></span>
                        </a>
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
