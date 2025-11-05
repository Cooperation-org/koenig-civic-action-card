# Koenig Integration for Civic Action Card

## Overview

This package integrates with Ghost by patching Koenig to include the civic action card node and plugin.

## Directory Structure

- `/var/www/gv/koenig-civic-action-card` - This package
- `/var/www/gv/Koenig` - Cloned TryGhost/Koenig (patched)
- `/var/www/gv/ghost-civic-new` - Ghost monorepo (dev/build)
- `/var/www/gv/ghost-civic/current/core/built/admin/` - Production Ghost

## Generate Patch File

Run on server where Koenig is already modified:

```bash
cd /var/www/gv/Koenig
git diff HEAD > ~/koenig-civic-action.patch
```

## New Server Install

```bash
# 1. Clone Koenig
cd /var/www/gv
git clone https://github.com/TryGhost/Koenig.git
cd Koenig
yarn install

# 2. Install civic action card package
cd packages/koenig-lexical
yarn add @linked-claims/koenig-civic-action-card

# 3. Apply patch
cd /var/www/gv/Koenig
git apply ~/koenig-civic-action.patch

# 4. Build Koenig
cd packages/koenig-lexical
yarn build

# 5. Copy to Ghost admin
cp -r dist/* /var/www/gv/ghost-civic-new/ghost/admin/node_modules/@tryghost/koenig-lexical/dist/

# 6. Build Ghost admin
cd /var/www/gv/ghost-civic-new/ghost/admin
yarn build:dev

# 7. Deploy
sudo cp -r dist/* /var/www/gv/ghost-civic/current/core/built/admin/
sudo systemctl restart ghost_goldavelez-org.service
```

## Upgrade Package on Existing Server

```bash
# 1. Update civic action card package
cd /var/www/gv/Koenig/packages/koenig-lexical
yarn upgrade @linked-claims/koenig-civic-action-card

# 2. Rebuild Koenig
yarn build

# 3. Copy to Ghost admin
cp -r dist/* /var/www/gv/ghost-civic-new/ghost/admin/node_modules/@tryghost/koenig-lexical/dist/

# 4. Rebuild Ghost admin
cd /var/www/gv/ghost-civic-new/ghost/admin
yarn build:dev

# 5. Deploy
sudo cp -r dist/* /var/www/gv/ghost-civic/current/core/built/admin/
sudo systemctl restart ghost_goldavelez-org.service
```

## Patch Contents

The patch creates/modifies:
- `packages/koenig-lexical/src/nodes/CivicActionNode.jsx`
- `packages/koenig-lexical/src/plugins/CivicActionPlugin.jsx`
- `packages/koenig-lexical/src/index.js` (exports)
- `packages/koenig-lexical/src/plugins/AllDefaultPlugins.jsx` (registration)

## Troubleshooting

**Patch fails:** Manually resolve conflicts, regenerate patch
**Build fails:** Check kg-default-nodes version match
**Card missing:** Check AllDefaultPlugins.jsx registration, clear cache
**Card errors:** Check browser console, verify bridgeUrl prop
