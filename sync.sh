#!/bin/bash

# Sync script: Pull from origin and push to line-x-test

echo "Pulling latest from origin (AhmedGamalIbrahimMohamed/line-x-v2)..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "Error: Failed to pull from origin"
  exit 1
fi

echo "Pushing to line-x-test (etman97/line-x-test)..."
git push line-x-test main

if [ $? -ne 0 ]; then
  echo "Error: Failed to push to line-x-test"
  exit 1
fi

echo "Sync complete!"
