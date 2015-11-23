'use strict';

let inserted = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    switch (request) {
        case 'showDivContentScript':
            if (!inserted) {
                const div = document.createElement('div');
                div.innerHTML = 'THIS IS A BIG DIV';
                const body = document.getElementsByTagName('body')[0];
                body.insertBefore(div, body.firstChild);
                div.style.position = 'fixed';
                div.style.top = '0px';
                div.style.width = '100%';
                div.style.height = '60px';
                div.style.backgroundColor = 'red';
                div.style.zIndex = '500000000';
                div.style.fontSize = '30px';
                div.style.color = 'black';
                inserted = true;
            }
            break;

        case 'tellOpenPageContentScript':
            sendResponse(window.location.href);
            break;

        default:
            console.warn('Unknown msg ', request, sender);
    }
});
