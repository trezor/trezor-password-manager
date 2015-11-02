"use strict";
// funkce, co handluje message

// at ta message prijde z pop-upu nebo ze skriptu ze stranky, vola se tohle
// filtrovat ruzne message se musi tady
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // vsechny console.log se v chrome://extension tabu hlasi jako "error".... :)
  // console.log(request);
  // console.log(sender); // v senderu se da poznat, odkud to slo, ale IMHO je lepsi to psat do requestu

  if (request === "showDiv") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, "showDivContentScript");
    });
  }

  // will ask the content script to tell me URL
  if (request === "tellOpenPage") {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, "tellOpenPageContentScript", function(response) {
        sendResponse(response);
      });
    });
  }

  // kdyz chces odpovidat asynchronne, musi tahle vec koncit na "return true"
  // je to trochu demence
  // je to potreba, pokud chces zavolat sendResponse v callbacku apod.
  return true;
});

