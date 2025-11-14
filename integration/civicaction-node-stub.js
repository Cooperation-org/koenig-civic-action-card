// Minimal server-side stub for CivicActionNode
// This allows Ghost's lexical renderer to recognize 'civicaction' type
// The actual HTML rendering is handled by civicaction-renderer.js

class CivicActionNodeStub {
    static getType() {
        return 'civicaction';
    }

    static clone() {
        return new CivicActionNodeStub();
    }
}

module.exports = CivicActionNodeStub;
