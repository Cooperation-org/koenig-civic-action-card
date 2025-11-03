# Koenig Integration for Civic Action Card

## Overview

To add the civic action card to Ghost, you need to patch Koenig to add the integration wrapper and plugin.

## Prerequisites

- Civic action card package: `@linked-claims/koenig-civic-action-card`
- Koenig repository cloned
- Node.js and yarn installed

## Integration Steps

### 1. Clone Koenig

```bash
cd /var/www/gv
git clone https://github.com/TryGhost/Koenig.git
cd Koenig
yarn install
```

### 2. Install Civic Action Package in Koenig

```bash
cd packages/koenig-lexical
yarn add @linked-claims/koenig-civic-action-card
```

### 3. Apply Changes

Create three files in Koenig:

**File 1: `packages/koenig-lexical/src/nodes/CivicActionNode.jsx`**

Wrapper that integrates the civic action card with Koenig's architecture.

**File 2: `packages/koenig-lexical/src/plugins/CivicActionPlugin.jsx`**

Plugin that handles the INSERT_CIVIC_ACTION_COMMAND.

**File 3: Updates to existing files**
- Export node and plugin in `src/index.js`
- Register plugin in `src/plugins/AllDefaultPlugins.jsx`

### 4. Generate Patch

After making changes:

```bash
cd /var/www/gv/Koenig

# Create patch of your changes
git add .
git diff --cached > /path/to/koenig-civic-action.patch

# Or if uncommitted:
git diff > /path/to/koenig-civic-action.patch
```

### 5. Build Koenig

```bash
cd packages/koenig-lexical
yarn build
```

### 6. Copy to Ghost Admin

```bash
cp -r dist/* /var/www/gv/ghost-civic-new/ghost/admin/node_modules/@tryghost/koenig-lexical/dist/
```

### 7. Build Ghost Admin

```bash
cd /var/www/gv/ghost-civic-new/ghost/admin
yarn build:dev
```

### 8. Deploy

```bash
sudo cp -r dist/* /var/www/gv/ghost-civic/current/core/built/admin/
sudo systemctl restart ghost_goldavelez-org.service
```

## Reusing the Patch

For other Ghost installations or Koenig version updates:

```bash
# Clone fresh Koenig
git clone https://github.com/TryGhost/Koenig.git
cd Koenig

# Install dependencies
yarn install

# Apply patch
git apply /path/to/koenig-civic-action.patch

# May need manual fixes if Koenig changed significantly

# Continue from step 5 above
```

## Troubleshooting

**Build fails with "generateDecoratorNode not exported":**
- Version mismatch between civic card package and Koenig's kg-default-nodes
- Solution: Rebuild civic action card package with same kg-default-nodes version as Koenig

**Card doesn't appear in menu:**
- Check plugin is registered in AllDefaultPlugins.jsx
- Check exports in index.js
- Clear browser cache

**Card appears but errors:**
- Check browser console for errors
- Verify CivicActionCard component receives correct props
- Check bridgeUrl configuration

## Maintenance

When Ghost/Koenig updates:
1. Clone new Koenig version
2. Attempt to apply patch
3. Fix any conflicts manually
4. Rebuild and test
5. Update patch file if needed
