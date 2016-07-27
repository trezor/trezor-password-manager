'use strict';

let visibleDialog = false,
    countVisibleInputs = (inputs) => {
        let visibleInputs = 0;
        for (let j = 0; j < inputs.length; j++) {
            if (inputs[j].type.toLowerCase() === 'email' || inputs[j].type.toLowerCase() === 'text') {
                visibleInputs++;
            }
        }
        return visibleInputs < 2;
    },

    hasOnePasswordInput = (inputs) => {
        let passwordInputsNo = 0;
        for (let j = 0; j < inputs.length; j++) {
            if (inputs[j].type.toLowerCase() === 'password') {
                passwordInputsNo++;
            }
        }
        return passwordInputsNo == 1;
    },

    hasSubmitElement = (form) => {
        let allChildElements = form.getElementsByTagName('*'),
            submitElement = 0;
        for (let j = 0; j < allChildElements.length; j++) {
            if (typeof(allChildElements[j].type) !== 'undefined') {
                if (allChildElements[j].type.toLowerCase() === 'submit') {
                    submitElement++;
                }
            }
        }
        return submitElement > 0;
    },

    getSubmitElement = (form) => {
        let allChildElements = form.getElementsByTagName('*'),
            submitElement = 0;
        for (let j = 0; j < allChildElements.length; j++) {
            if (typeof(allChildElements[j].type) !== 'undefined') {
                if (allChildElements[j].type.toLowerCase() === 'submit') {
                    submitElement++;
                }
            }
        }
        return submitElement;
    },

    getLoginForm = () => {
        let tempFormArr = document.getElementsByTagName('FORM'),
            loginFormsArrs = [];
        for (let i = 0; i < tempFormArr.length; i++) {
            let inputs = tempFormArr[i].getElementsByTagName('input'),
                hasPwdInput = hasOnePasswordInput(inputs);
            if (hasPwdInput) {
                loginFormsArrs.push(tempFormArr[i]);
            }
        }
        return loginFormsArrs;
    },


    setInputValues = (content) => {
        let loginForms = getLoginForm();
        if (loginForms.length === 0) {
            morphToNoResult();
        } else {
            morphToSuccess();
            for (let i = 0; i < loginForms.length; i++) {
                let inputs = loginForms[i].getElementsByTagName('input');
                for (let j = 0; j < inputs.length; j++) {
                    switch (inputs[j].type.toLowerCase()) {
                        case 'email':
                            inputs[j].value = content.username;
                            break;
                        case 'text':
                            inputs[j].value = content.username;
                            break;
                        case 'password':
                            inputs[j].value = content.password;
                            inputs[j].focus();
                            break;
                    }
                }
            }
        }
    },

    removeTrezorDialog = () => {
        if (visibleDialog) {
            let wrapperDiv = document.getElementById('tWaitingTrezor');
            wrapperDiv.className = 'tWaitingTrezorQuiting';

            setTimeout(() => {
                document.body.removeChild(wrapperDiv);
                visibleDialog = false;
            }, 300);
        }
    },

// creating basic popup dialog
    appendTrezorDialog = () => {
        visibleDialog = true;
        // main holder and wrapper
        let wrapperDiv = document.createElement('div');
        wrapperDiv.setAttribute('id', 'tWaitingTrezor');
        wrapperDiv.className = 'tShakeItBaby';

        // visible dialog itself
        let dialogDiv = document.createElement('div');
        dialogDiv.setAttribute('id', 'tWaitingTrezorDialog');

        // upper text
        let topTextBlock = document.createElement('span');
        topTextBlock.setAttribute('id', 'tWaitingTrezorResponse');
        topTextBlock.className = 'tTopTextBlock';
        topTextBlock.innerHTML = 'Couldn\'t find login form, sorry!';
        dialogDiv.appendChild(topTextBlock);

        // logo image
        let imageElement = document.createElement('img');
        imageElement.setAttribute('id', 'tWaitingTrezorImage');
        imageElement.src = chrome.extension.getURL('images/trezor.svg');
        dialogDiv.appendChild(imageElement);

        // bottom text
        let bottomTextBlock = document.createElement('span');
        bottomTextBlock.setAttribute('id', 'tWaitingTrezorText');
        bottomTextBlock.className = 'tBottomTextBlock';
        bottomTextBlock.innerHTML = 'Confirm on TREZOR!';
        dialogDiv.appendChild(bottomTextBlock);

        document.body.appendChild(wrapperDiv);
        wrapperDiv.appendChild(dialogDiv);
    },

    morphToNoResult = () => {
        let wrapperDiv = document.getElementById('tWaitingTrezor');
        wrapperDiv.className = '';

        let dialogDiv = document.getElementById('tWaitingTrezorDialog');
        dialogDiv.className = 'tNoResult';

        setTimeout(() => {
            // remove dialog ugly way
            removeTrezorDialog();
        }, 1700);
    },

    morphToSuccess = () => {
        let wrapperDiv = document.getElementById('tWaitingTrezor');
        wrapperDiv.className = '';

        let dialogDiv = document.getElementById('tWaitingTrezorDialog');
        dialogDiv.className = 'tSucccess';

        let imageElement = document.getElementById('tWaitingTrezorImage');
        imageElement.src = chrome.extension.getURL('images/success.svg');

        setTimeout(() => {
            // remove dialog nice way
            removeTrezorDialog();
        }, 1200);
    };



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'fillData':
            setTimeout(() => {
                if (document.addEventListener) {
                    if (request.content != null) {
                        if (document.readyState === 'complete') {
                            setInputValues(request.content);
                        } else {
                            document.addEventListener('DOMContentLoaded', setInputValues(request.content), false);
                            window.addEventListener('load', setInputValues(request.content), false);
                        }
                    } else {
                        removeTrezorDialog();
                    }
                }
            }, 800);
            break;

        case 'showTrezorMsg':
            if (!visibleDialog) {
                appendTrezorDialog();
            }
            break;

        case 'isScriptExecuted':
            sendResponse({type: 'scriptReady'});
            break;

        default:
            console.warn('Unknown msg ', request, sender);
    }
    return true;
});
