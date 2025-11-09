# Publishing Updates

## 1. Update Version

```bash
cd koenig-civic-action-card
npm version patch  # or minor, or major
```

## 2. Build and Publish

```bash
npm run build
npm publish
```

## 3. Upgrade on Server

On the server where Ghost is running:

```bash
# Set paths for your server (example for goldavelez.org):
export KOENIG_DIR=/var/www/gv/Koenig
export GHOST_MONO_DIR=/var/www/gv/ghost-civic-new
export GHOST_PROD_DIR=/var/www/gv/ghost-civic

# Run the upgrade script
cd /path/to/koenig-civic-action-card
./upgrade-civic-action.sh
```

Or use the script from GitHub:

```bash
curl -o upgrade-civic-action.sh https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/upgrade-civic-action.sh
chmod +x upgrade-civic-action.sh

export KOENIG_DIR=/path/to/Koenig
export GHOST_MONO_DIR=/path/to/ghost-civic-new
export GHOST_PROD_DIR=/path/to/ghost-civic

./upgrade-civic-action.sh
```

## Version Guidelines

- **patch** (1.0.x): Bug fixes, minor updates
- **minor** (1.x.0): New features, backward compatible
- **major** (x.0.0): Breaking changes
