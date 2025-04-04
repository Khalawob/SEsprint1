/**
 * Location Service
 * 
 * This service integrates with external mapping APIs to provide location-based
 * features such as geocoding, distance calculation, and map visualization.
 */

// We'll use the Mapbox API for this implementation
// In a real app, you would store this in environment variables
const MAPBOX_API_KEY = 'YOUR_MAPBOX_API_KEY'; // Replace with your actual API key in production
const MAPBOX_BASE_URL = 'https://api.mapbox.com';

/**
 * Geocode an address to get coordinates
 * 
 * @param {String} address - Address to geocode
 * @returns {Promise} - Promise resolving to coordinates
 */
async function geocodeAddress(address) {
    try {
        const encodedAddress = encodeURIComponent(address);
        const url = `${MAPBOX_BASE_URL}/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_API_KEY}`;
        
        // In a real implementation, you would make an actual API call
        // For this demo, we'll simulate the response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate response based on address keywords
        let coordinates;
        
        if (address.toLowerCase().includes('london')) {
            coordinates = { lat: 51.5074, lon: -0.1278 };
        } else if (address.toLowerCase().includes('manchester')) {
            coordinates = { lat: 53.4808, lon: -2.2426 };
        } else if (address.toLowerCase().includes('birmingham')) {
            coordinates = { lat: 52.4862, lon: -1.8904 };
        } else if (address.toLowerCase().includes('liverpool')) {
            coordinates = { lat: 53.4084, lon: -2.9916 };
        } else {
            // Default to a random location in the UK
            coordinates = { 
                lat: 51.5074 + (Math.random() - 0.5) * 2,
                lon: -0.1278 + (Math.random() - 0.5) * 2
            };
        }
        
        return {
            success: true,
            coordinates,
            formattedAddress: address
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return {
            success: false,
            error: 'Failed to geocode address'
        };
    }
}

/**
 * Get a static map image URL for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @param {Number} zoom - Map zoom level
 * @param {Number} width - Image width
 * @param {Number} height - Image height
 * @returns {String} - URL for static map image
 */
function getStaticMapUrl(coordinates, zoom = 14, width = 600, height = 400) {
    if (!coordinates || !coordinates.lat || !coordinates.lon) {
        return '';
    }
    
    return `${MAPBOX_BASE_URL}/styles/v1/mapbox/streets-v11/static/pin-s+f44336(${coordinates.lon},${coordinates.lat})/${coordinates.lon},${coordinates.lat},${zoom},0/${width}x${height}?access_token=${MAPBOX_API_KEY}`;
}

/**
 * Get directions between two locations
 * 
 * @param {Object} origin - Origin coordinates
 * @param {Object} destination - Destination coordinates
 * @param {String} mode - Transportation mode (driving, walking, cycling)
 * @returns {Promise} - Promise resolving to directions data
 */
async function getDirections(origin, destination, mode = 'driving') {
    try {
        if (!origin || !destination) {
            throw new Error('Origin and destination are required');
        }
        
        const validModes = ['driving', 'walking', 'cycling'];
        const transportMode = validModes.includes(mode) ? mode : 'driving';
        
        const url = `${MAPBOX_BASE_URL}/directions/v5/mapbox/${transportMode}/` +
                   `${origin.lon},${origin.lat};${destination.lon},${destination.lat}` +
                   `?steps=true&geometries=geojson&access_token=${MAPBOX_API_KEY}`;
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 700));
        
        // Calculate straight-line distance
        const distance = calculateDistance(origin.lat, origin.lon, destination.lat, destination.lon);
        
        // Simulate travel time based on mode and distance
        let duration;
        switch (transportMode) {
            case 'driving':
                duration = distance * 2; // ~30 km/h average
                break;
            case 'cycling':
                duration = distance * 4; // ~15 km/h average
                break;
            case 'walking':
                duration = distance * 12; // ~5 km/h average
                break;
            default:
                duration = distance * 2;
        }
        
        // Convert to seconds
        duration = Math.round(duration * 60);
        
        return {
            success: true,
            distance: {
                value: distance * 1000, // Convert to meters
                text: `${distance.toFixed(1)} km`
            },
            duration: {
                value: duration,
                text: formatDuration(duration)
            },
            mode: transportMode
        };
    } catch (error) {
        console.error('Directions error:', error);
        return {
            success: false,
            error: 'Failed to get directions'
        };
    }
}

/**
 * Find nearby food listings based on location
 * 
 * @param {Object} coordinates - User's coordinates
 * @param {Array} foodListings - All food listings
 * @param {Number} radius - Search radius in kilometers
 * @returns {Array} - Nearby food listings with distance
 */
function findNearbyFoodListings(coordinates, foodListings, radius = 5) {
    if (!coordinates || !foodListings || foodListings.length === 0) {
        return [];
    }
    
    // Filter listings within radius and add distance
    return foodListings
        .filter(listing => {
            // Skip listings without coordinates
            if (!listing.coordinates) {
                return false;
            }
            
            const distance = calculateDistance(
                coordinates.lat, coordinates.lon,
                listing.coordinates.lat, listing.coordinates.lon
            );
            
            return distance <= radius;
        })
        .map(listing => {
            const distance = calculateDistance(
                coordinates.lat, coordinates.lon,
                listing.coordinates.lat, listing.coordinates.lon
            );
            
            return {
                ...listing,
                distance: {
                    value: distance,
                    text: `${distance.toFixed(1)} km`
                }
            };
        })
        .sort((a, b) => a.distance.value - b.distance.value);
}

/**
 * Get location-based statistics for a user
 * 
 * @param {Object} userCoordinates - User's coordinates
 * @param {Array} foodListings - All food listings
 * @returns {Object} - Location statistics
 */
function getLocationStats(userCoordinates, foodListings) {
    if (!userCoordinates || !foodListings) {
        return {
            nearbyListings: 0,
            averageDistance: 0,
            mostCommonArea: 'Unknown',
            foodDensityMap: {}
        };
    }
    
    // Find nearby listings (within 10km)
    const nearbyListings = findNearbyFoodListings(userCoordinates, foodListings, 10);
    
    // Calculate average distance
    let totalDistance = 0;
    nearbyListings.forEach(listing => {
        totalDistance += listing.distance.value;
    });
    const averageDistance = nearbyListings.length > 0 ? 
        totalDistance / nearbyListings.length : 0;
    
    // Find most common area
    const areaCounts = {};
    foodListings.forEach(listing => {
        if (listing.area) {
            areaCounts[listing.area] = (areaCounts[listing.area] || 0) + 1;
        }
    });
    
    let mostCommonArea = 'Unknown';
    let maxCount = 0;
    
    for (const area in areaCounts) {
        if (areaCounts[area] > maxCount) {
            maxCount = areaCounts[area];
            mostCommonArea = area;
        }
    }
    
    // Create a simple food density map (for visualization)
    // Divide the area into a grid and count items in each cell
    const foodDensityMap = {};
    const gridSize = 0.1; // Grid cell size in degrees
    
    foodListings.forEach(listing => {
        if (listing.coordinates) {
            // Create grid cell ID
            const cellX = Math.floor(listing.coordinates.lon / gridSize);
            const cellY = Math.floor(listing.coordinates.lat / gridSize);
            const cellId = `${cellX},${cellY}`;
            
            foodDensityMap[cellId] = (foodDensityMap[cellId] || 0) + 1;
        }
    });
    
    return {
        nearbyListings: nearbyListings.length,
        averageDistance: averageDistance.toFixed(2),
        mostCommonArea,
        foodDensityMap
    };
}

/**
 * Integrate with weather API to get current weather for a location
 * 
 * @param {Object} coordinates - Location coordinates
 * @returns {Promise} - Promise resolving to weather data
 */
async function getWeatherForLocation(coordinates) {
    try {
        if (!coordinates || !coordinates.lat || !coordinates.lon) {
            throw new Error('Valid coordinates are required');
        }
        
        // In a real implementation, you would call an actual weather API
        // For this demo, we'll simulate the response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate random weather data
        const weatherConditions = [
            'Clear', 'Partly Cloudy', 'Cloudy', 'Light Rain', 'Rain', 'Thunderstorm', 'Snow', 'Fog'
        ];
        
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const temperature = Math.round(10 + Math.random() * 20); // 10-30°C
        const humidity = Math.round(40 + Math.random() * 50); // 40-90%
        const windSpeed = Math.round(5 + Math.random() * 25); // 5-30 km/h
        
        return {
            success: true,
            weather: {
                condition: randomCondition,
                temperature,
                humidity,
                windSpeed,
                icon: getWeatherIcon(randomCondition),
                updatedAt: new Date().toISOString()
            }
        };
    } catch (error) {
        console.error('Weather API error:', error);
        return {
            success: false,
            error: 'Failed to get weather data'
        };
    }
}

/**
 * Suggest optimal pickup times based on weather and traffic
 * 
 * @param {Object} coordinates - Location coordinates
 * @returns {Promise} - Promise resolving to suggested pickup times
 */
async function suggestOptimalPickupTimes(coordinates) {
    try {
        // Get weather data
        const weatherResponse = await getWeatherForLocation(coordinates);
        
        if (!weatherResponse.success) {
            throw new Error('Failed to get weather data');
        }
        
        const weather = weatherResponse.weather;
        
        // In a real implementation, you would also get traffic data
        // For this demo, we'll use simulated data
        
        // Define time slots
        const timeSlots = [
            { id: 'morning', label: 'Morning (8am - 12pm)', score: 0 },
            { id: 'afternoon', label: 'Afternoon (12pm - 5pm)', score: 0 },
            { id: 'evening', label: 'Evening (5pm - 9pm)', score: 0 }
        ];
        
        // Score based on weather
        timeSlots.forEach(slot => {
            // Weather condition score
            if (weather.condition === 'Clear' || weather.condition === 'Partly Cloudy') {
                slot.score += 3;
            } else if (weather.condition === 'Cloudy') {
                slot.score += 2;
            } else if (weather.condition === 'Light Rain' || weather.condition === 'Fog') {
                slot.score += 1;
            } else {
                slot.score += 0; // Bad weather
            }
            
            // Temperature score
            if (temperature >= 15 && temperature <= 25) {
                slot.score += 2; // Ideal temperature
            } else {
                slot.score += 1;
            }
        });
        
        // Adjust scores based on typical traffic patterns
        if (timeSlots[0].id === 'morning') {
            timeSlots[0].score -= 1; // Morning rush hour
        }
        
        if (timeSlots[2].id === 'evening') {
            timeSlots[2].score -= 1; // Evening rush hour
        }
        
        // Sort by score (highest first)
        timeSlots.sort((a, b) => b.score - a.score);
        
        // Add weather info to response
        return {
            success: true,
            suggestedTimeSlots: timeSlots,
            weather: {
                condition: weather.condition,
                temperature: `${weather.temperature}°C`,
                icon: weather.icon
            }
        };
    } catch (error) {
        console.error('Optimal pickup times error:', error);
        return {
            success: false,
            error: 'Failed to suggest optimal pickup times'
        };
    }
}

// Helper function to calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

// Helper function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

// Helper function to format duration in seconds to a human-readable string
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
        return `${hours} hr ${minutes} min`;
    } else {
        return `${minutes} min`;
    }
}

// Helper function to get weather icon based on condition
function getWeatherIcon(condition) {
    switch (condition.toLowerCase()) {
        case 'clear':
            return 'fas fa-sun';
        case 'partly cloudy':
            return 'fas fa-cloud-sun';
        case 'cloudy':
            return 'fas fa-cloud';
        case 'light rain':
            return 'fas fa-cloud-rain';
        case 'rain':
            return 'fas fa-cloud-showers-heavy';
        case 'thunderstorm':
            return 'fas fa-bolt';
        case 'snow':
            return 'fas fa-snowflake';
        case 'fog':
            return 'fas fa-smog';
        default:
            return 'fas fa-cloud';
    }
}

module.exports = {
    geocodeAddress,
    getStaticMapUrl,
    getDirections,
    findNearbyFoodListings,
    getLocationStats,
    getWeatherForLocation,
    suggestOptimalPickupTimes,
    calculateDistance
};
