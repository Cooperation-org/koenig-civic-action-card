// Just the React component - no node logic
import React, {useState, useCallback, useEffect} from 'react';
import './CivicActionCard.css';

export function CivicActionCard({
    actionId = '',
    title = '',
    description = '',
    eventType = '',
    eventDate = '',
    location = '',
    imageUrl = '',
    takeActionUrl = '',
    externalUrl = '',
    zipcode = '',
    isVirtual = false,
    sourceMeta = null,
    source = 'community',
    bridgeUrl = (typeof window !== 'undefined' && window.__GHOST_CONFIG__?.civicBridgeUrl) ||
                (typeof process !== 'undefined' && process.env.CIVIC_BRIDGE_URL) ||
                'http://127.0.0.1:5000',
    onUpdate,
    isEditor = true
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLocation, setSearchLocation] = useState('');
    const [searchState, setSearchState] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const showSearch = isEditor && (!actionId || !title);

    const handleSearch = useCallback(async (query, loc, state) => {
        // Need at least 2 characters in query OR location OR a state to search
        if ((!query || query.length < 2) && (!loc || loc.length < 2) && !state) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (query && query.trim()) {
                params.append('q', query.trim());
            }
            if (loc && loc.trim()) {
                params.append('location', loc.trim());
            }
            if (state) {
                params.append('state', state);
            }

            const url = `${bridgeUrl}/api/public/civic-actions?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const results = await response.json();
            setSearchResults(results);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to search civic actions. Please check your connection.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [bridgeUrl]);

    const handleSelectAction = useCallback((action) => {
        if (onUpdate) {
            onUpdate({
                actionId: action.id,
                source: action.source || 'community',
                title: action.title,
                description: action.description,
                eventType: action.eventType,
                eventDate: action.eventDate,
                location: action.location,
                imageUrl: action.imageUrl,
                takeActionUrl: action.takeActionUrl,
                externalUrl: action.externalUrl,
                zipcode: action.zipcode,
                isVirtual: action.isVirtual,
                sourceMeta: action.sourceMeta
            });
        }
        setSearchResults([]);
        setSearchQuery('');
        setSearchLocation('');
        setSearchState('');
    }, [onUpdate]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchLocation('');
        setSearchState('');
        setSearchResults([]);
        setError(null);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (showSearch) {
                handleSearch(searchQuery, searchLocation, searchState);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, searchLocation, searchState, showSearch, handleSearch]);

    if (showSearch) {
        return (
            <div className="civic-action-search-card">
                <div className="civic-search-header">
                    <div className="civic-search-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <div className="civic-search-title-wrapper">
                        <h4>Embed Civic Action</h4>
                        <p>Search for community events, volunteer opportunities, and initiatives</p>
                    </div>
                </div>

                <div className="civic-search-inputs">
                    <div className="civic-search-input-group">
                        <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M15 15L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input
                            type="text"
                            className="civic-search-input"
                            placeholder="Search by keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        {searchQuery && (
                            <button className="civic-clear-button" onClick={() => setSearchQuery('')} title="Clear keyword">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="civic-search-input-row">
                        <div className="civic-search-input-group">
                            <svg className="input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 6.66667C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66667C2 5.07536 2.63214 3.54926 3.75736 2.42404C4.88258 1.29882 6.40869 0.666672 8 0.666672C9.59131 0.666672 11.1174 1.29882 12.2426 2.42404C13.3679 3.54926 14 5.07536 14 6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8 8.66667C9.10457 8.66667 10 7.77124 10 6.66667C10 5.5621 9.10457 4.66667 8 4.66667C6.89543 4.66667 6 5.5621 6 6.66667C6 7.77124 6.89543 8.66667 8 8.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input
                                type="text"
                                className="civic-search-input"
                                placeholder="City or zip code..."
                                value={searchLocation}
                                onChange={(e) => setSearchLocation(e.target.value)}
                            />
                            {searchLocation && (
                                <button className="civic-clear-button" onClick={() => setSearchLocation('')} title="Clear location">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                        <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            )}
                        </div>

                        <div className="civic-search-input-group civic-state-select">
                            <select
                                className="civic-search-select"
                                value={searchState}
                                onChange={(e) => setSearchState(e.target.value)}
                            >
                                <option value="">All States</option>
                                <option value="AL">AL</option>
                                <option value="AK">AK</option>
                                <option value="AZ">AZ</option>
                                <option value="AR">AR</option>
                                <option value="CA">CA</option>
                                <option value="CO">CO</option>
                                <option value="CT">CT</option>
                                <option value="DE">DE</option>
                                <option value="FL">FL</option>
                                <option value="GA">GA</option>
                                <option value="HI">HI</option>
                                <option value="ID">ID</option>
                                <option value="IL">IL</option>
                                <option value="IN">IN</option>
                                <option value="IA">IA</option>
                                <option value="KS">KS</option>
                                <option value="KY">KY</option>
                                <option value="LA">LA</option>
                                <option value="ME">ME</option>
                                <option value="MD">MD</option>
                                <option value="MA">MA</option>
                                <option value="MI">MI</option>
                                <option value="MN">MN</option>
                                <option value="MS">MS</option>
                                <option value="MO">MO</option>
                                <option value="MT">MT</option>
                                <option value="NE">NE</option>
                                <option value="NV">NV</option>
                                <option value="NH">NH</option>
                                <option value="NJ">NJ</option>
                                <option value="NM">NM</option>
                                <option value="NY">NY</option>
                                <option value="NC">NC</option>
                                <option value="ND">ND</option>
                                <option value="OH">OH</option>
                                <option value="OK">OK</option>
                                <option value="OR">OR</option>
                                <option value="PA">PA</option>
                                <option value="RI">RI</option>
                                <option value="SC">SC</option>
                                <option value="SD">SD</option>
                                <option value="TN">TN</option>
                                <option value="TX">TX</option>
                                <option value="UT">UT</option>
                                <option value="VT">VT</option>
                                <option value="VA">VA</option>
                                <option value="WA">WA</option>
                                <option value="WV">WV</option>
                                <option value="WI">WI</option>
                                <option value="WY">WY</option>
                                <option value="DC">DC</option>
                            </select>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="civic-search-loading">
                        <div className="loading-spinner"></div>
                        <span>Searching civic actions...</span>
                    </div>
                )}

                {error && (
                    <div className="civic-search-error">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M10 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {!loading && !error && searchResults.length > 0 && (
                    <div className="civic-search-results">
                        <div className="civic-results-header">
                            <span className="civic-results-count">{searchResults.length} {searchResults.length === 1 ? 'action' : 'actions'} found</span>
                        </div>
                        {searchResults.map(action => {
                            const eventDateObj = action.eventDate ? new Date(action.eventDate) : null;
                            const isExpired = eventDateObj && eventDateObj < new Date();

                            return (
                                <div
                                    key={action.id}
                                    className={`civic-search-result ${isExpired ? 'expired' : ''}`}
                                    onClick={() => handleSelectAction(action)}
                                >
                                    {action.imageUrl && (
                                        <div className="result-image-wrapper">
                                            <img src={action.imageUrl} alt={action.title} className="result-image" />
                                        </div>
                                    )}
                                    <div className="result-content">
                                        <div className="result-header">
                                            {action.eventType && (
                                                <span className={`result-badge type-${action.eventType.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {action.eventType}
                                                </span>
                                            )}
                                            {isExpired && <span className="result-badge expired-badge">Past Event</span>}
                                        </div>
                                        <h5 className="result-title">{action.title}</h5>
                                        <p className="result-description">{action.description}</p>
                                        <div className="result-meta">
                                            {eventDateObj && (
                                                <span className="result-meta-item">
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <rect x="2" y="3" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                                                        <path d="M2 6H12" stroke="currentColor" strokeWidth="1.2"/>
                                                        <path d="M5 1.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                                        <path d="M9 1.5V4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                                    </svg>
                                                    {eventDateObj.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            )}
                                            {action.location && (
                                                <span className="result-meta-item">
                                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12 5.83333C12 9.66667 7 12.8333 7 12.8333C7 12.8333 2 9.66667 2 5.83333C2 4.56678 2.50178 3.35204 3.38904 2.46487C4.27629 1.57761 5.49102 1.07583 6.75758 1.07583C8.02413 1.07583 9.23886 1.57761 10.1261 2.46487C11.0134 3.35204 11.5152 4.56678 11.5152 5.83333H12Z" stroke="currentColor" strokeWidth="1.2"/>
                                                        <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                                                    </svg>
                                                    {action.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="result-action">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && !error && (searchQuery || searchLocation || searchState) && searchResults.length === 0 && (
                    <div className="civic-search-empty">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                            <path d="M24 16V24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
                            <path d="M24 32H24.02" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.3"/>
                        </svg>
                        <h5>No civic actions found</h5>
                        <p>Try adjusting your search terms, location, or state</p>
                    </div>
                )}

                {!loading && !error && !searchQuery && !searchLocation && !searchState && (
                    <div className="civic-search-empty">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 34C27.732 34 34 27.732 34 20C34 12.268 27.732 6 20 6C12.268 6 6 12.268 6 20C6 27.732 12.268 34 20 34Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                            <path d="M42 42L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
                        </svg>
                        <h5>Start searching</h5>
                        <p>Enter keywords, location, or select a state</p>
                    </div>
                )}
            </div>
        );
    }

    const [completed, setCompleted] = useState(false);
    const [recordingAction, setRecordingAction] = useState(false);

    const eventDateObj = eventDate ? new Date(eventDate) : null;
    const isExpired = eventDateObj && eventDateObj < new Date();

    const handleCompleteAction = useCallback(async (checked) => {
        setCompleted(checked);
        if (!checked || !actionId) return;

        setRecordingAction(true);
        try {
            const response = await fetch(`${bridgeUrl}/api/public/civic-actions/${actionId}/complete`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Failed to record action completion');
            }
        } catch (err) {
            console.error('Error recording action:', err);
        } finally {
            setRecordingAction(false);
        }
    }, [actionId, bridgeUrl]);

    const truncateDescription = (text, maxWords = 100) => {
        if (!text) return text;
        const words = text.split(/\s+/);
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(' ') + '...';
    };

    const formatDescription = (text) => {
        if (!text) return null;
        const truncated = truncateDescription(text);
        const paragraphs = truncated.split('\n').filter(p => p.trim());
        return paragraphs.map((para, i) => (
            <p key={i} style={{marginBottom: '0.75rem'}}>{para}</p>
        ));
    };

    return (
        <div className={`civic-action-preview-card ${isExpired ? 'expired' : ''} ${isEditor ? 'editor-mode' : 'reader-mode'}`}>
            {imageUrl && (
                <div className="preview-image">
                    <img src={imageUrl} alt={title} />
                    {isExpired && (
                        <div className="preview-overlay">
                            <span className="preview-overlay-badge">Past Event</span>
                        </div>
                    )}
                </div>
            )}

            <div className="preview-content">
                <div className="preview-header">
                    {eventType && (
                        <span className={`preview-badge type-${eventType.toLowerCase().replace(/\s+/g, '-')}`}>
                            {eventType}
                        </span>
                    )}
                </div>

                <h3 className="preview-title">{title}</h3>
                <div className="preview-description">{formatDescription(description)}</div>

                {sourceMeta?.sponsor && (
                    <div className="preview-sponsor">
                        {sourceMeta.sponsor.logo_url && (
                            <img 
                                src={sourceMeta.sponsor.logo_url} 
                                alt={sourceMeta.sponsor.name}
                                className="sponsor-logo"
                            />
                        )}
                        <div className="sponsor-info">
                            <span className="sponsor-label">Organized by</span>
                            <span className="sponsor-name">{sourceMeta.sponsor.name}</span>
                        </div>
                    </div>
                )}

                {(eventDateObj || location) && (
                    <div className="preview-details">
                        {eventDateObj && (
                            <div className="preview-detail">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M2 6H14" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M5 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M11 1.5V4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                                <span>
                                    {eventDateObj.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                    {' at '}
                                    {eventDateObj.toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    })}
                                </span>
                            </div>
                        )}
                        {location && (
                            <div className="preview-detail">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M14 6.66667C14 11.3333 8 15.3333 8 15.3333C8 15.3333 2 11.3333 2 6.66667C2 5.07536 2.63214 3.54926 3.75736 2.42404C4.88258 1.29882 6.40869 0.666672 8 0.666672C9.59131 0.666672 11.1174 1.29882 12.2426 2.42404C13.3679 3.54926 14 5.07536 14 6.66667Z" stroke="currentColor" strokeWidth="1.5"/>
                                    <circle cx="8" cy="6.66667" r="2" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                <span>{location}{zipcode ? ` ${zipcode}` : ''}</span>
                            </div>
                        )}
                        {isVirtual && (
                            <div className="preview-detail">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M5 13L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M11 13L9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M1 10H15" stroke="currentColor" strokeWidth="1.5"/>
                                </svg>
                                <span className="virtual-badge">Virtual Event</span>
                            </div>
                        )}
                    </div>
                )}

                {!isEditor && (
                    <div className="preview-actions-section">
                        {takeActionUrl && !isExpired && (
                            <div className="preview-actions">
                                <a
                                    href={takeActionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-button primary"
                                >
                                    Take Action
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </a>
                            </div>
                        )}
                        
                        <div className="preview-footer">
                            <label className="preview-checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={completed}
                                    onChange={(e) => handleCompleteAction(e.target.checked)}
                                    disabled={recordingAction}
                                    className="preview-checkbox"
                                />
                                <span className="checkbox-text">Did this!</span>
                            </label>
                            
                            <div className="preview-links">
                                {externalUrl && (
                                    <a
                                        href={externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="preview-link source-link"
                                    >
                                        Original
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 6.5V10.5H1.5V2H5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                            <path d="M7 1.5H10.5V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M5.5 6.5L10.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                                        </svg>
                                    </a>
                                )}
                                <a
                                    href="https://bridge.linkedtrust.us"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="preview-link dashboard-link"
                                >
                                    Your Impact Dashboard
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M4.5 2.25L8.25 6L4.5 9.75" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {isEditor && onUpdate && (
                    <div className="preview-editor-actions">
                        <button
                            className="preview-button secondary"
                            onClick={() => onUpdate({actionId: '', title: ''})}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="currentColor" strokeWidth="1.5"/>
                                <path d="M15 15L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Change Action
                        </button>
                        {externalUrl && (
                            <a
                                href={externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="preview-button secondary"
                            >
                                View Original
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 8.5V13H3V4H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <path d="M9 3H13V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M6.5 9.5L13 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            </a>
                        )}
                    </div>
                )}
                
                {!isEditor && takeActionUrl && isExpired && (
                    <div className="preview-actions">
                        <a
                            href={takeActionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="preview-button secondary"
                        >
                            View Details
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
