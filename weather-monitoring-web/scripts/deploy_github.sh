#!/usr/bin/env bash
# Small helper script to create a GitHub repo, push current code and enable GitHub Pages.
# NOTE: You must have git, gh (GitHub CLI) and npm installed and be authenticated with gh.

set -e
REPO_NAME=${1:-weather-monitoring-web}
OWNER=${2:-$(gh api user --jq '.login')}

echo "Creating repository $OWNER/$REPO_NAME..."
gh repo create "$OWNER/$REPO_NAME" --public --source=. --remote=origin --push

echo "Pushing main branch..."
git push -u origin main

echo "Enabling GitHub Pages (gh-pages branch will be used)..."
# The workflow will create gh-pages on push; enable pages to serve gh-pages
gh api -X PUT /repos/$OWNER/$REPO_NAME/pages -f source.branch=gh-pages -f source.path=/

echo "Repository created and Pages enabled. Give GitHub Actions a minute to run the workflow and publish." 

echo "Visit: https://$OWNER.github.io/$REPO_NAME/ (once published)"
