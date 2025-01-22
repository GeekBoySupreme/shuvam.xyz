class MuseumMap {
    constructor() {
        // Initialize variables
        this.map = null;
        this.markerClusterGroup = null;
        this.currentMarkers = new Map();
        this.searchResults = [];
        this.selectedResultIndex = -1;
        this.searchDebounceTimer = null;
        this.searchMarker = null;
        this.selectedMarkerId = null;
        
        // Create museum API instance
        this.museumApi = new MuseumAPI();
        
        // Initialize map
        this.initialize();
        console.log('MuseumMap initialized');
    }

    initialize() {
        // Initialize map centered on Met Museum in NYC
        this.map = L.map('map').setView([40.7794, -73.9632], 13);
        
        // Add OpenStreetMap tiles with custom styling
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            className: 'map-tiles'
        }).addTo(this.map);

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 80,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 18,
            chunkedLoading: true,
            animate: true,
            iconCreateFunction: (cluster) => {
                const count = cluster.getChildCount();
                const size = count < 10 ? 40 : count < 50 ? 50 : 60;
                
                return L.divIcon({
                    html: `
                        <div class="cluster-marker">
                            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                                <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" 
                                    fill="#FF69B4" stroke="white" stroke-width="2"/>
                                <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                                    fill="white" font-size="${size/3}px">${count}</text>
                            </svg>
                        </div>`,
                    className: 'custom-cluster-marker',
                    iconSize: L.point(size, size)
                });
            }
        });
        
        this.map.addLayer(this.markerClusterGroup);
        
        // Setup event listeners
        this.map.on('moveend', () => this.updateMarkers());
        this.setupSearch();
        this.setupArticleContainer();
    }

    createMarkerHtml(object, isSelected) {
        return `
            <svg width="24" height="24" viewBox="0 0 24 24" class="marker-icon ${isSelected ? 'selected' : ''}" 
                style="transform-origin: center; transition: all 0.3s ease;">
                <circle cx="12" cy="12" r="8" 
                    fill="${isSelected ? '#4169E1' : '#FF69B4'}"
                    stroke="white" 
                    stroke-width="2"
                    style="transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"/>
                ${isSelected ? `
                    <circle cx="12" cy="12" r="10" 
                        fill="none"
                        stroke="#4169E1"
                        stroke-width="2"
                        opacity="0.5">
                        <animate attributeName="r" from="8" to="12" dur="1.5s" repeatCount="indefinite"/>
                        <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                ` : ''}
            </svg>`;
    }

    createMarker(object) {
        const isSelected = this.selectedMarkerId === object.id;
        const markerHtml = this.createMarkerHtml(object, isSelected);
            
        const marker = L.marker([object.geolocation.lat, object.geolocation.lng], {
            icon: L.divIcon({
                html: markerHtml,
                className: `museum-marker ${isSelected ? 'selected-marker' : ''}`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            }),
            zIndexOffset: isSelected ? 1000 : 0,
            riseOnHover: true,
            riseOffset: 1000
        });

        const tooltipContent = `
            <div class="museum-tooltip">
                <div class="tooltip-title">${object.title || 'Untitled'}</div>
                ${object.artist ? `<div class="tooltip-artist">by ${object.artist}</div>` : ''}
                ${object.date ? `<div class="tooltip-date">${object.date}</div>` : ''}
            </div>
        `;

        marker.bindTooltip(tooltipContent, {
            direction: 'top',
            offset: [0, -12],
            className: 'museum-tooltip',
            permanent: false,
            opacity: 1
        });

        marker.on('click', () => {
            this.selectedMarkerId = object.id;
            this.showArtwork(object);
            
            // Center map on selected marker with smooth animation
            this.map.setView(
                [object.geolocation.lat, object.geolocation.lng],
                this.map.getZoom(),
                {
                    animate: true,
                    duration: 0.8,
                    easeLinearity: 0.25
                }
            );
            
            this.updateMarkers();
        });
        
        return marker;
    }

    async updateMarkers() {
        if (this._updating) return;
        this._updating = true;
        
        try {
            const bounds = this.map.getBounds();
            
            // Clear any pending updates
            if (this._updateTimer) {
                clearTimeout(this._updateTimer);
            }
            
            await new Promise(resolve => {
                this._updateTimer = setTimeout(async () => {
                    const objects = await this.museumApi.getObjectsInBounds(bounds);
                    const objectsMap = new Map(objects.map(obj => [obj.id, obj]));
                    const currentIds = new Set(this.currentMarkers.keys());
                    const newIds = new Set(objects.map(obj => obj.id));
                    
                    // Only update markers that have changed
                    const markersToRemove = [...currentIds].filter(id => !newIds.has(id));
                    const markersToAdd = [...newIds].filter(id => !currentIds.has(id));
                    
                    // Remove outdated markers
                    markersToRemove.forEach(id => {
                        const marker = this.currentMarkers.get(id);
                        if (marker) {
                            this.markerClusterGroup.removeLayer(marker);
                            this.currentMarkers.delete(id);
                        }
                    });
                    
                    // Add new markers
                    markersToAdd.forEach(id => {
                        const object = objectsMap.get(id);
                        if (object) {
                            const marker = this.createMarker(object);
                            this.markerClusterGroup.addLayer(marker);
                            this.currentMarkers.set(id, marker);
                        }
                    });
                    
                    // Update existing markers if selected state changed
                    objects.forEach(object => {
                        const id = object.id;
                        if (currentIds.has(id)) {
                            const existingMarker = this.currentMarkers.get(id);
                            const isSelected = this.selectedMarkerId === id;
                            const shouldUpdate = existingMarker.options.icon.options.html !== this.createMarkerHtml(object, isSelected);
                            
                            if (shouldUpdate) {
                                this.markerClusterGroup.removeLayer(existingMarker);
                                const newMarker = this.createMarker(object);
                                this.markerClusterGroup.addLayer(newMarker);
                                this.currentMarkers.set(id, newMarker);
                            }
                        }
                    });
                    
                    resolve();
                }, 300); // Reduced debounce time
            });
        } catch (error) {
            console.error('Error updating markers:', error);
        } finally {
            this._updating = false;
        }
    }

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const searchBox = document.querySelector('.search-box');
        const articleContainer = document.getElementById('article-container');

        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            
            const query = searchInput.value.trim();
            
            // Always reset selection state when typing
            this.selectedResultIndex = -1;
            
            // Hide search results first
            searchResults.classList.add('hidden');
            searchBox.classList.remove('loading');
            
            // If query is too short, clear everything
            if (query.length < 2) {
                this.searchResults = [];
                return;
            }
            
            debounceTimer = setTimeout(async () => {
                searchBox.classList.add('loading');
                
                try {
                    // Get search results first
                    this.searchResults = await this.museumApi.searchObjects(query);
                    
                    // If we have results, close article panel before showing suggestions
                    if (this.searchResults.length > 0) {
                        // Close article view if open
                        if (!articleContainer.classList.contains('hidden')) {
                            articleContainer.classList.add('hidden');
                            this.selectedMarkerId = null;
                            this.updateMarkers();
                        }
                        
                        // Now render and show search results
                        this.renderSearchResults();
                        searchResults.classList.remove('hidden');
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    searchResults.classList.add('hidden');
                    this.searchResults = [];
                } finally {
                    searchBox.classList.remove('loading');
                }
            }, 300);
        });

        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            // Only handle keyboard if we have results and results are visible
            if ((!this.searchResults.length || searchResults.classList.contains('hidden')) && e.key !== 'Escape') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (this.selectedResultIndex < this.searchResults.length - 1) {
                        this.selectedResultIndex++;
                        this.updateSelectedResult();
                    }
                    break;
                    
                case 'ArrowUp':
                    e.preventDefault();
                    if (this.selectedResultIndex > -1) {
                        this.selectedResultIndex--;
                        this.updateSelectedResult();
                        if (this.selectedResultIndex === -1) {
                            searchInput.focus();
                        }
                    }
                    break;
                    
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedResultIndex >= 0) {
                        const selectedResult = this.searchResults[this.selectedResultIndex];
                        if (selectedResult) {
                            this.selectResult(this.selectedResultIndex);
                        }
                    }
                    break;
                    
                case 'Escape':
                    e.preventDefault();
                    this.clearSearch();
                    searchInput.blur();
                    break;
            }
        });

        // Handle clicks outside
        document.addEventListener('click', (e) => {
            if (!searchResults.contains(e.target) && e.target !== searchInput) {
                searchResults.classList.add('hidden');
                this.selectedResultIndex = -1;
            }
        });
    }
    

    renderSearchResults() {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';
        
        this.searchResults.forEach((result, index) => {
            const div = document.createElement('div');
            div.className = 'search-result';
            div.innerHTML = `
                <div class="title">${result.title || 'Untitled'}</div>
                <div class="snippet">${result.snippet || ''}</div>
            `;
            
            div.addEventListener('click', () => this.selectResult(index));
            
            div.addEventListener('mouseenter', () => {
                this.selectedResultIndex = index;
                this.updateSelectedResult();
            });
            
            searchResults.appendChild(div);
        });
    }

    updateSelectedResult() {
        const results = document.querySelectorAll('.search-result');
        results.forEach((result, index) => {
            result.classList.toggle('selected', index === this.selectedResultIndex);
            
            if (index === this.selectedResultIndex) {
                result.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }



    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        
        searchInput.value = '';
        searchResults.classList.add('hidden');
        this.searchResults = [];
        this.selectedResultIndex = -1;
        this.updateSelectedResult();
    }

    selectResult(index) {
        const result = this.searchResults[index];
        if (!result) return;

        // Update selected marker
        this.selectedMarkerId = result.id;
        
        // Show artwork details
        this.showArtwork(result);
        
        // Center map on selected artwork
        if (result.geolocation) {
            this.map.setView([result.geolocation.lat, result.geolocation.lng], 16);
        }
        
        // Update markers
        this.updateMarkers();
        
        // Clear search and hide results
        this.clearSearch();
        document.getElementById('search-results').classList.add('hidden');
    }

    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        searchInput.value = '';
        searchResults.classList.add('hidden');
        this.searchResults = [];
        this.selectedResultIndex = -1;
    }

    setupArticleContainer() {
        const container = document.getElementById('article-container');
        document.getElementById('close-article')?.addEventListener('click', () => {
            container.classList.add('hidden');
            this.selectedMarkerId = null;
            this.updateMarkers();
        });
    }

    showArtwork(object) {
        const container = document.getElementById('article-container');
        
        // Create content
        container.innerHTML = `
            <button id="close-article" class="close-button" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="artwork-content">
                <div class="artwork-image">
                    <div class="shimmer-placeholder"></div>
                    ${object.image ? 
                        `<img 
                            src="${object.image}" 
                            alt="${object.title || 'Artwork'}" 
                            style="opacity: 0.8; object-fit: contain;"
                        >` : 
                        '<div class="no-image">No image available</div>'
                    }
                </div>
                <div class="artwork-details">
                    <h2>${object.title || 'Untitled'}</h2>
                    ${object.artist ? `<p class="artist">⎯ &nbsp;by ${object.artist}</p>` : ''}
                    ${object.date ? `<p class="date"><i class="fa-solid fa-clock"></i> &nbsp;${object.date}</p>` : ''}
                    ${object.culture ? `<p class="culture"><i class="fa-solid fa-mountain-sun"></i> &nbsp;${object.culture}</p>` : ''}
                    ${object.department ? `<p class="department"><i class="fa-solid fa-landmark"></i> &nbsp;${object.department}</p>` : ''}
                    ${object.medium ? `<p class="medium"><i class="fa-solid fa-marker"></i> &nbsp;${object.medium}</p>` : ''}
                    ${object.dimensions ? `<p class="dimensions"><i class="fa-solid fa-ruler"></i> &nbsp;${object.dimensions}</p>` : ''}
                </div>
            </div>
        `;

        // Show container
        container.classList.remove('hidden');

        // Center the map on the artwork location with smooth animation
        if (object.geolocation) {
            this.map.setView(
                [object.geolocation.lat, object.geolocation.lng],
                this.map.getZoom(),
                {
                    animate: true,
                    duration: 0.8,
                    easeLinearity: 0.25
                }
            );
        }

        // Setup close button
        const closeButton = container.querySelector('#close-article');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                container.classList.add('hidden');
                this.selectedMarkerId = null;
                this.updateMarkers();
            });
        }

        // Handle image loading
        const img = container.querySelector('.artwork-image img');
        const shimmer = container.querySelector('.shimmer-placeholder');
        
        if (img && shimmer) {
            const updateShimmerHeight = (height) => {
                shimmer.style.height = `${height}px`;
            };
            
            updateShimmerHeight(200);
            
            img.onload = () => {
                const naturalRatio = img.naturalHeight / img.naturalWidth;
                const maxHeight = Math.min(300, window.innerHeight * 0.4);
                const containerWidth = img.parentElement.offsetWidth;
                const calculatedHeight = containerWidth * naturalRatio;
                
                updateShimmerHeight(calculatedHeight);
                img.style.height = `${calculatedHeight}px`;
                img.style.opacity = '1';
                img.style.filter = 'blur(0)';
                shimmer.style.opacity = '0';
                
                setTimeout(() => {
                    shimmer.style.display = 'none';
                }, 300);
            };
            
            img.onerror = () => {
                shimmer.style.display = 'none';
                img.style.display = 'none';
                const noImage = document.createElement('div');
                noImage.className = 'no-image';
                noImage.textContent = 'Image failed to load';
                img.parentNode.appendChild(noImage);
            };
        }
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.museumMap = new MuseumMap();
});