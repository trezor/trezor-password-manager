'use strict';

let visibleDialog = false,
    countVisibleInputs = (inputs) => {
        let visibleInputs = 0;
        for (let j = 0; j < inputs.length; j++) {
            if (inputs[j].type.toLowerCase() === 'email' || inputs[j].type.toLowerCase() === 'text') {
                visibleInputs++;
            }
        }
        return visibleInputs == 1;
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
                visibleInputs = countVisibleInputs(inputs),
                hasPwdInput = hasOnePasswordInput(inputs),
                hasSubmit = hasSubmitElement(tempFormArr[i]);
            if (hasPwdInput && hasSubmit && visibleInputs) {
                loginFormsArrs.push(tempFormArr[i]);
            }
        }
        return loginFormsArrs;
    },


    setInputValues = (content) => {
        let loginForms = getLoginForm();
        removeTrezorDialog();

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
    },

    removeTrezorDialog = () => {
        if (visibleDialog) {
            let doc = document.getElementById('waiting-trezor'),
                css = document.getElementById('trezor-css');
            document.body.removeChild(doc);
            document.getElementsByTagName('head')[0].removeChild(css);
            visibleDialog = false;
        }
    },

    appendTrezorDialog = () => {
        visibleDialog = true;
        let wrapperDiv = document.createElement('div');
        wrapperDiv.setAttribute('style', 'position: fixed; left: 0px; right: 0px; top: 30%; background: transparent; z-index: 99999; height: 180px; width: 100%; animation: shakeitbaby 1.2s cubic-bezier(0.36, 0.07, 0, 0.1) infinite; transform: translate3d(0, 0, 0);');
        wrapperDiv.setAttribute('id', 'waiting-trezor');

        let dialogDiv = document.createElement('div');
        dialogDiv.setAttribute('style', 'position: relative; background: rgba(0,0,0,.7); height: 180px; width: 160px; border-radius: 6px; -webkit-border-radius: 6px; margin: 0 auto; text-align: center;');
        let imageElement = document.createElement('img');
        imageElement.src = chrome.extension.getURL('images/trezor.svg');
        imageElement.setAttribute('style', 'display: block; width: 50%; margin: 0 auto; padding-top: 15px;');
        dialogDiv.appendChild(imageElement);
        let textBlock = document.createElement('span');
        textBlock.innerHTML = 'Look at TREZOR!';
        textBlock.setAttribute('style', 'position: relative; width: 100%; margin: 0 auto; text-align: center; color: white; font-weight: bold; line-height: 40px; font-size: 16px;');
        dialogDiv.appendChild(textBlock);

        let css = document.createElement('style');
        css.type = 'text/css';
        css.setAttribute('id', 'trezor-css');
        css.innerHTML = '@keyframes shakeitbaby {10%, 90% {transform: translate3d(-1px, 0, 0);} 20%, 80% {transform: translate3d(2px, 0, 0);}30%, 50%, 70% {transform: translate3d(-4px, 0, 0);}40%, 60% {transform: translate3d(4px, 0, 0);}';
        document.getElementsByTagName('head')[0].appendChild(css);
        document.body.appendChild(wrapperDiv);

        if (document.head.createShadowRoot) {
            let shadow = wrapperDiv.createShadowRoot();
            shadow.appendChild(dialogDiv);
        } else {
            wrapperDiv.appendChild(dialogDiv);
        }
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
            }, 100);
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
