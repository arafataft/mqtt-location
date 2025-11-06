#!/bin/bash

# Extract Package Script
# This script copies the mqtt-location package to a standalone directory

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Extracting @barikoi/mqtt-location package...${NC}\n"

# Configuration
SOURCE_DIR="/home/barikoi/Desktop/Project/trace-mqtt-dashboard/packages/mqtt-location"
DEST_DIR="$HOME/Desktop/mqtt-location"

# Check if source exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${YELLOW}❌ Source directory not found: $SOURCE_DIR${NC}"
    exit 1
fi

# Create destination directory
echo -e "${GREEN}✓${NC} Creating destination directory: $DEST_DIR"
mkdir -p "$DEST_DIR"

# Copy package files
echo -e "${GREEN}✓${NC} Copying package files..."
cp -r "$SOURCE_DIR"/* "$DEST_DIR/"

# Remove node_modules if exists
if [ -d "$DEST_DIR/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Removing node_modules..."
    rm -rf "$DEST_DIR/node_modules"
fi

# Remove dist if exists (we'll rebuild)
if [ -d "$DEST_DIR/dist" ]; then
    echo -e "${GREEN}✓${NC} Removing old dist..."
    rm -rf "$DEST_DIR/dist"
fi

# Initialize git
cd "$DEST_DIR"
if [ ! -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: MQTT location tracking package"
fi

echo -e "\n${GREEN}✅ Package extracted successfully!${NC}\n"
echo -e "${BLUE}Next steps:${NC}"
echo -e "  1. cd $DEST_DIR"
echo -e "  2. Create GitHub repo: ${YELLOW}https://github.com/new${NC}"
echo -e "  3. Update package.json with your GitHub URL"
echo -e "  4. Run: ${YELLOW}npm install${NC}"
echo -e "  5. Run: ${YELLOW}npm run build${NC}"
echo -e "  6. Run: ${YELLOW}npm login${NC}"
echo -e "  7. Run: ${YELLOW}npm publish --access public${NC}"
echo -e "\n${BLUE}See PUBLISHING.md for detailed instructions${NC}\n"
