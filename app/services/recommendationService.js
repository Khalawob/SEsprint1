/**
 * Food Waste Reduction Recommendation Service
 * 
 * This service provides advanced recommendation algorithms for matching users with food items
 * based on their preferences, location, history, and other factors.
 */

// Utility function to calculate distance between two coordinates using Haversine formula
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

function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Generates personalized food recommendations for a user
 * 
 * @param {Object} user - The user object
 * @param {Array} foodListings - Array of available food listings
 * @param {Object} userPreferences - User's food preferences
 * @returns {Array} - Sorted array of recommended food items
 */
function getPersonalizedRecommendations(user, foodListings, userPreferences = {}) {
    if (!user || !foodListings || foodListings.length === 0) {
        return [];
    }

    // Extract user location (assuming it's stored as lat/long)
    const userLocation = user.coordinates || { 
        lat: 51.5074, // Default to London coordinates if not available
        lon: -0.1278
    };
    
    // Get user dietary preferences
    const dietaryPreferences = userPreferences.dietary || [];
    
    // Get user category preferences
    const categoryPreferences = userPreferences.categories || [];
    
    // Get user's past interactions
    const pastInteractions = user.interactions || [];
    
    // Calculate scores for each food listing
    const scoredListings = foodListings.map(listing => {
        let score = 0;
        
        // 1. Distance score (closer items get higher scores)
        if (listing.coordinates) {
            const distance = calculateDistance(
                userLocation.lat, userLocation.lon,
                listing.coordinates.lat, listing.coordinates.lon
            );
            // Closer items get higher scores (max 40 points for distance)
            score += Math.max(0, 40 - (distance * 5));
        }
        
        // 2. Freshness score (fresher items get higher scores)
        if (listing.expiryDate) {
            const today = new Date();
            const expiryDate = new Date(listing.expiryDate);
            const daysUntilExpiry = Math.max(0, Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24)));
            
            // Items expiring soon (but not expired) get higher scores
            // Optimal window is 1-3 days (max 20 points)
            if (daysUntilExpiry <= 0) {
                score += 0; // Expired items
            } else if (daysUntilExpiry <= 3) {
                score += 20; // Urgent items (1-3 days)
            } else if (daysUntilExpiry <= 7) {
                score += 15; // Soon to expire (4-7 days)
            } else {
                score += 10; // Plenty of time
            }
        }
        
        // 3. Dietary preference match (10 points per match)
        if (listing.dietaryInfo && dietaryPreferences.length > 0) {
            const listingDietary = listing.dietaryInfo.split(',').map(item => item.trim().toLowerCase());
            dietaryPreferences.forEach(pref => {
                if (listingDietary.includes(pref.toLowerCase())) {
                    score += 10;
                }
            });
        }
        
        // 4. Category preference match (15 points per match)
        if (listing.category && categoryPreferences.length > 0) {
            if (categoryPreferences.includes(listing.category.toLowerCase())) {
                score += 15;
            }
        }
        
        // 5. Past interaction boost
        // Check if user has previously interacted with this provider
        const hasInteractedWithProvider = pastInteractions.some(
            interaction => interaction.providerId === listing.postedBy
        );
        
        if (hasInteractedWithProvider) {
            score += 10; // Boost score for providers the user has successfully interacted with
        }
        
        // 6. Rating boost
        if (listing.providerRating) {
            score += listing.providerRating * 2; // Up to 10 points for a 5-star provider
        }
        
        return {
            ...listing,
            recommendationScore: score
        };
    });
    
    // Sort by score (highest first)
    return scoredListings.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

/**
 * Finds the best matches for a specific food item
 * 
 * @param {Object} foodItem - The food item to find matches for
 * @param {Array} users - Array of users
 * @returns {Array} - Sorted array of matched users
 */
function findBestMatchesForFood(foodItem, users) {
    if (!foodItem || !users || users.length === 0) {
        return [];
    }
    
    const foodLocation = foodItem.coordinates || { 
        lat: 51.5074, // Default to London coordinates if not available
        lon: -0.1278
    };
    
    // Calculate scores for each user
    const scoredUsers = users.map(user => {
        let score = 0;
        
        // 1. Distance score (closer users get higher scores)
        if (user.coordinates) {
            const distance = calculateDistance(
                foodLocation.lat, foodLocation.lon,
                user.coordinates.lat, user.coordinates.lon
            );
            // Closer users get higher scores (max 40 points for distance)
            score += Math.max(0, 40 - (distance * 5));
        }
        
        // 2. Dietary preference match
        if (foodItem.dietaryInfo && user.dietaryPreferences) {
            const foodDietary = foodItem.dietaryInfo.split(',').map(item => item.trim().toLowerCase());
            user.dietaryPreferences.forEach(pref => {
                if (foodDietary.includes(pref.toLowerCase())) {
                    score += 15;
                }
            });
        }
        
        // 3. Category preference match
        if (foodItem.category && user.categoryPreferences) {
            if (user.categoryPreferences.includes(foodItem.category.toLowerCase())) {
                score += 20;
            }
        }
        
        // 4. Activity level boost (more active users get priority)
        if (user.activityLevel) {
            score += user.activityLevel * 5; // Up to 25 points for very active users
        }
        
        // 5. Rating boost
        if (user.rating) {
            score += user.rating * 3; // Up to 15 points for a 5-star user
        }
        
        return {
            ...user,
            matchScore: score
        };
    });
    
    // Sort by score (highest first)
    return scoredUsers.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generates community recommendations based on collaborative filtering
 * 
 * @param {Object} user - The user to generate recommendations for
 * @param {Array} allUsers - All users in the system
 * @param {Array} allListings - All food listings
 * @returns {Array} - Recommended food items
 */
function getCollaborativeFilteringRecommendations(user, allUsers, allListings) {
    if (!user || !allUsers || !allListings) {
        return [];
    }
    
    // Find similar users (users with similar preferences and behavior)
    const similarUsers = findSimilarUsers(user, allUsers);
    
    // Get items that similar users have interacted with
    const recommendedItems = [];
    
    similarUsers.forEach(similarUser => {
        // Get items this similar user has interacted with
        const userInteractions = similarUser.interactions || [];
        
        userInteractions.forEach(interaction => {
            // Check if this item exists in allListings
            const item = allListings.find(listing => listing.id === interaction.itemId);
            
            // Check if user has already interacted with this item
            const hasUserInteracted = (user.interactions || []).some(
                userInt => userInt.itemId === interaction.itemId
            );
            
            if (item && !hasUserInteracted) {
                // Calculate a recommendation score based on similarity and interaction type
                const similarityScore = similarUser.similarityScore || 0.5;
                const interactionWeight = getInteractionWeight(interaction.type);
                const score = similarityScore * interactionWeight;
                
                recommendedItems.push({
                    ...item,
                    recommendationScore: score
                });
            }
        });
    });
    
    // Remove duplicates and sort by score
    const uniqueRecommendations = [];
    const seenIds = new Set();
    
    recommendedItems.forEach(item => {
        if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            uniqueRecommendations.push(item);
        }
    });
    
    return uniqueRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);
}

// Helper function to find similar users
function findSimilarUsers(user, allUsers) {
    return allUsers
        .filter(otherUser => otherUser.id !== user.id)
        .map(otherUser => {
            const similarityScore = calculateUserSimilarity(user, otherUser);
            return {
                ...otherUser,
                similarityScore
            };
        })
        .sort((a, b) => b.similarityScore - a.similarityScore)
        .slice(0, 10); // Get top 10 similar users
}

// Helper function to calculate similarity between users
function calculateUserSimilarity(user1, user2) {
    let similarityScore = 0;
    
    // 1. Similar dietary preferences
    const dietaryOverlap = calculatePreferenceOverlap(
        user1.dietaryPreferences || [],
        user2.dietaryPreferences || []
    );
    similarityScore += dietaryOverlap * 0.3;
    
    // 2. Similar category preferences
    const categoryOverlap = calculatePreferenceOverlap(
        user1.categoryPreferences || [],
        user2.categoryPreferences || []
    );
    similarityScore += categoryOverlap * 0.3;
    
    // 3. Geographic proximity
    if (user1.coordinates && user2.coordinates) {
        const distance = calculateDistance(
            user1.coordinates.lat, user1.coordinates.lon,
            user2.coordinates.lat, user2.coordinates.lon
        );
        
        // Convert distance to a 0-1 score (closer = higher score)
        const proximityScore = Math.max(0, 1 - (distance / 20)); // 20km as max relevant distance
        similarityScore += proximityScore * 0.2;
    }
    
    // 4. Similar activity patterns
    const activitySimilarity = calculateActivitySimilarity(
        user1.interactions || [],
        user2.interactions || []
    );
    similarityScore += activitySimilarity * 0.2;
    
    return similarityScore;
}

// Helper function to calculate overlap between two arrays
function calculatePreferenceOverlap(prefs1, prefs2) {
    if (prefs1.length === 0 || prefs2.length === 0) {
        return 0;
    }
    
    const set1 = new Set(prefs1.map(p => p.toLowerCase()));
    const set2 = new Set(prefs2.map(p => p.toLowerCase()));
    
    let intersectionCount = 0;
    set1.forEach(item => {
        if (set2.has(item)) {
            intersectionCount++;
        }
    });
    
    // Jaccard similarity: intersection size / union size
    return intersectionCount / (set1.size + set2.size - intersectionCount);
}

// Helper function to calculate similarity in activity patterns
function calculateActivitySimilarity(interactions1, interactions2) {
    if (interactions1.length === 0 || interactions2.length === 0) {
        return 0;
    }
    
    // Compare interaction types and frequencies
    const types1 = countInteractionTypes(interactions1);
    const types2 = countInteractionTypes(interactions2);
    
    // Calculate cosine similarity between interaction type vectors
    return calculateCosineSimilarity(types1, types2);
}

// Helper function to count interaction types
function countInteractionTypes(interactions) {
    const counts = {
        share: 0,
        receive: 0,
        view: 0,
        save: 0,
        message: 0
    };
    
    interactions.forEach(interaction => {
        if (counts[interaction.type] !== undefined) {
            counts[interaction.type]++;
        }
    });
    
    return counts;
}

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vector1, vector2) {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;
    
    for (const key in vector1) {
        if (vector2[key] !== undefined) {
            dotProduct += vector1[key] * vector2[key];
            magnitude1 += vector1[key] * vector1[key];
            magnitude2 += vector2[key] * vector2[key];
        }
    }
    
    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);
    
    if (magnitude1 === 0 || magnitude2 === 0) {
        return 0;
    }
    
    return dotProduct / (magnitude1 * magnitude2);
}

// Helper function to get weight for different interaction types
function getInteractionWeight(type) {
    switch (type) {
        case 'receive':
            return 1.0; // Highest weight for items the user has received
        case 'share':
            return 0.8; // High weight for items the user has shared
        case 'save':
            return 0.7; // Medium-high weight for saved items
        case 'message':
            return 0.6; // Medium weight for items the user has messaged about
        case 'view':
            return 0.3; // Lower weight for viewed items
        default:
            return 0.1;
    }
}

module.exports = {
    getPersonalizedRecommendations,
    findBestMatchesForFood,
    getCollaborativeFilteringRecommendations,
    calculateDistance
};
