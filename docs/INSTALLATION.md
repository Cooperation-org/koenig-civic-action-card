# Civic Action Card Installation

## Quick Install

Run the installation script on your Ghost server:

```bash
curl -o install-civic-action.sh https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/install-civic-action.sh
chmod +x install-civic-action.sh
GHOST_DIR=/path/to/your/ghost ./install-civic-action.sh
```

## Manual Installation

1. **Clone and patch Koenig:**
   ```bash
   git clone https://github.com/TryGhost/Koenig.git
   cd Koenig/packages/koenig-lexical
   npm install @linked-claims/koenig-civic-action-card
   ```

2. **Copy integration files:**
   ```bash
   cp /path/to/koenig-civic-action-card/integration/CivicActionNode.jsx src/nodes/
   cp /path/to/koenig-civic-action-card/integration/CivicActionPlugin.jsx src/plugins/
   ```

3. **Apply patches:**
   ```bash
   cd /path/to/koenig-civic-action-card
   patch /path/to/Koenig/packages/koenig-lexical/package.json < patches/koenig-lexical-package.json.patch
   patch /path/to/Koenig/packages/koenig-lexical/src/index.js < patches/koenig-lexical-index.js.patch
   patch /path/to/Koenig/packages/koenig-lexical/src/plugins/AllDefaultPlugins.jsx < patches/koenig-lexical-AllDefaultPlugins.jsx.patch
   ```

4. **Build and deploy:**
   ```bash
   cd /path/to/Koenig
   yarn install
   yarn build
   # Copy to Ghost and rebuild admin
   ```

## What Gets Modified

- `packages/koenig-lexical/package.json` - Adds civic action card dependency
- `packages/koenig-lexical/src/index.js` - Exports CivicActionPlugin
- `packages/koenig-lexical/src/plugins/AllDefaultPlugins.jsx` - Includes CivicActionPlugin
- `packages/koenig-lexical/src/nodes/CivicActionNode.jsx` - New file
- `packages/koenig-lexical/src/plugins/CivicActionPlugin.jsx` - New file
