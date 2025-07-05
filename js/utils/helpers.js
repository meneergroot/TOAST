// Utility functions for SEDDIT app

/**
 * Format a timestamp to a human-readable string
 * @param {number|string} timestamp - Unix timestamp or date string
 * @returns {string} Formatted time string
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h`;
    } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Truncate a wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} startLength - Number of characters to show at start
 * @param {number} endLength - Number of characters to show at end
 * @returns {string} Truncated address
 */
function truncateAddress(address, startLength = 4, endLength = 4) {
    if (!address || address.length < startLength + endLength + 3) {
        return address;
    }
    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

/**
 * Format USDC amount for display
 * @param {number} amount - Amount in smallest units (lamports)
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted amount
 */
function formatUSDC(amount, decimals = 6) {
    const formattedAmount = (amount / Math.pow(10, decimals)).toFixed(2);
    return `$${formattedAmount}`;
}

/**
 * Generate a random avatar URL based on wallet address
 * @param {string} address - Wallet address
 * @returns {string} Avatar URL
 */
function generateAvatarUrl(address) {
    if (!address) return 'https://via.placeholder.com/40';
    
    // Use DiceBear API for consistent avatars based on address
    const seed = address.slice(0, 10);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
}

/**
 * Generate a random display name based on wallet address
 * @param {string} address - Wallet address
 * @returns {string} Display name
 */
function generateDisplayName(address) {
    if (!address) return 'Anonymous User';
    
    const adjectives = ['Crypto', 'Solana', 'DeFi', 'Web3', 'Blockchain', 'Digital', 'Future', 'Smart', 'Fast', 'Secure'];
    const nouns = ['Trader', 'Builder', 'Explorer', 'Innovator', 'Pioneer', 'Creator', 'Developer', 'Artist', 'Collector', 'Enthusiast'];
    
    const seed = address.slice(0, 8);
    const hash = seed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    const adjIndex = Math.abs(hash) % adjectives.length;
    const nounIndex = Math.abs(hash >> 8) % nouns.length;
    
    return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}

/**
 * Generate a random username based on wallet address
 * @param {string} address - Wallet address
 * @returns {string} Username
 */
function generateUsername(address) {
    if (!address) return 'anonymous';
    
    const seed = address.slice(0, 6);
    const hash = seed.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    return `user${Math.abs(hash)}`;
}

/**
 * Validate tweet content
 * @param {string} content - Tweet content
 * @returns {object} Validation result with isValid and error properties
 */
function validateTweet(content) {
    if (!content || content.trim().length === 0) {
        return {
            isValid: false,
            error: 'Tweet cannot be empty'
        };
    }
    
    if (content.length > APP_CONFIG.TWEET.MAX_LENGTH) {
        return {
            isValid: false,
            error: `Tweet exceeds maximum length of ${APP_CONFIG.TWEET.MAX_LENGTH} characters`
        };
    }
    
    return {
        isValid: true,
        error: null
    };
}

/**
 * Get character count status for tweet composer
 * @param {number} count - Current character count
 * @returns {object} Status object with class and message
 */
function getCharCountStatus(count) {
    const remaining = APP_CONFIG.TWEET.MAX_LENGTH - count;
    
    if (remaining < 0) {
        return {
            class: 'error',
            message: `${Math.abs(remaining)} characters over limit`
        };
    } else if (remaining <= APP_CONFIG.TWEET.WARNING_THRESHOLD) {
        return {
            class: 'warning',
            message: `${remaining} characters remaining`
        };
    } else {
        return {
            class: '',
            message: `${remaining} characters remaining`
        };
    }
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone an object
 * @param {any} obj - Object to clone
 * @returns {any} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Check if running on mobile device
 * @returns {boolean} True if mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if running on iOS device
 * @returns {boolean} True if iOS device
 */
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Check if running on Android device
 * @returns {boolean} True if Android device
 */
function isAndroid() {
    return /Android/.test(navigator.userAgent);
}

/**
 * Get device pixel ratio
 * @returns {number} Device pixel ratio
 */
function getDevicePixelRatio() {
    return window.devicePixelRatio || 1;
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} True if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector to scroll to
 * @param {number} offset - Offset from top
 */
function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        }
    } catch (error) {
        console.error('Failed to copy text:', error);
        return false;
    }
}

/**
 * Format number with appropriate suffix (K, M, B)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    } else {
        return num.toString();
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Parse URL parameters
 * @returns {object} URL parameters object
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

/**
 * Set URL parameter
 * @param {string} key - Parameter key
 * @param {string} value - Parameter value
 */
function setUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

/**
 * Remove URL parameter
 * @param {string} key - Parameter key to remove
 */
function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// Export helper functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTimestamp,
        truncateAddress,
        formatUSDC,
        generateAvatarUrl,
        generateDisplayName,
        generateUsername,
        validateTweet,
        getCharCountStatus,
        debounce,
        throttle,
        generateId,
        deepClone,
        isMobile,
        isIOS,
        isAndroid,
        getDevicePixelRatio,
        isInViewport,
        smoothScrollTo,
        copyToClipboard,
        formatNumber,
        escapeHtml,
        getUrlParams,
        setUrlParam,
        removeUrlParam
    };
} 