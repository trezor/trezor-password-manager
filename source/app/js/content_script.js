'use strict';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    let getLoginForm = () => {
            var tempFormArr = document.getElementsByTagName('FORM'),
                loginFormsArr = [];
            for (var i = 0; i < tempFormArr.length; i++) {
                var inputs = tempFormArr[i].getElementsByTagName('input');
                var pwdInputs = [];
                for (var j = 0; j < inputs.length; j++) {
                    if (inputs[j].type.toLowerCase() === 'password') {
                        pwdInputs.push(inputs[j]);
                    }
                }

                if (pwdInputs.length == 1) {
                    loginFormsArr.push(tempFormArr[i]);

                }
            }

            if (loginFormsArr.length == 1) {
                return loginFormsArr[0]
            } else if (loginFormsArr.length > 1) {
                var winnerArr = loginFormsArr[0];
                for (i = 1; i < loginFormsArr.length; i++) {
                    var winnerCount = winnerArr.getElementsByTagName('input').length,
                        competitorCount = loginFormsArr[i].getElementsByTagName('input').length;
                    console.log(winnerCount, competitorCount);
                    if(competitorCount < winnerCount) {
                        winnerArr = loginFormsArr[i];
                    }
                }
                return winnerArr;
            }
        },

        setInputValues = (content) => {
            var loginForm = getLoginForm();
            var inputs = loginForm.getElementsByTagName('INPUT');
            for (var j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'password') {
                    inputs[j].value = content.password;
                    inputs[j].focus();
                }
            }
            for (j = 0; j < inputs.length; j++) {
                if (inputs[j].type.toLowerCase() === 'email') {
                    inputs[j].value = content.username;
                }
            }
            for (j = 0; j < inputs.length; j++) {
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
