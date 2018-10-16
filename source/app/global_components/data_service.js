/*
 * Copyright (c) Peter Jensen, SatoshiLabs
 *
 * Licensed under Microsoft Reference Source License (Ms-RSL)
 * see LICENSE.md file for details
 */

'use strict';

var Service = {
  saveContext(data) {
    chrome.runtime.sendMessage({ type: 'saveContent', content: data });
  },

  getContext() {
    return JSON.parse(window.decryptedContent);
  }
};

module.exports = Service;
