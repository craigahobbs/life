.DEFAULT_GOAL := help

.PHONY: help
help:
	@echo usage: make [gh-pages]

.PHONY: gh-pages
gh-pages:
	if [ ! -d ../$(notdir $(CURDIR)).doc ]; then git clone -b gh-pages `git config --get remote.origin.url` ../$(notdir $(CURDIR)).doc; fi
	cd ../$(notdir $(CURDIR)).doc && git pull
	cp life.html ../$(notdir $(CURDIR)).doc
