'use strict';
var dropboxClient = new Dropbox.Client({key: "k1qq2saf035rn7c"}),
    tempStorage = {
        'tags': {
            '0': {
                'title': 'All',
                'icon': 'home'
            }
        },
        'entries': {}
    },
    trezorStatus = 'disconnected',
    dropboxStatus = 'disconnected',
    badgeState = {
        ready: {color: [59, 192, 195, 100], defaultText: '\u0020'},
        waiting: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        disconnected: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        throttled: {color: [255, 255, 0, 100], defaultText: '!'}
    },

    handleError = (error) => {
        switch (error.status) {
            case Dropbox.ApiError.INVALID_TOKEN:
                console.warn('user token expired ', error.status);
                break;

            case Dropbox.ApiError.NOT_FOUND:
                console.warn('file or dir not found ', error.status);
                break;

            case Dropbox.ApiError.OVER_QUOTA:
                console.warn('dropbox quota overreached ', error.status);
                break;

            case Dropbox.ApiError.RATE_LIMITED:
                console.warn('too many API calls ', error.status);
                break;

            case Dropbox.ApiError.NETWORK_ERROR:
                console.warn('network error, check connection ', error.status);
                break;

            case Dropbox.ApiError.INVALID_PARAM:
            case Dropbox.ApiError.OAUTH_ERROR:
            case Dropbox.ApiError.INVALID_METHOD:
            default:
                console.warn('network error, check connection ', error.status);
        }
    },

    fillTestData = () => {
        let pubkey = localStorage.getItem('public_key');
        if (localStorage) {
            if (!localStorage.getItem(pubkey)) {
                localStorage.setItem(pubkey, JSON.stringify(tempStorage));
            }
        } else {
            alert('localstorage not supported');
        }
    },

    updateBadgeStatus = (status) => {
        chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
        chrome.browserAction.setBadgeBackgroundColor(
            {color: badgeState[status].color});
    },

    isDropboxLoggedIn = () => {
        return dropboxClient.isAuthenticated();
    },

    connectToDropbox = () => {
        dropboxClient.authenticate((error, data) => {
            if (error) {
                return handleError(error);
            }
            if(dropboxClient.isAuthenticated()) {
                dropboxStatus = 'ready';
                checkConnectionStatus();
                chrome.runtime.sendMessage('dropboxReady');
            }
        });
    },

    isTrezorLoggedIn = () => {
        return true;
    },

    checkConnectionStatus = () => {
        if(dropboxClient.isAuthenticated() && isTrezorLoggedIn()){
            updateBadgeStatus('ready');
            return true;
        } else {
            updateBadgeStatus('waiting');
            return false
        }

    };

dropboxClient.authDriver(new Dropbox.AuthDriver.ChromeExtension({receiverPath: "html/chrome_oauth_receiver.html"}));
dropboxClient.onError.addListener(function (error) {
    if (window.console) {  // Skip the "if" in node.js code.
        handleError(error);
    }
});

// first check after reopen of browser or installation
chrome.runtime.onStartup.addListener(checkConnectionStatus);
chrome.runtime.onInstalled.addListener(checkConnectionStatus);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
        case 'initPlease':
            if (trezorStatus === 'disconnected') {
                localStorage.setItem('public_key', '03e93d8b0582397fc4922eded9729b6939acdb047484c37df16ddfafa70');
                fillTestData();
                trezorStatus = 'ready';
            }
            chrome.runtime.sendMessage('trezorReady');
            if (dropboxStatus === 'disconnected') {
                if(!isDropboxLoggedIn()){
                    connectToDropbox();
                }
            }
            break;

        case 'connectDropbox':
            if (dropboxStatus === 'disconnected') {
                if(!isDropboxLoggedIn()){
                    connectToDropbox();
                }
            }
            chrome.runtime.sendMessage('dropboxReady');
            checkConnectionStatus();
            break;

        case 'showDiv':
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'showDivContentScript');
            });
            break;

        case 'tellOpenPage':
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, 'tellOpenPageContentScript', function (response) {
                    sendResponse(response);
                });
            });
            break;
    }
});

