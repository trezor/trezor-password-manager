/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var React = require('react'),
    Router = require('react-router'),
    ErrorModal = require('./modal_dialogs/error_modal'),
    { RouteHandler } = Router,
    Layout = React.createClass({

        componentDidMount() {
            chrome.runtime.onMessage.addListener(this.chromeLayoutModalMsgHandler);
        },

        componentWillUnmount() {
            chrome.runtime.onMessage.removeListener(this.chromeLayoutModalMsgHandler);
        },

        chromeLayoutModalMsgHandler(request, sender, sendResponse) {
            switch (request.type) {
                case 'isAppOpen':
                    chrome.tabs.getCurrent((tab) => {
                        sendResponse({type:'openApp', tab: tab});
                    });
                    break;
            }
            return true;
        },

        render() {
            return (
                <div>
                    <RouteHandler />
                    <ErrorModal />
                </div>
            )
        }
    });

module.exports = Layout;
