import React from 'react';
import './CivicActionCard.css';

export function CivicActionCard({
    actionId,
    title,
    description,
    eventType,
    eventDate,
    location,
    imageUrl,
    takeActionUrl,
    source,
    isSelected,
    bridgeUrl,
    onUpdate
}) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // If no action selected, show search interface
    const showSearch = !actionId || !title;

    // Search civic actions
    const handleSearch = React.useCallback(async (term) => {
        setSearchTerm(term);
        if (!term || term.length < 2) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `${bridgeUrl}/api/civic-actions/search?q=${encodeURIComponent(term)}&limit=20`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const results = await response.json();
            setSearchResults(results);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search civic actions');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [bridgeUrl]);

    // Select an action from search results
    const handleSelectAction = React.useCallback((action) => {
        onUpdate({
            actionId: action.id,
            source: action.source || 'community',
            title: action.title,
            description: action.description,
            eventType: action.eventType,
            eventDate: action.eventDate,
            location: action.location,
            imageUrl: action.imageUrl,
            takeActionUrl: action.takeActionUrl
        });
        setSearchResults([]);
        setSearchTerm('');
    }, [onUpdate]);

    // Debounced search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (showSearch && searchTerm) {
                handleSearch(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, showSearch, handleSearch]);

    if (showSearch) {
        return (
            <div className={`civic-action-search-card ${isSelected ? 'selected' : ''}`}>
                <div className="civic-search-header">
                    <h4>Search Civic Actions</h4>
                    <p>Find and embed a civic action from your community</p>
                </div>

                <input
                    type="text"
                    className="civic-search-input"
                    placeholder="Search by title, description, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />

                {loading && (
                    <div className="civic-search-loading">Searching...</div>
                )}

                {error && (
                    <div className="civic-search-error">{error}</div>
                )}

                {searchResults.length > 0 && (
                    <div className="civic-search-results">
                        {searchResults.map(action => (
                            <div
                                key={action.id}
                                className="civic-search-result"
                                onClick={() => handleSelectAction(action)}
                            >
                                {action.imageUrl && (
                                    <img
                                        src={action.imageUrl}
                                        alt={action.title}
                                        className="result-image"
                                    />
                                )}
                                <div className="result-content">
                                    {action.eventType && (
                                        <span className={`result-badge type-${action.eventType}`}>
                                            {action.eventType}
                                        </span>
                                    )}
                                    <strong className="result-title">{action.title}</strong>
                                    <p className="result-description">{action.description}</p>
                                    <div className="result-meta">
                                        {action.eventDate && (
                                            <span>📅 {new Date(action.eventDate).toLocaleDateString()}</span>
                                        )}
                                        {action.location && (
                                            <span>📍 {action.location}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {searchTerm && !loading && searchResults.length === 0 && (
                    <div className="civic-search-empty">
                        No civic actions found. Try a different search term.
                    </div>
                )}
            </div>
        );
    }

    // Show preview of selected action
    const eventDateObj = eventDate ? new Date(eventDate) : null;
    const isExpired = eventDateObj && eventDateObj < new Date();

    return (
        <div className={`civic-action-preview-card ${isSelected ? 'selected' : ''} ${isExpired ? 'expired' : ''}`}>
            {imageUrl && (
                <div className="preview-image">
                    <img src={imageUrl} alt={title} />
                </div>
            )}

            <div className="preview-content">
                <div className="preview-meta">
                    {eventType && (
                        <span className={`preview-badge type-${eventType}`}>
                            {eventType}
                        </span>
                    )}
                    {isExpired && (
                        <span className="preview-badge expired-badge">Past Event</span>
                    )}
                </div>

                <h3 className="preview-title">{title}</h3>
                <p className="preview-description">{description}</p>

                {(eventDateObj || location) && (
                    <div className="preview-details">
                        {eventDateObj && (
                            <div className="preview-detail">
                                📅 {eventDateObj.toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </div>
                        )}
                        {location && (
                            <div className="preview-detail">
                                📍 {location}
                            </div>
                        )}
                    </div>
                )}

                {isSelected && (
                    <div className="preview-actions">
                        <button
                            className="preview-button change-action"
                            onClick={() => onUpdate({actionId: '', title: ''})}
                        >
                            Change Action
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
