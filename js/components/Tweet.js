// Tweet component for rendering individual tweets

/**
 * Create a tweet element
 * @param {object} tweet - Tweet data object
 * @returns {HTMLElement} Tweet element
 */
function createTweetElement(tweet) {
    const tweetElement = document.createElement('div');
    tweetElement.className = 'tweet';
    tweetElement.dataset.tweetId = tweet.id;

    const currentUserId = getWalletAddress();
    const isLiked = LikeStorage.hasLiked(tweet.id, currentUserId);
    const isRetweeted = RetweetStorage.hasRetweeted(tweet.id, currentUserId);
    const likeCount = LikeStorage.getLikeCount(tweet.id);
    const retweetCount = RetweetStorage.getRetweetCount(tweet.id);
    
    // Calculate earnings for content creator
    const totalEngagement = likeCount + retweetCount;
    const earnings = totalEngagement * TRANSACTION_CONFIG.FEES.LIKE_TWEET * TRANSACTION_CONFIG.FEE_DISTRIBUTION.CREATOR_SHARE;
    const isOwnTweet = tweet.authorId === currentUserId;

    tweetElement.innerHTML = `
        <img src="${tweet.authorAvatar || generateAvatarUrl(tweet.authorId)}" 
             alt="${tweet.authorName}" 
             class="tweet-avatar"
             onerror="this.src='https://via.placeholder.com/48'">
        
        <div class="tweet-content">
            <div class="tweet-header">
                <a href="#" class="tweet-author">${escapeHtml(tweet.authorName)}</a>
                <span class="tweet-username">@${tweet.authorUsername}</span>
                <span class="tweet-timestamp">${formatTimestamp(tweet.timestamp)}</span>
            </div>
            
            <div class="tweet-text">${escapeHtml(tweet.content)}</div>
            
            ${tweet.image ? `
            <div class="tweet-image">
                <img src="${tweet.image.url}" alt="Tweet image" class="tweet-image-content">
            </div>
            ` : ''}
            
            ${isOwnTweet && earnings > 0 ? `
            <div class="tweet-earnings">
                <i class="fas fa-coins"></i>
                <span>Earned: $${earnings.toFixed(3)} USDC</span>
            </div>
            ` : ''}
            
            <div class="tweet-actions">
                <button class="tweet-action comment" onclick="handleComment('${tweet.id}')">
                    <i class="fas fa-comment"></i>
                    <span>0</span>
                </button>
                
                <button class="tweet-action retweet ${isRetweeted ? 'retweeted' : ''}" 
                        onclick="handleRetweet('${tweet.id}')">
                    <i class="fas fa-retweet"></i>
                    <span>${formatNumber(retweetCount)}</span>
                </button>
                
                <button class="tweet-action like ${isLiked ? 'liked' : ''}" 
                        onclick="handleLike('${tweet.id}')">
                    <i class="fas fa-heart"></i>
                    <span>${formatNumber(likeCount)}</span>
                </button>
                
                <button class="tweet-action share" onclick="handleShare('${tweet.id}')">
                    <i class="fas fa-share"></i>
                </button>
            </div>
        </div>
    `;

    return tweetElement;
}

/**
 * Handle tweet like action
 * @param {string} tweetId - Tweet ID to like
 */
async function handleLike(tweetId) {
    if (!isWalletConnected()) {
        showToast('Please connect your wallet to like tweets', 'warning');
        return;
    }

    try {
        const currentUserId = getWalletAddress();
        const isLiked = LikeStorage.hasLiked(tweetId, currentUserId);

        if (isLiked) {
            // Unlike
            LikeStorage.removeLike(tweetId, currentUserId);
            updateTweetLikeUI(tweetId, false);
            showToast('Tweet unliked', 'success');
        } else {
            // Like
            const result = await createLikeTweetTransaction(tweetId);
            if (result.success) {
                LikeStorage.addLike(tweetId, currentUserId);
                updateTweetLikeUI(tweetId, true);
                showToast(SUCCESS_MESSAGES.TWEET.LIKED, 'success');
            }
        }
    } catch (error) {
        console.error('Error handling like:', error);
        showToast(error.message || 'Failed to like tweet', 'error');
    }
}

/**
 * Handle tweet retweet action
 * @param {string} tweetId - Tweet ID to retweet
 */
async function handleRetweet(tweetId) {
    if (!isWalletConnected()) {
        showToast('Please connect your wallet to retweet', 'warning');
        return;
    }

    try {
        const currentUserId = getWalletAddress();
        const isRetweeted = RetweetStorage.hasRetweeted(tweetId, currentUserId);

        if (isRetweeted) {
            // Unretweet
            RetweetStorage.removeRetweet(tweetId, currentUserId);
            updateTweetRetweetUI(tweetId, false);
            showToast('Retweet removed', 'success');
        } else {
            // Retweet
            const result = await createRetweetTransaction(tweetId);
            if (result.success) {
                RetweetStorage.addRetweet(tweetId, currentUserId);
                updateTweetRetweetUI(tweetId, true);
                showToast(SUCCESS_MESSAGES.TWEET.RETWEETED, 'success');
            }
        }
    } catch (error) {
        console.error('Error handling retweet:', error);
        showToast(error.message || 'Failed to retweet', 'error');
    }
}

/**
 * Handle tweet comment action
 * @param {string} tweetId - Tweet ID to comment on
 */
function handleComment(tweetId) {
    // Focus on tweet composer and add reply context
    const tweetText = document.getElementById('tweet-text');
    if (tweetText) {
        tweetText.focus();
        // You could add a reply indicator here
        showToast('Reply feature coming soon!', 'info');
    }
}

/**
 * Handle tweet share action
 * @param {string} tweetId - Tweet ID to share
 */
async function handleShare(tweetId) {
    try {
        const tweet = TweetStorage.getTweets().find(t => t.id === tweetId);
        if (!tweet) {
            showToast('Tweet not found', 'error');
            return;
        }

        const shareText = `${tweet.content}\n\nShared from SEDDIT`;
        const shareUrl = `${window.location.origin}?tweet=${tweetId}`;

        if (navigator.share) {
            await navigator.share({
                title: 'SEDDIT Tweet',
                text: shareText,
                url: shareUrl
            });
        } else {
            // Fallback to clipboard
            const success = await copyToClipboard(`${shareText}\n${shareUrl}`);
            if (success) {
                showToast('Tweet link copied to clipboard!', 'success');
            } else {
                showToast('Failed to copy tweet link', 'error');
            }
        }
    } catch (error) {
        console.error('Error sharing tweet:', error);
        showToast('Failed to share tweet', 'error');
    }
}

/**
 * Update tweet like UI
 * @param {string} tweetId - Tweet ID
 * @param {boolean} isLiked - Whether tweet is liked
 */
function updateTweetLikeUI(tweetId, isLiked) {
    const tweetElement = document.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (!tweetElement) return;

    const likeButton = tweetElement.querySelector('.tweet-action.like');
    const likeCount = tweetElement.querySelector('.tweet-action.like span');
    
    if (likeButton && likeCount) {
        if (isLiked) {
            likeButton.classList.add('liked');
        } else {
            likeButton.classList.remove('liked');
        }
        
        const newCount = LikeStorage.getLikeCount(tweetId);
        likeCount.textContent = formatNumber(newCount);
    }
}

/**
 * Update tweet retweet UI
 * @param {string} tweetId - Tweet ID
 * @param {boolean} isRetweeted - Whether tweet is retweeted
 */
function updateTweetRetweetUI(tweetId, isRetweeted) {
    const tweetElement = document.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (!tweetElement) return;

    const retweetButton = tweetElement.querySelector('.tweet-action.retweet');
    const retweetCount = tweetElement.querySelector('.tweet-action.retweet span');
    
    if (retweetButton && retweetCount) {
        if (isRetweeted) {
            retweetButton.classList.add('retweeted');
        } else {
            retweetButton.classList.remove('retweeted');
        }
        
        const newCount = RetweetStorage.getRetweetCount(tweetId);
        retweetCount.textContent = formatNumber(newCount);
    }
}

/**
 * Create a new tweet
 * @param {string} content - Tweet content
 * @param {object} imageData - Optional image data
 * @returns {object} Created tweet object
 */
function createTweet(content, imageData = null) {
    const currentUserId = getWalletAddress();
    
    const tweet = {
        id: generateId(),
        content: content.trim(),
        authorId: currentUserId,
        authorName: getUserDisplayName(),
        authorUsername: getUserUsername(),
        authorAvatar: getUserAvatarUrl(),
        timestamp: Date.now(),
        likes: 0,
        retweets: 0,
        comments: 0
    };

    // Add image if provided
    if (imageData && imageData.success) {
        tweet.image = {
            url: imageData.url,
            filename: imageData.filename,
            size: imageData.size
        };
    }

    // Add to storage
    TweetStorage.addTweet(tweet);

    return tweet;
}

/**
 * Render tweet feed
 * @param {Array} tweets - Array of tweets to render
 * @param {HTMLElement} container - Container element
 */
function renderTweetFeed(tweets, container) {
    if (!container) return;

    // Clear container
    container.innerHTML = '';

    if (tweets.length === 0) {
        // Show empty state
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-feather"></i>
                <h3>No tweets yet</h3>
                <p>Be the first to share what's happening on Solana!</p>
            </div>
        `;
        return;
    }

    // Render tweets
    tweets.forEach(tweet => {
        const tweetElement = createTweetElement(tweet);
        container.appendChild(tweetElement);
    });
}

/**
 * Add tweet to feed
 * @param {object} tweet - Tweet object to add
 * @param {HTMLElement} container - Container element
 */
function addTweetToFeed(tweet, container) {
    if (!container) return;

    const tweetElement = createTweetElement(tweet);
    
    // Insert at the top
    if (container.firstChild) {
        container.insertBefore(tweetElement, container.firstChild);
    } else {
        container.appendChild(tweetElement);
    }
}

/**
 * Remove tweet from feed
 * @param {string} tweetId - Tweet ID to remove
 * @param {HTMLElement} container - Container element
 */
function removeTweetFromFeed(tweetId, container) {
    if (!container) return;

    const tweetElement = container.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (tweetElement) {
        tweetElement.remove();
    }
}

/**
 * Update tweet in feed
 * @param {string} tweetId - Tweet ID to update
 * @param {object} updates - Updates to apply
 * @param {HTMLElement} container - Container element
 */
function updateTweetInFeed(tweetId, updates, container) {
    if (!container) return;

    const tweetElement = container.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (tweetElement) {
        // Remove old element
        tweetElement.remove();
        
        // Get updated tweet data
        const tweets = TweetStorage.getTweets();
        const updatedTweet = tweets.find(t => t.id === tweetId);
        
        if (updatedTweet) {
            // Create new element with updated data
            const newTweetElement = createTweetElement(updatedTweet);
            
            // Insert at the same position
            const nextSibling = tweetElement.nextSibling;
            if (nextSibling) {
                container.insertBefore(newTweetElement, nextSibling);
            } else {
                container.appendChild(newTweetElement);
            }
        }
    }
}

/**
 * Create loading skeleton for tweets
 * @param {number} count - Number of skeleton tweets to create
 * @returns {Array} Array of skeleton elements
 */
function createTweetSkeletons(count = 3) {
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-tweet';
        skeleton.innerHTML = `
            <div class="skeleton-avatar skeleton"></div>
            <div class="skeleton-content">
                <div class="skeleton-header">
                    <div class="skeleton-name skeleton"></div>
                    <div class="skeleton-username skeleton"></div>
                </div>
                <div class="skeleton-text skeleton"></div>
                <div class="skeleton-text skeleton"></div>
                <div class="skeleton-actions">
                    <div class="skeleton-action skeleton"></div>
                    <div class="skeleton-action skeleton"></div>
                    <div class="skeleton-action skeleton"></div>
                    <div class="skeleton-action skeleton"></div>
                </div>
            </div>
        `;
        skeletons.push(skeleton);
    }
    
    return skeletons;
}

/**
 * Show loading state in feed
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeleton tweets
 */
function showTweetLoading(container, count = 3) {
    if (!container) return;

    const skeletons = createTweetSkeletons(count);
    skeletons.forEach(skeleton => {
        container.appendChild(skeleton);
    });
}

/**
 * Hide loading state in feed
 * @param {HTMLElement} container - Container element
 */
function hideTweetLoading(container) {
    if (!container) return;

    const skeletons = container.querySelectorAll('.skeleton-tweet');
    skeletons.forEach(skeleton => {
        skeleton.remove();
    });
}

/**
 * Get tweet by ID
 * @param {string} tweetId - Tweet ID
 * @returns {object|null} Tweet object or null
 */
function getTweetById(tweetId) {
    const tweets = TweetStorage.getTweets();
    return tweets.find(tweet => tweet.id === tweetId) || null;
}

/**
 * Get tweets by user
 * @param {string} userId - User ID
 * @returns {Array} Array of user's tweets
 */
function getTweetsByUser(userId) {
    return TweetStorage.getTweetsByUser(userId);
}

/**
 * Delete tweet
 * @param {string} tweetId - Tweet ID to delete
 * @param {HTMLElement} container - Container element
 */
function deleteTweet(tweetId, container) {
    // Remove from storage
    TweetStorage.removeTweet(tweetId);
    
    // Remove from UI
    removeTweetFromFeed(tweetId, container);
    
    // Remove associated likes and retweets
    const likes = LikeStorage.getLikes();
    const retweets = RetweetStorage.getRetweets();
    
    const filteredLikes = likes.filter(like => like.tweetId !== tweetId);
    const filteredRetweets = retweets.filter(retweet => retweet.tweetId !== tweetId);
    
    storage.set('likes', filteredLikes);
    storage.set('retweets', filteredRetweets);
}

// Export tweet functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createTweetElement,
        handleLike,
        handleRetweet,
        handleComment,
        handleShare,
        updateTweetLikeUI,
        updateTweetRetweetUI,
        createTweet,
        renderTweetFeed,
        addTweetToFeed,
        removeTweetFromFeed,
        updateTweetInFeed,
        createTweetSkeletons,
        showTweetLoading,
        hideTweetLoading,
        getTweetById,
        getTweetsByUser,
        deleteTweet
    };
} 