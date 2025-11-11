console.log('[CIVIC] CivicActionNode.jsx is loading...');

import React from 'react';
import {CivicActionCard} from '@linked-claims/koenig-civic-action-card';
import {KoenigCardWrapper} from '../index.js';
import {DecoratorNode, $getNodeByKey} from 'lexical';
import {createCommand} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';

console.log('[CIVIC] CivicActionCard imported:', CivicActionCard);

export const INSERT_CIVIC_ACTION_COMMAND = createCommand();

console.log('[CIVIC] INSERT_CIVIC_ACTION_COMMAND created:', INSERT_CIVIC_ACTION_COMMAND);

const CivicActionIcon = () => {
    return <div>🏛️</div>;
};

export class CivicActionNode extends DecoratorNode {
    __actionId;
    __title;
    __description;
    __eventType;
    __eventDate;
    __location;
    __imageUrl;
    __takeActionUrl;
    __source;

    static kgMenu = [{
        label: 'Civic Action v6',
        desc: 'Embed a civic action',
        Icon: CivicActionIcon,
        insertCommand: INSERT_CIVIC_ACTION_COMMAND,
        matches: ['civic', 'action'],
        priority: 5
    }];

    static getType() {
        return 'civicaction';
    }

    static clone(node) {
        return new CivicActionNode(node.getDataset(), node.__key);
    }

    constructor(dataset = {}, key) {
        console.log('[CIVIC] CivicActionNode constructor called with dataset:', dataset, 'key:', key);
        try {
            console.log('[CIVIC] About to call super(key)...');
            super(key);
            console.log('[CIVIC] super(key) succeeded');
            this.__actionId = dataset.actionId || '';
            this.__title = dataset.title || '';
            this.__description = dataset.description || '';
            this.__eventType = dataset.eventType || '';
            this.__eventDate = dataset.eventDate || '';
            this.__location = dataset.location || '';
            this.__imageUrl = dataset.imageUrl || '';
            this.__takeActionUrl = dataset.takeActionUrl || '';
            this.__source = dataset.source || 'community';
            console.log('[CIVIC] CivicActionNode constructed, actionId:', this.__actionId);
        } catch (error) {
            console.error('[CIVIC] Constructor error:', error);
            throw error;
        }
    }

    getDataset() {
        return {
            actionId: this.__actionId,
            title: this.__title,
            description: this.__description,
            eventType: this.__eventType,
            eventDate: this.__eventDate,
            location: this.__location,
            imageUrl: this.__imageUrl,
            takeActionUrl: this.__takeActionUrl,
            source: this.__source
        };
    }

    createDOM() {
        return document.createElement('div');
    }

    decorate() {
        const bridgeUrl = typeof window !== 'undefined' && window.__GHOST_CONFIG__?.civicBridgeUrl
            || typeof process !== 'undefined' && process.env.CIVIC_BRIDGE_URL
            || 'https://bridge.linkedtrust.us';

        console.log('[CIVIC] Bridge URL:', bridgeUrl);
        console.log('[CIVIC] window.__GHOST_CONFIG__:', window.__GHOST_CONFIG__);
        console.log('[CIVIC] decorate() called with key:', this.getKey());

        const nodeKey = this.getKey();
        const dataset = this.getDataset();

        const CivicActionCardWrapper = () => {
            const [editor] = useLexicalComposerContext();

            const handleUpdate = (updates) => {
                editor.update(() => {
                    const node = $getNodeByKey(nodeKey);
                    if (node) {
                        const writable = node.getWritable();
                        Object.assign(writable, {
                            __actionId: updates.actionId,
                            __title: updates.title,
                            __description: updates.description,
                            __eventType: updates.eventType,
                            __eventDate: updates.eventDate,
                            __location: updates.location,
                            __imageUrl: updates.imageUrl,
                            __takeActionUrl: updates.takeActionUrl,
                            __source: updates.source
                        });
                    }
                });
            };

            return (
                <CivicActionCard
                    {...dataset}
                    bridgeUrl={bridgeUrl}
                    onUpdate={handleUpdate}
                />
            );
        };

        return (
            <KoenigCardWrapper nodeKey={nodeKey}>
                <CivicActionCardWrapper />
            </KoenigCardWrapper>
        );
    }

    exportJSON() {
        return {
            type: 'civicaction',
            version: 1,
            ...this.getDataset()
        };
    }

    static importJSON(serializedNode) {
        return $createCivicActionNode(serializedNode);
    }
}

export const $createCivicActionNode = (dataset) => {
    return new CivicActionNode(dataset);
};

export function $isCivicActionNode(node) {
    return node instanceof CivicActionNode;
}
