# CLAUDE.md

This file provides guidance to Claude Code when working with the koenig-civic-action-card package.

## CRITICAL RULE: NEVER EDIT FILES DIRECTLY

**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**
**DO NOT EDIT FILES DIRECTLY - ALWAYS USE THE UPGRADE SCRIPT**

## Core Principle: Single Source Repository

**CRITICAL**: All modifications to the Ghost/Koenig integration must be made in THIS repository only. We do NOT fork or directly modify the Koenig or Ghost repositories.

### Workflow

1. **Make changes in koenig-civic-action-card repo**:
   - Edit files in `integration/` directory
   - Edit files in `src/` directory
   - Most importantly: **update `upgrade-civic-action.sh`**

2. **The upgrade script is the source of truth**:
   - Any changes to external repos (Koenig, Ghost) must be automated in `upgrade-civic-action.sh`
   - Experiments and modifications should be added to the script with clear comments
   - The script should be idempotent where possible (safe to run multiple times)

3. **Never modify external repos directly**:
   - Don't edit files in `/var/www/gv/Koenig/` directly
   - Don't edit files in `/var/www/gv/ghost-civic/` directly
   - Don't edit files in `/var/www/gv/ghost-civic-new/` directly
   - All such changes must be codified in the upgrade script

### Why This Matters

- The upgrade script makes our customizations reproducible
- When upgrading Ghost or Koenig, we can re-run the script to reapply customizations
- Future maintainers can see exactly what customizations were made
- The koenig-civic-action-card repo becomes the single source of truth

## Project Overview

This package provides a custom Lexical node for embedding civic action cards in Ghost posts. It includes:

- `src/CivicActionCard.jsx` - The React component for the card
- `src/CivicActionCardRenderer.js` - Server-side HTML renderer
- `integration/CivicActionNode.jsx` - Lexical node definition for Koenig
- `integration/civicaction-renderer.js` - Ghost backend renderer
- `upgrade-civic-action.sh` - Deployment automation script

## Architecture

### Editor Integration (Client-side)
- `CivicActionNode.jsx` extends Lexical's `DecoratorNode`
- Renders `CivicActionCard` React component in the editor
- Stored in Lexical JSON format with type 'civicaction'

### Published Content (Server-side)
- Ghost's lexical renderer needs custom renderer for 'civicaction' type
- `civicaction-renderer.js` generates HTML for published pages
- Node stub registered in Ghost's `lexical.js` to recognize the type

### Bridge Communication
- Card communicates with bridge.linkedtrust.us for action data
- Bridge URL configurable via `window.__GHOST_CONFIG__.civicBridgeUrl`
- Falls back to process.env.CIVIC_BRIDGE_URL or default

## Upgrade Script

The `upgrade-civic-action.sh` script automates:

1. **Package upgrade**: Updates @linked-claims/koenig-civic-action-card in Koenig
2. **Dependency install**: Runs `yarn install` at workspace root (Lerna requirement)
3. **Integration copy**: Copies `integration/CivicActionNode.jsx` to Koenig
4. **External dependency fix**: Ensures package is bundled, not marked as external
5. **Build**: Builds Koenig lexical
6. **Deploy**: Copies to Ghost monorepo and production
7. **Custom renderer**: Installs civicaction-renderer.js in Ghost
8. **Node registration**: Registers renderer in Ghost's node-renderers/index.js
9. **Experiments**: May add experimental code (clearly marked) to Ghost files
10. **Cache busting**: Updates editor hash to invalidate browser caches
11. **Restart**: Restarts Ghost via systemd

### Running the Script

```bash
cd /var/www/gv/koenig-civic-action-card
./upgrade-civic-action.sh
```

## Key Technical Details

### Bundling Strategy
- Initially tried marking as "external" dependency (like React/ReactDOM)
- Ghost couldn't find it at runtime
- **Solution**: Bundle the package into koenig-lexical.umd.js
- Script ensures it's NOT in vite.config.js external array

### Node Base Class
- Must extend Lexical's `DecoratorNode`, not `KoenigDecoratorNode`
- `KoenigDecoratorNode` causes "Lexical error #71" (DOM mutation error)
- Keep it simple: DecoratorNode works perfectly

### Server-side Rendering
- Ghost's lexical renderer needs to know 'civicaction' type exists
- Add minimal node stub to Ghost's lexical.js populateNodes() function
- Custom renderer in civicaction-renderer.js generates actual HTML
- Uses emoji icons (📅 📍) instead of SVG for server compatibility

## Development Workflow

### Testing Changes

1. **Edit files in this repo** (`src/`, `integration/`)
2. **Update upgrade script** if external changes needed
3. **Run upgrade script**: `./upgrade-civic-action.sh`
4. **Test in standalone editor**: https://goldavelez.org/lexical/
5. **Test in Ghost admin**: https://goldavelez.org/ghost/
6. **Test published page**: Create a post with civic action card and publish

### Debugging

- **Editor errors**: Check browser console at /lexical/ endpoint
- **Published page errors**: Check Ghost logs: `journalctl -u ghost_goldavelez-org -n 100`
- **Build errors**: Check Koenig build output
- **Import errors**: Ensure package installed in node_modules (Step 1b in script)

## Common Issues

### Import Resolution Error
**Symptom**: "Failed to resolve import @linked-claims/koenig-civic-action-card"
**Cause**: Package not installed in Koenig's node_modules
**Fix**: Step 1b in upgrade script runs `yarn install` at workspace root

### Runtime Undefined Error
**Symptom**: "Cannot read properties of undefined (reading 'CivicActionCard')"
**Cause**: Package marked as external but not available at runtime
**Fix**: Step 2b removes from external array so it gets bundled

### Card Not Visible on Published Pages
**Symptom**: Card shows in editor but not on published post
**Cause**: Server-side renderer doesn't recognize 'civicaction' type
**Fix**: Install custom renderer and node stub (Steps 6c, 6d)

### Lexical Error #71 or #38
**Symptom**: "Minified Lexical error #71" or "#38"
**Cause**: CivicActionNode extending wrong base class
**Fix**: Must extend DecoratorNode, not KoenigDecoratorNode

## Environment Variables

- `CIVIC_BRIDGE_URL`: Bridge API endpoint (default: https://bridge.linkedtrust.us)
- `GHOST_PROD_DIR`: Production Ghost installation path
- `KOENIG_DIR`: Koenig repository path
- `GHOST_MONO_DIR`: Ghost monorepo for building admin

## Testing Endpoints

- **Standalone editor**: https://goldavelez.org/lexical/ (for debugging)
- **Ghost admin**: https://goldavelez.org/ghost/ (production editor)
- **Published content**: https://goldavelez.org/ (live posts)

## Future Improvements

If making significant changes:
1. Document them in this file
2. Update the upgrade script to automate them
3. Test the full workflow: edit → publish → verify
4. Consider impact on Ghost/Koenig upgrades
