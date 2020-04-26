.DEFAULT_GOAL := help

NODE_VERSION := lts

build/eslint.install:
	docker run --rm -u `id -u`:`id -g` -v $(abspath .):$(abspath .) -w $(abspath .) node:$(NODE_VERSION) npm install -D eslint
	mkdir -p $(dir $@)
	touch $@

.PHONY: help
help:
	@echo 'usage: make [clean|commit|eslint]'

.PHONY: commit
commit: eslint

.PHONY: eslint
eslint: build/eslint.install
	docker run --rm -u `id -u`:`id -g` -v $(abspath .):$(abspath .) -w $(abspath .) node:$(NODE_VERSION) npx eslint src/*.js

.PHONY: clean
clean:
	rm -rf build node_modules

.PHONY: gh-pages
gh-pages:
	if [ ! -d ../$(notdir $(CURDIR)).doc ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).doc; fi
	cd ../$(notdir $(CURDIR)).doc && git pull
	rsync -rv --delete --exclude=.git/ src/ ../$(notdir $(CURDIR)).doc
	touch ../$(notdir $(CURDIR)).doc/.nojekyll
