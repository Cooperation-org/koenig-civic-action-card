# Civic Action Card Integration for Koenig Lexical

This directory contains the integration files for adding the Civic Action Card to Ghost's Koenig Lexical editor.

## Files

### CivicActionNode.jsx
The main Lexical DecoratorNode implementation for the Civic Action card.

**Location in Koenig source:**
`/var/www/gv/Koenig/packages/koenig-lexical/src/nodes/CivicActionNode.jsx`

**Key Methods:**
- `static getType()` - Returns 'civicaction'
- `static clone(node)` - Creates a copy using node.getDataset()
- `createDOM()` - Returns a div element (REQUIRED for DecoratorNode)
- `decorate()` - Returns the CivicActionCard React component wrapped in KoenigCardWrapper
- `exportJSON()` / `static importJSON()` - JSON serialization

### CivicActionPlugin.jsx
The Lexical plugin that handles the INSERT_CIVIC_ACTION_COMMAND.

**Location in Koenig source:**
`/var/www/gv/Koenig/packages/koenig-lexical/src/plugins/CivicActionPlugin.jsx`

**What it does:**
- Registers the INSERT_CIVIC_ACTION_COMMAND
- Creates a CivicActionNode when the command is dispatched
- Uses INSERT_CARD_COMMAND to insert the node into the editor

## Integration Steps

### 1. Add Package Dependency

In `/var/www/gv/Koenig/packages/koenig-lexical/package.json`:

```json
{
  "dependencies": {
    "@linked-claims/koenig-civic-action-card": "2.2.1"
  }
}
```

### 2. Register the Node

In `/var/www/gv/Koenig/packages/koenig-lexical/src/nodes/DefaultNodes.js`:

```javascript
import {CivicActionNode} from './CivicActionNode';

const DEFAULT_NODES = [
    // ... other nodes
    CivicActionNode,
    // ... more nodes
];
```

### 3. Register the Plugin

In `/var/www/gv/Koenig/packages/koenig-lexical/src/plugins/AllDefaultPlugins.jsx`:

```javascript
import {CivicActionPlugin} from '../plugins/CivicActionPlugin';

export const AllDefaultPlugins = () => {
    return (
        <>
            {/* ... other plugins */}
            <CivicActionPlugin />
            {/* ... more plugins */}
        </>
    );
};
```

### 4. Mark Package as External in Vite Config

**CRITICAL:** The civic action card package must be marked as external so Vite doesn't try to bundle it.

In `/var/www/gv/Koenig/packages/koenig-lexical/vite.config.js`:

```javascript
rollupOptions: {
    external: [
        'react',
        'react-dom',
        '@linked-claims/koenig-civic-action-card'  // ADD THIS LINE
    ],
```

**Why:** CivicActionNode.jsx imports `@linked-claims/koenig-civic-action-card`. Without marking it as external, Vite will try to bundle it during the build, causing errors like:

```
[vite]: Rollup failed to resolve import "@linked-claims/koenig-civic-action-card"
```

### 5. Install Dependencies

```bash
cd /var/www/gv/Koenig/packages/koenig-lexical
yarn install
```

## Configuration

### Bridge URL

The card uses the following priority for determining the bridge URL:

1. `window.__GHOST_CONFIG__?.civicBridgeUrl` (Ghost config)
2. `process.env.CIVIC_BRIDGE_URL` (Environment variable)
3. `https://bridge.linkedtrust.us/api` (Default fallback)

To configure in Ghost, add to config.production.json:

```json
{
  "civicBridgeUrl": "https://bridge.linkedtrust.us/api"
}
```

## Development Testing

### Standalone Koenig Editor

```bash
cd /var/www/gv/Koenig/packages/koenig-lexical
yarn dev
```

Access at: http://localhost:5173/lexical/

The card will appear in the card menu as "Civic Action v4".

### Hot Reload

Changes to CivicActionNode.jsx or the card component will automatically reload in the browser (typically < 1 second).

## Deployment to Ghost

After testing in standalone Koenig, deploy to Ghost:

```bash
# Build Koenig
cd /var/www/gv/Koenig/packages/koenig-lexical
rm -rf dist && yarn build

# Copy to ghost-civic-new for admin build
rm -rf /var/www/gv/ghost-civic-new/node_modules/@tryghost/koenig-lexical/dist
cp -r dist /var/www/gv/ghost-civic-new/node_modules/@tryghost/koenig-lexical/

# Build admin
cd /var/www/gv/ghost-civic-new/ghost/admin
rm -rf tmp dist && yarn build:dev

# Copy to production Ghost
sudo cp -r /var/www/gv/Koenig/packages/koenig-lexical/dist/* \
  /var/www/gv/ghost-civic/versions/6.6.0/core/built/admin/assets/koenig-lexical/

# Update hash in index.html
NEW_HASH=$(node -e "const crypto = require('crypto'); const fs = require('fs'); \
  const file = fs.readFileSync('/var/www/gv/ghost-civic/versions/6.6.0/core/built/admin/assets/koenig-lexical/koenig-lexical.umd.js', 'utf8'); \
  console.log(crypto.createHash('sha256').update(file).digest('hex').slice(0, 10));")

OLD_HASH=$(python3 -c "import urllib.parse; print(urllib.parse.unquote(open('/var/www/gv/ghost-civic/versions/6.6.0/core/built/admin/index.html').read()))" | \
  grep -o '"editorHash":"[^"]*"' | cut -d'"' -f4)

sudo sed -i "s/%22${OLD_HASH}%22/%22${NEW_HASH}%22/g" /var/www/gv/ghost-civic/versions/6.6.0/core/built/admin/index.html

# Restart Ghost
cd /var/www/gv/ghost-civic
sudo -u ghost bash -c 'source ~/.nvm/nvm.sh && nvm use 22 && ghost restart'
```

## Required DecoratorNode Methods

All Lexical DecoratorNodes MUST implement these methods:

1. **static getType()** - Returns the node type string
2. **static clone(node)** - Creates a copy of the node
3. **createDOM()** - Returns the DOM element (CRITICAL - will fail without this!)
4. **decorate()** - Returns the React component to render
5. **exportJSON()** - Exports node data to JSON
6. **static importJSON()** - Imports node from JSON

## Troubleshooting

### Error: "createDOM: base method not extended"
You forgot to add the `createDOM()` method. Add:
```javascript
createDOM() {
    return document.createElement('div');
}
```

### Error: "Reconciliation: could not find DOM element"
This usually means createDOM() is missing or the node isn't properly registered.

### Card doesn't appear in menu
Check that:
- Node is registered in DefaultNodes.js
- Plugin is registered in AllDefaultPlugins.jsx
- kgMenu static property is defined on the node class
- Dev server has been restarted after registration

## Version History

- v1: Initial test build
- v2: First successful deployment to Ghost
- v3: Fixed clone() method bug (node.__dataset → node.getDataset())
- v4: Added createDOM() method + restored CivicActionCard with bridge URL
- v5: Added script auto-update of vite.config.js to mark package as external
- v6: Continued refinements
- v7: Current version with automated deployment script

## Current Version: v7

Last updated: 2025-11-11
