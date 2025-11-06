#!/bin/bash

# Quick Publish Script
# Run this to extract and prepare your package for publishing

set -e

echo "🚀 Quick Publish Helper"
echo "======================="
echo ""

# Check if extract script exists
if [ ! -f "extract-package.sh" ]; then
    echo "❌ Please run this from packages/mqtt-location directory"
    exit 1
fi

# Step 1: Extract
echo "📦 Step 1: Extracting package..."
./extract-package.sh

# Step 2: Navigate
cd ~/Desktop/mqtt-location

# Step 3: Install deps
echo ""
echo "📥 Step 2: Installing dependencies..."
npm install

# Step 4: Build
echo ""
echo "🔨 Step 3: Building package..."
npm run build

# Step 5: Check package
echo ""
echo "📋 Step 4: Checking package contents..."
npm pack --dry-run

echo ""
echo "✅ Package is ready!"
echo ""
echo "📝 Next steps:"
echo "  1. Create GitHub repo: https://github.com/new"
echo "  2. Update package.json with your repo URL"
echo "  3. Push to GitHub:"
echo "     git remote add origin https://github.com/YOUR_USERNAME/mqtt-location.git"
echo "     git push -u origin main"
echo "  4. Login to npm: npm login"
echo "  5. Publish: npm publish --access public"
echo ""
echo "📚 See PUBLISHING.md for detailed instructions"
echo ""
