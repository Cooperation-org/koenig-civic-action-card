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
curl -o upgrade-civic-action.sh https://raw.githubusercontent.com/YOUR-ORG/koenig-civic-action-card/main/upgrade-civic-action.sh
chmod +x upgrade-civic-action.sh
./upgrade-civic-action.sh
```

Or if you have the repo locally:

```bash
/path/to/koenig-civic-action-card/upgrade-civic-action.sh
```

## Version Guidelines

- **patch** (1.0.x): Bug fixes, minor updates
- **minor** (1.x.0): New features, backward compatible
- **major** (x.0.0): Breaking changes
