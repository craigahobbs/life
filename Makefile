.DEFAULT_GOAL := help

NODE_IMAGE := node:13-buster-slim
NODE_DOCKER := docker run --rm -u `id -u`:`id -g` -v $(CURDIR):$(CURDIR) -w $(CURDIR) -e HOME=$(CURDIR)/build $(NODE_IMAGE)

build/npm.install:
	$(NODE_DOCKER) npm install
	mkdir -p $(dir $@)
	touch $@

.PHONY: help
help:
	@echo 'usage: make [clean|commit|lint|test|gh-pages]'

.PHONY: commit
commit: test lint

.PHONY: test
test: build/npm.install
	$(NODE_DOCKER) npx nyc --check-coverage --reporter html --reporter text \
		--report-dir build/coverage --temp-dir build/tmp ava tests/test*.js

.PHONY: lint
lint: build/npm.install
	$(NODE_DOCKER) npx eslint -c .eslintrc.js -f unix .eslintrc.js src tests

.PHONY: clean
clean:
	rm -rf build node_modules package-lock.json

.PHONY: superclean
superclean: clean
	docker rmi -f $(NODE_IMAGE)

.PHONY: gh-pages
gh-pages: clean commit
	if [ ! -d ../$(notdir $(CURDIR)).gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).gh-pages; fi
	cd ../$(notdir $(CURDIR)).gh-pages && git pull
	rsync -rv --delete --exclude=.git/ src/ ../$(notdir $(CURDIR)).gh-pages
	touch ../$(notdir $(CURDIR)).gh-pages/.nojekyll
