.DEFAULT_GOAL := help

NODE_IMAGE := node:lts
NODE_DOCKER := docker run --rm -u `id -u`:`id -g` -v $(CURDIR):$(CURDIR) -w $(CURDIR) -e HOME=$(CURDIR)/build $(NODE_IMAGE)
ESLINT_VERSION := 6.8.0

build/eslint.install:
	$(NODE_DOCKER) npm install -D eslint@$(ESLINT_VERSION)
	mkdir -p $(dir $@)
	touch $@

.PHONY: help
help:
	@echo 'usage: make [clean|commit|eslint|gh-pages]'

.PHONY: commit
commit: eslint

.PHONY: eslint
eslint: build/eslint.install
	$(NODE_DOCKER) npx eslint --format unix --ignore-pattern '!.eslintrc.js' .eslintrc.js src

.PHONY: clean
clean:
	rm -rf build node_modules

.PHONY: superclean
superclean: clean
	docker rmi -f $(NODE_IMAGE)

.PHONY: gh-pages
gh-pages: clean commit
	if [ ! -d ../$(notdir $(CURDIR)).gh-pages ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).gh-pages; fi
	cd ../$(notdir $(CURDIR)).gh-pages && git pull
	rsync -rv --delete --exclude=.git/ src/ ../$(notdir $(CURDIR)).gh-pages
	touch ../$(notdir $(CURDIR)).gh-pages/.nojekyll
