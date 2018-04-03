help: ## show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36mmake %-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

node_modules: ## install npm dependencies via yarn
	yarn

build: node_modules ## build using gulp
	./node_modules/.bin/gulp

release: clean ## prepare the release (extension.zip)
	zip -r extension.zip extension/

clean: ## remove old release
	rm -f *.zip
