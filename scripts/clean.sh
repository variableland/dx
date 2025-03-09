#!/usr/bin/env bash

if [ "$1" = "--only-dist" ]; then
  echo "Cleaning only 'dist' folders... ⌛"
  npx --yes rimraf -g **/dist
  echo "Done ✅"
else
  echo "Cleaning all... ⌛"
  npx --yes rimraf -g **/.turbo
  npx --yes rimraf -g **/dist
  npx --yes rimraf -g **/node_modules
  npx --yes rimraf pnpm-lock.yaml
  echo "Done ✅"
fi
