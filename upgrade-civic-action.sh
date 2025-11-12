#!/bin/bash
set -e

# Upgrade script for Civic Action Card
# Run this after publishing a new version to npm
#
# Required environment variables (or defaults):
#   KOENIG_DIR - Path to Koenig repository (default: /var/www/gv/Koenig)
#   GHOST_MONO_DIR - Path to Ghost monorepo for building (default: /var/www/gv/ghost-civic-new)
#   GHOST_PROD_DIR - Path to production Ghost installation (default: /var/www/gv/ghost-civic)

# Convert to absolute paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
KOENIG_DIR="${KOENIG_DIR:-/var/www/gv/Koenig}"
GHOST_MONO_DIR="${GHOST_MONO_DIR:-/var/www/gv/ghost-civic-new}"
GHOST_PROD_DIR="${GHOST_PROD_DIR:-/var/www/gv/ghost-civic}"

echo "=== Civic Action Card Upgrade ==="
echo "Koenig: $KOENIG_DIR"
echo "Ghost Mono: $GHOST_MONO_DIR"
echo "Ghost Prod: $GHOST_PROD_DIR"
echo ""

# Step 1: Upgrade package in Koenig
echo "Upgrading @linked-claims/koenig-civic-action-card..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn upgrade @linked-claims/koenig-civic-action-card@latest

# Step 1b: Install dependencies at workspace root
echo "Installing dependencies at workspace root..."
cd "$KOENIG_DIR"
yarn install

# Step 2: Copy updated integration file if it exists and is different
echo "Checking for updated integration file..."
if [ -f "$SCRIPT_DIR/integration/CivicActionNode.jsx" ]; then
    KOENIG_NODE_FILE="$KOENIG_DIR/packages/koenig-lexical/src/nodes/CivicActionNode.jsx"
    if [ ! -f "$KOENIG_NODE_FILE" ] || ! cmp -s "$SCRIPT_DIR/integration/CivicActionNode.jsx" "$KOENIG_NODE_FILE"; then
        echo "Copying updated CivicActionNode.jsx to Koenig..."
        cp "$SCRIPT_DIR/integration/CivicActionNode.jsx" "$KOENIG_NODE_FILE"
    else
        echo "Integration file is already up to date"
    fi
else
    echo "Warning: integration/CivicActionNode.jsx not found in $SCRIPT_DIR"
fi

# Step 2b: Update vite.config.js to mark civic action card as external
echo "Updating Koenig vite.config.js to mark civic action card as external..."
VITE_CONFIG="$KOENIG_DIR/packages/koenig-lexical/vite.config.js"
if grep -q "@linked-claims/koenig-civic-action-card" "$VITE_CONFIG"; then
    echo "vite.config.js already has civic action card marked as external"
else
    echo "Adding @linked-claims/koenig-civic-action-card to external dependencies..."
    sed -i "/external: \[/,/\],/ s/'react-dom'/'react-dom',\n                    '@linked-claims\/koenig-civic-action-card'/" "$VITE_CONFIG"
fi

# Step 3: Build Koenig
echo "Building Koenig..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn build

# Step 4: Copy to Ghost monorepo
echo "Copying to Ghost monorepo..."
rm -rf "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/dist"
cp -r "$KOENIG_DIR/packages/koenig-lexical/dist" "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/"

# Step 5: Build Ghost Admin
echo "Building Ghost Admin..."
cd "$GHOST_MONO_DIR/ghost/admin"
yarn build:dev

# Step 6a: Deploy admin to production
echo "Deploying admin to production..."
sudo cp -r "$GHOST_MONO_DIR/ghost/admin/dist/"* "$GHOST_PROD_DIR/current/core/built/admin/"

# Step 6b: Deploy Koenig directly to production (admin build doesn't include it)
echo "Deploying Koenig lexical to production..."
sudo cp -r "$KOENIG_DIR/packages/koenig-lexical/dist/"* "$GHOST_PROD_DIR/current/core/built/admin/assets/koenig-lexical/"

# Step 7: Update hash for cache busting
echo "Updating koenig-lexical hash for cache busting..."
OLD_HASH=$(grep -o 'editorHash[^,}]*' "$GHOST_PROD_DIR/current/core/built/admin/index.html" | grep -o '[a-f0-9]\{10\}' | head -1)
NEW_HASH=$(node -e "const crypto = require('crypto'); const fs = require('fs'); const file = fs.readFileSync('$GHOST_PROD_DIR/current/core/built/admin/assets/koenig-lexical/koenig-lexical.umd.js', 'utf8'); console.log(crypto.createHash('sha256').update(file).digest('hex').slice(0, 10));")
echo "Old hash: $OLD_HASH"
echo "New hash: $NEW_HASH"
# Use a specific pattern to replace only the editorHash value in URL-encoded JSON, preserving the encoding
sudo sed -i "s|%22editorHash%22%3A%22${OLD_HASH}%22|%22editorHash%22%3A%22${NEW_HASH}%22|g" "$GHOST_PROD_DIR/current/core/built/admin/index.html"

# Step 8: Restart Ghost via systemd
echo "Restarting Ghost..."
sudo systemctl restart ghost_goldavelez-org

echo ""
echo "Waiting for Ghost to start..."
sleep 3

# Check status
sudo systemctl status ghost_goldavelez-org --no-pager | head -15

echo ""
echo "=== Upgrade complete! ==="
echo "Clear your browser cache or use Ctrl+Shift+R to see the new version"
