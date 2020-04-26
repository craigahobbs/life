.DEFAULT_GOAL := help

NODE_DOCKER := docker run --rm -u `id -u`:`id -g` -v $(CURDIR):$(CURDIR) -w $(CURDIR) -e HOME=$(CURDIR)/build node:lts

build/eslint.install:
	$(NODE_DOCKER) npm install -D eslint
	mkdir -p $(dir $@)
	touch $@

.PHONY: help
help:
	@echo 'usage: make [clean|commit|eslint]'

.PHONY: commit
commit: eslint

.PHONY: eslint
eslint: build/eslint.install
	$(NODE_DOCKER) npx eslint --format unix src

.PHONY: clean
clean:
	rm -rf build node_modules

.PHONY: gh-pages
gh-pages: clean commit
	if [ ! -d ../$(notdir $(CURDIR)).gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).gh-pages; fi
	cd ../$(notdir $(CURDIR)).gh-pages && git pull
	rsync -rv --delete --exclude=.git/ src/ ../$(notdir $(CURDIR)).gh-pages
	touch ../$(notdir $(CURDIR)).gh-pages/.nojekyll
