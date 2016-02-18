all: release

node_modules:
	npm install

build: node_modules
	./node_modules/.bin/gulp

release: clean
	zip -r extension-newtab.zip extension/
	# remove new tab attribute
	sed -i 's/(with New Tab)/(without New Tab)/' extension/manifest.json
	sed -i '/chrome_url_overrides/,+2d' extension/manifest.json
	zip -r extension-no-newtab.zip extension/
	# revert manifest
	git checkout extension/manifest.json

clean:
	rm -f *.zip
