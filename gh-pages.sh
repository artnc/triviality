#!/bin/sh
# Compiles frontend assets and publishes to GitHub Pages.

set -eu

git checkout -b gh-pages
docker run \
  -e NODE_ENV=production \
  -v "${PWD}:/code" \
  -v "/code/node_modules" \
  "$(docker build -q -t artnc/triviality .)" \
  node_modules/.bin/webpack -p
cp -a dist/. .
git add -A
git commit -m "Compile assets for GitHub Pages"
git branch -u origin/gh-pages
git push -f
git checkout master
git branch -D gh-pages
