// HTML renderer for CivicActionCard - used when publishing articles
export function renderCivicActionCard(node, options = {}) {
    const document = options.createDocument ? options.createDocument() : global.document;

    const {
        actionId,
        title,
        description,
        eventType,
        eventDate,
        location,
        imageUrl,
        takeActionUrl,
        source
    } = node;

    // Don't render if no content
    if (!title && !description) {
        const emptyDiv = document.createElement('div');
        return {element: emptyDiv};
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
    const container = document.createElement('figure');
    container.setAttribute('class', `kg-card civic-action-preview-card ${isExpired ? 'expired' : ''} reader-mode`);

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

        container.appendChild(imageDiv);
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

            // Calendar icon SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('fill', 'none');

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '2');
            rect.setAttribute('y', '3');
            rect.setAttribute('width', '12');
            rect.setAttribute('height', '10');
            rect.setAttribute('rx', '1');
            rect.setAttribute('stroke', 'currentColor');
            rect.setAttribute('stroke-width', '1.5');
            svg.appendChild(rect);

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M2 6H14');
            path1.setAttribute('stroke', 'currentColor');
            path1.setAttribute('stroke-width', '1.5');
            svg.appendChild(path1);

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M5 1V4');
            path2.setAttribute('stroke', 'currentColor');
            path2.setAttribute('stroke-width', '1.5');
            path2.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path2);

            const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttribute('d', 'M11 1V4');
            path3.setAttribute('stroke', 'currentColor');
            path3.setAttribute('stroke-width', '1.5');
            path3.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path3);

            dateDetail.appendChild(svg);

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

            // Location icon SVG
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('fill', 'none');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M8 8a2 2 0 100-4 2 2 0 000 4zM8 1a5 5 0 00-5 5c0 3 5 9 5 9s5-6 5-9a5 5 0 00-5-5z');
            path.setAttribute('stroke', 'currentColor');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(path);

            locationDetail.appendChild(svg);

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

    container.appendChild(content);

    return {element: container};
}
