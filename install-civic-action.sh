#!/bin/bash
set -e

# Installation script for Civic Action Card on Ghost server
# This assumes Ghost is already installed via ghost-cli

GHOST_DIR="${GHOST_DIR:-$(pwd)}"
WORK_DIR="${WORK_DIR:-/var/www/gv}"
KOENIG_DIR="${WORK_DIR}/Koenig"
GHOST_MONO_DIR="${WORK_DIR}/ghost-civic-new"

echo "=== Civic Action Card Installation ==="
echo "Ghost directory: $GHOST_DIR"
echo "Work directory: $WORK_DIR"

# Step 1: Clone Koenig if not exists
if [ ! -d "$KOENIG_DIR" ]; then
    echo "Cloning TryGhost/Koenig..."
    cd "$WORK_DIR"
    git clone https://github.com/TryGhost/Koenig.git
else
    echo "Koenig directory already exists"
fi

# Step 2: Install civic action card package
echo "Installing civic action card package..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn add @linked-claims/koenig-civic-action-card

# Step 3: Download and copy integration files
echo "Downloading integration files..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
curl -L -o CivicActionNode.jsx https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/integration/CivicActionNode.jsx
curl -L -o CivicActionPlugin.jsx https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/integration/CivicActionPlugin.jsx

cp CivicActionNode.jsx "$KOENIG_DIR/packages/koenig-lexical/src/nodes/"
cp CivicActionPlugin.jsx "$KOENIG_DIR/packages/koenig-lexical/src/plugins/"

# Step 4: Download and apply patches
echo "Downloading and applying patches..."
curl -L -o package.json.patch https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/patches/koenig-lexical-package.json.patch
curl -L -o index.js.patch https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/patches/koenig-lexical-index.js.patch
curl -L -o AllDefaultPlugins.jsx.patch https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/patches/koenig-lexical-AllDefaultPlugins.jsx.patch

cd "$KOENIG_DIR/packages/koenig-lexical"
patch -p3 package.json < "$TEMP_DIR/package.json.patch"
patch -p3 src/index.js < "$TEMP_DIR/index.js.patch"
patch -p3 src/plugins/AllDefaultPlugins.jsx < "$TEMP_DIR/AllDefaultPlugins.jsx.patch"

rm -rf "$TEMP_DIR"

# Step 5: Build Koenig
echo "Building Koenig..."
cd "$KOENIG_DIR"
yarn install
yarn build

# Step 6: Clone Ghost monorepo if needed
if [ ! -d "$GHOST_MONO_DIR" ]; then
    echo "Cloning Ghost monorepo..."
    cd "$WORK_DIR"
    git clone --recurse-submodules https://github.com/TryGhost/Ghost.git ghost-civic-new
    cd ghost-civic-new
    yarn install
else
    echo "Ghost monorepo already exists"
fi

# Step 7: Copy built Koenig to Ghost
echo "Copying built Koenig to Ghost..."
cp -r "$KOENIG_DIR/packages/koenig-lexical/build" "$GHOST_MONO_DIR/ghost/admin/node_modules/@tryghost/koenig-lexical/"

# Step 8: Build Ghost Admin
echo "Building Ghost Admin..."
cd "$GHOST_MONO_DIR/ghost/admin"
yarn build:dev

# Step 9: Deploy to production Ghost
echo "Deploying to production..."
PROD_ADMIN="$GHOST_DIR/current/core/built/admin"
if [ -d "$PROD_ADMIN" ]; then
    cp -r "$GHOST_MONO_DIR/ghost/admin/dist/"* "$PROD_ADMIN/"
    echo "Restarting Ghost..."
    cd "$GHOST_DIR"
    ghost restart
    echo "=== Installation complete! ==="
else
    echo "WARNING: Production admin directory not found at $PROD_ADMIN"
    echo "Built admin is available at: $GHOST_MONO_DIR/ghost/admin/dist/"
fi
