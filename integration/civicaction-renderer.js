// Server-side renderer for Civic Action card
// This file should be copied to Ghost's node-renderers directory

const {addCreateDocumentOption} = require('../render-utils/add-create-document-option');
const {renderEmptyContainer} = require('../render-utils/render-empty-container');

function renderCivicActionNode(node, options = {}) {
    addCreateDocumentOption(options);
    const document = options.createDocument();

    const {
        title,
        description,
        eventType,
        eventDate,
        location,
        imageUrl,
        takeActionUrl
    } = node;

    // Don't render if no content
    if (!title && !description) {
        return renderEmptyContainer(document);
    }

    // Check if event is expired
    let isExpired = false;
    let eventDateObj = null;
    if (eventDate) {
        try {
            eventDateObj = new Date(eventDate);
            isExpired = eventDateObj < new Date();
        } catch (e) {
            // Invalid date, ignore
        }
    }

    // Create main container
    const figure = document.createElement('figure');
    figure.setAttribute('class', `kg-card civic-action-preview-card ${isExpired ? 'expired' : ''} reader-mode`);

    // Store node data for client-side hydration
    figure.setAttribute('data-civic-action', JSON.stringify({
        actionId: node.actionId,
        title: node.title,
        description: node.description,
        eventType: node.eventType,
        eventDate: node.eventDate,
        location: node.location,
        imageUrl: node.imageUrl,
        takeActionUrl: node.takeActionUrl,
        source: node.source
    }));

    // Add image if present
    if (imageUrl) {
        const imageDiv = document.createElement('div');
        imageDiv.setAttribute('class', 'preview-image');

        const img = document.createElement('img');
        img.setAttribute('src', imageUrl);
        img.setAttribute('alt', title || 'Civic action');
        img.setAttribute('loading', 'lazy');
        imageDiv.appendChild(img);

        if (isExpired) {
            const overlay = document.createElement('div');
            overlay.setAttribute('class', 'preview-overlay');
            const badge = document.createElement('span');
            badge.setAttribute('class', 'preview-overlay-badge');
            badge.textContent = 'Past Event';
            overlay.appendChild(badge);
            imageDiv.appendChild(overlay);
        }

        figure.appendChild(imageDiv);
    }

    // Create content container
    const content = document.createElement('div');
    content.setAttribute('class', 'preview-content');

    // Add event type badge
    if (eventType) {
        const header = document.createElement('div');
        header.setAttribute('class', 'preview-header');
        const badge = document.createElement('span');
        const badgeClass = `preview-badge type-${eventType.toLowerCase().replace(/\s+/g, '-')}`;
        badge.setAttribute('class', badgeClass);
        badge.textContent = eventType;
        header.appendChild(badge);
        content.appendChild(header);
    }

    // Add title
    if (title) {
        const titleEl = document.createElement('h3');
        titleEl.setAttribute('class', 'preview-title');
        titleEl.textContent = title;
        content.appendChild(titleEl);
    }

    // Add description
    if (description) {
        const descEl = document.createElement('p');
        descEl.setAttribute('class', 'preview-description');
        descEl.textContent = description;
        content.appendChild(descEl);
    }

    // Add event details (date and location)
    if (eventDateObj || location) {
        const details = document.createElement('div');
        details.setAttribute('class', 'preview-details');

        if (eventDateObj) {
            const dateDetail = document.createElement('div');
            dateDetail.setAttribute('class', 'preview-detail');

            // Calendar icon - use text placeholder instead of SVG for server-side
            const iconSpan = document.createElement('span');
            iconSpan.textContent = '📅 ';
            dateDetail.appendChild(iconSpan);

            const dateText = document.createElement('span');
            dateText.textContent = eventDateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            dateDetail.appendChild(dateText);
            details.appendChild(dateDetail);
        }

        if (location) {
            const locationDetail = document.createElement('div');
            locationDetail.setAttribute('class', 'preview-detail');

            // Location icon - use text placeholder instead of SVG for server-side
            const iconSpan = document.createElement('span');
            iconSpan.textContent = '📍 ';
            locationDetail.appendChild(iconSpan);

            const locationText = document.createElement('span');
            locationText.textContent = location;
            locationDetail.appendChild(locationText);
            details.appendChild(locationDetail);
        }

        content.appendChild(details);
    }

    // Add action button if URL is present
    if (takeActionUrl) {
        const footer = document.createElement('div');
        footer.setAttribute('class', 'preview-footer');

        const link = document.createElement('a');
        link.setAttribute('href', takeActionUrl);
        link.setAttribute('class', isExpired ? 'preview-button secondary' : 'preview-button primary');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = isExpired ? 'View Details' : 'Take Action';

        footer.appendChild(link);
        content.appendChild(footer);
    }

    figure.appendChild(content);

    return {element: figure};
}

module.exports = renderCivicActionNode;
