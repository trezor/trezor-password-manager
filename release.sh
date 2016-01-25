#!/bin/sh
rm -f *.zip
zip -r extension-newtab.zip extension/
# remove new tab attribute
sed -i 's/(with New Tab feature)/(without New Tab feature)/' extension/manifest.json
sed -i '/chrome_url_overrides/,+2d' extension/manifest.json
zip -r extension-no-newtab.zip extension/
