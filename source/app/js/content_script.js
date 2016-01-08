'use strict';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    let countVisibleInputs = (inputs) => {
            var visibleInputs = 0;
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'email' || inputs[j].type.toLowerCase() === 'text' ) {
                    visibleInputs++;
                }
            }
            return visibleInputs == 1;
        },

        hasOnePasswordInput = (inputs) => {
            var passwordInputsNo = 0;
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'password') {
                    passwordInputsNo++;
                }
            }
            return passwordInputsNo == 1
        },

        hasSubmitElement = (form) => {
            var allChildElements = form.getElementsByTagName('*'),
                submitElement = 0;
            for (var j = 0; j < allChildElements.length; j++) {
                if (typeof(allChildElements[j].type) !== 'undefined') {
                    console.log('was here', allChildElements[j].type);
                    if (allChildElements[j].type.toLowerCase() === 'submit') {
                        submitElement++;
                    }
                }
            }
            return submitElement > 0;
        },

        getLoginForm = () => {
            var tempFormArr = document.getElementsByTagName('FORM'),
                loginFormsArrs = [];
            for (var i = 0; i < tempFormArr.length; i++) {
                var inputs = tempFormArr[i].getElementsByTagName('input'),
                    visibleInputs = countVisibleInputs(inputs),
                    hasPwdInput = hasOnePasswordInput(inputs),
                    hasSubmit = hasSubmitElement(tempFormArr[i]);
                if (hasPwdInput && hasSubmit&& visibleInputs) {
                    loginFormsArrs.push(tempFormArr[i]);
                }
            }
            return loginFormsArrs;
        },



        setInputValues = (content) => {
            var loginForms = getLoginForm();
            console.log(loginForms);
            for (var i = 0; i < loginForms.length; i++) {
                var inputs = loginForms[i].getElementsByTagName('input');
                for (var j = 0; j < inputs.length; j++) {
                    if (inputs[j].type.toLowerCase() === 'email') {
                        inputs[j].value = content.username;
                    }
                    if (inputs[j].type.toLowerCase() === 'text') {
                        inputs[j].value = content.username;
                    }
                    if (inputs[j].type.toLowerCase() === 'password') {
                        inputs[j].value = content.password;
                        inputs[j].focus();
                    }
                }
            }
            /*
             setTimeout(()=> {
             loginForm.submit();
             }, 250);
             */
        };

    switch (request.type) {
        case 'fillData':
            document.addEventListener("DOMContentLoaded", function () {
                setInputValues(request.content);
            });
            break;

        case 'isScriptExecuted':
            sendResponse({type: 'scriptReady'});
            break;

        default:
            console.warn('Unknown msg ', request, sender);
    }
    return true;
});
