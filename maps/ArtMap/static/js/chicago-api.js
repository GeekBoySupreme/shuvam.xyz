class ChicagoAPI {
    constructor() {
        this.baseUrl = 'https://api.artic.edu/api/v1';
    }

    async searchObjects(query) {
        if (!query || query.length < 2) return [];
        
        try {
            const url = `${this.baseUrl}/artworks/search?q=${encodeURIComponent(query)}&limit=10&fields=id,title,image_id,date_display,artist_display,medium_display,dimensions,thumbnail`;
            const response = await fetch(url);
            const data = await response.json();
            
            return data.data.map(artwork => ({
                id: `chicago_${artwork.id}`,
                title: artwork.title,
                sourceUrl: `https://www.artic.edu/artworks/${artwork.id}`,
                image: this.getImageUrl(artwork.image_id),
                thumbnail: this.getImageUrl(artwork.image_id, 200),
                artist: artwork.artist_display,
                date: artwork.date_display,
                medium: artwork.medium_display,
                dimensions: artwork.dimensions,
                geolocation: {
                    lat: 41.8796, // Art Institute of Chicago location
                    lng: -87.6237
                },
                snippet: `${artwork.title} (${artwork.date_display || ''}) - ${artwork.artist_display || ''}`
            })).filter(obj => obj.image);
        } catch (error) {
            console.error('Error searching Chicago artworks:', error);
            return [];
        }
    }

    getImageUrl(imageId, size = 843) {
        if (!imageId) return null;
        return `https://www.artic.edu/iiif/2/${imageId}/full/${size},/0/default.jpg`;
    }

    async getObjectsInBounds(bounds) {
        try {
            const response = await fetch(`${this.baseUrl}/artworks?limit=10&fields=id,title,image_id,date_display,artist_display,medium_display,dimensions,thumbnail`);
            const data = await response.json();
            
            return data.data.map(artwork => ({
                id: `chicago_${artwork.id}`,
                title: artwork.title,
                image: this.getImageUrl(artwork.image_id),
                thumbnail: this.getImageUrl(artwork.image_id, 200),
                artist: artwork.artist_display,
                date: artwork.date_display,
                medium: artwork.medium_display,
                dimensions: artwork.dimensions,
                geolocation: {
                    lat: 41.8796 + (Math.random() - 0.5) * 0.01,
                    lng: -87.6237 + (Math.random() - 0.5) * 0.01
                },
                snippet: `${artwork.title} (${artwork.date_display || ''}) - ${artwork.artist_display || ''}`
            })).filter(obj => obj.image);
        } catch (error) {
            console.error('Error fetching Chicago objects:', error);
            return [];
        }
    }

    getObjectUrl(objectId) {
        const id = objectId.replace('chicago_', '');
        return `https://www.artic.edu/artworks/${id}`;
    }
}
