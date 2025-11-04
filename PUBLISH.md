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

```bash
cd /path/to/ghost
./upgrade-civic-action.sh
```

## Version Guidelines

- **patch** (1.0.x): Bug fixes, minor updates
- **minor** (1.x.0): New features, backward compatible
- **major** (x.0.0): Breaking changes
