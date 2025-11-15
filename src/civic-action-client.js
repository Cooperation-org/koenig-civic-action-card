/**
 * Lightweight client-side script for civic action cards
 * Handles checkbox interactions for server-rendered HTML
 */

(function() {
    'use strict';

    const BRIDGE_URL = 'https://bridge.linkedtrust.us';

    function initCivicActionCards() {
        const checkboxes = document.querySelectorAll('[data-civic-action-complete="true"]');

        checkboxes.forEach(checkbox => {
            const actionId = checkbox.getAttribute('data-action-id');

            if (!actionId) return;

            // Load saved state from localStorage
            const storageKey = `civic-action-${actionId}`;
            const isCompleted = localStorage.getItem(storageKey) === 'true';
            checkbox.checked = isCompleted;

            // Handle checkbox change
            checkbox.addEventListener('change', async function(e) {
                const isChecked = e.target.checked;

                // Save to localStorage immediately
                localStorage.setItem(storageKey, isChecked.toString());

                // If checked, record to bridge
                if (isChecked && actionId) {
                    try {
                        const response = await fetch(`${BRIDGE_URL}/api/public/civic-actions/${actionId}/complete`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });

                        if (!response.ok) {
                            console.warn('Failed to record civic action completion');
                        }
                    } catch (err) {
                        console.warn('Error recording civic action:', err);
                    }
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCivicActionCards);
    } else {
        initCivicActionCards();
    }
})();
