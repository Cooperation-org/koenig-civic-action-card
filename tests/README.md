# Debugging Tests for Civic Action Card

These tests help debug the civic action card integration with Ghost's Lexical renderer.

## Prerequisites

Tests must be run as the `ghost` user because they need to write to `/tmp/civic-debug.log`:

```bash
sudo -u ghost bash -c "command here"
```

## Tests

### 1. test-lexical-to-html.js

**Purpose:** The main test - verifies that Ghost can convert lexical JSON (from database) to HTML.

**What it does:**
- Takes actual lexical JSON containing a civic action card
- Calls Ghost's `lexicalLib.render()` to convert to HTML
- Checks if the HTML contains the civic action card

**How to run:**
```bash
sudo -u ghost bash -c "node tests/test-lexical-to-html.js 2>&1"
```

**Expected output (working):**
```
📄 Testing lexical-to-HTML conversion

Input lexical JSON has civic action: ✅ YES

🔧 Loaded Ghost lexical library
Available functions: [...]

🎨 Calling lexicalLib.render()...
[CIVIC STUB] importJSON called with title: CD1 Protest at Schweikert's Office
[CIVIC STUB] clone() called, created clone with title: CD1 Protest at Schweikert's Office
[CIVIC STUB] exportDOM called
[CIVIC STUB]   has nodeRenderers: true
[CIVIC STUB]   Calling custom renderer!

✅ HTML Generated:
<p>things</p><figure class="kg-card civic-action-preview-card...

📊 Analysis:
- Length: 1607 characters
- Has data-civic-action: ✅ YES
- Has figure tag: ✅ YES

🎉 SUCCESS - HTML generation works! Renderer is being called.
```

**Expected output (broken):**
```
✅ HTML Generated:
<p>things</p>

📊 Analysis:
- Length: 13 characters
- Has data-civic-action: ❌ NO
- Has figure tag: ❌ NO

❌ PROBLEM REPRODUCED - HTML generated but NO civic action card
```

**Debug log:**
Check `/tmp/civic-debug.log` for detailed execution trace.

### 2. test-node-registration.js

**Purpose:** Verifies the civic action node is registered in Ghost's Lexical nodes array.

**What it does:**
- Loads Ghost's lexical library
- Lists all registered node types
- Checks if `civicaction` is in the list
- Tests if importJSON works

**How to run:**
```bash
node tests/test-node-registration.js 2>&1
```

**Expected output:**
```
🔧 Checking node registration

Nodes array length: 33

Registered node types:
  0: extended-text (ExtendedTextNode)
  ...
  32: civicaction (CivicActionNodeStub)

 Has civicaction node: ✅ YES

✅ Found CivicActionNode class
   Name: CivicActionNodeStub
   Has importJSON: function
   Has clone: function
   Has getType: function
   ✅ importJSON works, created instance with title: Test
```

## Troubleshooting

### Permission denied on /tmp/civic-debug.log

The stub writes debug logs to `/tmp/civic-debug.log`. If you get permission errors:

```bash
sudo -u ghost rm -f /tmp/civic-debug.log
sudo -u ghost bash -c "node tests/test-lexical-to-html.js 2>&1"
```

### Test shows "NO civic action card"

This means the fix isn't working. Check:

1. **Node stub using `extends`:**
   ```bash
   grep "extends KoenigDecoratorNode" integration/civicaction-node-stub.js
   ```
   Should return a match.

2. **Node stub calling `super()`:**
   ```bash
   grep "super(key)" integration/civicaction-node-stub.js
   ```
   Should return a match.

3. **Renderer is registered:**
   ```bash
   grep "civicaction.*require.*civicaction-renderer" /var/www/gv/ghost-civic/versions/6.8.0/core/server/services/koenig/node-renderers/index.js
   ```
   Should return a match.

4. **Check debug log:**
   ```bash
   sudo -u ghost cat /tmp/civic-debug.log
   ```
   Look for:
   - `[CIVIC STUB] importJSON called` - ✅ Good
   - `[CIVIC STUB] exportDOM called` - ✅ Good
   - `[CIVIC STUB] Calling custom renderer!` - ✅ Good

   If exportDOM is NOT called, the `extends` fix isn't working.

### Node error #38

If you see "Minified Lexical error #38", the node stub is missing required methods:
- `createDOM(config)` - Creates DOM element
- `updateDOM()` - Updates DOM

Check that both methods exist in `integration/civicaction-node-stub.js`.

## How This Helped

**The Problem:**
- Cards were saving to database (lexical field)
- But HTML field was NULL
- Published pages were empty

**The Debug Process:**
1. Created `test-lexical-to-html.js` to reproduce the issue locally
2. Test showed: lexical has civic action, but HTML doesn't
3. Added debug logging to the stub
4. Found that `exportDOM()` was never being called
5. Root cause: Using `Object.setPrototypeOf()` instead of `extends`
6. Fixed by properly extending `KoenigDecoratorNode`
7. Test confirmed the fix works

**Key Insight:**
Local testing with these scripts allowed rapid iteration (2 second test cycle) instead of:
- Deploying to Ghost
- Updating database
- Checking published page
- Repeat

This saved hours of debugging time.

## Files to Check After Changes

After modifying the civic action integration, verify:

1. **Node stub deployed:**
   ```bash
   ls -l /var/www/gv/ghost-civic/versions/6.8.0/core/server/lib/civicaction-node-stub.js
   ```

2. **Renderer deployed:**
   ```bash
   ls -l /var/www/gv/ghost-civic/versions/6.8.0/core/server/services/koenig/node-renderers/civicaction-renderer.js
   ```

3. **Renderer registered:**
   ```bash
   grep civicaction /var/www/gv/ghost-civic/versions/6.8.0/core/server/services/koenig/node-renderers/index.js
   ```

4. **Run the test:**
   ```bash
   sudo -u ghost bash -c "node tests/test-lexical-to-html.js 2>&1"
   ```

## Understanding the Test Data

The test uses actual lexical JSON from the database:

```javascript
{
    "root": {
        "children": [
            {
                "type": "paragraph",
                "children": [{"text": "things", ...}]
            },
            {
                "type": "civicaction",
                "actionId": "cmhshvtpx0008qpgg384pi5hp",
                "title": "CD1 Protest at Schweikert's Office",
                "description": "...",
                "eventType": "RALLY",
                "eventDate": "2025-11-17T15:00:00.000Z",
                "location": "14500 N Northsight Blvd, Scottsdale, AZ",
                "imageUrl": "...",
                "takeActionUrl": "...",
                "source": "mobilize"
            }
        ]
    }
}
```

To test with your own data, replace the `lexicalFromDB` object in the test file with JSON from:

```bash
mysql -u ghost_gv -p ghost_gv -e "SELECT lexical FROM posts WHERE slug='your-post-slug' \G"
```
