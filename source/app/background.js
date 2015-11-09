'use strict';

var tempStorage = {
        'tags': {
            '0': {
                'title': 'All',
                'icon': 'home'
            }
        },
        'entries': {}
    },
    trezorStatus = 'disconnected',
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
    badgeState = {
        ready: {color: [59, 192, 195, 100], defaultText: '\u0020'},
        disconnected: {color: [237, 199, 85, 100], defaultText: '\u0020'},
        throttled: {color: [255, 255, 0, 100], defaultText: '!'}
    };

function updateBadgeStatus(status) {
    chrome.browserAction.setBadgeText({text: badgeState[status].defaultText});
    chrome.browserAction.setBadgeBackgroundColor(
        {color: badgeState[status].color});
}

chrome.runtime.onLaunched.addLister(() => {

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
        case 'initTrezorPlease':
            if (trezorStatus === 'disconnected') {
                localStorage.setItem('public_key', '03e93d8b0582397fc4922eded9729b6939acdb047484c37df16ddfafa70');
                fillTestData();
                trezorStatus = 'ready';
                updateBadgeStatus(trezorStatus);
            }
            chrome.runtime.sendMessage('trezorReady');
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

