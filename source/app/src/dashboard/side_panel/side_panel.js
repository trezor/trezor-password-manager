"use strict";

var React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),
    SidePanel = React.createClass({

        context: {},

        getInitialState() {
            return {
                tags: {},
                active_id: 0,
                active_title: ''
            }
        },

        componentWillMount() {
            this.props.eventEmitter.on('contextInit', this.saveContext);
        },

        onClick(e) {
            this.props.eventEmitter.emit('changeTag', e);
            this.setState({
                active_id: parseInt(e),
                active_title: this.context.getTagTitleById(e)
            });
        },

        saveContext(context) {
            this.context = context;
            this.setState({
                tags: this.context.data.tags,
                active_title: this.context.getTagTitleById(this.state.active_id)
            });
        },

        render(){
            var tag_array = Object.keys(this.state.tags).map((key) => {
                var obj = this.state.tags[key];
                obj.active = this.state.active_title === obj.title ? 'active' : '';
                return (
                    <li key={key} className={obj.active}>
                        <a data-tag-key={key}
                           data-tag-name={obj.title}
                           onClick={this.onClick.bind(null, key)}
                           onTouchStart={this.onClick.bind(null, key)}>
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
                        </ul>
                    </nav>

                </aside>
            )
        }
    });

module.exports = SidePanel;
