// Solana Configuration
const SOLANA_CONFIG = {
    // Mainnet configuration
    MAINNET: {
        endpoint: 'https://solana-mainnet.g.alchemy.com/v2/0Loj0xjq2nQy2NLbY4NkL4-YhwmHuyaj',
        commitment: 'confirmed',
        network: 'mainnet-beta'
    },
    
    // Devnet configuration (for testing)
    DEVNET: {
        endpoint: 'https://api.devnet.solana.com',
        commitment: 'confirmed',
        network: 'devnet'
    }
};

// Wallet Configuration
const WALLET_CONFIG = {
    // Phantom wallet adapter configuration
    PHANTOM: {
        name: 'Phantom',
        url: 'https://phantom.app/',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9InVybCgjZ3JhZGllbnQwX2xpbmVhcl8xXzEpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF9saW5lYXJfMV8xIiB4MT0iNjQiIHkxPSIwIiB4Mj0iNjQiIHkyPSIxMjgiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzUxNUZGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNBRDVGQjAiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8cGF0aCBkPSJNMzUuMDY2NyA0OC4yNjY3SDQ4LjI2NjdWNTQuNjY2N0gzNS4wNjY3VjQ4LjI2NjdIMzUuMDY2N1pNNTQuNjY2NyA0OC4yNjY3SDY3Ljg2NjdWNTQuNjY2N0g1NC42NjY3VjQ4LjI2NjdINTQuNjY2N1pNMzUuMDY2NyA1OC42NjY3SDQ4LjI2NjdWNjUuMDY2N0gzNS4wNjY3VjU4LjY2NjdIMzUuMDY2N1pNNTQuNjY2NyA1OC42NjY3SDY3Ljg2NjdWNjUuMDY2N0g1NC42NjY3VjU4LjY2NjdINTQuNjY2N1pNMzUuMDY2NyA2OS4wNjY3SDQ4LjI2NjdWNzUuNDY2N0gzNS4wNjY3VjY5LjA2NjdIMzUuMDY2N1pNNTQuNjY2NyA2OS4wNjY3SDY3Ljg2NjdWNzUuNDY2N0g1NC42NjY3VjY5LjA2NjdINTQuNjY2N1oiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
    }
};

// Transaction Configuration
const TRANSACTION_CONFIG = {
    // Fee structure (in USDC)
    FEES: {
        POST_TWEET: 0.01, // $0.01 for posting a tweet
        LIKE_TWEET: 0.01, // $0.01 for liking a tweet
        RETWEET: 0.01,    // $0.01 for retweeting
        PROFILE_PICTURE: 1.00 // $1.00 for changing profile picture
    },
    
    // Fee distribution
    FEE_DISTRIBUTION: {
        DEVELOPER_WALLET: 'EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3',
        DEVELOPER_SHARE: 0.5, // 50% to developer wallet
        CREATOR_SHARE: 0.5    // 50% to content creator (original poster)
    },
    
    // USDC Token Configuration (Mainnet)
    USDC_TOKEN: {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mainnet mint
        decimals: 6,
        symbol: 'USDC'
    },
    
    // Transaction settings
    TRANSACTION_SETTINGS: {
        maxRetries: 3,
        confirmationTimeout: 30000, // 30 seconds
        commitment: 'confirmed'
    }
};

// App Configuration
const APP_CONFIG = {
    // App metadata
    NAME: 'SEDDIT',
    VERSION: '1.0.0',
    DESCRIPTION: 'Solana Social Media Platform',
    
    // Tweet configuration
    TWEET: {
        MAX_LENGTH: 280,
        WARNING_THRESHOLD: 20, // Show warning when 20 chars remaining
        ERROR_THRESHOLD: 0     // Show error when no chars remaining
    },
    
    // UI Configuration
    UI: {
        TOAST_DURATION: 5000, // 5 seconds
        LOADING_TIMEOUT: 30000, // 30 seconds
        REFRESH_INTERVAL: 30000 // 30 seconds
    },
    
    // Storage keys
    STORAGE_KEYS: {
        THEME: 'seddit_theme',
        WALLET_CONNECTION: 'seddit_wallet_connection',
        USER_PREFERENCES: 'seddit_user_preferences'
    }
};

// Error Messages
const ERROR_MESSAGES = {
    WALLET: {
        NOT_INSTALLED: 'Phantom wallet is not installed. Please install it from https://phantom.app/',
        CONNECTION_FAILED: 'Failed to connect to Phantom wallet',
        DISCONNECTED: 'Wallet disconnected',
        TRANSACTION_FAILED: 'Transaction failed',
        INSUFFICIENT_BALANCE: 'Insufficient USDC balance for this action',
        USER_REJECTED: 'Transaction was rejected by user'
    },
    
    NETWORK: {
        CONNECTION_FAILED: 'Failed to connect to Solana network',
        TIMEOUT: 'Network request timed out',
        UNKNOWN: 'An unknown network error occurred'
    },
    
    VALIDATION: {
        TWEET_TOO_LONG: 'Tweet exceeds maximum length of 280 characters',
        TWEET_EMPTY: 'Tweet cannot be empty',
        INVALID_WALLET: 'Invalid wallet address',
        SELF_LIKE: 'You cannot like your own tweet',
        SELF_RETWEET: 'You cannot retweet your own tweet'
    }
};

// Success Messages
const SUCCESS_MESSAGES = {
    WALLET: {
        CONNECTED: 'Wallet connected successfully',
        DISCONNECTED: 'Wallet disconnected successfully',
        TRANSACTION_SUCCESS: 'Transaction completed successfully'
    },
    
    TWEET: {
        POSTED: 'Tweet posted successfully! You earned $0.005 USDC',
        LIKED: 'Tweet liked successfully! Creator earned $0.005 USDC',
        RETWEETED: 'Tweet retweeted successfully! Creator earned $0.005 USDC'
    },
    
    PROFILE: {
        UPDATED: 'Profile picture updated successfully! ($1.00 fee charged)'
    }
};

// Local Storage Keys
const STORAGE_KEYS = {
    THEME: 'seddit_theme',
    WALLET_CONNECTION: 'seddit_wallet_connection',
    USER_PREFERENCES: 'seddit_user_preferences',
    TWEETS: 'seddit_tweets',
    LIKES: 'seddit_likes',
    RETWEETS: 'seddit_retweets'
};

// Export constants for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SOLANA_CONFIG,
        WALLET_CONFIG,
        TRANSACTION_CONFIG,
        APP_CONFIG,
        ERROR_MESSAGES,
        SUCCESS_MESSAGES,
        STORAGE_KEYS
    };
} 