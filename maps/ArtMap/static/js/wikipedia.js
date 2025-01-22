class WikipediaAPI {
    constructor() {
        this.baseUrl = 'https://en.wikipedia.org/w/api.php';
    }

    async getArticlesInBounds(bounds) {
        const params = {
            action: 'query',
            list: 'geosearch',
            gsradius: 10000,
            gslimit: 100,
            format: 'json',
            origin: '*',
            gscoord: `${bounds.getCenter().lat}|${bounds.getCenter().lng}`
        };

        try {
            const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return data.query.geosearch.map(article => ({
                id: article.pageid,
                title: article.title,
                lat: article.lat,
                lng: article.lon,
                distance: article.dist
            }));
        } catch (error) {
            console.error('Error fetching Wikipedia articles:', error);
            return [];
        }
    }

    async searchArticles(query) {
        if (!query || query.length < 2) return [];
        
        const params = {
            action: 'query',
            list: 'search',
            srsearch: query,
            format: 'json',
            origin: '*',
            srlimit: 10,
            srwhat: 'text',
            srprop: 'snippet'
        };

        try {
            const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
            const response = await fetch(url);
            const data = await response.json();
            
            return data.query.search.map(result => ({
                id: result.pageid,
                title: result.title,
                snippet: result.snippet.replace(/<\/?span[^>]*>/g, '')
            }));
        } catch (error) {
            console.error('Error searching Wikipedia:', error);
            return [];
        }
    }

    async getArticleLocation(pageId) {
        const params = {
            action: 'query',
            pageids: pageId,
            prop: 'coordinates',
            format: 'json',
            origin: '*'
        };

        try {
            const url = `${this.baseUrl}?${new URLSearchParams(params)}`;
            const response = await fetch(url);
            const data = await response.json();
            const page = data.query.pages[pageId];
            
            if (page.coordinates) {
                return {
                    lat: page.coordinates[0].lat,
                    lng: page.coordinates[0].lon
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching article location:', error);
            return null;
        }
    }

    getArticleUrl(pageId) {
        return `https://en.wikipedia.org/?curid=${pageId}`;
    }
}
