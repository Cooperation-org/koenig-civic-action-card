# Add Civic Action Card to Ghost Admin

## SETUP COMPLETE
- ✅ Ghost monorepo at `/var/www/gv/ghost-civic-new`
- ✅ Admin builds (`yarn build:dev` works)  
- ✅ Civic card installed: `@linked-claims/koenig-civic-action-card`

## WORKING DIRECTORY
`/var/www/gv/ghost-civic-new/ghost/admin/`

## TASK
Find koenig-lexical SOURCE, add civic card registration, rebuild.

## NOTES from previous run

What I discovered:
  1. The civic action card package exports: CivicActionNodeEditor, CivicActionNode, $createCivicActionNode, etc.
  2. The package is already installed in the current Ghost installation: @linked-claims/koenig-civic-action-card@1.0.2
  3. The compiled koenig-lexical.js shows card registration patterns with $createBookmarkNode, $createImageNode, etc.
  4. Card menu items use data-kg-card-menu-item attributes

  For the new session, you'll need:
  - Work in /var/www/gv/ghost-civic-new/ghost/admin/
  - Find koenig-lexical SOURCE files (not compiled)
  - Add import: import {CivicActionNodeEditor} from '@linked-claims/koenig-civic-action-card';
  - Register the node in the cards array following existing patterns
  - Build with yarn build:dev
  - Deploy to /var/www/gv/ghost-civic/current/core/built/admin/

  The only change I made was installing the package (which added it to package.json) - that's harmless and actually needed.

  A fresh session in the correct directory would be more efficient than resetting!

## STEPS

1. **Find card registration in SOURCE:**
```bash
ls node_modules/@tryghost/koenig-lexical/
grep -r "BookmarkNode" node_modules/@tryghost/koenig-lexical/ --include="*.js" --include="*.jsx"
```

2. **Add import:**
```javascript
import {CivicActionNodeEditor} from '@linked-claims/koenig-civic-action-card';
```

3. **Add to cards array** (follow existing pattern)

4. **Rebuild:**
```bash
yarn build:dev
```

5. **Deploy:**
```bash
sudo cp -r dist/* /var/www/gv/ghost-civic/current/core/built/admin/
sudo systemctl restart ghost_goldavelez-org.service
```

Work with SOURCE not dist/. Follow existing patterns.
EOF
