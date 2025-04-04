/**
 * In-App Messaging Service
 * 
 * This service provides functionality for real-time messaging between users,
 * including conversation management, notifications, and message status tracking.
 */

// Message status constants
const MESSAGE_STATUS = {
    SENT: 'sent',
    DELIVERED: 'delivered',
    READ: 'read',
    FAILED: 'failed'
};

// Message types
const MESSAGE_TYPE = {
    TEXT: 'text',
    IMAGE: 'image',
    LOCATION: 'location',
    FOOD_ITEM: 'food_item',
    ARRANGEMENT: 'arrangement',
    SYSTEM: 'system'
};

/**
 * Create a new message
 * 
 * @param {Number} senderId - ID of the sender
 * @param {Number} recipientId - ID of the recipient
 * @param {String} content - Message content
 * @param {String} type - Message type (from MESSAGE_TYPE)
 * @param {Object} metadata - Additional message metadata
 * @returns {Object} - New message object
 */
function createMessage(senderId, recipientId, content, type = MESSAGE_TYPE.TEXT, metadata = {}) {
    const timestamp = new Date().toISOString();
    
    return {
        id: generateMessageId(),
        senderId,
        recipientId,
        content,
        type,
        metadata,
        status: MESSAGE_STATUS.SENT,
        timestamp,
        conversationId: getConversationId(senderId, recipientId)
    };
}

/**
 * Create a new conversation or retrieve an existing one
 * 
 * @param {Number} user1Id - First user ID
 * @param {Number} user2Id - Second user ID
 * @param {String} title - Optional conversation title
 * @returns {Object} - Conversation object
 */
function createOrGetConversation(user1Id, user2Id, title = '') {
    const conversationId = getConversationId(user1Id, user2Id);
    
    // In a real implementation, we would check if the conversation exists in the database
    // For this demo, we'll create a new conversation object
    
    return {
        id: conversationId,
        participants: [user1Id, user2Id],
        title: title || `Conversation between ${user1Id} and ${user2Id}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessagePreview: '',
        unreadCount: {
            [user1Id]: 0,
            [user2Id]: 0
        }
    };
}

/**
 * Get all conversations for a user
 * 
 * @param {Number} userId - User ID
 * @param {Array} allConversations - All conversations in the system
 * @param {Array} allUsers - All users in the system (for participant details)
 * @returns {Array} - User's conversations with details
 */
function getUserConversations(userId, allConversations, allUsers) {
    if (!userId || !allConversations || !allUsers) {
        return [];
    }
    
    // Filter conversations where the user is a participant
    return allConversations
        .filter(conversation => conversation.participants.includes(userId))
        .map(conversation => {
            // Get the other participant's details
            const otherParticipantId = conversation.participants.find(id => id !== userId);
            const otherParticipant = allUsers.find(user => user.id === otherParticipantId) || {};
            
            return {
                ...conversation,
                otherParticipant: {
                    id: otherParticipant.id,
                    name: otherParticipant.name || 'Unknown User',
                    avatar: otherParticipant.avatar || '',
                    isOnline: otherParticipant.isOnline || false
                },
                unreadCount: conversation.unreadCount[userId] || 0
            };
        })
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // Sort by most recent
}

/**
 * Get messages for a specific conversation
 * 
 * @param {String} conversationId - Conversation ID
 * @param {Array} allMessages - All messages in the system
 * @param {Number} limit - Maximum number of messages to return
 * @param {String} beforeTimestamp - Get messages before this timestamp
 * @returns {Array} - Messages in the conversation
 */
function getConversationMessages(conversationId, allMessages, limit = 50, beforeTimestamp = null) {
    if (!conversationId || !allMessages) {
        return [];
    }
    
    let filteredMessages = allMessages.filter(message => message.conversationId === conversationId);
    
    // Filter by timestamp if provided
    if (beforeTimestamp) {
        filteredMessages = filteredMessages.filter(
            message => new Date(message.timestamp) < new Date(beforeTimestamp)
        );
    }
    
    // Sort by timestamp (newest first) and limit
    return filteredMessages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
}

/**
 * Mark messages as read
 * 
 * @param {Array} messageIds - IDs of messages to mark as read
 * @param {Array} allMessages - All messages in the system
 * @returns {Array} - Updated messages
 */
function markMessagesAsRead(messageIds, allMessages) {
    if (!messageIds || !allMessages) {
        return allMessages;
    }
    
    return allMessages.map(message => {
        if (messageIds.includes(message.id)) {
            return {
                ...message,
                status: MESSAGE_STATUS.READ,
                readAt: new Date().toISOString()
            };
        }
        return message;
    });
}

/**
 * Update conversation with new message
 * 
 * @param {Object} conversation - Conversation to update
 * @param {Object} message - New message
 * @returns {Object} - Updated conversation
 */
function updateConversationWithMessage(conversation, message) {
    if (!conversation || !message) {
        return conversation;
    }
    
    // Create a preview of the message content
    let preview = message.content;
    if (message.type !== MESSAGE_TYPE.TEXT) {
        preview = `[${message.type.toUpperCase()}]`;
    }
    
    // Truncate long previews
    if (preview.length > 50) {
        preview = preview.substring(0, 47) + '...';
    }
    
    // Update unread count for recipient
    const unreadCount = { ...conversation.unreadCount };
    unreadCount[message.recipientId] = (unreadCount[message.recipientId] || 0) + 1;
    
    return {
        ...conversation,
        lastMessagePreview: preview,
        updatedAt: message.timestamp,
        unreadCount
    };
}

/**
 * Create a system message
 * 
 * @param {String} conversationId - Conversation ID
 * @param {String} content - System message content
 * @param {Object} metadata - Additional metadata
 * @returns {Object} - System message
 */
function createSystemMessage(conversationId, content, metadata = {}) {
    return {
        id: generateMessageId(),
        senderId: 0, // System sender ID
        recipientId: 0, // System messages don't have a specific recipient
        conversationId,
        content,
        type: MESSAGE_TYPE.SYSTEM,
        metadata,
        status: MESSAGE_STATUS.DELIVERED,
        timestamp: new Date().toISOString()
    };
}

/**
 * Create a food arrangement message
 * 
 * @param {Number} senderId - Sender user ID
 * @param {Number} recipientId - Recipient user ID
 * @param {Object} foodItem - Food item details
 * @param {Object} arrangementDetails - Pickup/delivery details
 * @returns {Object} - Arrangement message
 */
function createArrangementMessage(senderId, recipientId, foodItem, arrangementDetails) {
    return createMessage(
        senderId,
        recipientId,
        `Arrangement for ${foodItem.title}`,
        MESSAGE_TYPE.ARRANGEMENT,
        {
            foodItemId: foodItem.id,
            foodItemTitle: foodItem.title,
            foodItemImage: foodItem.imageUrl,
            arrangementType: arrangementDetails.type, // pickup or delivery
            proposedTime: arrangementDetails.time,
            location: arrangementDetails.location,
            status: 'proposed' // proposed, accepted, rejected, completed
        }
    );
}

/**
 * Update an arrangement message status
 * 
 * @param {Object} message - Arrangement message to update
 * @param {String} newStatus - New arrangement status
 * @param {String} comment - Optional comment
 * @returns {Object} - Updated message
 */
function updateArrangementStatus(message, newStatus, comment = '') {
    if (!message || message.type !== MESSAGE_TYPE.ARRANGEMENT) {
        return message;
    }
    
    const validStatuses = ['proposed', 'accepted', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
        return message;
    }
    
    return {
        ...message,
        metadata: {
            ...message.metadata,
            status: newStatus,
            statusUpdatedAt: new Date().toISOString(),
            statusComment: comment
        }
    };
}

/**
 * Get conversation statistics for a user
 * 
 * @param {Number} userId - User ID
 * @param {Array} allConversations - All conversations
 * @param {Array} allMessages - All messages
 * @returns {Object} - Conversation statistics
 */
function getUserMessageStats(userId, allConversations, allMessages) {
    if (!userId || !allConversations || !allMessages) {
        return {
            totalConversations: 0,
            totalMessages: 0,
            sentMessages: 0,
            receivedMessages: 0,
            unreadMessages: 0,
            responseRate: 0,
            averageResponseTime: 0
        };
    }
    
    // Get user's conversations
    const userConversations = allConversations.filter(
        conversation => conversation.participants.includes(userId)
    );
    
    // Get all messages in user's conversations
    const userMessages = allMessages.filter(
        message => userConversations.some(conv => conv.id === message.conversationId)
    );
    
    // Calculate message counts
    const sentMessages = userMessages.filter(message => message.senderId === userId);
    const receivedMessages = userMessages.filter(message => message.recipientId === userId);
    const unreadMessages = receivedMessages.filter(message => message.status !== MESSAGE_STATUS.READ);
    
    // Calculate response rate (percentage of received messages that were responded to)
    let responseRate = 0;
    if (receivedMessages.length > 0) {
        // Group messages by conversation
        const conversationMessages = {};
        userMessages.forEach(message => {
            if (!conversationMessages[message.conversationId]) {
                conversationMessages[message.conversationId] = [];
            }
            conversationMessages[message.conversationId].push(message);
        });
        
        // Count conversations where user responded
        let conversationsResponded = 0;
        Object.values(conversationMessages).forEach(messages => {
            const receivedInConversation = messages.some(m => m.recipientId === userId);
            const sentInConversation = messages.some(m => m.senderId === userId);
            
            if (receivedInConversation && sentInConversation) {
                conversationsResponded++;
            }
        });
        
        responseRate = (conversationsResponded / userConversations.length) * 100;
    }
    
    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    
    // Sort messages by timestamp
    const sortedMessages = [...userMessages].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    
    // Find pairs of messages (received then sent)
    for (let i = 0; i < sortedMessages.length - 1; i++) {
        const currentMessage = sortedMessages[i];
        const nextMessage = sortedMessages[i + 1];
        
        if (currentMessage.recipientId === userId && nextMessage.senderId === userId) {
            const responseTime = new Date(nextMessage.timestamp) - new Date(currentMessage.timestamp);
            totalResponseTime += responseTime;
            responseCount++;
        }
    }
    
    const averageResponseTime = responseCount > 0 ? 
        totalResponseTime / responseCount / (1000 * 60) : // Convert to minutes
        0;
    
    return {
        totalConversations: userConversations.length,
        totalMessages: userMessages.length,
        sentMessages: sentMessages.length,
        receivedMessages: receivedMessages.length,
        unreadMessages: unreadMessages.length,
        responseRate: Math.round(responseRate),
        averageResponseTime: Math.round(averageResponseTime)
    };
}

// Helper function to generate a conversation ID
function getConversationId(user1Id, user2Id) {
    // Ensure consistent ID regardless of order
    const sortedIds = [user1Id, user2Id].sort().join('-');
    return `conv-${sortedIds}`;
}

// Helper function to generate a unique message ID
function generateMessageId() {
    return `msg-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

module.exports = {
    MESSAGE_STATUS,
    MESSAGE_TYPE,
    createMessage,
    createOrGetConversation,
    getUserConversations,
    getConversationMessages,
    markMessagesAsRead,
    updateConversationWithMessage,
    createSystemMessage,
    createArrangementMessage,
    updateArrangementStatus,
    getUserMessageStats
};
