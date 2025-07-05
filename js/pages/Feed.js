// Feed page component for managing tweet feed and composer

/**
 * Feed state
 */
let feedState = {
    tweets: [],
    loading: false,
    refreshing: false,
    composerOpen: false
};

/**
 * Feed elements
 */
let feedElements = {
    composer: null,
    tweetText: null,
    charCount: null,
    postButton: null,
    feed: null,
    refreshButton: null,
    addImageButton: null,
    imageUploadArea: null
};

/**
 * Initialize feed page
 */
function initFeed() {
    // Get DOM elements
    feedElements.composer = document.querySelector('.tweet-composer');
    feedElements.tweetText = document.getElementById('tweet-text');
    feedElements.charCount = document.getElementById('char-count');
    feedElements.postButton = document.getElementById('post-tweet');
    feedElements.feed = document.getElementById('tweet-feed');
    feedElements.refreshButton = document.getElementById('refresh-feed');
    feedElements.addImageButton = document.getElementById('add-image');
    feedElements.imageUploadArea = document.getElementById('tweet-image-upload');

    // Set up event listeners
    setupComposerEvents();
    setupFeedEvents();
    
    // Load initial tweets
    loadTweets();
    
    // Set up auto-refresh
    setupAutoRefresh();
}

/**
 * Set up composer event listeners
 */
function setupComposerEvents() {
    if (!feedElements.tweetText) return;

    // Character count and validation
    feedElements.tweetText.addEventListener('input', handleTweetInput);
    
    // Post tweet
    if (feedElements.postButton) {
        feedElements.postButton.addEventListener('click', handlePostTweet);
    }

    // Add image button
    if (feedElements.addImageButton) {
        feedElements.addImageButton.addEventListener('click', toggleImageUpload);
    }

    // Auto-resize textarea
    feedElements.tweetText.addEventListener('input', autoResizeTextarea);
    
    // Keyboard shortcuts
    feedElements.tweetText.addEventListener('keydown', handleTweetKeydown);
}

/**
 * Set up feed event listeners
 */
function setupFeedEvents() {
    // Refresh button
    if (feedElements.refreshButton) {
        feedElements.refreshButton.addEventListener('click', refreshFeed);
    }

    // Infinite scroll (if needed)
    setupInfiniteScroll();
}

/**
 * Handle tweet input
 */
function handleTweetInput() {
    const text = feedElements.tweetText.value;
    const charCount = text.length;
    const maxLength = APP_CONFIG.TWEET.MAX_LENGTH;
    const remaining = maxLength - charCount;

    // Update character count
    if (feedElements.charCount) {
        feedElements.charCount.textContent = remaining;
        
        // Update character count styling
        const status = getCharCountStatus(charCount);
        feedElements.charCount.className = `char-count ${status.class}`;
    }

    // Update post button state
    if (feedElements.postButton) {
        const validation = validateTweet(text);
        feedElements.postButton.disabled = !validation.isValid || !isWalletConnected();
    }
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
    const textarea = feedElements.tweetText;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Set new height based on scrollHeight
    const newHeight = Math.min(textarea.scrollHeight, 200); // Max height of 200px
    textarea.style.height = newHeight + 'px';
}

/**
 * Handle tweet keyboard shortcuts
 */
function handleTweetKeydown(event) {
    // Ctrl/Cmd + Enter to post
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        handlePostTweet();
    }
    
    // Escape to clear
    if (event.key === 'Escape') {
        clearComposer();
    }
}

/**
 * Handle post tweet
 */
async function handlePostTweet() {
    if (!isWalletConnected()) {
        showToast('Please connect your wallet to post tweets', 'warning');
        return;
    }

    const text = feedElements.tweetText.value.trim();
    const validation = validateTweet(text);
    
    if (!validation.isValid) {
        showToast(validation.error, 'error');
        return;
    }

    try {
        // Show loading state
        const originalText = feedElements.postButton.innerHTML;
        feedElements.postButton.disabled = true;
        feedElements.postButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Posting...
        `;

        // Create transaction
        const result = await createPostTweetTransaction(text);
        
        if (result.success) {
            // Create tweet object with image if available
            const tweet = createTweet(text, feedState.currentImage);
            
            // Add to feed
            addTweetToFeed(tweet, feedElements.feed);
            
            // Clear composer
            clearComposer();
            
            // Show success message
            showToast(SUCCESS_MESSAGES.TWEET.POSTED, 'success');
            
            // Update feed state
            feedState.tweets.unshift(tweet);
        }
    } catch (error) {
        console.error('Error posting tweet:', error);
        showToast(error.message || 'Failed to post tweet', 'error');
    } finally {
        // Reset button state
        feedElements.postButton.disabled = false;
        feedElements.postButton.innerHTML = `
            <i class="fas fa-paper-plane"></i>
            Post ($0.01)
        `;
    }
}

/**
 * Toggle image upload area
 */
function toggleImageUpload() {
    if (!feedElements.imageUploadArea) return;
    
    if (feedElements.imageUploadArea.style.display === 'none') {
        // Show image upload
        feedElements.imageUploadArea.style.display = 'block';
        
        // Create image upload element if it doesn't exist
        if (!feedElements.imageUploadArea.querySelector('.image-upload')) {
            const uploadElement = createImageUploadElement('tweet', handleImageUpload);
            feedElements.imageUploadArea.appendChild(uploadElement);
        }
        
        // Update button
        if (feedElements.addImageButton) {
            feedElements.addImageButton.innerHTML = '<i class="fas fa-times"></i>';
            feedElements.addImageButton.title = 'Remove image';
        }
    } else {
        // Hide image upload
        feedElements.imageUploadArea.style.display = 'none';
        feedElements.imageUploadArea.innerHTML = '';
        
        // Update button
        if (feedElements.addImageButton) {
            feedElements.addImageButton.innerHTML = '<i class="fas fa-image"></i>';
            feedElements.addImageButton.title = 'Add image';
        }
    }
}

/**
 * Handle image upload
 * @param {object} result - Upload result
 */
function handleImageUpload(result) {
    if (result && result.success) {
        // Store the uploaded image for the tweet
        feedState.currentImage = result;
        showToast('Image ready for tweet!', 'success');
    } else {
        // Clear any stored image
        feedState.currentImage = null;
    }
}

/**
 * Clear composer
 */
function clearComposer() {
    if (feedElements.tweetText) {
        feedElements.tweetText.value = '';
        feedElements.tweetText.style.height = 'auto';
        handleTweetInput();
    }
    
    // Clear image upload
    if (feedElements.imageUploadArea) {
        feedElements.imageUploadArea.style.display = 'none';
        feedElements.imageUploadArea.innerHTML = '';
    }
    
    // Reset add image button
    if (feedElements.addImageButton) {
        feedElements.addImageButton.innerHTML = '<i class="fas fa-image"></i>';
        feedElements.addImageButton.title = 'Add image';
    }
    
    // Clear stored image
    feedState.currentImage = null;
}

/**
 * Load tweets
 */
function loadTweets() {
    feedState.loading = true;
    
    // Show loading state
    if (feedElements.feed) {
        showTweetLoading(feedElements.feed, 3);
    }

    // Simulate loading delay
    setTimeout(() => {
        // Get tweets from storage
        const tweets = TweetStorage.getTweets();
        
        // Sort by timestamp (newest first)
        tweets.sort((a, b) => b.timestamp - a.timestamp);
        
        feedState.tweets = tweets;
        
        // Render tweets
        if (feedElements.feed) {
            hideTweetLoading(feedElements.feed);
            renderTweetFeed(tweets, feedElements.feed);
        }
        
        feedState.loading = false;
    }, 1000);
}

/**
 * Refresh feed
 */
async function refreshFeed() {
    if (feedState.refreshing) return;
    
    feedState.refreshing = true;
    
    // Show refresh animation
    if (feedElements.refreshButton) {
        const icon = feedElements.refreshButton.querySelector('i');
        icon.className = 'fas fa-spinner fa-spin';
    }
    
    try {
        // Reload tweets
        loadTweets();
        
        // Show success message
        showToast('Feed refreshed!', 'success');
    } catch (error) {
        console.error('Error refreshing feed:', error);
        showToast('Failed to refresh feed', 'error');
    } finally {
        feedState.refreshing = false;
        
        // Reset refresh button
        if (feedElements.refreshButton) {
            const icon = feedElements.refreshButton.querySelector('i');
            icon.className = 'fas fa-sync-alt';
        }
    }
}

/**
 * Set up auto-refresh
 */
function setupAutoRefresh() {
    const interval = APP_CONFIG.UI.REFRESH_INTERVAL;
    
    if (interval > 0) {
        setInterval(() => {
            // Only auto-refresh if user is not actively using the app
            if (!document.hidden && !feedState.loading) {
                loadTweets();
            }
        }, interval);
    }
}

/**
 * Set up infinite scroll
 */
function setupInfiniteScroll() {
    if (!feedElements.feed) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !feedState.loading) {
                // Load more tweets (if implemented)
                // loadMoreTweets();
            }
        });
    }, {
        rootMargin: '100px'
    });

    // Observe the last tweet for infinite scroll
    const observeLastTweet = () => {
        const tweets = feedElements.feed.querySelectorAll('.tweet');
        if (tweets.length > 0) {
            observer.observe(tweets[tweets.length - 1]);
        }
    };

    // Set up mutation observer to watch for new tweets
    const mutationObserver = new MutationObserver(() => {
        observeLastTweet();
    });

    mutationObserver.observe(feedElements.feed, {
        childList: true,
        subtree: true
    });
}

/**
 * Add sample tweets for demonstration
 */
function addSampleTweets() {
    const sampleTweets = [
        {
            id: generateId(),
            content: "Just discovered SEDDIT! The future of social media on Solana is here 🚀 #Solana #Web3",
            authorId: "sample_user_1",
            authorName: "Crypto Explorer",
            authorUsername: "cryptoexplorer",
            authorAvatar: generateAvatarUrl("sample_user_1"),
            timestamp: Date.now() - 300000, // 5 minutes ago
            likes: 12,
            retweets: 3,
            comments: 2
        },
        {
            id: generateId(),
            content: "The transaction fees are so low on Solana! Paying just $0.01 to post feels revolutionary 💎",
            authorId: "sample_user_2",
            authorName: "DeFi Builder",
            authorUsername: "defibuilder",
            authorAvatar: generateAvatarUrl("sample_user_2"),
            timestamp: Date.now() - 600000, // 10 minutes ago
            likes: 8,
            retweets: 1,
            comments: 0
        },
        {
            id: generateId(),
            content: "Finally, a social platform that rewards creators and users with real value. This is what Web3 should be! 🔥",
            authorId: "sample_user_3",
            authorName: "Web3 Pioneer",
            authorUsername: "web3pioneer",
            authorAvatar: generateAvatarUrl("sample_user_3"),
            timestamp: Date.now() - 900000, // 15 minutes ago
            likes: 15,
            retweets: 5,
            comments: 3
        }
    ];

    // Add sample tweets to storage
    sampleTweets.forEach(tweet => {
        TweetStorage.addTweet(tweet);
    });

    // Reload feed
    loadTweets();
}

/**
 * Get feed statistics
 * @returns {object} Feed statistics
 */
function getFeedStats() {
    const tweets = feedState.tweets;
    const totalLikes = tweets.reduce((sum, tweet) => sum + LikeStorage.getLikeCount(tweet.id), 0);
    const totalRetweets = tweets.reduce((sum, tweet) => sum + RetweetStorage.getRetweetCount(tweet.id), 0);
    
    return {
        totalTweets: tweets.length,
        totalLikes,
        totalRetweets,
        averageLikes: tweets.length > 0 ? (totalLikes / tweets.length).toFixed(1) : 0,
        averageRetweets: tweets.length > 0 ? (totalRetweets / tweets.length).toFixed(1) : 0
    };
}

/**
 * Search tweets
 * @param {string} query - Search query
 * @returns {Array} Filtered tweets
 */
function searchTweets(query) {
    if (!query || query.trim() === '') {
        return feedState.tweets;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return feedState.tweets.filter(tweet => 
        tweet.content.toLowerCase().includes(searchTerm) ||
        tweet.authorName.toLowerCase().includes(searchTerm) ||
        tweet.authorUsername.toLowerCase().includes(searchTerm)
    );
}

/**
 * Filter tweets by user
 * @param {string} userId - User ID to filter by
 * @returns {Array} Filtered tweets
 */
function filterTweetsByUser(userId) {
    if (!userId) {
        return feedState.tweets;
    }

    return feedState.tweets.filter(tweet => tweet.authorId === userId);
}

/**
 * Get trending hashtags
 * @returns {Array} Array of trending hashtags
 */
function getTrendingHashtags() {
    const tweets = feedState.tweets;
    const hashtagCount = {};
    
    tweets.forEach(tweet => {
        const hashtags = tweet.content.match(/#\w+/g) || [];
        hashtags.forEach(hashtag => {
            hashtagCount[hashtag] = (hashtagCount[hashtag] || 0) + 1;
        });
    });
    
    return Object.entries(hashtagCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([hashtag, count]) => ({ hashtag, count }));
}

/**
 * Export feed data
 * @returns {object} Feed data for export
 */
function exportFeedData() {
    return {
        tweets: feedState.tweets,
        stats: getFeedStats(),
        trending: getTrendingHashtags(),
        exportDate: new Date().toISOString()
    };
}

/**
 * Import feed data
 * @param {object} data - Feed data to import
 */
function importFeedData(data) {
    if (data.tweets && Array.isArray(data.tweets)) {
        // Clear existing tweets
        TweetStorage.clearTweets();
        
        // Import new tweets
        data.tweets.forEach(tweet => {
            TweetStorage.addTweet(tweet);
        });
        
        // Reload feed
        loadTweets();
        
        showToast('Feed data imported successfully!', 'success');
    } else {
        showToast('Invalid feed data format', 'error');
    }
}

// Export feed functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initFeed,
        loadTweets,
        refreshFeed,
        addSampleTweets,
        getFeedStats,
        searchTweets,
        filterTweetsByUser,
        getTrendingHashtags,
        exportFeedData,
        importFeedData
    };
} 