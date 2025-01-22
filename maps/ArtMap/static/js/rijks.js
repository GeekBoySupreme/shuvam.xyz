class RijksAPI {
    constructor() {
        this.baseUrl = 'https://www.rijksmuseum.nl/api/en';
    }

    async searchObjects(query) {
        if (!query || query.length < 2) return [];
        try {
            // Simplified mock data
            return [{
                id: `rijks_1`,
                title: 'The Night Watch',
                image: 'https://rijksmuseum.nl/example.jpg',
                thumbnail: 'https://rijksmuseum.nl/example_thumb.jpg',
                artist: 'Rembrandt',
                date: '1642',
                geolocation: {
                    lat: 52.3600, // Rijksmuseum location
                    lng: 4.8852
                },
                snippet: 'The Night Watch (1642) - Rembrandt'
            }];
        } catch (error) {
            console.error('Error searching Rijksmuseum items:', error);
            return [];
        }
    }

    async getObjectsInBounds(bounds) {
        return this.searchObjects('');
    }
}
