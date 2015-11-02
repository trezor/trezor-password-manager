// Tohle je na vsech strankach
"use strict";


// tohle se nacte na kazde strance prave jednou
let inserted = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request === "showDivContentScript") {
    if (!inserted) {
      const div = document.createElement('div');
      div.innerHTML = "THIS IS A BIG DIV";
      const body = document.getElementsByTagName("body")[0];
      body.insertBefore(div, body.firstChild);
      div.style.position = "fixed";
      div.style.top = "0px";
      div.style.width = "100%";
      div.style.height = "60px";
      div.style.backgroundColor = "red";
      div.style.zIndex = "500000000";
      div.style.fontSize = "30px";
      div.style.color = "black";
      inserted = true;
    }
  }

  if (request === "tellOpenPageContentScript") {
    sendResponse(window.location.href);
    // kdyby tohle bylo v callbacku, musim mit dole "return true"
  }

  // kdyz chces odpovidat asynchronne, musi tahle vec koncit na "return true"
  // je to trochu demence
  // je to potreba, pokud chces zavolat sendResponse v callbacku apod.
  // tady to potreba neni
  // return true;
});
