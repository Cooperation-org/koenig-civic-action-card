# Client-Side Civic Action Renderer

## Overview

The client-side renderer allows civic action cards to appear on published Ghost pages by rendering them in the browser after the page loads. This approach was chosen because Lexical's server-side rendering has architectural limitations that prevent our custom nodes from being rendered.

## Architecture

### How It Works

1. **Editor**: Civic action cards are saved in Lexical JSON format in the database
2. **Published Page**: Ghost outputs the Lexical JSON in a `<script>` tag
3. **Client Renderer**: Browser-side script parses the JSON and renders React components

### Files

- `integration/civicaction-client-renderer.jsx` - Client renderer source
- `rollup.config.client.js` - Rollup config for building browser bundle
- `dist/civic-action-renderer.min.js` - Built bundle (deployed to theme)
- `test-client-renderer.cjs` - Fast local test using jsdom

## Building

```bash
# Build the client renderer
yarn build:client

# Test it locally
yarn test:client
```

## Testing Workflow

Fast iteration loop on the server:

```bash
# 1. Make changes to civicaction-client-renderer.jsx or CivicActionCard.jsx
# 2. Rebuild
yarn build:client

# 3. Test locally
yarn test:client
```

The test uses jsdom to simulate a browser environment and verifies:
- Bundle loads successfully
- Civic action nodes found in lexical data
- Placeholder divs created
- React components rendered
- Card content appears correctly

## Deployment

The upgrade script handles deployment:

```bash
./upgrade-civic-action.sh
```

This:
1. Builds the client renderer (`yarn build:client`)
2. Copies `dist/civic-action-renderer.min.js` to theme assets
3. Injects script tag into `post.hbs` (idempotent)
4. Restarts Ghost

## How the Renderer Finds Data

The client renderer looks for lexical data in two places:

1. **Script tag with data attribute**:
   ```html
   <script type="application/json" data-ghost-post>
   {"lexical": {...}}
   </script>
   ```

2. **Window variable** (if theme provides it):
   ```javascript
   window.ghostPost = {lexical: {...}}
   ```

## What Gets Rendered

For each `civicaction` node found in the lexical data:
1. Creates a `<div class="civic-action-placeholder">` element
2. Appends it to the article
3. Renders the `CivicActionCard` React component into it

The card shows:
- Event type badge (RALLY, PROTEST, etc.)
- Event title
- Description
- Date and time
- Location
- Optional image
- Take action button (if URL provided)

## Benefits of Client-Side Rendering

✅ No Ghost core modifications needed
✅ Works with existing editor integration
✅ Easy to update and deploy
✅ Full React component with interactivity
✅ Mobile-friendly

## Tradeoffs

⚠️ Cards don't appear in initial HTML (SEO)
⚠️ Requires JavaScript enabled
⚠️ Small delay before cards appear

For this use case (local community organizing site), these tradeoffs are acceptable since:
- Site isn't targeting search engine traffic
- Target audience has JS enabled
- Cards appear quickly (< 500ms)
