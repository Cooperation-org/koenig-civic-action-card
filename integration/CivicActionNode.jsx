import React from 'react';
import {CivicActionNode as BaseCivicActionNode} from '@linked-claims/koenig-civic-action-card';
import {CivicActionCard} from '@linked-claims/koenig-civic-action-card';
import {KoenigCardWrapper} from '../index.js';
import {createCommand} from 'lexical';

export const INSERT_CIVIC_ACTION_COMMAND = createCommand();

// Temporarily use a simple icon instead of SVG import
const CivicActionIcon = () => {
    console.log('[CIVIC] CivicActionIcon component called');
    return <div>🏛️</div>;
};

console.log('[CIVIC] CivicActionIcon defined:', CivicActionIcon);
console.log('[CIVIC] CivicActionIcon typeof:', typeof CivicActionIcon);

export class CivicActionNode extends BaseCivicActionNode {
    static kgMenu = [{
        label: 'Civic Action',
        desc: 'Embed a civic action',
        Icon: CivicActionIcon,
        insertCommand: INSERT_CIVIC_ACTION_COMMAND,
        matches: ['civic', 'action'],
        priority: 5
    }];

    constructor(dataset) {
        console.log('[CIVIC] CivicActionNode constructor called');
        super(dataset);
    }

    static getType() {
        console.log('[CIVIC] getType called');
        console.log('[CIVIC] kgMenu:', CivicActionNode.kgMenu);
        console.log('[CIVIC] Icon:', CivicActionNode.kgMenu[0].Icon);
        console.log('[CIVIC] Icon typeof:', typeof CivicActionNode.kgMenu[0].Icon);
        return super.getType();
    }

    decorate() {
        console.log('[CIVIC] decorate called');
        return (
            <KoenigCardWrapper nodeKey={this.getKey()}>
                <CivicActionCard {...this.getDataset()} />
            </KoenigCardWrapper>
        );
    }
}

console.log('[CIVIC] CivicActionNode class defined');
console.log('[CIVIC] CivicActionNode.kgMenu after definition:', CivicActionNode.kgMenu);
console.log('[CIVIC] CivicActionNode.kgMenu[0].Icon after definition:', CivicActionNode.kgMenu[0].Icon);

export const $createCivicActionNode = (dataset) => {
    console.log('[CIVIC] $createCivicActionNode called');
    return new CivicActionNode(dataset);
};

export function $isCivicActionNode(node) {
    return node instanceof CivicActionNode;
}

console.log('[CIVIC] All exports defined');
console.log('[CIVIC] Exports - $createCivicActionNode:', $createCivicActionNode);
console.log('[CIVIC] Exports - $isCivicActionNode:', $isCivicActionNode);
console.log('[CIVIC] Exports - CivicActionNode:', CivicActionNode);
console.log('[CIVIC] Exports - INSERT_CIVIC_ACTION_COMMAND:', INSERT_CIVIC_ACTION_COMMAND);
