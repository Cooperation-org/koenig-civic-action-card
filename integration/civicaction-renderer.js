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
        takeActionUrl,
        externalUrl,
        zipcode,
        isVirtual,
        sourceMeta
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
        externalUrl: node.externalUrl,
        zipcode: node.zipcode,
        isVirtual: node.isVirtual,
        sourceMeta: node.sourceMeta,
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

    // Add title (as link to externalUrl if available)
    if (title) {
        if (externalUrl) {
            const titleLink = document.createElement('a');
            titleLink.setAttribute('href', externalUrl);
            titleLink.setAttribute('class', 'preview-title-link');
            titleLink.setAttribute('target', '_blank');
            titleLink.setAttribute('rel', 'noopener noreferrer');
            
            const titleEl = document.createElement('h3');
            titleEl.setAttribute('class', 'preview-title');
            titleEl.textContent = title;
            
            titleLink.appendChild(titleEl);
            content.appendChild(titleLink);
        } else {
            const titleEl = document.createElement('h3');
            titleEl.setAttribute('class', 'preview-title');
            titleEl.textContent = title;
            content.appendChild(titleEl);
        }
    }

    // Add description (truncated to 100 words with paragraphs)
    if (description) {
        const descDiv = document.createElement('div');
        descDiv.setAttribute('class', 'preview-description');
        
        // Truncate to 100 words
        const words = description.split(/\s+/);
        const maxWords = 100;
        const truncated = words.length > maxWords 
            ? words.slice(0, maxWords).join(' ') + '...'
            : description;
        
        // Split by newlines and create paragraphs
        const paragraphs = truncated.split('\n').filter(p => p.trim());
        if (paragraphs.length === 0) {
            const p = document.createElement('p');
            p.textContent = truncated;
            descDiv.appendChild(p);
        } else {
            paragraphs.forEach(para => {
                const p = document.createElement('p');
                p.textContent = para;
                descDiv.appendChild(p);
            });
        }
        
        content.appendChild(descDiv);
    }

    // Add sponsor info if available
    if (sourceMeta && sourceMeta.sponsor) {
        const sponsorDiv = document.createElement('div');
        sponsorDiv.setAttribute('class', 'preview-sponsor');

        if (sourceMeta.sponsor.logo_url) {
            const logoImg = document.createElement('img');
            logoImg.setAttribute('src', sourceMeta.sponsor.logo_url);
            logoImg.setAttribute('alt', sourceMeta.sponsor.name);
            logoImg.setAttribute('class', 'sponsor-logo');
            sponsorDiv.appendChild(logoImg);
        }

        const sponsorInfo = document.createElement('div');
        sponsorInfo.setAttribute('class', 'sponsor-info');

        const sponsorLabel = document.createElement('span');
        sponsorLabel.setAttribute('class', 'sponsor-label');
        sponsorLabel.textContent = 'Organized by';
        sponsorInfo.appendChild(sponsorLabel);

        const sponsorName = document.createElement('span');
        sponsorName.setAttribute('class', 'sponsor-name');
        sponsorName.textContent = sourceMeta.sponsor.name;
        sponsorInfo.appendChild(sponsorName);

        sponsorDiv.appendChild(sponsorInfo);
        content.appendChild(sponsorDiv);
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
            const dateStr = eventDateObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            const timeStr = eventDateObj.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            dateText.textContent = `${dateStr} at ${timeStr}`;
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
            locationText.textContent = location + (zipcode ? ` ${zipcode}` : '');
            locationDetail.appendChild(locationText);
            details.appendChild(locationDetail);
        }

        if (isVirtual) {
            const virtualDetail = document.createElement('div');
            virtualDetail.setAttribute('class', 'preview-detail');
            const iconSpan = document.createElement('span');
            iconSpan.textContent = '💻 ';
            virtualDetail.appendChild(iconSpan);
            const virtualText = document.createElement('span');
            virtualText.setAttribute('class', 'virtual-badge');
            virtualText.textContent = 'Virtual Event';
            virtualDetail.appendChild(virtualText);
            details.appendChild(virtualDetail);
        }

        content.appendChild(details);
    }

    // Add action section
    const actionsSection = document.createElement('div');
    actionsSection.setAttribute('class', 'preview-actions-section');

    // Add Take Action button if URL is present and not expired
    if (takeActionUrl && !isExpired) {
        const actionsDiv = document.createElement('div');
        actionsDiv.setAttribute('class', 'preview-actions');

        const link = document.createElement('a');
        link.setAttribute('href', takeActionUrl);
        link.setAttribute('class', 'preview-button primary');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = 'Take Action';

        actionsDiv.appendChild(link);
        actionsSection.appendChild(actionsDiv);
    }

    // Add footer with checkbox and links
    const footer = document.createElement('div');
    footer.setAttribute('class', 'preview-footer');

    // Checkbox
    const checkboxLabel = document.createElement('label');
    checkboxLabel.setAttribute('class', 'preview-checkbox-label');

    const checkbox = document.createElement('input');
    checkbox.setAttribute('type', 'checkbox');
    checkbox.setAttribute('class', 'preview-checkbox');
    checkbox.setAttribute('data-action-id', node.actionId || '');
    checkbox.setAttribute('data-civic-action-complete', 'true');

    const checkboxText = document.createElement('span');
    checkboxText.setAttribute('class', 'checkbox-text');
    checkboxText.textContent = 'Did this!';

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(checkboxText);
    footer.appendChild(checkboxLabel);

    // Links container
    const linksDiv = document.createElement('div');
    linksDiv.setAttribute('class', 'preview-links');

    // External source link
    if (externalUrl) {
        const sourceLink = document.createElement('a');
        sourceLink.setAttribute('href', externalUrl);
        sourceLink.setAttribute('class', 'preview-link source-link');
        sourceLink.setAttribute('target', '_blank');
        sourceLink.setAttribute('rel', 'noopener noreferrer');
        sourceLink.textContent = 'Original ↗';
        linksDiv.appendChild(sourceLink);
    }

    // Dashboard link
    const dashboardLink = document.createElement('a');
    dashboardLink.setAttribute('href', 'https://bridge.linkedtrust.us/bridge/dashboard');
    dashboardLink.setAttribute('class', 'preview-link dashboard-link');
    dashboardLink.setAttribute('target', '_blank');
    dashboardLink.setAttribute('rel', 'noopener noreferrer');
    dashboardLink.textContent = 'Your Impact Dashboard →';
    linksDiv.appendChild(dashboardLink);

    footer.appendChild(linksDiv);
    actionsSection.appendChild(footer);
    content.appendChild(actionsSection);

    // Add View Details button for expired events
    if (takeActionUrl && isExpired) {
        const expiredActions = document.createElement('div');
        expiredActions.setAttribute('class', 'preview-actions');

        const link = document.createElement('a');
        link.setAttribute('href', takeActionUrl);
        link.setAttribute('class', 'preview-button secondary');
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.textContent = 'View Details';

        expiredActions.appendChild(link);
        content.appendChild(expiredActions);
    }

    figure.appendChild(content);

    // Add inline script for checkbox functionality
    const script = document.createElement('script');
    script.textContent = `
(function(){
const BRIDGE_URL='https://bridge.linkedtrust.us';
function initCivicActionCards(){
const checkboxes=document.querySelectorAll('[data-civic-action-complete="true"]');
checkboxes.forEach(checkbox=>{
const actionId=checkbox.getAttribute('data-action-id');
if(!actionId)return;
const storageKey='civic-action-'+actionId;
const isCompleted=localStorage.getItem(storageKey)==='true';
checkbox.checked=isCompleted;
checkbox.addEventListener('change',async function(e){
const isChecked=e.target.checked;
localStorage.setItem(storageKey,isChecked.toString());
if(isChecked&&actionId){
try{
const response=await fetch(BRIDGE_URL+'/api/public/civic-actions/'+actionId+'/complete',{
method:'POST',
headers:{'Content-Type':'application/json'},
credentials:'include'
});
if(!response.ok){console.warn('Failed to record civic action completion');}
}catch(err){console.warn('Error recording civic action:',err);}
}
});
});
}
if(document.readyState==='loading'){
document.addEventListener('DOMContentLoaded',initCivicActionCards);
}else{
initCivicActionCards();
}
})();
`;
    figure.appendChild(script);

    return {element: figure};
}

module.exports = renderCivicActionNode;
