#!/bin/bash
set -e

# Upgrade script for Civic Action Card
# Run this after publishing a new version to npm
#
# Required environment variables (or defaults):
#   KOENIG_DIR - Path to Koenig repository (default: ../Koenig)
#   GHOST_MONO_DIR - Path to Ghost monorepo for building (default: ../ghost-civic-new)
#   GHOST_PROD_DIR - Path to production Ghost installation (default: ../ghost-civic)

KOENIG_DIR="${KOENIG_DIR:-../Koenig}"
GHOST_MONO_DIR="${GHOST_MONO_DIR:-../ghost-civic-new}"
GHOST_PROD_DIR="${GHOST_PROD_DIR:-../ghost-civic}"

echo "=== Civic Action Card Upgrade ==="
echo "Koenig: $KOENIG_DIR"
echo "Ghost Mono: $GHOST_MONO_DIR"
echo "Ghost Prod: $GHOST_PROD_DIR"
echo ""

# Step 1: Upgrade package in Koenig
echo "Upgrading @linked-claims/koenig-civic-action-card..."
cd "$KOENIG_DIR/packages/koenig-lexical"
yarn upgrade @linked-claims/koenig-civic-action-card@latest

# Step 2: Build Koenig
echo "Building Koenig..."
yarn build

# Step 3: Copy to Ghost monorepo
echo "Copying to Ghost monorepo..."
rm -rf "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/dist"
cp -r "$KOENIG_DIR/packages/koenig-lexical/dist" "$GHOST_MONO_DIR/node_modules/@tryghost/koenig-lexical/"

# Step 4: Build Ghost Admin
echo "Building Ghost Admin..."
cd "$GHOST_MONO_DIR/ghost/admin"
yarn build:dev

# Step 5: Deploy to production
echo "Deploying to production..."
sudo cp -r "$GHOST_MONO_DIR/ghost/admin/dist/"* "$GHOST_PROD_DIR/current/core/built/admin/"

# Step 6: Restart Ghost
echo "Restarting Ghost..."
cd "$GHOST_PROD_DIR"
sudo -u ghost bash -c 'source ~/.nvm/nvm.sh && nvm use 22 && ghost restart'

echo ""
echo "=== Upgrade complete! ==="
