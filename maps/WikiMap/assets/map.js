const WikiMap = {
    init() {
        this.map = null;
        this.markerClusterGroup = null;
        this.wikiApi = new WikipediaAPI();
        this.currentMarkers = new Map();
        this.searchResults = [];
        this.selectedResultIndex = -1;
        this.searchDebounceTimer = null;
        this.searchMarker = null;
        this.initialize();
    },

    initialize() {
        // Initialize map
        this.map = L.map('map').setView([51.505, -0.09], 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Initialize marker cluster group
        this.markerClusterGroup = L.markerClusterGroup({
            maxClusterRadius: 60,
            spiderfyOnMaxZoom: true,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: true,
            disableClusteringAtZoom: 17,
            chunkedLoading: true,
            animate: false
        });
        this.map.addLayer(this.markerClusterGroup);

        // Setup event listeners
        this.map.on('moveend', () => this.updateMarkers());
        this.setupArticleContainer();
        this.setupSearch();

        // Add spinner HTML to search box
        const searchBox = document.querySelector('.search-box');
        const spinnerContainer = document.createElement('div');
        spinnerContainer.className = 'spinner-container';
        spinnerContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" stroke="rgb(29, 108, 255)" viewBox="0 0 24 24"><style>.spinner_V8m1{transform-origin:center;animation:spinner_zKoa 2s linear infinite}.spinner_V8m1 circle{stroke-linecap:round;animation:spinner_YpZS 1.5s ease-in-out infinite}@keyframes spinner_zKoa{100%{transform:rotate(360deg)}}@keyframes spinner_YpZS{0%{stroke-dasharray:0 150;stroke-dashoffset:0}47.5%{stroke-dasharray:42 150;stroke-dashoffset:-16}95%,100%{stroke-dasharray:42 150;stroke-dashoffset:-59}}</style><g class="spinner_V8m1"><circle cx="12" cy="12" r="9.5" fill="none" stroke-width="3"/></g></svg>
        `;
        searchBox.appendChild(spinnerContainer);
        
        // Initialize other components
        this.setupArticleContainer();
        //this.setupSearch();
    },

    setupArticleContainer() {
        const container = document.getElementById('article-container');
        const closeButton = document.getElementById('close-article');
        const searchContainer = document.getElementById('search-container');
        
        closeButton.addEventListener('click', () => {
            container.classList.add('hidden');
            searchContainer.classList.remove('expanded');
            document.getElementById('article-frame').src = '';
        });
    },

    showArticle(article) {
        const container = document.getElementById('article-container');
        const iframe = document.getElementById('article-frame');
        const searchContainer = document.getElementById('search-container');
        
        iframe.src = this.wikiApi.getArticleUrl(article.id);
        container.classList.remove('hidden');
        searchContainer.classList.add('expanded');
    },

    // Modified search handling with loading spinner
    async handleSearch() {
        const query = document.getElementById('search-input').value.trim();
        const searchResults = document.getElementById('search-results');
        const searchContainer = document.getElementById('search-container');
        const spinnerContainer = document.querySelector('.spinner-container');
        console.log(spinnerContainer);

        if (query.length < 2) {
            searchResults.classList.add('hidden');
            this.searchResults = [];
            spinnerContainer.classList.remove('visible');
            // Only remove expanded class if article panel is also hidden
            if (document.getElementById('article-container').classList.contains('hidden')) {
                searchContainer.classList.remove('expanded');
            }
            return;
        }

        // Show spinner
        spinnerContainer.classList.add('visible');

        try {
            this.searchResults = await this.wikiApi.searchArticles(query);
            this.selectedResultIndex = -1;
            this.renderSearchResults();
            searchResults.classList.remove('hidden');
            searchContainer.classList.add('expanded');  // Add expanded class when showing results
        } finally {
            spinnerContainer.classList.remove('visible');
        }
    },

    clearSearch() {
        const searchResults = document.getElementById('search-results');
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search-input');
        
        searchResults.classList.add('hidden');
        this.searchResults = [];
        this.selectedResultIndex = -1;
        searchInput.value = '';
        
        // Only remove expanded class if article panel is hidden
        if (document.getElementById('article-container').classList.contains('hidden')) {
            searchContainer.classList.remove('expanded');
        }
    },

    async updateMarkers() {
        const bounds = this.map.getBounds();
        const articles = await this.wikiApi.getArticlesInBounds(bounds);
        
        // Remove out-of-bounds markers
        for (const [id, marker] of this.currentMarkers) {
            if (!articles.some(article => article.id === id)) {
                this.markerClusterGroup.removeLayer(marker);
                this.currentMarkers.delete(id);
            }
        }

        // Add new markers
        articles.forEach(article => {
            if (!this.currentMarkers.has(article.id)) {
                const marker = this.createMarker(article);
                this.markerClusterGroup.addLayer(marker);
                this.currentMarkers.set(article.id, marker);
            }
        });
    },

    createMarker(article) {
        const normalIcon = L.divIcon({
            html: `<svg width="32" height="32" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_4403_6947)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 24C20.5228 24 25 19.5228 25 14C25 8.47715 20.5228 4 15 4C9.47715 4 5 8.47715 5 14C5 19.5228 9.47715 24 15 24Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 24C20.5228 24 25 19.5228 25 14C25 8.47715 20.5228 4 15 4C9.47715 4 5 8.47715 5 14C5 19.5228 9.47715 24 15 24Z" stroke="black" stroke-opacity="0.12" stroke-width="0.5"/>
</g>
<g filter="url(#filter1_i_4403_6947)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 21C18.866 21 22 17.866 22 14C22 10.134 18.866 7 15 7C11.134 7 8 10.134 8 14C8 17.866 11.134 21 15 21Z" fill="#4E74F8"/>
</g>
<defs>
<filter id="filter0_d_4403_6947" x="0.75" y="0.25" width="28.5" height="28.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="0.5"/>
<feGaussianBlur stdDeviation="2"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4403_6947"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4403_6947" result="shape"/>
</filter>
<filter id="filter1_i_4403_6947" x="8" y="7" width="14" height="14.3" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="0.3"/>
<feGaussianBlur stdDeviation="1.2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4403_6947"/>
</filter>
</defs>
</svg>
`,
            className: 'wiki-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });


        const selectedIcon = L.divIcon({
            html: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_4403_6986)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 24C20.5228 24 25 19.5228 25 14C25 8.47715 20.5228 4 15 4C9.47715 4 5 8.47715 5 14C5 19.5228 9.47715 24 15 24Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 24C20.5228 24 25 19.5228 25 14C25 8.47715 20.5228 4 15 4C9.47715 4 5 8.47715 5 14C5 19.5228 9.47715 24 15 24Z" stroke="black" stroke-opacity="0.12" stroke-width="0.5"/>
</g>
<g filter="url(#filter1_i_4403_6986)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M15 21C18.866 21 22 17.866 22 14C22 10.134 18.866 7 15 7C11.134 7 8 10.134 8 14C8 17.866 11.134 21 15 21Z" fill="#F24769"/>
</g>
<defs>
<filter id="filter0_d_4403_6986" x="0.75" y="0.25" width="28.5" height="28.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="0.5"/>
<feGaussianBlur stdDeviation="2"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4403_6986"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4403_6986" result="shape"/>
</filter>
<filter id="filter1_i_4403_6986" x="8" y="7" width="14" height="14.3" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="0.3"/>
<feGaussianBlur stdDeviation="1.2"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_4403_6986"/>
</filter>
</defs>
</svg>
`,
            className: 'wiki-marker selected',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker([article.lat, article.lng], {
            icon: normalIcon,
            interactive: true,
            bubblingMouseEvents: false
        });

        marker.bindTooltip(article.title, {
            direction: 'top',
            offset: [0, -12]
        });

        // Store current icon state
    marker.isSelected = false;

    marker.on('click', () => {
        // Deselect all other markers first
        this.currentMarkers.forEach((m) => {
            if (m.isSelected && m !== marker) {
                m.setIcon(normalIcon);
                m.isSelected = false;
            }
        });

        // Toggle this marker's state
        marker.isSelected = !marker.isSelected;
        marker.setIcon(marker.isSelected ? selectedIcon : normalIcon);
        
        this.showArticle(article);
    });
    
    return marker;
    },

    setupArticleContainer() {
        const container = document.getElementById('article-container');
        const closeButton = document.getElementById('close-article');
        const searchContainer = document.getElementById('search-container');
    
        closeButton.addEventListener('click', () => {
            container.classList.add('hidden');
            searchContainer.classList.remove('expanded');
            document.getElementById('article-frame').src = '';
        });
    },

    showArticle(article) {
        const container = document.getElementById('article-container');
        const iframe = document.getElementById('article-frame');
        const searchContainer = document.getElementById('search-container');
    
        iframe.src = this.wikiApi.getArticleUrl(article.id);
        container.classList.remove('hidden');
        searchContainer.classList.add('expanded');
    },

    updateSelectedResult() {
        const results = document.querySelectorAll('.search-result');
        results.forEach((result, index) => {
            result.classList.toggle('selected', index === this.selectedResultIndex);
        });

        // Ensure the selected item is visible
        const selectedResult = results[this.selectedResultIndex];
        if (selectedResult) {
            selectedResult.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    },

    renderSearchResults() {
        const searchResults = document.getElementById('search-results');
        searchResults.innerHTML = '';

        this.searchResults.forEach((result, index) => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result';
            resultElement.innerHTML = `
                <div class="title">${result.title}</div>
                <div class="snippet">${result.snippet}</div>
            `;
            resultElement.addEventListener('click', () => this.selectResult(index));
            searchResults.appendChild(resultElement);
        });
    },

    selectNextResult() {
        if (this.searchResults.length === 0) return;
        if (this.selectedResultIndex < this.searchResults.length - 1) {
            this.selectedResultIndex++;
            this.updateSelectedResult();
            this.ensureSelectedResultVisible();
        }
    },

    selectPreviousResult() {
        if (this.searchResults.length === 0) return;
        if (this.selectedResultIndex > 0) {
            this.selectedResultIndex--;
            this.updateSelectedResult();
            this.ensureSelectedResultVisible();
        }
    },

    updateSelectedResult() {
        const results = document.querySelectorAll('.search-result');
        results.forEach((result, index) => {
            if (index === this.selectedResultIndex) {
                result.classList.add('selected');
                result.setAttribute('aria-selected', 'true');
            } else {
                result.classList.remove('selected');
                result.setAttribute('aria-selected', 'false');
            }
        });
    },

    ensureSelectedResultVisible() {
        const selectedResult = document.querySelector('.search-result.selected');
        if (selectedResult) {
            const container = document.getElementById('search-results');
            const containerRect = container.getBoundingClientRect();
            const elementRect = selectedResult.getBoundingClientRect();

            if (elementRect.bottom > containerRect.bottom) {
                selectedResult.scrollIntoView({ behavior: 'smooth', block: 'end' });
            } else if (elementRect.top < containerRect.top) {
                selectedResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    },

    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');

        searchInput.addEventListener('input', () => {
            clearTimeout(this.searchDebounceTimer);
            this.searchDebounceTimer = setTimeout(() => this.handleSearch(), 100);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (this.searchResults.length === 0 && e.key !== 'Escape') return;
            
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNextResult();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPreviousResult();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.selectedResultIndex >= 0) {
                        this.selectResult(this.selectedResultIndex);
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.clearSearch();
                    break;
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchResults.contains(e.target) && e.target !== searchInput) {
                searchResults.classList.add('hidden');
            }
        });
    },

    async selectResult(index) {
        const result = this.searchResults[index];
        if (!result) {
            console.warn('No result found at index:', index);
            return;
        }

        console.log('Selected article:', result.title);

        // Show article immediately
        this.showArticle({
            id: result.id,
            title: result.title
        });

        const location = await this.wikiApi.getArticleLocation(result.id);
        if (!location) {
            console.warn('No location found for article:', result.title);
            return;
        }

        console.log('Article location:', location);

        // Remove existing search marker if any
        if (this.searchMarker) {
            this.map.removeLayer(this.searchMarker);
        }

        // Create new marker with selected state
        const selectedIcon = L.divIcon({
            html: `<svg width="24" height="24" viewBox="0 0 24 24" class="marker-icon">
                    <circle cx="12" cy="12" r="8" class="marker-circle" />
                    <circle cx="12" cy="12" r="4" class="marker-dot" />
                  </svg>`,
            className: 'wiki-marker selected-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        this.searchMarker = L.marker([location.lat, location.lng], {
            icon: selectedIcon,
            interactive: true,
            bubblingMouseEvents: false
        }).addTo(this.map);

        // Pan to location with smooth animation
        this.map.setView([location.lat, location.lng], 16, {
            animate: true,
            duration: 1.0
        });

        // Clear search after a short delay
        setTimeout(() => this.clearSearch(), 300);
    },

    clearSearch() {
        document.getElementById('search-results').classList.add('hidden');
        this.searchResults = [];
        this.selectedResultIndex = -1;
    }
};

// Initialize the map
document.addEventListener('DOMContentLoaded', () => {
    WikiMap.init();
});
