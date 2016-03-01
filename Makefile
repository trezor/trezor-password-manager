all: release

node_modules:
	npm install

build: node_modules
	./node_modules/.bin/gulp

release: clean
	zip -r extension.zip extension/

clean:
	rm -f *.zip
