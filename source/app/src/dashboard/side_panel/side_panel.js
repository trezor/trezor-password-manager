"use strict";

let React = require('react'),
    Router = require('react-router'),
    DataService = require('../../components/data_service'),

    SidePanel = React.createClass({

        getInitialState() {
            return {
                trezorCredentials: window.trezorResponse,
                tags: {},
                active: 0
            }
        },

        componentWillMount() {
            DataService.getUserTagsTest().then(response => {
                this.setState({
                    tags: response.tags,
                    active: Object.getOwnPropertyDescriptor(response.tags, this.state.active).value.name
                });
            });
        },

        onClick(e) {
            this.setState({
                active: Object.getOwnPropertyDescriptor(this.state.tags, e).value.name
            });
        },

        render(){
            let tag_array = Object.keys(this.state.tags).map((key) => {
                var obj = this.state.tags[key];
                obj.active = this.state.active === obj.name ? 'active' : '';
                return (
                    <li key={key} className={obj.active}><a data-tag-key={key} data-tag-name={obj.name} onClick={this.onClick.bind(null, key)}
                                         onTouchStart={this.onClick.bind(null, key)}><i
                        className={"icon ion-" + obj.icon}></i> <span
                        className="nav-label">{obj.name}</span></a></li>)
            });

            return (
                <aside className="left-panel">
                    <div className="logo">
                        <a href="." className="logo-expanded">
                            <img src="dist/img/logo-mini.png" alt="logo"/>
                            <span className="nav-label"><b>KEEZOR</b></span>
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
