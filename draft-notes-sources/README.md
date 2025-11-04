# @cooperation/koenig-civic-action-card

A custom card for Ghost's Koenig editor that allows authors to embed civic actions (events, volunteer opportunities, petitions, etc.) directly into posts.

## Features

- **Search interface** - Authors can search for civic actions from the bridge API
- **Preview in editor** - Shows full preview of selected action
- **Automatic rendering** - Embedded cards render on published posts
- **Mobile responsive** - Works on all screen sizes
- **Type badges** - Visual indicators for different action types

## Installation

```bash
npm install @cooperation/koenig-civic-action-card
```

Or with yarn:

```bash
yarn add @cooperation/koenig-civic-action-card
```

## Integration with Ghost

### 1. Add to Koenig Editor (ghost-civic)

In `ghost-civic/ghost/admin/app/components/koenig-lexical-editor.js`:

```javascript
// Import the civic action node
import {CivicActionNodeEditor} from '@cooperation/koenig-civic-action-card';

// ... existing code ...

// In the ReactComponent function, add to cardConfig:
const cardConfig = {
    // ... existing config ...
    civicBridgeUrl: 'https://your-bridge-url.com', // or from Ghost config
};

// Add to DEFAULT_NODES (wherever nodes are registered):
const customNodes = [
    // ... other nodes ...
    CivicActionNodeEditor,
];
```

### 2. Register Node in Lexical

The node should be added to the `nodes` array in the Koenig Composer:

```jsx
<KoenigComposer
    editorResource={this.editorResource}
    cardConfig={cardConfig}
    nodes={[...DEFAULT_NODES, CivicActionNodeEditor]} // Add here
    // ... other props
>
```

### 3. Add Frontend Rendering

Create node renderer in `ghost-civic/ghost/core/core/server/services/koenig/node-renderers/`:

**File:** `civic-action-renderer.js`

```javascript
function renderCivicActionNode(node) {
    return {
        type: 'html',
        html: `<figure class="kg-civic-action-card" data-action-id="${node.actionId}" data-source="${node.source}">
    <div class="civic-action-loading">Loading civic action...</div>
</figure>`
    };
}

module.exports = renderCivicActionNode;
```

Register in `node-renderers/index.js`:

```javascript
module.exports = {
    // ... other renderers ...
    'civic-action': require('./civic-action-renderer'),
};
```

### 4. Add Frontend JavaScript

In your Ghost theme's `default.hbs`, add before `</body>`:

```html
<script>
window.CIVIC_BRIDGE_URL = '{{@config.civic_bridge_url}}';
</script>
<script src="{{asset "js/civic-action-frontend.js"}}"></script>
<link rel="stylesheet" href="{{asset "css/civic-action-frontend.css"}}">
```

**Create:** `assets/js/civic-action-frontend.js`

```javascript
(function() {
    const BRIDGE_URL = window.CIVIC_BRIDGE_URL || 'http://127.0.0.1:5000';

    document.querySelectorAll('.kg-civic-action-card').forEach(async (card) => {
        const actionId = card.dataset.actionId;
        if (!actionId) return;

        try {
            const response = await fetch(`${BRIDGE_URL}/api/civic-actions/${actionId}`);
            const action = await response.json();

            card.innerHTML = renderCivicAction(action);
        } catch (error) {
            console.error('Failed to load civic action:', error);
            card.innerHTML = '<div class="error">Unable to load civic action</div>';
        }
    });

    function renderCivicAction(action) {
        const eventDate = action.eventDate ? new Date(action.eventDate) : null;
        const isExpired = eventDate && eventDate < new Date();

        return `
            <div class="civic-action-content ${isExpired ? 'expired' : ''}">
                ${action.imageUrl ? `<img src="${action.imageUrl}" alt="${action.title}">` : ''}
                <div class="civic-action-body">
                    ${action.eventType ? `<span class="badge type-${action.eventType}">${action.eventType}</span>` : ''}
                    <h3>${action.title}</h3>
                    <p>${action.description}</p>
                    ${eventDate ? `<div>📅 ${eventDate.toLocaleDateString()}</div>` : ''}
                    ${action.location ? `<div>📍 ${action.location}</div>` : ''}
                    ${!isExpired && action.takeActionUrl ? `
                        <a href="${action.takeActionUrl}" class="action-button" target="_blank">Take Action →</a>
                        <label><input type="checkbox" onchange="trackConfirm('${action.id}')"> I did this</label>
                    ` : ''}
                    <div class="stats" id="stats-${action.id}">Loading stats...</div>
                </div>
            </div>
        `;
    }

    window.trackConfirm = async function(actionId) {
        await fetch(`${BRIDGE_URL}/api/civic-actions/${actionId}/confirm`, {method: 'POST'});
    };
})();
```

## Usage

### In Ghost Editor

1. Click the **+** button in the editor
2. Select **"Civic Action"** from the menu
3. Search for a civic action
4. Click to select and embed
5. Publish your post

The card will show:
- In editor: Search interface or preview
- On published page: Full rendered card with action button

## Configuration

### Bridge URL

Set the bridge URL in Ghost's config:

```json
{
  "civic": {
    "bridgeUrl": "https://your-bridge-url.com"
  }
}
```

Or via environment variable:
```bash
civic__bridgeUrl=https://your-bridge-url.com
```

## Development

### Build

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Publish

```bash
npm publish
```

## API Requirements

The bridge API must provide these endpoints:

```
GET  /api/civic-actions/search?q=term&limit=20
GET  /api/civic-actions/:id
POST /api/civic-actions/:id/click
POST /api/civic-actions/:id/confirm
GET  /api/civic-actions/:id/stats
```

### Search Response Format

```json
[
  {
    "id": "action123",
    "title": "Community Garden Cleanup",
    "description": "Join us...",
    "eventType": "volunteer",
    "eventDate": "2024-03-15T10:00:00Z",
    "location": "Central Park",
    "imageUrl": "https://...",
    "takeActionUrl": "https://...",
    "source": "community"
  }
]
```

## License

MIT

## Support

For issues, please file a GitHub issue at https://github.com/cooperation-org/koenig-civic-action-card
