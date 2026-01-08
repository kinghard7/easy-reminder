#!/bin/bash
set -e

# Define Output Directory
OUTPUT_DIR="ios/output"
mkdir -p "$OUTPUT_DIR"

echo "📦 Building Web Project..."
npm run build

echo "🔄 Syncing Capacitor..."
npx cap sync ios

echo "🏗️ Building Unsigned iOS App (Release)..."

# Check if xcodebuild is available and working
if ! xcodebuild -version >/dev/null 2>&1; then
    echo "❌ Error: 'xcodebuild' command failed."
    echo "Diagnosis: Your Mac is likely using 'Command Line Tools' instead of the full Xcode app."
    echo ""
    echo "👉 Fix Step 1: Ensure Xcode is installed from the App Store."
    echo "👉 Fix Step 2: Run this command to switch to Xcode:"
    echo "   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

# Build using xcodebuild without signing
# Note: This requires Xcode to be installed and xcode-select configured correctly
xcodebuild -workspace ios/App/App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -derivedDataPath ios/build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO

echo "📦 Packaging into .ipa..."
# Clean previous payload
rm -rf "$OUTPUT_DIR/Payload"
mkdir -p "$OUTPUT_DIR/Payload"

# Copy the .app bundle
cp -r ios/build/Build/Products/Release-iphoneos/App.app "$OUTPUT_DIR/Payload/"

# Zip it into an IPA
cd "$OUTPUT_DIR"
zip -r App-unsigned.ipa Payload
cd ../..

echo "✅ Build Complete!"
echo "📂 IPA Location: $OUTPUT_DIR/App-unsigned.ipa"
echo "⚠️ Note: This is an UNSIGNED IPA. It cannot be installed on a standard iPhone directly."
echo "   To install, you must sign it manually (e.g. using Cydia Impactor, AltStore) or build via Xcode with a Team selected."
