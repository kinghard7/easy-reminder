#!/bin/bash

# Build the web project
echo "📦 Building Web Project..."
npm run build

# Sync files with iOS
echo "📱 Syncing with iOS..."
npx cap sync ios

echo "✅ Done! You can now open Xcode to build the App."
echo "Command: npx cap open ios"
