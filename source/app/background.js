"use strict";

var tempStorage = {
        "tags": {
            "0": {
                "title": "All",
                "icon": "home"
            }
        },
        "entries": {}
    },
    trezorReady = false,
    fillTestData = () => {
        let pubkey = localStorage.getItem('public_key');
        if (localStorage) {
            if (!localStorage.getItem(pubkey)) {
                localStorage.setItem(pubkey, JSON.stringify(tempStorage));
            }
        } else {
            alert('localstorage not supported');
        }
    };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request) {
        case 'initTrezorPlease':
            if (!trezorReady) {
                localStorage.setItem('public_key', '03e93d8b0582397fc4922eded9729b6939acdb047484c37df16ddfafa70');
                fillTestData();
                trezorReady = true;
            }
            chrome.runtime.sendMessage('trezorReady');
            break;

        case 'showDiv':
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, "showDivContentScript");
            });
            break;

        case 'tellOpenPage':
            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, "tellOpenPageContentScript", function (response) {
                    sendResponse(response);
                });
            });
            break;
    }

    // async response
    return true;
});

