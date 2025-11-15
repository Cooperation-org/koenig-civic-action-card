#!/bin/bash
set -e

# Upgrade script for Civic Action Card
# Run this after publishing a new version to npm
#
# Configurable environment variables (or defaults):
#   KOENIG_DIR - Path to Koenig repository
#   GHOST_MONO_DIR - Path to Ghost monorepo for building
#   GHOST_PROD_DIR - Path to production Ghost installation
#   GHOST_VERSION - Ghost version number (affects paths in versions/)
#   GHOST_THEME - Theme name (default: journal)
#   GHOST_SERVICE - Systemd service name (default: ghost_goldavelez-org)

# Convert to absolute paths
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Server paths - configure these for your environment
KOENIG_DIR="${KOENIG_DIR:-/var/www/gv/Koenig}"
GHOST_MONO_DIR="${GHOST_MONO_DIR:-/var/www/gv/ghost-civic-new}"
GHOST_PROD_DIR="${GHOST_PROD_DIR:-/var/www/gv/ghost-civic}"

# Ghost configuration
GHOST_VERSION="${GHOST_VERSION:-6.8.0}"
GHOST_THEME="${GHOST_THEME:-journal}"
GHOST_SERVICE="${GHOST_SERVICE:-ghost_goldavelez-org}"

# Derived paths (don't usually need to change these)
GHOST_VERSIONS_DIR="$GHOST_PROD_DIR/versions/$GHOST_VERSION"
GHOST_RENDERER_DIR="$GHOST_VERSIONS_DIR/core/server/services/koenig/node-renderers"
GHOST_LIB_DIR="$GHOST_VERSIONS_DIR/core/server/lib"
THEME_DIR="$GHOST_PROD_DIR/content/themes/$GHOST_THEME"
THEME_ASSETS_DIR="$THEME_DIR/assets/built"

echo "=== Civic Action Card Upgrade ==="
echo "Koenig: $KOENIG_DIR"
echo "Ghost Mono: $GHOST_MONO_DIR"
echo "Ghost Prod: $GHOST_PROD_DIR"
echo "Ghost Version: $GHOST_VERSION"
echo "Theme: $GHOST_THEME"
echo "Service: $GHOST_SERVICE"
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

# Step 2b: Remove civic action card from external if present (it should be bundled, not external)
echo "Ensuring civic action card is bundled (not external)..."
VITE_CONFIG="$KOENIG_DIR/packages/koenig-lexical/vite.config.js"
if grep -q "@linked-claims/koenig-civic-action-card" "$VITE_CONFIG"; then
    echo "Removing @linked-claims/koenig-civic-action-card from external dependencies..."
    sed -i "/@linked-claims\/koenig-civic-action-card/d" "$VITE_CONFIG"
    # Clean up any trailing commas that might be left
    sed -i "/external: \[/,/\],/ s/,\s*,/,/g" "$VITE_CONFIG"
else
    echo "vite.config.js is already correct (civic action card not marked as external)"
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

# Step 6c: Install custom node renderer in Ghost
echo "Installing civic action renderer in Ghost..."
sudo cp "$SCRIPT_DIR/integration/civicaction-renderer.js" "$GHOST_RENDERER_DIR/"

# Update index.js to register the renderer if not already present
RENDERER_INDEX="$GHOST_RENDERER_DIR/index.js"
if ! sudo grep -q "civicaction:" "$RENDERER_INDEX"; then
    echo "Registering civicaction renderer in index.js..."
    # First add comma to video line if missing
    sudo sed -i "s/video: require('.\/video-renderer')/video: require('.\/video-renderer'),/" "$RENDERER_INDEX"
    # Then add civicaction line after video
    sudo sed -i "/video: require('.\/video-renderer'),/a\\    civicaction: require('./civicaction-renderer')," "$RENDERER_INDEX"
else
    echo "Civicaction renderer already registered"
fi

# Step 6d: Install CivicActionNode stub for server-side validation
echo "Installing civic action node stub..."
sudo cp "$SCRIPT_DIR/integration/civicaction-node-stub.js" "$GHOST_LIB_DIR/"

# Register node stub in lexical.js if not already present
LEXICAL_JS="$GHOST_LIB_DIR/lexical.js"
if ! sudo grep -q "civicaction-node-stub" "$LEXICAL_JS"; then
    echo "Registering civic action node stub in lexical.js..."
    # Add require at top of populateNodes function
    sudo sed -i "/function populateNodes() {/a\\    const CivicActionNodeStub = require('./civicaction-node-stub');" "$LEXICAL_JS"
    # Add to nodes array
    sudo sed -i "/nodes = DEFAULT_NODES;/a\\    nodes = [...nodes, CivicActionNodeStub];" "$LEXICAL_JS"
else
    echo "Civic action node stub already registered"
fi

# Step 6e: Build client-side renderer
echo "Building client-side renderer..."
cd "$SCRIPT_DIR"
yarn install
yarn build:client

# Step 6f: Deploy client renderer to theme assets
echo "Deploying client renderer to theme..."
if [ -d "$THEME_ASSETS_DIR" ]; then
    sudo cp "$SCRIPT_DIR/dist/civic-action-renderer.min.js" "$THEME_ASSETS_DIR/"
    sudo cp "$SCRIPT_DIR/dist/civic-action-renderer.min.js.map" "$THEME_ASSETS_DIR/" 2>/dev/null || true
    echo "Client renderer deployed to theme assets"
else
    echo "Warning: Theme assets directory not found at $THEME_ASSETS_DIR"
fi

# Step 6g: Inject script tag into theme's default.hbs (idempotent)
echo "Injecting client renderer script into theme..."
DEFAULT_HBS="$THEME_DIR/default.hbs"
if [ -f "$DEFAULT_HBS" ]; then
    if ! sudo grep -q "civic-action-renderer.min.js" "$DEFAULT_HBS"; then
        echo "Adding script tag to default.hbs..."
        # Add before </body> tag, only on post pages
        sudo sed -i 's|</body>|{{#is "post"}}\n    <script src="{{asset \"built/civic-action-renderer.min.js\"}}"></script>\n{{/is}}\n</body>|' "$DEFAULT_HBS"
    else
        echo "Script tag already present in default.hbs"
    fi
else
    echo "Warning: default.hbs not found at $DEFAULT_HBS"
fi

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
sudo systemctl restart "$GHOST_SERVICE"

echo ""
echo "Waiting for Ghost to start..."
sleep 3

# Check status
sudo systemctl status "$GHOST_SERVICE" --no-pager | head -15

echo ""
echo "=== Upgrade complete! ==="
echo "Clear your browser cache or use Ctrl+Shift+R to see the new version"
