.DEFAULT_GOAL := deploy
MAKEFLAGS += --silent
SHELL = /usr/bin/env bash

# Compile frontend assets and publish to GitHub Pages
.PHONY: deploy
deploy:
	[[ -z "$$(git status --porcelain)" ]]
	git branch -D gh-pages &> /dev/null || true
	git checkout -b gh-pages
	docker run \
		-e NODE_ENV=production \
		-v "$${PWD}:/code" \
		-v '/code/node_modules' \
		"$$(docker build -q -t artnc/triviality .)" \
		node_modules/.bin/webpack -p
	cp -a dist/. .
	git add -A
	git commit -m 'Compile assets for GitHub Pages' -n
	git branch -u origin/gh-pages
	git push -f
	git checkout master
	git branch -D gh-pages
