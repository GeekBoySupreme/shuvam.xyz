class ClevelandAPI {
    constructor() {
        this.baseUrl = 'https://openaccess-api.clevelandart.org/';
    }

    async searchObjects(query) {
        if (!query || query.length < 2) return [];
        try {
            // Simplified mock data
            return [{
                id: `cleveland_1`,
                title: 'Cleveland Museum of Art Collection Item',
                image: 'https://clevelandart.org/example.jpg',
                thumbnail: 'https://clevelandart.org/example_thumb.jpg',
                artist: 'Various Artists',
                date: '1900s',
                geolocation: {
                    lat: 41.5090, // Cleveland Museum of Art location
                    lng: -81.6114
                },
                snippet: 'Cleveland Collection (1900s)'
            }];
        } catch (error) {
            console.error('Error searching Cleveland items:', error);
            return [];
        }
    }

    async getObjectsInBounds(bounds) {
        return this.searchObjects('');
    }
}
