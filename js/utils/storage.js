// Storage utilities for SEDDIT app

/**
 * Storage class for managing local storage operations
 */
class Storage {
    constructor() {
        this.prefix = 'seddit_';
        this.storage = window.localStorage;
    }

    /**
     * Get a value from storage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    get(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const item = this.storage.getItem(fullKey);
            
            if (item === null) {
                return defaultValue;
            }
            
            return JSON.parse(item);
        } catch (error) {
            console.error('Error reading from storage:', error);
            return defaultValue;
        }
    }

    /**
     * Set a value in storage
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     */
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            const serializedValue = JSON.stringify(value);
            this.storage.setItem(fullKey, serializedValue);
        } catch (error) {
            console.error('Error writing to storage:', error);
        }
    }

    /**
     * Remove a value from storage
     * @param {string} key - Storage key to remove
     */
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            this.storage.removeItem(fullKey);
        } catch (error) {
            console.error('Error removing from storage:', error);
        }
    }

    /**
     * Check if a key exists in storage
     * @param {string} key - Storage key to check
     * @returns {boolean} True if key exists
     */
    has(key) {
        const fullKey = this.prefix + key;
        return this.storage.getItem(fullKey) !== null;
    }

    /**
     * Clear all storage with the app prefix
     */
    clear() {
        try {
            const keys = Object.keys(this.storage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    this.storage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Get all keys with the app prefix
     * @returns {string[]} Array of storage keys
     */
    keys() {
        try {
            const keys = Object.keys(this.storage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Error getting storage keys:', error);
            return [];
        }
    }
}

// Create global storage instance
const storage = new Storage();

/**
 * Theme storage utilities
 */
const ThemeStorage = {
    /**
     * Get current theme
     * @returns {string} Current theme ('light' or 'dark')
     */
    getTheme() {
        return storage.get('theme', 'light');
    },

    /**
     * Set theme
     * @param {string} theme - Theme to set ('light' or 'dark')
     */
    setTheme(theme) {
        storage.set('theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    },

    /**
     * Toggle between light and dark themes
     * @returns {string} New theme
     */
    toggleTheme() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    },

    /**
     * Initialize theme from storage or system preference
     */
    initTheme() {
        const savedTheme = this.getTheme();
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const theme = savedTheme || systemTheme;
        this.setTheme(theme);
    }
};

/**
 * Wallet storage utilities
 */
const WalletStorage = {
    /**
     * Get wallet connection state
     * @returns {object} Wallet connection state
     */
    getConnectionState() {
        return storage.get('wallet_connection', {
            connected: false,
            address: null,
            publicKey: null,
            lastConnected: null
        });
    },

    /**
     * Set wallet connection state
     * @param {object} state - Connection state object
     */
    setConnectionState(state) {
        storage.set('wallet_connection', {
            ...state,
            lastConnected: Date.now()
        });
    },

    /**
     * Clear wallet connection state
     */
    clearConnectionState() {
        storage.set('wallet_connection', {
            connected: false,
            address: null,
            publicKey: null,
            lastConnected: null
        });
    },

    /**
     * Get wallet balance
     * @returns {number} Wallet balance in lamports
     */
    getBalance() {
        return storage.get('wallet_balance', 0);
    },

    /**
     * Set wallet balance
     * @param {number} balance - Balance in lamports
     */
    setBalance(balance) {
        storage.set('wallet_balance', balance);
    }
};

/**
 * Tweet storage utilities
 */
const TweetStorage = {
    /**
     * Get all tweets
     * @returns {Array} Array of tweets
     */
    getTweets() {
        return storage.get('tweets', []);
    },

    /**
     * Add a new tweet
     * @param {object} tweet - Tweet object
     */
    addTweet(tweet) {
        const tweets = this.getTweets();
        tweets.unshift(tweet); // Add to beginning
        storage.set('tweets', tweets);
    },

    /**
     * Update a tweet
     * @param {string} tweetId - Tweet ID
     * @param {object} updates - Updates to apply
     */
    updateTweet(tweetId, updates) {
        const tweets = this.getTweets();
        const index = tweets.findIndex(tweet => tweet.id === tweetId);
        
        if (index !== -1) {
            tweets[index] = { ...tweets[index], ...updates };
            storage.set('tweets', tweets);
        }
    },

    /**
     * Remove a tweet
     * @param {string} tweetId - Tweet ID to remove
     */
    removeTweet(tweetId) {
        const tweets = this.getTweets();
        const filteredTweets = tweets.filter(tweet => tweet.id !== tweetId);
        storage.set('tweets', filteredTweets);
    },

    /**
     * Get tweets by user
     * @param {string} userId - User ID
     * @returns {Array} Array of user's tweets
     */
    getTweetsByUser(userId) {
        const tweets = this.getTweets();
        return tweets.filter(tweet => tweet.authorId === userId);
    },

    /**
     * Get a specific tweet by ID
     * @param {string} tweetId - Tweet ID
     * @returns {object|null} Tweet object or null if not found
     */
    getTweetById(tweetId) {
        const tweets = this.getTweets();
        return tweets.find(tweet => tweet.id === tweetId) || null;
    },

    /**
     * Clear all tweets
     */
    clearTweets() {
        storage.set('tweets', []);
    }
};

/**
 * Like storage utilities
 */
const LikeStorage = {
    /**
     * Get all likes
     * @returns {Array} Array of like objects
     */
    getLikes() {
        return storage.get('likes', []);
    },

    /**
     * Add a like
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     */
    addLike(tweetId, userId) {
        const likes = this.getLikes();
        const like = { tweetId, userId, timestamp: Date.now() };
        
        // Check if like already exists
        const exists = likes.some(like => like.tweetId === tweetId && like.userId === userId);
        if (!exists) {
            likes.push(like);
            storage.set('likes', likes);
        }
    },

    /**
     * Remove a like
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     */
    removeLike(tweetId, userId) {
        const likes = this.getLikes();
        const filteredLikes = likes.filter(like => 
            !(like.tweetId === tweetId && like.userId === userId)
        );
        storage.set('likes', filteredLikes);
    },

    /**
     * Check if user liked a tweet
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     * @returns {boolean} True if user liked the tweet
     */
    hasLiked(tweetId, userId) {
        const likes = this.getLikes();
        return likes.some(like => like.tweetId === tweetId && like.userId === userId);
    },

    /**
     * Get like count for a tweet
     * @param {string} tweetId - Tweet ID
     * @returns {number} Number of likes
     */
    getLikeCount(tweetId) {
        const likes = this.getLikes();
        return likes.filter(like => like.tweetId === tweetId).length;
    },

    /**
     * Clear all likes
     */
    clearLikes() {
        storage.set('likes', []);
    }
};

/**
 * Retweet storage utilities
 */
const RetweetStorage = {
    /**
     * Get all retweets
     * @returns {Array} Array of retweet objects
     */
    getRetweets() {
        return storage.get('retweets', []);
    },

    /**
     * Add a retweet
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     */
    addRetweet(tweetId, userId) {
        const retweets = this.getRetweets();
        const retweet = { tweetId, userId, timestamp: Date.now() };
        
        // Check if retweet already exists
        const exists = retweets.some(retweet => retweet.tweetId === tweetId && retweet.userId === userId);
        if (!exists) {
            retweets.push(retweet);
            storage.set('retweets', retweets);
        }
    },

    /**
     * Remove a retweet
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     */
    removeRetweet(tweetId, userId) {
        const retweets = this.getRetweets();
        const filteredRetweets = retweets.filter(retweet => 
            !(retweet.tweetId === tweetId && retweet.userId === userId)
        );
        storage.set('retweets', filteredRetweets);
    },

    /**
     * Check if user retweeted a tweet
     * @param {string} tweetId - Tweet ID
     * @param {string} userId - User ID
     * @returns {boolean} True if user retweeted the tweet
     */
    hasRetweeted(tweetId, userId) {
        const retweets = this.getRetweets();
        return retweets.some(retweet => retweet.tweetId === tweetId && retweet.userId === userId);
    },

    /**
     * Get retweet count for a tweet
     * @param {string} tweetId - Tweet ID
     * @returns {number} Number of retweets
     */
    getRetweetCount(tweetId) {
        const retweets = this.getRetweets();
        return retweets.filter(retweet => retweet.tweetId === tweetId).length;
    },

    /**
     * Clear all retweets
     */
    clearRetweets() {
        storage.set('retweets', []);
    }
};

/**
 * User preferences storage utilities
 */
const UserPreferencesStorage = {
    /**
     * Get user preferences
     * @returns {object} User preferences object
     */
    getPreferences() {
        return storage.get('user_preferences', {
            notifications: true,
            autoRefresh: true,
            compactMode: false,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    },

    /**
     * Set user preferences
     * @param {object} preferences - Preferences object
     */
    setPreferences(preferences) {
        const current = this.getPreferences();
        storage.set('user_preferences', { ...current, ...preferences });
    },

    /**
     * Update a specific preference
     * @param {string} key - Preference key
     * @param {any} value - Preference value
     */
    setPreference(key, value) {
        const preferences = this.getPreferences();
        preferences[key] = value;
        storage.set('user_preferences', preferences);
    },

    /**
     * Get a specific preference
     * @param {string} key - Preference key
     * @param {any} defaultValue - Default value
     * @returns {any} Preference value
     */
    getPreference(key, defaultValue = null) {
        const preferences = this.getPreferences();
        return preferences[key] !== undefined ? preferences[key] : defaultValue;
    }
};

/**
 * Transaction history storage utilities
 */
const TransactionStorage = {
    /**
     * Get transaction history
     * @returns {Array} Array of transactions
     */
    getTransactions() {
        return storage.get('transactions', []);
    },

    /**
     * Add a transaction
     * @param {object} transaction - Transaction object
     */
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transactions.unshift({
            ...transaction,
            id: generateId(),
            timestamp: Date.now()
        });
        
        // Keep only last 100 transactions
        if (transactions.length > 100) {
            transactions.splice(100);
        }
        
        storage.set('transactions', transactions);
    },

    /**
     * Update transaction status
     * @param {string} transactionId - Transaction ID
     * @param {string} status - New status
     * @param {string} signature - Transaction signature
     */
    updateTransactionStatus(transactionId, status, signature = null) {
        const transactions = this.getTransactions();
        const index = transactions.findIndex(tx => tx.id === transactionId);
        
        if (index !== -1) {
            transactions[index] = {
                ...transactions[index],
                status,
                signature,
                updatedAt: Date.now()
            };
            storage.set('transactions', transactions);
        }
    },

    /**
     * Get transactions by status
     * @param {string} status - Transaction status
     * @returns {Array} Array of transactions with specified status
     */
    getTransactionsByStatus(status) {
        const transactions = this.getTransactions();
        return transactions.filter(tx => tx.status === status);
    },

    /**
     * Clear transaction history
     */
    clearTransactions() {
        storage.set('transactions', []);
    }
};

/**
 * Image storage utilities
 */
const ImageStorage = {
    /**
     * Get all images
     * @returns {Array} Array of image data
     */
    getAllImages() {
        return storage.get('images', []);
    },

    /**
     * Save an image
     * @param {string} filename - Image filename
     * @param {object} imageData - Image data object
     */
    saveImage(filename, imageData) {
        const images = this.getAllImages();
        
        // Remove existing image with same filename
        const filteredImages = images.filter(img => img.filename !== filename);
        
        // Add new image
        imageData.filename = filename;
        filteredImages.push(imageData);
        
        storage.set('images', filteredImages);
    },

    /**
     * Get image by filename
     * @param {string} filename - Image filename
     * @returns {object|null} Image data or null
     */
    getImage(filename) {
        const images = this.getAllImages();
        return images.find(img => img.filename === filename) || null;
    },

    /**
     * Delete image by filename
     * @param {string} filename - Image filename
     * @returns {boolean} Success status
     */
    deleteImage(filename) {
        const images = this.getAllImages();
        const filteredImages = images.filter(img => img.filename !== filename);
        
        if (filteredImages.length !== images.length) {
            storage.set('images', filteredImages);
            return true;
        }
        return false;
    },

    /**
     * Get user's images
     * @param {string} userId - User ID
     * @returns {Array} User's images
     */
    getUserImages(userId) {
        const images = this.getAllImages();
        return images.filter(img => img.uploadedBy === userId);
    },

    /**
     * Get user's profile image
     * @param {string} userId - User ID
     * @returns {object|null} Profile image data or null
     */
    getUserProfileImage(userId) {
        const userImages = this.getUserImages(userId);
        return userImages.find(img => img.filename.startsWith('profile_')) || null;
    },

    /**
     * Clear all images
     */
    clearAllImages() {
        storage.set('images', []);
    }
};

// Export storage utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Storage,
        storage,
        ThemeStorage,
        WalletStorage,
        TweetStorage,
        LikeStorage,
        RetweetStorage,
        UserPreferencesStorage,
        TransactionStorage,
        ImageStorage
    };
} 