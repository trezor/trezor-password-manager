"use strict";

require('whatwg-fetch');
var React = require('react'),
    Router = require('react-router'),
    TableEntry = React.createClass({

        getInitialState: function () {
            return {
                image_src: 'dist/img/transparent.png',
                view: 'list-entry'

            };
        },

        extractDomain(url) {
            var domain;
            if (url.indexOf("://") > -1) {
                domain = url.split('/')[2];
            } else {
                domain = url.split('/')[0];
            }
            domain = domain.split(':')[0];
            return domain;
        },

        componentDidMount() {
            if (this.props.title.indexOf(".") > -1) {
                this.setState({
                    image_src: "https://logo.clearbit.com/" + this.extractDomain(this.props.title)
                });
            }
        },

        handleError() {
            this.setState({
                image_src: 'dist/img/transparent.png'
            });
        },

        changeView() {

            if (this.state.view === 'list-entry') {
                this.setState({
                    view: 'edit-entry'
                })
            } else {
                this.setState({
                    view: 'list-entry'
                })
            }
        },

        render() {

            return (
                <div key={this.props.key} className={"entry col-xs-12 " + this.state.view}>
                    <div className="avatar">
                        <img src={this.state.image_src} onError={this.handleError}/>
                        <i className={"icon ion-" + this.props.context.getTagIconById(this.props.tag % 5)}></i>
                    </div>
                    <div className="title">
                        <span>Title </span><input type="text" value={this.props.title} disabled={this.state.view === 'list-entry' ? 'disabled' : false}  />
                    </div>

                    <div className="username">
                        <span>Username </span><input type="text" value={this.props.username} disabled={this.state.view === 'list-entry' ? 'disabled' : false} />
                    </div>
                    <span className="edit" onClick={this.changeView}>
                        <i className="ion-chevron-down"></i>
                    </span>
                </div>
            )
        }
    })
    ;

module.exports = TableEntry;
