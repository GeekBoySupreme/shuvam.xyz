class ParisAPI {
    constructor() {
        this.baseUrl = 'https://collections.louvre.fr/ark:/53355/';
    }

    async searchObjects(query) {
        if (!query || query.length < 2) return [];
        try {
            // Simplified mock data since actual API might not be accessible
            return [{
                id: `paris_1`,
                title: 'Mona Lisa',
                image: 'https://collections.louvre.fr/ark:/53355/cl010066723',
                thumbnail: 'https://collections.louvre.fr/ark:/53355/cl010066723',
                artist: 'Leonardo da Vinci',
                date: '1503-1519',
                geolocation: {
                    lat: 48.8606, // Louvre Museum location
                    lng: 2.3376
                },
                snippet: 'Mona Lisa (1503-1519) - Leonardo da Vinci'
            }];
        } catch (error) {
            console.error('Error searching Paris artworks:', error);
            return [];
        }
    }

    async getObjectsInBounds(bounds) {
        return this.searchObjects('');
    }
}

// Make ParisAPI available globally
window.ParisAPI = ParisAPI;
