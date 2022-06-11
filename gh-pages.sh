#!/bin/sh
# Compiles frontend assets and publishes to GitHub Pages.

set -eu

git checkout -b gh-pages
npm install
NODE_ENV=production webpack -p
cp -a dist/. .
git add -A
git commit -m "Compile assets for GitHub Pages"
git branch -u origin/gh-pages
git push -f
git checkout master
git branch -D gh-pages
