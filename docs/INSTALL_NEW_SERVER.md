# Installing on a New Server

All server-specific paths are now configurable as environment variables at the top of `upgrade-civic-action.sh`.

## Quick Start

### 1. Clone this repository

```bash
git clone <repo-url> /path/to/koenig-civic-action-card
cd /path/to/koenig-civic-action-card
```

### 2. Configure environment variables

Edit `upgrade-civic-action.sh` or set environment variables before running:

```bash
# Required paths
export KOENIG_DIR="/path/to/Koenig"
export GHOST_MONO_DIR="/path/to/ghost-monorepo"
export GHOST_PROD_DIR="/path/to/ghost-production"

# Ghost configuration
export GHOST_VERSION="6.8.0"           # Or your Ghost version
export GHOST_THEME="journal"           # Or your theme name
export GHOST_SERVICE="ghost_yoursite"  # Systemd service name

# Run upgrade
./upgrade-civic-action.sh
```

## Configuration Variables

### Required Paths

**KOENIG_DIR** (default: `/var/www/gv/Koenig`)
- Path to your Koenig repository clone
- Used for: Building koenig-lexical with the civic action card

**GHOST_MONO_DIR** (default: `/var/www/gv/ghost-civic-new`)
- Path to Ghost monorepo (for building admin)
- Used for: Building Ghost admin assets

**GHOST_PROD_DIR** (default: `/var/www/gv/ghost-civic`)
- Path to production Ghost installation
- Used for: Deploying built assets and integration files

### Ghost Configuration

**GHOST_VERSION** (default: `6.8.0`)
- Your Ghost version number
- Affects paths in `versions/` directory
- Example: `6.8.0`, `5.95.0`

**GHOST_THEME** (default: `journal`)
- Theme name where client renderer will be deployed
- Must match directory name in `content/themes/`

**GHOST_SERVICE** (default: `ghost_goldavelez-org`)
- Systemd service name for Ghost
- Used for restarting Ghost after deployment

## Derived Paths

These are automatically calculated from the variables above:

```bash
GHOST_VERSIONS_DIR="$GHOST_PROD_DIR/versions/$GHOST_VERSION"
GHOST_RENDERER_DIR="$GHOST_VERSIONS_DIR/core/server/services/koenig/node-renderers"
GHOST_LIB_DIR="$GHOST_VERSIONS_DIR/core/server/lib"
THEME_DIR="$GHOST_PROD_DIR/content/themes/$GHOST_THEME"
THEME_ASSETS_DIR="$THEME_DIR/assets/built"
```

You usually don't need to change these unless your Ghost installation has a non-standard structure.

## Example: New Server Setup

```bash
# 1. Install prerequisites
sudo apt install nodejs npm yarn
npm install -g ghost-cli

# 2. Clone Koenig
git clone https://github.com/TryGhost/Koenig /var/www/mysite/Koenig

# 3. Clone Ghost monorepo
git clone https://github.com/TryGhost/Ghost /var/www/mysite/ghost-mono

# 4. Install Ghost production
cd /var/www/mysite
ghost install --dir ghost-prod

# 5. Clone this repository
git clone <repo-url> /var/www/mysite/koenig-civic-action-card

# 6. Configure and run
cd /var/www/mysite/koenig-civic-action-card

# Edit upgrade-civic-action.sh to set:
#   KOENIG_DIR="/var/www/mysite/Koenig"
#   GHOST_MONO_DIR="/var/www/mysite/ghost-mono"
#   GHOST_PROD_DIR="/var/www/mysite/ghost-prod"
#   GHOST_VERSION="6.8.0"  # Your version
#   GHOST_THEME="casper"   # Your theme
#   GHOST_SERVICE="ghost_mysite"

# Or use environment variables:
export KOENIG_DIR="/var/www/mysite/Koenig"
export GHOST_MONO_DIR="/var/www/mysite/ghost-mono"
export GHOST_PROD_DIR="/var/www/mysite/ghost-prod"
export GHOST_VERSION="6.8.0"
export GHOST_THEME="casper"
export GHOST_SERVICE="ghost_mysite"

./upgrade-civic-action.sh
```

## What Gets Deployed

The script deploys files to these locations:

1. **Editor (Admin)**
   - `$GHOST_PROD_DIR/current/core/built/admin/assets/koenig-lexical/`
   - Contains the editor with CivicActionNode

2. **Server-side renderer**
   - `$GHOST_VERSIONS_DIR/core/server/services/koenig/node-renderers/civicaction-renderer.js`
   - Renders civic action cards to HTML on server

3. **Node stub**
   - `$GHOST_VERSIONS_DIR/core/server/lib/civicaction-node-stub.js`
   - Allows Ghost to recognize 'civicaction' type in lexical JSON

4. **Client-side renderer**
   - `$THEME_DIR/assets/built/civic-action-renderer.min.js`
   - Hydrates server HTML with interactive React components

5. **Theme integration**
   - Adds script tag to `$THEME_DIR/default.hbs`

## Troubleshooting

### Permission Issues

If you get permission errors, ensure:
- You have sudo access
- Ghost files are owned by the correct user
- The script uses `sudo` for file operations in Ghost directories

### Path Issues

If files aren't found:
1. Check your environment variables are set correctly
2. Verify Ghost version matches: `ghost version` in production directory
3. Check theme exists: `ls $GHOST_PROD_DIR/content/themes/`
4. Verify systemd service name: `sudo systemctl list-units | grep ghost`

### Testing

After deployment, test locally:
```bash
cd /var/www/mysite/koenig-civic-action-card
sudo -u ghost bash -c "node tests/test-lexical-to-html.js 2>&1"
```

Expected output:
```
✅ HTML Generated: <p>things</p><figure class="kg-card civic-action-preview-card...
🎉 SUCCESS - HTML generation works!
```

## Upgrading to New Version

After publishing a new version to npm:

```bash
cd /path/to/koenig-civic-action-card
./upgrade-civic-action.sh
```

The script will:
1. Pull latest package from npm
2. Build everything
3. Deploy to production
4. Restart Ghost

No manual intervention needed!
