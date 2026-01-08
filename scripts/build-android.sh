#!/bin/bash

# Build the web project
echo "📦 Building Web Project..."
npm run build

# Sync files with Android
echo "📱 Syncing with Android..."
npx cap copy android

echo "✅ Done! You can now open Android Studio to build the APK."
echo "Command: npx cap open android"
