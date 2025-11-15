/**
 * Client-side renderer for Civic Action cards
 *
 * This script runs in the browser on published Ghost pages.
 * It finds server-rendered civic action cards (via data-civic-action attributes)
 * and replaces them with the full interactive React component.
 */

import React from 'react';
import {createRoot} from 'react-dom/client';
import {CivicActionCard} from '../src/CivicActionCard.jsx';

/**
 * Render civic action cards
 */
function renderCivicActions() {
    // Find all server-rendered civic action cards
    const cards = document.querySelectorAll('figure[data-civic-action]');

    if (cards.length === 0) {
        console.log('[Civic Actions] No civic action cards found on page');
        return;
    }

    console.log(`[Civic Actions] Hydrating ${cards.length} civic action card(s)`);

    cards.forEach((card) => {
        try {
            // Parse the data from the data attribute (decode HTML entities first)
            const dataAttr = card.getAttribute('data-civic-action');
            const decodedData = dataAttr.replace(/&quot;/g, '"');
            const data = JSON.parse(decodedData);

            // Create a container to replace the server-rendered card
            const container = document.createElement('div');
            container.className = 'civic-action-card-container';

            // Replace the server-rendered card with our container
            card.parentNode.replaceChild(container, card);

            // Render the React component
            const root = createRoot(container);
            root.render(
                <CivicActionCard
                    actionId={data.actionId}
                    title={data.title}
                    description={data.description}
                    eventType={data.eventType}
                    eventDate={data.eventDate}
                    location={data.location}
                    imageUrl={data.imageUrl}
                    takeActionUrl={data.takeActionUrl}
                    source={data.source}
                    isEditor={false}
                />
            );
        } catch (e) {
            console.error('[Civic Actions] Failed to parse card data:', e);
        }
    });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderCivicActions);
} else {
    renderCivicActions();
}
