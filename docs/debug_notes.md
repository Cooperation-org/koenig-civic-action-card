# Fix Summary - Civic Action Card HTML Rendering

## Problem Identified

**Symptom:** Civic action card data saved to database (lexical field) but HTML field was NULL, causing published pages to be empty.

**Root Cause:** The CivicActionNode stub was using `Object.setPrototypeOf()` to manually set the prototype chain instead of properly extending `KoenigDecoratorNode`.

## Why It Failed

When using manual prototype setting:
```javascript
Object.setPrototypeOf(CivicActionNodeStub.prototype, KoenigDecoratorNode.prototype);
```

The node would be created during `importJSON()` but when Lexical internally cloned/processed the node, the instanceof checks would fail, causing:
- `$isKoenigCard(node)` to return false
- `exportDOM()` never being called
- Node being skipped during HTML rendering

## The Fix

Changed from manual prototype manipulation to proper class extension:

### Before (BROKEN):
```javascript
class CivicActionNodeStub {
    constructor(dataset = {}) {
        this.dataset = dataset;
    }
    // ... methods
}

Object.setPrototypeOf(CivicActionNodeStub.prototype, KoenigDecoratorNode.prototype);
```

### After (WORKING):
```javascript
class CivicActionNodeStub extends KoenigDecoratorNode {
    constructor(dataset = {}, key) {
        super(key); // CRITICAL: Call parent constructor
        this.dataset = dataset;
    }
    // ... methods
}
```

## Required Methods

The stub needs these methods for Lexical to work:

1. **Static methods:**
   - `getType()` - Returns 'civicaction'
   - `importJSON(serializedNode)` - Creates instance from JSON
   - `clone(node)` - Creates a copy of the node

2. **Instance methods:**
   - `exportJSON()` - Serializes node to JSON
   - `createDOM(config)` - Creates DOM element (required by Lexical)
   - `updateDOM()` - Updates DOM (return false if no update needed)
   - `exportDOM(options)` - Calls custom renderer from options.nodeRenderers
   - `decorate()` - Returns null for server-side
   - Property getters (actionId, title, description, etc.)

## Local Test Results

✅ **Before fix:**
- importJSON called: YES
- exportDOM called: NO
- HTML output: `<p>things</p>` (only paragraph, no civic action)
- data-civic-action in HTML: NO

✅ **After fix:**
- importJSON called: YES
- clone() called: YES
- exportDOM called: YES
- Custom renderer called: YES
- HTML output: Full `<figure>` element with data-civic-action attribute
- data-civic-action in HTML: YES
- Length: 1607 characters (full card HTML)

## Files Changed

- `integration/civicaction-node-stub.js` - Fixed to use `extends` and `super()`

## Testing

Run local test:
```bash
sudo -u ghost bash -c "node /tmp/test-lexical-to-html.js 2>&1"
```

Expected output:
```
✅ HTML Generated: <p>things</p><figure class="kg-card civic-action-preview-card...
📊 Analysis:
- Has data-civic-action: ✅ YES
- Has figure tag: ✅ YES
🎉 SUCCESS - HTML generation works!
```

## Next Steps

1. ✅ Fix implemented and tested locally
2. ⏳ Deploy to production via `./upgrade-civic-action.sh`
3. ⏳ Update existing posts (Ghost needs to regenerate HTML)
4. ⏳ Verify on published pages

## Key Insight

JavaScript's `extends` keyword does more than just set up the prototype chain - it:
- Properly links the constructor
- Ensures `super()` works correctly
- Maintains the prototype chain through Lexical's internal cloning
- Makes `instanceof` checks work reliably

Manual prototype manipulation with `Object.setPrototypeOf()` is fragile and breaks when frameworks internally process/clone objects.
