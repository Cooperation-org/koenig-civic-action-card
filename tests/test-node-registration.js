#!/usr/bin/env node

/**
 * LOCAL TEST: Check if civicaction node is registered in Lexical's nodes array
 */

process.env.NODE_ENV = 'production';

const lexicalLib = require('/var/www/gv/ghost-civic/versions/6.8.0/core/server/lib/lexical');

console.log('🔧 Checking node registration\n');

console.log('Nodes array length:', lexicalLib.nodes.length);
console.log('\nRegistered node types:');

lexicalLib.nodes.forEach((NodeClass, index) => {
    const type = NodeClass.getType ? NodeClass.getType() : 'unknown';
    const name = NodeClass.name;
    console.log(`  ${index}: ${type} (${name})`);
});

const hasCivic = lexicalLib.nodes.some(NodeClass => {
    try {
        return NodeClass.getType && NodeClass.getType() === 'civicaction';
    } catch (e) {
        return false;
    }
});

console.log('\n Has civicaction node:', hasCivic ? '✅ YES' : '❌ NO');

// Try to find the CivicActionNodeStub
const CivicNodeClass = lexicalLib.nodes.find(NodeClass => {
    try {
        return NodeClass.getType && NodeClass.getType() === 'civicaction';
    } catch (e) {
        return false;
    }
});

if (CivicNodeClass) {
    console.log('\n✅ Found CivicActionNode class');
    console.log('   Name:', CivicNodeClass.name);
    console.log('   Has importJSON:', typeof CivicNodeClass.importJSON);
    console.log('   Has clone:', typeof CivicNodeClass.clone);
    console.log('   Has getType:', typeof CivicNodeClass.getType);

    // Try creating an instance
    try {
        const instance = CivicNodeClass.importJSON({
            type: 'civicaction',
            title: 'Test',
            actionId: 'test123'
        });
        console.log('   ✅ importJSON works, created instance with title:', instance.title);
    } catch (e) {
        console.log('   ❌ importJSON error:', e.message);
    }
} else {
    console.log('\n❌ CivicActionNode NOT in nodes array!');
}
