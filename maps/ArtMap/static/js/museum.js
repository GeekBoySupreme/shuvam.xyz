class MuseumAPI {
    constructor() {
        // API endpoints
        this.metBaseUrl = 'https://collectionapi.metmuseum.org/public/collection/v1';
        this.harvardBaseUrl = 'https://api.harvardartmuseums.org';
        this.chicagoBaseUrl = 'https://api.artic.edu/api/v1';
        this.rijksBaseUrl = 'https://www.rijksmuseum.nl/api/en/collection';
        this.clevelandBaseUrl = 'https://openaccess-api.clevelandart.org/api';
        this.artsmiaBaseUrl = 'https://collections.artsmia.org';
        // Harvard Art Museums API key (hardcoded)
        this.harvardApiKey = '90820dd5-dca7-4f01-8444-65ecb82f0e3a'; // Production API key
        this.objectCache = new Map();
        
        // Initialize all museum APIs
        this.chicagoApi = new ChicagoAPI();
        this.parisApi = new ParisAPI();
        this.nyplApi = new NYPLApi();
        this.rijksApi = new RijksAPI();
        this.artsmiaApi = new ArtsMIAAPI();
        this.clevelandApi = new ClevelandAPI();
        
        console.log('MuseumAPI initialized with all providers');
    }

    async searchObjects(query) {
        if (!query || query.length < 2) return [];
        
        try {
            // Search all museum collections in parallel
            const [
                metResults, 
                harvardResults, 
                chicagoResults, 
                parisResults, 
                nyplResults, 
                rijksResults, 
                artsmiaResults, 
                clevelandResults
            ] = await Promise.all([
                this.searchMetObjects(query).catch(err => {
                    console.error('Met API error:', err);
                    return [];
                }),
                this.searchHarvardObjects(query).catch(err => {
                    console.error('Harvard API error:', err);
                    return [];
                }),
                this.chicagoApi.searchObjects(query).catch(err => {
                    console.error('Chicago API error:', err);
                    return [];
                }),
                this.parisApi.searchObjects(query).catch(err => {
                    console.error('Paris API error:', err);
                    return [];
                }),
                this.nyplApi.searchObjects(query).catch(err => {
                    console.error('NYPL API error:', err);
                    return [];
                }),
                this.rijksApi.searchObjects(query).catch(err => {
                    console.error('Rijks API error:', err);
                    return [];
                }),
                this.artsmiaApi.searchObjects(query).catch(err => {
                    console.error('Arts MIA API error:', err);
                    return [];
                }),
                this.clevelandApi.searchObjects(query).catch(err => {
                    console.error('Cleveland API error:', err);
                    return [];
                })
            ]);
            
            // Combine and sort results
            const combinedResults = [
                ...metResults,
                ...harvardResults,
                ...chicagoResults,
                ...parisResults,
                ...nyplResults,
                ...rijksResults,
                ...artsmiaResults,
                ...clevelandResults
            ].sort((a, b) => a.title.localeCompare(b.title));
            
            return combinedResults.slice(0, 20); // Limit to top 20 results
        } catch (error) {
            console.error('Error searching museum objects:', error);
            return [];
        }
    }

    async searchMetObjects(query) {
        try {
            const url = `${this.metBaseUrl}/search?q=${encodeURIComponent(query)}&hasImages=true`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Met API HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (!data.objectIDs || data.objectIDs.length === 0) {
                return [];
            }
            
            const objectIds = data.objectIDs.slice(0, 10);
            const objects = await Promise.all(
                objectIds.map(id => this.getMetObjectDetails(id))
            );
            
            return objects.filter(obj => obj !== null);
        } catch (error) {
            console.error('Error searching Met Museum:', error);
            return [];
        }
    }

    async searchHarvardObjects(query) {
        try {
            const params = new URLSearchParams({
                q: query,
                size: '10',
                apikey: this.harvardApiKey,
                hasimage: '1',
                fields: 'id,title,primaryimageurl,people,dated,culture,department,medium,dimensions,geocoordinates'
            });
            
            const url = `${this.harvardBaseUrl}/object?${params.toString()}`;
            console.log('Fetching Harvard objects...');
            
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Harvard API error:', errorText);
                return [];
            }
            
            const data = await response.json();
            
            if (!data?.records?.length) {
                console.log('No Harvard records found');
                return [];
            }
            
            return data.records
                .filter(record => record && record.primaryimageurl)
                .map(record => ({
                    id: `harvard_${record.id}`,
                    title: record.title || 'Untitled',
                    image: record.primaryimageurl,
                    thumbnail: record.primaryimageurl,
                    artist: record.people?.[0]?.name || 'Unknown Artist',
                    date: record.dated || 'Date unknown',
                    culture: record.culture || '',
                    department: record.department || '',
                    medium: record.medium || '',
                    dimensions: record.dimensions || '',
                    geolocation: {
                        lat: record.geocoordinates?.latitude || 42.3744, // Harvard Art Museum location
                        lng: record.geocoordinates?.longitude || -71.1144
                    },
                    snippet: `${record.title || 'Untitled'} (${record.dated || 'Date unknown'}) - ${record.culture || ''}`
                }));
        } catch (error) {
            console.error('Error searching Harvard Museum:', error);
            return [];
        }
    }

    async getMetObjectDetails(objectId) {
        try {
            if (this.objectCache.has(objectId)) {
                return this.objectCache.get(objectId);
            }

            const url = `${this.metBaseUrl}/objects/${objectId}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Met API HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (!data.primaryImage) {
                return null;
            }
            
            const object = {
                id: `met_${data.objectID}`,
                title: data.title || 'Untitled',
                image: data.primaryImage,
                thumbnail: data.primaryImageSmall || data.primaryImage,
                artist: data.artistDisplayName || 'Unknown Artist',
                date: data.objectDate || 'Date unknown',
                culture: data.culture || '',
                department: data.department || '',
                medium: data.medium || '',
                dimensions: data.dimensions || '',
                geolocation: {
                    lat: 40.7794 + (Math.random() - 0.5) * 0.01, // Met Museum location with slight random spread
                    lng: -73.9632 + (Math.random() - 0.5) * 0.01
                },
                snippet: `${data.title || 'Untitled'} (${data.objectDate || 'Date unknown'}) - ${data.artistDisplayName || 'Unknown Artist'}`
            };
            
            this.objectCache.set(objectId, object);
            return object;
        } catch (error) {
            console.error('Error fetching Met object details:', error);
            return null;
        }
    }

    async getObjectsInBounds(bounds) {
        try {
            // Get objects from all museums
            const [
                metObjects, 
                harvardObjects, 
                chicagoObjects, 
                parisObjects, 
                nyplObjects, 
                rijksObjects, 
                artsmiaObjects, 
                clevelandObjects
            ] = await Promise.all([
                this.getMetObjectsInBounds(bounds).catch(() => []),
                this.getHarvardObjectsInBounds(bounds).catch(() => []),
                this.chicagoApi.getObjectsInBounds(bounds).catch(() => []),
                this.parisApi.getObjectsInBounds(bounds).catch(() => []),
                this.nyplApi.getObjectsInBounds(bounds).catch(() => []),
                this.rijksApi.getObjectsInBounds(bounds).catch(() => []),
                this.artsmiaApi.getObjectsInBounds(bounds).catch(() => []),
                this.clevelandApi.getObjectsInBounds(bounds).catch(() => [])
            ]);
            
            return [
                ...metObjects,
                ...harvardObjects,
                ...chicagoObjects,
                ...parisObjects,
                ...nyplObjects,
                ...rijksObjects,
                ...artsmiaObjects,
                ...clevelandObjects
            ];
        } catch (error) {
            console.error('Error fetching objects in bounds:', error);
            return [];
        }
    }

    async getMetObjectsInBounds(bounds) {
        try {
            const deptResponse = await fetch(`${this.metBaseUrl}/departments`);
            if (!deptResponse.ok) {
                throw new Error(`Met API HTTP error! status: ${deptResponse.status}`);
            }
            
            const deptData = await deptResponse.json();
            const randomDept = deptData.departments[
                Math.floor(Math.random() * deptData.departments.length)
            ];
            
            const searchResponse = await fetch(
                `${this.metBaseUrl}/search?departmentId=${randomDept.departmentId}&hasImages=true&q=*`
            );
            if (!searchResponse.ok) {
                throw new Error(`Met API HTTP error! status: ${searchResponse.status}`);
            }
            
            const searchData = await searchResponse.json();
            if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
                return [];
            }
            
            const randomObjects = this.getRandomElements(searchData.objectIDs, 10);
            const objects = await Promise.all(
                randomObjects.map(id => this.getMetObjectDetails(id))
            );
            
            return objects.filter(obj => obj !== null);
        } catch (error) {
            console.error('Error fetching Met objects in bounds:', error);
            return [];
        }
    }

    async getHarvardObjectsInBounds(bounds) {
        try {
            // Calculate bounding box for the query
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const geoBounds = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
            
            const url = `${this.harvardBaseUrl}/object?size=10&apikey=${this.harvardApiKey}&hasimage=1&fields=id,title,primaryimageurl,people,dated,culture,department,medium,dimensions,geocoordinates&sort=random`;
            console.log('Fetching Harvard objects in bounds with URL:', url);
            
            const response = await fetch(url);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Harvard API HTTP error! status: ${response.status}, message: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Harvard API response for bounds:', data);
            
            if (!data || typeof data !== 'object') {
                console.warn('Invalid Harvard API response format');
                return [];
            }
            
            if (!data.records || !Array.isArray(data.records)) {
                console.warn('Harvard API response missing records array');
                return [];
            }
            
            return data.records
                .filter(record => record && record.primaryimageurl)
                .map(record => ({
                    id: `harvard_${record.id}`,
                    title: record.title || 'Untitled',
                    image: record.primaryimageurl,
                    thumbnail: record.primaryimageurl,
                    artist: record.people?.length > 0 ? record.people[0].name : 'Unknown Artist',
                    date: record.dated || 'Date unknown',
                    culture: record.culture || '',
                    department: record.department || '',
                    medium: record.medium || '',
                    dimensions: record.dimensions || '',
                    geolocation: {
                        lat: record.geocoordinates?.latitude || 42.3744,
                        lng: record.geocoordinates?.longitude || -71.1144
                    },
                    snippet: `${record.title || 'Untitled'} (${record.dated || 'Date unknown'}) - ${record.culture || ''}`
                }));
        } catch (error) {
            console.error('Error fetching Harvard objects in bounds:', error);
            return [];
        }
    }

    getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
}
