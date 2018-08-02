'use strict';

let visibleDialog = false,
  retry = 0,
  getInputs = () => {
    return document.getElementsByTagName('input');
  },
  setInputValues = content => {
    let inputs = getInputs();
    if (inputs.length === 0) {
      if (visibleDialog) {
        morphToNoResult();
      } else {
        appendNoResultDialog();
      }
    } else if (content.username && content.password) {
      if (visibleDialog) {
        morphToSuccess();
      } else {
        appendSuccessDialog();
      }
      for (let i = 0; i < inputs.length; i++) {
        switch (inputs[i].type.toLowerCase()) {
          case 'email':
            inputs[i].defaultValue = content.username;
            inputs[i].value = content.username;
            break;
          case 'text':
            inputs[i].defaultValue = content.username;
            inputs[i].value = content.username;
            break;
          case 'password':
            inputs[i].defaultValue = content.password;
            inputs[i].value = content.password;
            break;
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
    topTextBlock.innerHTML = "Couldn't find any form, sorry!";
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
  appendSuccessDialog = () => {
    visibleDialog = true;
    // main holder and wrapper
    let wrapperDiv = document.createElement('div');
    wrapperDiv.setAttribute('id', 'tWaitingTrezor');
    wrapperDiv.className = '';

    // visible dialog itself
    let dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', 'tWaitingTrezorDialog');
    dialogDiv.className = 'tSucccess';

    // logo image
    let imageElement = document.createElement('img');
    imageElement.setAttribute('id', 'tWaitingTrezorImage');
    imageElement.src = chrome.extension.getURL('images/success.svg');
    dialogDiv.appendChild(imageElement);

    document.body.appendChild(wrapperDiv);
    wrapperDiv.appendChild(dialogDiv);

    setTimeout(() => {
      // remove dialog nice way
      removeTrezorDialog();
    }, 2500);
  },
  appendNoResultDialog = () => {
    visibleDialog = true;
    // main holder and wrapper
    let wrapperDiv = document.createElement('div');
    wrapperDiv.setAttribute('id', 'tWaitingTrezor');
    wrapperDiv.className = '';

    // visible dialog itself
    let dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('id', 'tWaitingTrezorDialog');
    dialogDiv.className = 'tNoResult';

    // upper text
    let topTextBlock = document.createElement('span');
    topTextBlock.setAttribute('id', 'tWaitingTrezorResponse');
    topTextBlock.className = 'tTopTextBlock';
    topTextBlock.innerHTML = "Couldn't find any form, sorry!";
    dialogDiv.appendChild(topTextBlock);

    document.body.appendChild(wrapperDiv);
    wrapperDiv.appendChild(dialogDiv);

    setTimeout(() => {
      // remove dialog ugly way
      removeTrezorDialog();
    }, 2700);
  },
  morphToCancelDialog = () => {
    let wrapperDiv = document.getElementById('tWaitingTrezor');
    wrapperDiv.className = '';

    let dialogDiv = document.getElementById('tWaitingTrezorDialog');
    dialogDiv.className = 'tCancel';

    let imageElement = document.getElementById('tWaitingTrezorImage');
    imageElement.src = chrome.extension.getURL('images/trezor.svg');

    // bottom text
    let bottomTextBlock = document.getElementById('tWaitingTrezorText');
    bottomTextBlock.className = 'tBottomTextBlock';
    bottomTextBlock.innerHTML = 'Action Cancelled!';
    dialogDiv.appendChild(bottomTextBlock);

    setTimeout(() => {
      // remove dialog nice way
      removeTrezorDialog();
    }, 2500);
  },
  morphToNoResult = () => {
    let wrapperDiv = document.getElementById('tWaitingTrezor');
    console.log('div ', wrapperDiv);
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
    }, 1500);
  },
  fillData = request => {
    setTimeout(() => {
      if (document.addEventListener) {
        if (request.content !== null) {
          if (document.readyState === 'complete') {
            retry = 0;
            setInputValues(request.content);
          } else {
            // document.addEventListener('DOMContentLoaded', setInputValues(request.content), false);
            // window.addEventListener('load', setInputValues(request.content), false);
            // not nice - handle all "edge" cases
            if (retry++ < 30) {
              fillData(request);
            }
          }
        } else {
          removeTrezorDialog();
        }
      } else {
        // not nice - handle all "edge" cases
        if (retry++ < 30) {
          fillData(request);
        }
      }
    }, 1000);
  };

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'fillData':
      fillData(request);
      break;

    case 'cancelData':
      if (visibleDialog) {
        morphToCancelDialog();
      }
      break;

    case 'showTrezorMsg':
      if (!visibleDialog) {
        appendTrezorDialog();
      }
      break;

    case 'isScriptExecuted':
      sendResponse({ type: 'scriptReady' });
      break;

    default:
      console.warn('Unknown msg ', request, sender);
  }
  return true;
});
