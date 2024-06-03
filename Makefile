.DEFAULT_GOAL := dev
MAKEFLAGS += --silent
SHELL = /usr/bin/env bash

# Compile frontend assets and publish to GitHub Pages
.PHONY: deploy
deploy:
	npm install
	[[ -z "$$(git status --porcelain)" ]]
	git branch -D gh-pages &> /dev/null || true
	git checkout -b gh-pages
	rm -rf dist/ .parcel-cache/
	node_modules/.bin/parcel build src/index.html \
		--no-source-maps --public-url /triviality
	cp -a dist/. .
	git add -A
	git commit -m 'Compile assets for GitHub Pages' -n
	git branch -u origin/gh-pages
	git push -f
	git checkout master
	git branch -D gh-pages

# Start local dev server
.PHONY: dev
dev:
	npm install
	node_modules/.bin/parcel src/index.html
