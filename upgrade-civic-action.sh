#!/bin/bash
set -e

# Upgrade script for Civic Action Card
# Run this after publishing a new version to npm

GHOST_DIR="${GHOST_DIR:-$(pwd)}"
WORK_DIR="${WORK_DIR:-/var/www/gv}"
KOENIG_DIR="${WORK_DIR}/Koenig"
GHOST_MONO_DIR="${WORK_DIR}/ghost-civic-new"

echo "=== Civic Action Card Upgrade ==="

# Step 1: Upgrade package in Koenig
echo "Upgrading @linked-claims/koenig-civic-action-card..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn upgrade @linked-claims/koenig-civic-action-card

# Step 2: Rebuild Koenig
echo "Rebuilding Koenig..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn build

# Step 3: Install Ghost dependencies if needed
if [ ! -d "$GHOST_MONO_DIR/node_modules" ]; then
    echo "Installing Ghost dependencies..."
    cd "$GHOST_MONO_DIR"
    yarn install
fi

# Step 4: Copy to Ghost monorepo (root node_modules, not admin)
echo "Copying to Ghost..."
rm -rf "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/dist"
cp -r "$KOENIG_DIR/packages/koenig-lexical/dist" "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/"

# Step 5: Rebuild Ghost Admin
echo "Rebuilding Ghost Admin..."
cd "$GHOST_MONO_DIR/ghost/admin"
yarn build:dev

# Step 6: Deploy to production
echo "Deploying to production..."
PROD_ADMIN="$GHOST_DIR/current/core/built/admin"
cp -r "$GHOST_MONO_DIR/ghost/admin/dist/"* "$PROD_ADMIN/"

# Step 7: Restart Ghost
echo "Restarting Ghost..."
cd "$GHOST_DIR"
ghost restart

echo "=== Upgrade complete! ==="
