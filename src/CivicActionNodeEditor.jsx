import React from 'react';
import {CivicActionNode as BaseCivicActionNode} from './CivicActionNode';
import {CivicActionCard} from './CivicActionCard';
import {createCommand} from 'lexical';
import {$getNodeByKey} from 'lexical';

// Import icon - you'll need to provide this SVG
import CivicActionIcon from './icon.svg';

export const INSERT_CIVIC_ACTION_COMMAND = createCommand();

export class CivicActionNodeEditor extends BaseCivicActionNode {
    static kgMenu = [{
        label: 'Civic Action',
        desc: 'Embed a civic action event or initiative',
        Icon: CivicActionIcon,
        insertCommand: INSERT_CIVIC_ACTION_COMMAND,
        matches: ['civic', 'action', 'event', 'volunteer'],
        priority: 5
    }];

    getIcon() {
        return CivicActionIcon;
    }

    decorate() {
        return (
            <CivicActionCardWrapper
                nodeKey={this.getKey()}
                actionId={this.actionId}
                source={this.source}
                title={this.title}
                description={this.description}
                eventType={this.eventType}
                eventDate={this.eventDate}
                location={this.location}
                imageUrl={this.imageUrl}
                takeActionUrl={this.takeActionUrl}
            />
        );
    }
}

function CivicActionCardWrapper({nodeKey, ...props}) {
    const [editor] = useLexicalComposerContext();
    const [isSelected, setIsSelected] = React.useState(false);
    const [cardConfig, setCardConfig] = React.useState({});

    // Get config from context if available
    React.useEffect(() => {
        // Try to get config from KoenigComposerContext
        // This will be available when integrated into Ghost
        try {
            const config = window.__KOENIG_CARD_CONFIG__ || {};
            setCardConfig(config);
        } catch (e) {
            // Use defaults
        }
    }, []);

    const handleUpdate = React.useCallback((updates) => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if (node) {
                Object.keys(updates).forEach(key => {
                    node[key] = updates[key];
                });
            }
        });
    }, [editor, nodeKey]);

    // Get bridge URL from multiple sources (priority order)
    const bridgeUrl = 
        cardConfig.civicBridgeUrl ||
        (typeof window !== 'undefined' && window.__GHOST_CONFIG__?.civicBridgeUrl) ||
        (typeof process !== 'undefined' && process.env.CIVIC_BRIDGE_URL) ||
        'http://127.0.0.1:5000';

    return (
        <CivicActionCard
            {...props}
            isSelected={isSelected}
            bridgeUrl={bridgeUrl}
            onUpdate={handleUpdate}
        />
    );
}

// Helper hook import
function useLexicalComposerContext() {
    // This will be provided by @lexical/react when integrated
    const context = React.useContext(window.__LEXICAL_COMPOSER_CONTEXT__);
    return [context?.getEditor?.() || null];
}

export const $createCivicActionNode = (dataset) => {
    return new CivicActionNodeEditor(dataset);
};

export function $isCivicActionNode(node) {
    return node instanceof CivicActionNodeEditor;
}
