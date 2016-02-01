'use strict';

let countVisibleInputs = (inputs) => {
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
        console.log(tempFormArr.length, tempFormArr);
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

    };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case 'fillData':
            setTimeout(() => {
                if (document.addEventListener) {
                    if (document.readyState === 'complete') {
                        setInputValues(request.content);
                    } else {
                        document.addEventListener('DOMContentLoaded', setInputValues(request.content), false);
                        window.addEventListener('load', setInputValues(request.content), false);
                    }
                }
            }, 10);

            break;

        case 'isScriptExecuted':
            sendResponse({type: 'scriptReady'});
            break;

        default:
            console.warn('Unknown msg ', request, sender);
    }
    return true;
});
