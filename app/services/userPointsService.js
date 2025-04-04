/**
 * User Points and Rating System
 * 
 * This service manages user points, badges, levels, and ratings
 * to gamify the food sharing experience and encourage participation.
 */

// Point values for different activities
const POINT_VALUES = {
    SHARE_FOOD: 50,         // Points for sharing a food item
    COLLECT_FOOD: 20,        // Points for collecting food
    COMPLETE_PROFILE: 30,    // Points for completing profile
    VERIFY_EMAIL: 15,        // Points for verifying email
    VERIFY_PHONE: 15,        // Points for verifying phone
    LEAVE_REVIEW: 10,        // Points for leaving a review
    RECEIVE_REVIEW: 5,       // Points for receiving a review
    DAILY_LOGIN: 5,          // Points for daily login
    INVITE_USER: 25,         // Points for inviting a new user
    REFERRED_USER_JOINS: 50, // Points when a referred user joins
    SHARE_ON_SOCIAL: 15,     // Points for sharing on social media
    ATTEND_EVENT: 30,        // Points for attending a community event
    PREVENT_WASTE_KG: 10,    // Points per kg of food waste prevented
    MILESTONE_ACHIEVEMENT: 100 // Points for achieving a milestone
};

// User levels based on points
const USER_LEVELS = [
    { name: "Beginner", minPoints: 0, icon: "seedling" },
    { name: "Contributor", minPoints: 200, icon: "leaf" },
    { name: "Sustainer", minPoints: 500, icon: "tree" },
    { name: "Eco-Warrior", minPoints: 1000, icon: "globe-americas" },
    { name: "Food Saver Champion", minPoints: 2000, icon: "award" },
    { name: "Community Hero", minPoints: 3500, icon: "crown" },
    { name: "Sustainability Legend", minPoints: 5000, icon: "star" }
];

// Badges that can be earned
const BADGES = [
    { 
        id: "first_share",
        name: "First Share", 
        description: "Shared your first food item", 
        icon: "hand-holding-heart",
        condition: user => user.stats.itemsShared >= 1
    },
    { 
        id: "regular_sharer",
        name: "Regular Sharer", 
        description: "Shared 10 food items", 
        icon: "share-alt",
        condition: user => user.stats.itemsShared >= 10
    },
    { 
        id: "super_sharer",
        name: "Super Sharer", 
        description: "Shared 50 food items", 
        icon: "share-square",
        condition: user => user.stats.itemsShared >= 50
    },
    { 
        id: "first_collection",
        name: "First Collection", 
        description: "Collected your first food item", 
        icon: "shopping-basket",
        condition: user => user.stats.itemsReceived >= 1
    },
    { 
        id: "waste_warrior",
        name: "Waste Warrior", 
        description: "Prevented 10kg of food waste", 
        icon: "recycle",
        condition: user => user.stats.wastePreventedKg >= 10
    },
    { 
        id: "eco_impact",
        name: "Eco Impact", 
        description: "Prevented 50kg of food waste", 
        icon: "leaf",
        condition: user => user.stats.wastePreventedKg >= 50
    },
    { 
        id: "carbon_cutter",
        name: "Carbon Cutter", 
        description: "Saved 100kg of CO2 emissions", 
        icon: "cloud",
        condition: user => user.stats.carbonSavedKg >= 100
    },
    { 
        id: "community_connector",
        name: "Community Connector", 
        description: "Connected with 10 different users", 
        icon: "users",
        condition: user => user.stats.uniqueConnections >= 10
    },
    { 
        id: "five_star",
        name: "Five Star", 
        description: "Received 5 five-star ratings", 
        icon: "star",
        condition: user => user.stats.fiveStarRatings >= 5
    },
    { 
        id: "quick_responder",
        name: "Quick Responder", 
        description: "Responded to messages within 1 hour (10 times)", 
        icon: "bolt",
        condition: user => user.stats.quickResponses >= 10
    },
    { 
        id: "local_hero",
        name: "Local Hero", 
        description: "Shared food with 20 people in your neighborhood", 
        icon: "map-marker-alt",
        condition: user => user.stats.localShares >= 20
    },
    { 
        id: "variety_king",
        name: "Variety King", 
        description: "Shared 10 different categories of food", 
        icon: "utensils",
        condition: user => user.stats.categoriesShared >= 10
    }
];

/**
 * Calculate the user's current level based on points
 * 
 * @param {Number} points - User's current points
 * @returns {Object} - User level object
 */
function getUserLevel(points) {
    // Find the highest level the user qualifies for
    for (let i = USER_LEVELS.length - 1; i >= 0; i--) {
        if (points >= USER_LEVELS[i].minPoints) {
            return {
                ...USER_LEVELS[i],
                currentPoints: points,
                nextLevel: USER_LEVELS[i+1] || null,
                pointsToNextLevel: USER_LEVELS[i+1] ? USER_LEVELS[i+1].minPoints - points : 0,
                progressPercentage: USER_LEVELS[i+1] ? 
                    Math.min(100, Math.round(((points - USER_LEVELS[i].minPoints) / 
                    (USER_LEVELS[i+1].minPoints - USER_LEVELS[i].minPoints)) * 100)) : 100
            };
        }
    }
    
    // Fallback to the first level if no match (should never happen)
    return {
        ...USER_LEVELS[0],
        currentPoints: points,
        nextLevel: USER_LEVELS[1],
        pointsToNextLevel: USER_LEVELS[1].minPoints - points,
        progressPercentage: Math.min(100, Math.round((points / USER_LEVELS[1].minPoints) * 100))
    };
}

/**
 * Award points to a user for a specific activity
 * 
 * @param {Object} user - User object
 * @param {String} activity - Activity key from POINT_VALUES
 * @param {Number} multiplier - Optional multiplier for the points (default: 1)
 * @returns {Object} - Updated user object with new points and any level changes
 */
function awardPoints(user, activity, multiplier = 1) {
    if (!user || !POINT_VALUES[activity]) {
        return user;
    }
    
    // Calculate points to award
    const pointsToAward = Math.round(POINT_VALUES[activity] * multiplier);
    
    // Get current user level
    const currentLevel = getUserLevel(user.points || 0);
    
    // Update user points
    const updatedUser = {
        ...user,
        points: (user.points || 0) + pointsToAward,
        pointsHistory: [
            ...(user.pointsHistory || []),
            {
                activity,
                points: pointsToAward,
                timestamp: new Date().toISOString()
            }
        ]
    };
    
    // Check if user leveled up
    const newLevel = getUserLevel(updatedUser.points);
    
    if (newLevel.name !== currentLevel.name) {
        updatedUser.levelUpNotification = {
            previousLevel: currentLevel.name,
            newLevel: newLevel.name,
            timestamp: new Date().toISOString()
        };
    }
    
    return updatedUser;
}

/**
 * Calculate and update user badges based on their stats
 * 
 * @param {Object} user - User object with stats
 * @returns {Object} - Updated user object with earned badges
 */
function updateBadges(user) {
    if (!user || !user.stats) {
        return user;
    }
    
    const currentBadges = user.badges || [];
    const newBadges = [];
    
    // Check each badge to see if the user qualifies
    BADGES.forEach(badge => {
        // Skip badges the user already has
        if (currentBadges.some(userBadge => userBadge.id === badge.id)) {
            return;
        }
        
        // Check if user meets the badge condition
        if (badge.condition(user)) {
            newBadges.push({
                id: badge.id,
                name: badge.name,
                description: badge.description,
                icon: badge.icon,
                earnedAt: new Date().toISOString()
            });
        }
    });
    
    // Add new badges to user's badge collection
    return {
        ...user,
        badges: [...currentBadges, ...newBadges],
        newBadgeNotifications: newBadges.length > 0 ? newBadges : null
    };
}

/**
 * Calculate a user's trust score based on various factors
 * 
 * @param {Object} user - User object with stats and history
 * @returns {Number} - Trust score from 0-100
 */
function calculateTrustScore(user) {
    if (!user || !user.stats) {
        return 0;
    }
    
    let score = 0;
    const weights = {
        rating: 30,          // 30% weight for average rating
        completions: 20,     // 20% weight for successful completions
        verifications: 15,   // 15% weight for identity verifications
        consistency: 15,     // 15% weight for consistent activity
        communityStanding: 10, // 10% weight for community standing
        accountAge: 10       // 10% weight for account age
    };
    
    // 1. Rating component (0-5 stars converted to 0-30 points)
    const avgRating = user.stats.averageRating || 0;
    score += (avgRating / 5) * weights.rating;
    
    // 2. Successful completions
    const completions = (user.stats.successfulCompletions || 0);
    const completionScore = Math.min(1, completions / 20); // Max out at 20 completions
    score += completionScore * weights.completions;
    
    // 3. Identity verifications
    let verificationScore = 0;
    if (user.emailVerified) verificationScore += 0.4;
    if (user.phoneVerified) verificationScore += 0.3;
    if (user.idVerified) verificationScore += 0.3;
    score += verificationScore * weights.verifications;
    
    // 4. Consistency score
    const consistencyScore = Math.min(1, (user.stats.activeWeeks || 0) / 10); // Max out at 10 active weeks
    score += consistencyScore * weights.consistency;
    
    // 5. Community standing
    const standingScore = 1 - (Math.min(5, user.stats.complaints || 0) / 5); // Reduce score for complaints
    score += standingScore * weights.communityStanding;
    
    // 6. Account age
    const accountCreated = new Date(user.createdAt || new Date());
    const now = new Date();
    const accountAgeMonths = (now.getFullYear() - accountCreated.getFullYear()) * 12 + 
                             (now.getMonth() - accountCreated.getMonth());
    const ageScore = Math.min(1, accountAgeMonths / 6); // Max out at 6 months
    score += ageScore * weights.accountAge;
    
    return Math.round(score);
}

/**
 * Calculate the environmental impact of a user's activities
 * 
 * @param {Object} user - User object with stats
 * @returns {Object} - Environmental impact metrics
 */
function calculateEnvironmentalImpact(user) {
    if (!user || !user.stats) {
        return {
            wastePreventedKg: 0,
            carbonSavedKg: 0,
            waterSavedLiters: 0,
            energySavedKWh: 0,
            treesEquivalent: 0
        };
    }
    
    // Base calculations on food waste prevented
    const wastePreventedKg = user.stats.wastePreventedKg || 0;
    
    // Environmental impact conversion factors
    // These are approximate values based on research
    const carbonPerKg = 2.5;       // 2.5 kg CO2 per kg food waste
    const waterPerKg = 1000;       // 1000 liters of water per kg food waste
    const energyPerKg = 4.5;       // 4.5 kWh of energy per kg food waste
    const kgCO2PerTree = 25;       // 25 kg CO2 absorbed by one tree per year
    
    // Calculate impact metrics
    const carbonSavedKg = wastePreventedKg * carbonPerKg;
    const waterSavedLiters = wastePreventedKg * waterPerKg;
    const energySavedKWh = wastePreventedKg * energyPerKg;
    const treesEquivalent = carbonSavedKg / kgCO2PerTree;
    
    return {
        wastePreventedKg,
        carbonSavedKg,
        waterSavedLiters,
        energySavedKWh,
        treesEquivalent: Math.round(treesEquivalent * 100) / 100
    };
}

/**
 * Process a rating given to a user and update their stats
 * 
 * @param {Object} user - User receiving the rating
 * @param {Number} rating - Rating value (1-5)
 * @param {String} comment - Optional comment with the rating
 * @returns {Object} - Updated user object
 */
function processRating(user, rating, comment = '') {
    if (!user || rating < 1 || rating > 5) {
        return user;
    }
    
    // Get current stats or initialize
    const stats = user.stats || {
        totalRatings: 0,
        ratingSum: 0,
        averageRating: 0,
        ratingDistribution: {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        fiveStarRatings: 0
    };
    
    // Update rating stats
    stats.totalRatings += 1;
    stats.ratingSum += rating;
    stats.averageRating = stats.ratingSum / stats.totalRatings;
    stats.ratingDistribution[rating] = (stats.ratingDistribution[rating] || 0) + 1;
    
    if (rating === 5) {
        stats.fiveStarRatings = (stats.fiveStarRatings || 0) + 1;
    }
    
    // Add the new rating to history
    const ratingHistory = user.ratingHistory || [];
    ratingHistory.push({
        rating,
        comment,
        timestamp: new Date().toISOString()
    });
    
    // Update user object
    const updatedUser = {
        ...user,
        stats: {
            ...user.stats,
            ...stats
        },
        ratingHistory
    };
    
    // Check for new badges based on ratings
    return updateBadges(updatedUser);
}

/**
 * Generate leaderboard data for the community
 * 
 * @param {Array} users - Array of all users
 * @param {String} category - Leaderboard category (points, waste, shares)
 * @param {Number} limit - Maximum number of users to include
 * @returns {Array} - Sorted leaderboard data
 */
function generateLeaderboard(users, category = 'points', limit = 10) {
    if (!users || users.length === 0) {
        return [];
    }
    
    // Define sorting criteria based on category
    let sortField, labelField;
    
    switch (category) {
        case 'points':
            sortField = 'points';
            labelField = 'points';
            break;
        case 'waste':
            sortField = 'stats.wastePreventedKg';
            labelField = 'wastePreventedKg';
            break;
        case 'shares':
            sortField = 'stats.itemsShared';
            labelField = 'itemsShared';
            break;
        default:
            sortField = 'points';
            labelField = 'points';
    }
    
    // Map and sort users
    return users
        .map(user => {
            // Handle nested fields like stats.wastePreventedKg
            const parts = sortField.split('.');
            let value = user;
            for (const part of parts) {
                value = value && value[part];
            }
            
            return {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                level: getUserLevel(user.points || 0).name,
                value: value || 0,
                label: labelField
            };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, limit);
}

module.exports = {
    POINT_VALUES,
    USER_LEVELS,
    BADGES,
    getUserLevel,
    awardPoints,
    updateBadges,
    calculateTrustScore,
    calculateEnvironmentalImpact,
    processRating,
    generateLeaderboard
};
