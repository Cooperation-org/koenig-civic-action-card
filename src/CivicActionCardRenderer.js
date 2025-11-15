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
        externalUrl,
        zipcode,
        isVirtual,
        sourceMeta,
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

    // Add description (truncated to 200 words with paragraphs)
    if (description) {
        const descDiv = document.createElement('div');
        descDiv.setAttribute('class', 'preview-description');
        
        const words = description.split(/\s+/);
        const maxWords = 200;
        const truncated = words.length > maxWords 
            ? words.slice(0, maxWords).join(' ') + '...'
            : description;
        
        // Split by newlines and create paragraphs
        const paragraphs = truncated.split('\n').filter(p => p.trim());
        paragraphs.forEach(para => {
            const p = document.createElement('p');
            p.textContent = para;
            descDiv.appendChild(p);
        });
        
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
            locationText.textContent = location + (zipcode ? ` ${zipcode}` : '');
            locationDetail.appendChild(locationText);
            details.appendChild(locationDetail);
        }

        if (isVirtual) {
            const virtualDetail = document.createElement('div');
            virtualDetail.setAttribute('class', 'preview-detail');

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '16');
            svg.setAttribute('height', '16');
            svg.setAttribute('viewBox', '0 0 16 16');
            svg.setAttribute('fill', 'none');

            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '1');
            rect.setAttribute('y', '3');
            rect.setAttribute('width', '14');
            rect.setAttribute('height', '10');
            rect.setAttribute('rx', '1');
            rect.setAttribute('stroke', 'currentColor');
            rect.setAttribute('stroke-width', '1.5');
            svg.appendChild(rect);

            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('d', 'M5 13L7 10');
            path1.setAttribute('stroke', 'currentColor');
            path1.setAttribute('stroke-width', '1.5');
            path1.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path1);

            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('d', 'M11 13L9 10');
            path2.setAttribute('stroke', 'currentColor');
            path2.setAttribute('stroke-width', '1.5');
            path2.setAttribute('stroke-linecap', 'round');
            svg.appendChild(path2);

            const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path3.setAttribute('d', 'M1 10H15');
            path3.setAttribute('stroke', 'currentColor');
            path3.setAttribute('stroke-width', '1.5');
            svg.appendChild(path3);

            virtualDetail.appendChild(svg);

            const virtualText = document.createElement('span');
            virtualText.setAttribute('class', 'virtual-badge');
            virtualText.textContent = 'Virtual Event';
            virtualDetail.appendChild(virtualText);
            details.appendChild(virtualDetail);
        }

        content.appendChild(details);
    }

    // Add actions section
    const actionsSection = document.createElement('div');
    actionsSection.setAttribute('class', 'preview-actions-section');

    // Add Take Action button if URL is present and not expired
    if (takeActionUrl && !isExpired) {
        const actionsDiv = document.createElement('div');
        actionsDiv.setAttribute('class', 'preview-actions');

        const actionLink = document.createElement('a');
        actionLink.setAttribute('href', takeActionUrl);
        actionLink.setAttribute('class', 'preview-button primary');
        actionLink.setAttribute('target', '_blank');
        actionLink.setAttribute('rel', 'noopener noreferrer');
        actionLink.textContent = 'Take Action';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '16');
        svg.setAttribute('height', '16');
        svg.setAttribute('viewBox', '0 0 16 16');
        svg.setAttribute('fill', 'none');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M6 3L11 8L6 13');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        svg.appendChild(path);
        actionLink.appendChild(svg);

        actionsDiv.appendChild(actionLink);
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
    checkbox.setAttribute('data-action-id', actionId || '');
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

    // Source link
    if (externalUrl) {
        const sourceLink = document.createElement('a');
        sourceLink.setAttribute('href', externalUrl);
        sourceLink.setAttribute('class', 'preview-link source-link');
        sourceLink.setAttribute('target', '_blank');
        sourceLink.setAttribute('rel', 'noopener noreferrer');
        sourceLink.textContent = 'Original';

        const sourceSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        sourceSvg.setAttribute('width', '12');
        sourceSvg.setAttribute('height', '12');
        sourceSvg.setAttribute('viewBox', '0 0 12 12');
        sourceSvg.setAttribute('fill', 'none');

        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p1.setAttribute('d', 'M10 6.5V10.5H1.5V2H5.5');
        p1.setAttribute('stroke', 'currentColor');
        p1.setAttribute('stroke-width', '1.2');
        p1.setAttribute('stroke-linecap', 'round');
        sourceSvg.appendChild(p1);

        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p2.setAttribute('d', 'M7 1.5H10.5V5');
        p2.setAttribute('stroke', 'currentColor');
        p2.setAttribute('stroke-width', '1.2');
        p2.setAttribute('stroke-linecap', 'round');
        p2.setAttribute('stroke-linejoin', 'round');
        sourceSvg.appendChild(p2);

        const p3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p3.setAttribute('d', 'M5.5 6.5L10.5 1.5');
        p3.setAttribute('stroke', 'currentColor');
        p3.setAttribute('stroke-width', '1.2');
        p3.setAttribute('stroke-linecap', 'round');
        sourceSvg.appendChild(p3);

        sourceLink.appendChild(sourceSvg);
        linksDiv.appendChild(sourceLink);
    }

    // Dashboard link
    const dashboardLink = document.createElement('a');
    dashboardLink.setAttribute('href', 'https://bridge.linkedtrust.us');
    dashboardLink.setAttribute('class', 'preview-link dashboard-link');
    dashboardLink.setAttribute('target', '_blank');
    dashboardLink.setAttribute('rel', 'noopener noreferrer');
    dashboardLink.textContent = 'Your Impact Dashboard';

    const dashSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    dashSvg.setAttribute('width', '12');
    dashSvg.setAttribute('height', '12');
    dashSvg.setAttribute('viewBox', '0 0 12 12');
    dashSvg.setAttribute('fill', 'none');
    const dashPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    dashPath.setAttribute('d', 'M4.5 2.25L8.25 6L4.5 9.75');
    dashPath.setAttribute('stroke', 'currentColor');
    dashPath.setAttribute('stroke-width', '1.2');
    dashPath.setAttribute('stroke-linecap', 'round');
    dashPath.setAttribute('stroke-linejoin', 'round');
    dashSvg.appendChild(dashPath);
    dashboardLink.appendChild(dashSvg);
    linksDiv.appendChild(dashboardLink);

    footer.appendChild(linksDiv);
    actionsSection.appendChild(footer);
    content.appendChild(actionsSection);

    // Add View Details button for expired events
    if (takeActionUrl && isExpired) {
        const expiredActions = document.createElement('div');
        expiredActions.setAttribute('class', 'preview-actions');

        const expiredLink = document.createElement('a');
        expiredLink.setAttribute('href', takeActionUrl);
        expiredLink.setAttribute('class', 'preview-button secondary');
        expiredLink.setAttribute('target', '_blank');
        expiredLink.setAttribute('rel', 'noopener noreferrer');
        expiredLink.textContent = 'View Details';

        expiredActions.appendChild(expiredLink);
        content.appendChild(expiredActions);
    }

    container.appendChild(content);

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
    container.appendChild(script);

    return {element: container};
}
