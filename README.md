# TREZOR Password Manager

## Overview


- [What is TREZOR?](https://trezor.io/)
- [What is TREZOR Password Manager?](https://trezor.io/passwords/)
- [Download TREZOR Password Manager for Chrome](https://chrome.google.com/webstore/detail/trezor-password-manager/imloifkgjagghnncjkhggdhalmcnfklk)

## Development setup

1. Clone repository and install dependencies

   ```
   git clone git@github.com:satoshilabs/password-manager.git
   cd password-manager
   npm install yarn -g
   yarn install
   ```

2. Set Chrome/Chromium to [Developer Mode](https://developer.chrome.com/extensions/getstarted#unpacked)

3. For setup [Dropbox](https://www.dropbox.com/developers/apps/create)
and [Google Drive](https://console.developers.google.com/apis/),
you need to register and obtain own API keys.
   * Dropbox API key is located in file `/source/background/classes/dropbox_mgmt.js`
[view on github](https://github.com/satoshilabs/password-manager/blob/master/source/background/classes/dropbox_mgmt.js#L11)
   * Google Drive needs to set OAuth.client_id in `/extension/manifest.json` [view on github](https://github.com/satoshilabs/password-manager/blob/master/extension/manifest.json#L49)

4. To make your dev version of extension accessible for TREZOR Chrome Extension and TREZOR Bridge
   you need to append key value into your extension manifest file. It will override dev extension id to same id as original TREZOR Password manager.
   **Remove this key before releasing to production and inform our support to add your new extension key into whitelist!**
   [Read about Manifest key](https://developer.chrome.com/apps/manifest/key)

   ```
   "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgRzyy+IKeaKZA6SIHgrDSinXRNcNq1tT/WeyX1K6gTnVc8KFRVHu5CLf0xN0eCfuz7JKy7U+XfNBzO2i0pkamma6kFMEpvX73WU3Lvmc+g6jg/VSZc9OOgCocT6I8FX92ad1Mj6qcDjVyCkpE2FPotUkuH0PwqQNzSQjPor+KhNPnOQIf5IqLvFEr7P4hUTgyiTUsOX6ROxk61EvP1Fi+Qllscgkm961q+/puw+9Z0Gr4eNIgfAK7DpYj0UJQsdlBP59PQqbW91mwPrKTr3FHmaHGOk+odLCOgchN8MmXgLpqoar1Rxo/AXs5BdnyCprlVHvtXRYbLlthQVzxYylNwIDAQAB",
   ```

5. Now run `gulp serve` and [load unpacked extension](https://developer.chrome.com/extensions/getstarted#unpacked) from `/extension/`

   - For production run `gulp production`

6. Have fun!


## Build & release

Always check version number and manifest keys in manifest.json file before build!

   ```
   make modules
   make build
   make release
   ```



## License

TREZOR LICENSE [view on github](https://github.com/satoshilabs/password-manager/blob/master/LICENSE.md)
