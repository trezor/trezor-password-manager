'use strict';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    let getLoginForm = () => {
            var tempFormArr = document.getElementsByTagName('FORM');
            var loginForm = '';
            for (var i = 0; i < tempFormArr.length; i++) {
                var inputs = tempFormArr[i].getElementsByTagName('input');
                var pwdInputs = [];
                for (var j = 0; j < inputs.length; j++) {
                    if (inputs[j].type.toLowerCase() === 'password') {
                        pwdInputs.push(inputs[j]);
                    }
                }
                console.log(inputs, pwdInputs);
                console.log(loginForm.getElementsByTagName('input').length > tempFormArr[i].getElementsByTagName('input').length);
                if (pwdInputs.length == 1) {
                    if (loginForm === '') {
                        loginForm = tempFormArr[i];
                    } else if (loginForm.getElementsByTagName('input').length > tempFormArr[i].getElementsByTagName('input').length) {
                        loginForm = tempFormArr[i];
                    }
                }
            }
            return loginForm;
        },

        setInputValues = (content) => {
            var loginForm = getLoginForm();
            var inputs = loginForm.getElementsByTagName('INPUT');
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'password') {
                    inputs[j].value = content.password;
                }
            }
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'email') {
                    inputs[j].value = content.username;
                }
            }
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'text') {
                    inputs[j].value = content.username;
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
