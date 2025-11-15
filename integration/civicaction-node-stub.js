// FIXED v4: Properly extend KoenigDecoratorNode with super() call

const {KoenigDecoratorNode} = require('@tryghost/kg-default-nodes');

// Properly extend the class
class CivicActionNodeStub extends KoenigDecoratorNode {
    constructor(dataset = {}, key) {
        super(key); // Call parent constructor
        this.dataset = dataset;
    }

    static getType() {
        return 'civicaction';
    }

    static transform() {
        return null;
    }

    static clone(node) {
        const clone = new CivicActionNodeStub(node.getDataset(), node.__key);
        console.error(`[CIVIC STUB] clone() called, created clone with title: ${clone.title}`);
        return clone;
    }

    static importJSON(serializedNode) {
        console.error(`[CIVIC STUB] importJSON called with title: ${serializedNode.title}`);
        return new CivicActionNodeStub(serializedNode);
    }

    exportJSON() {
        return {
            type: 'civicaction',
            version: 1,
            ...this.dataset
        };
    }

    getDataset() {
        return this.dataset;
    }

    // REQUIRED: createDOM for Lexical to create the DOM element
    createDOM(config) {
        console.error('[CIVIC STUB] createDOM called');
        const createElement = config?.createElement || (typeof document !== 'undefined' ? document.createElement.bind(document) : null);

        if (!createElement) {
            return {
                tagName: 'div',
                setAttribute: () => {},
                appendChild: () => {}
            };
        }

        const element = createElement('div');
        element.setAttribute('data-lexical-decorator', 'true');
        return element;
    }

    // REQUIRED: updateDOM for Lexical node updates
    updateDOM(prevNode, dom, config) {
        console.error('[CIVIC STUB] updateDOM called');
        return false;
    }

    // FIX: exportDOM needs to call the custom renderer from options.nodeRenderers
    exportDOM(options = {}) {
        console.error('[CIVIC STUB] exportDOM called');
        console.error(`[CIVIC STUB]   has nodeRenderers: ${'nodeRenderers' in options}`);

        const nodeType = 'civicaction';

        if (options.nodeRenderers?.[nodeType]) {
            console.error('[CIVIC STUB]   Calling custom renderer!');
            const render = options.nodeRenderers[nodeType];

            if (typeof render === 'object') {
                const nodeVersion = this.__version || 1;
                const versionRenderer = render[nodeVersion];
                if (!versionRenderer) {
                    throw new Error(`civicaction renderer for version ${nodeVersion} not found`);
                }
                return versionRenderer(this, options);
            } else {
                return render(this, options);
            }
        }

        console.error('[CIVIC STUB]   No custom renderer - using default');
        return {
            element: {
                tagName: 'div',
                outerHTML: '<div data-civic-placeholder="true"></div>'
            },
            type: 'default'
        };
    }

    // Property getters
    get actionId() { return this.dataset.actionId || ''; }
    get title() { return this.dataset.title || ''; }
    get description() { return this.dataset.description || ''; }
    get eventType() { return this.dataset.eventType || ''; }
    get eventDate() { return this.dataset.eventDate || ''; }
    get location() { return this.dataset.location || ''; }
    get imageUrl() { return this.dataset.imageUrl || ''; }
    get takeActionUrl() { return this.dataset.takeActionUrl || ''; }
    get source() { return this.dataset.source || 'community'; }

    // Lexical node interface - using parent implementations where possible
    decorate() {
        return null; // Server-side doesn't render React components
    }

    isInline() {
        return false;
    }

    isIsolated() {
        return false;
    }

    isKeyboardSelectable() {
        return true;
    }
}

module.exports = CivicActionNodeStub;
