"use strict";

require('whatwg-fetch');
var React = require('react'),
    Router = require('react-router'),
    TableEntry = React.createClass({

        getInitialState: function () {
            return {image_src: 'dist/img/transparent.png'};
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

        render() {

            return (
                <div key={this.props.key} className="entry">
                    <div className="avatar">
                        <img src={this.state.image_src} onError={this.handleError}/>
                        <i className={"icon ion-" + this.props.context.getTagIconById(this.props.tag % 5)}></i>
                    </div>
                    <div className="title">
                        <span>{this.props.title}</span>
                    </div>

                    <div className="username">
                        <span>{this.props.username}</span>
                    </div>
                </div>
            )
        }
    })
    ;

module.exports = TableEntry;
