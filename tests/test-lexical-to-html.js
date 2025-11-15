#!/usr/bin/env node

/**
 * LOCAL TEST: Reproduce the problem - lexical JSON exists but HTML not generated
 */

// Set required environment variable
process.env.NODE_ENV = 'production';

// The actual lexical data from fresh-test post in database
const lexicalFromDB = {
    "root": {
        "children": [
            {
                "children": [
                    {
                        "detail": 0,
                        "format": 0,
                        "mode": "normal",
                        "style": "",
                        "text": "things",
                        "type": "extended-text",
                        "version": 1
                    }
                ],
                "direction": "ltr",
                "format": "",
                "indent": 0,
                "type": "paragraph",
                "version": 1
            },
            {
                "type": "civicaction",
                "actionId": "cmhshvtpx0008qpgg384pi5hp",
                "title": "CD1 Protest at Schweikert's Office",
                "description": "- Bring non-perishable food donations for the St. Mary's Food Bank\n- RSVP required\n- Free parking available",
                "eventType": "RALLY",
                "eventDate": "2025-11-17T15:00:00.000Z",
                "location": "14500 N Northsight Blvd, Scottsdale, AZ",
                "imageUrl": "https://example.com/placeholder.jpg",
                "takeActionUrl": "https://www.mobilize.us/arizonaforall/event/123456/",
                "source": "mobilize",
                "version": 1
            }
        ],
        "direction": "ltr",
        "format": "",
        "indent": 0,
        "type": "root",
        "version": 1
    }
};

async function testRender() {
    console.log('📄 Testing lexical-to-HTML conversion\n');
    console.log('Input lexical JSON has civic action:', JSON.stringify(lexicalFromDB).includes('civicaction') ? '✅ YES' : '❌ NO');

    // Now try to render it like Ghost does
    try {
        // Load Ghost's lexical renderer
        const lexicalLib = require('/var/www/gv/ghost-civic/versions/6.8.0/core/server/lib/lexical');

        console.log('\n🔧 Loaded Ghost lexical library');
        console.log('Available functions:', Object.keys(lexicalLib));

        if (lexicalLib.render) {
            console.log('\n🎨 Calling lexicalLib.render()...');

            const html = await lexicalLib.render(JSON.stringify(lexicalFromDB), {
                target: 'html'
            });

            console.log('\n✅ HTML Generated:');
            console.log(html);
            console.log('\n📊 Analysis:');
            console.log('- Length:', html.length, 'characters');
            console.log('- Has data-civic-action:', html.includes('data-civic-action') ? '✅ YES' : '❌ NO');
            console.log('- Has figure tag:', html.includes('<figure') ? '✅ YES' : '❌ NO');
            console.log('- Has civicaction class:', html.includes('civicaction') ? '✅ YES' : '❌ NO');

            if (html.includes('data-civic-action')) {
                console.log('\n🎉 SUCCESS - HTML generation works! Renderer is being called.');
            } else {
                console.log('\n❌ PROBLEM REPRODUCED - HTML generated but NO civic action card');
                console.log('This is the exact problem: lexical has civicaction, but HTML doesn\'t');
            }
        } else {
            console.log('❌ No render function found');
        }

    } catch (e) {
        console.error('\n❌ Error:', e.message);
        console.error(e.stack);
    }
}

testRender();
