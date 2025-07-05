// Main app entry point for SEDDIT

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    ThemeStorage.initTheme();

    // Initialize wallet
    initWallet();

    // Initialize toast system
    initToast();

    // Initialize feed
    initFeed();

    // Add sample tweets if feed is empty (for demo)
    if (TweetStorage.getTweets().length === 0) {
        addSampleTweets();
    }

    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const newTheme = ThemeStorage.toggleTheme();
            showToast(`Switched to ${newTheme} mode`, 'info');
        });
    }

    // Wallet connect button (redundant, handled in wallet hook, but for safety)
    const connectWalletBtn = document.getElementById('connect-wallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    // Listen for wallet connection changes
    setWalletCallbacks({
        onConnect: (state) => showWalletToast('Wallet connected', 'connected'),
        onDisconnect: () => showWalletToast('Wallet disconnected', 'disconnected'),
        onError: (error) => showWalletToast(error.message || 'Wallet error', 'error'),
        onBalanceChange: (balance) => {
            // Optionally update UI or show toast
        }
    });

    // Listen for transaction events
    setTransactionCallbacks({
        onTransactionStart: (tx) => showTransactionToast('Processing transaction...', 'pending', 0),
        onTransactionSuccess: (result) => showTransactionToast('Transaction successful!', 'success'),
        onTransactionError: (error) => showTransactionToast(error.message || 'Transaction failed', 'error'),
        onTransactionComplete: () => closeAllToasts()
    });

    // Responsive sidebar toggle (for mobile)
    // (Implementation can be added here if needed)
    
    // Add testing functions to global scope for debugging
    window.TOAST_DEBUG = {
        setUSDCBalance: (balance) => {
            if (typeof setUSDCBalance === 'function') {
                setUSDCBalance(balance);
                showToast(`USDC balance set to $${balance}`, 'success');
            }
        },
        getUSDCBalance: () => {
            if (typeof getUSDCBalance === 'function') {
                const balance = getUSDCBalance();
                console.log(`Current USDC balance: $${balance}`);
                return balance;
            }
        },
        testTransaction: () => {
            const balance = getUSDCBalance();
            const fee = TRANSACTION_CONFIG.FEES.POST_TWEET;
            console.log(`Testing transaction: Fee $${fee}, Balance $${balance}, Sufficient: ${hasSufficientBalance(fee)}`);
        },
        testProfilePictureTransaction: async () => {
            try {
                console.log('Testing profile picture transaction...');
                const result = await createProfilePictureTransaction();
                console.log('Profile picture transaction result:', result);
                return result;
            } catch (error) {
                console.error('Profile picture transaction failed:', error);
                throw error;
            }
        }
    };
    
    console.log('TOAST Debug functions available:');
    console.log('- TOAST_DEBUG.setUSDCBalance(amount) - Set USDC balance');
    console.log('- TOAST_DEBUG.getUSDCBalance() - Get current USDC balance');
    console.log('- TOAST_DEBUG.testTransaction() - Test transaction balance check');
    console.log('- TOAST_DEBUG.testProfilePictureTransaction() - Test profile picture transaction');

    // Show the X.com-style profile page
    function showProfilePage(userId = null) {
        document.getElementById('tweet-feed').style.display = 'none';
        document.getElementById('profile-main').style.display = 'block';
        const composer = document.querySelector('.tweet-composer');
        if (composer) composer.style.display = 'none';

        const currentUserId = getWalletAddress();
        const profileUserId = userId || currentUserId;
        const isOwnProfile = profileUserId === currentUserId;
        const displayName = getUserDisplayName(profileUserId);
        const username = getUserUsername(profileUserId);
        const avatarUrl = getUserAvatarUrl(profileUserId);
        const followers = FollowStorage.getFollowers(profileUserId);
        const following = FollowStorage.getFollowing(profileUserId);
        const address = profileUserId;
        document.getElementById('profile-main-avatar').src = avatarUrl;
        document.getElementById('profile-main-name').textContent = displayName;
        document.getElementById('profile-main-username').textContent = '@' + username;
        document.getElementById('profile-main-address').textContent = address ? (address.slice(0, 4) + '...' + address.slice(-4)) : '';
        document.getElementById('profile-main-followers').innerHTML = `<b>${followers.length}</b> Followers`;
        document.getElementById('profile-main-following').innerHTML = `<b>${following.length}</b> Following`;
        document.getElementById('profile-main-bio').textContent = isOwnProfile ? 'This is your profile.' : 'No bio yet.';
        const followBtn = document.getElementById('profile-main-follow-btn');
        if (isOwnProfile) {
            followBtn.style.display = 'none';
        } else {
            followBtn.style.display = 'inline-block';
            if (FollowStorage.isFollowing(currentUserId, profileUserId)) {
                followBtn.textContent = 'Unfollow';
                followBtn.classList.remove('btn-primary');
                followBtn.classList.add('btn-secondary');
            } else {
                followBtn.textContent = 'Follow';
                followBtn.classList.remove('btn-secondary');
                followBtn.classList.add('btn-primary');
            }
            followBtn.onclick = function() {
                if (FollowStorage.isFollowing(currentUserId, profileUserId)) {
                    FollowStorage.unfollowUser(currentUserId, profileUserId);
                } else {
                    FollowStorage.followUser(currentUserId, profileUserId);
                }
                showProfilePage(profileUserId);
                updateSidebarProfileMeta();
            };
        }
        renderProfileTweets(profileUserId);
    }

    function renderProfileTweets(userId) {
        const tweets = TweetStorage.getTweetsByUser(userId);
        const container = document.getElementById('profile-main-tweets');
        if (!container) return;
        if (!tweets || tweets.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-feather"></i><h3>No tweets yet</h3></div>`;
            return;
        }
        container.innerHTML = '';
        tweets.forEach(tweet => {
            const el = createTweetElement(tweet);
            container.appendChild(el);
        });
    }

    function updateSidebarProfileMeta() {
        const currentUserId = getWalletAddress();
        const followers = FollowStorage.getFollowers(currentUserId);
        const following = FollowStorage.getFollowing(currentUserId);
        document.getElementById('sidebar-followers').innerHTML = `<b>${followers.length}</b> Followers`;
        document.getElementById('sidebar-following').innerHTML = `<b>${following.length}</b> Following`;
    }

    function setupSidebarProfileLink() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.textContent.trim().toLowerCase() === 'profile') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    showProfilePage();
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            } else if (item.textContent.trim().toLowerCase() === 'home') {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.getElementById('tweet-feed').style.display = 'block';
                    document.getElementById('profile-main').style.display = 'none';
                    const composer = document.querySelector('.tweet-composer');
                    if (composer) composer.style.display = 'block';
                    navItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                });
            }
        });
    }

    function updateMobileConnectWalletButton() {
        const btn = document.getElementById('mobile-connect-wallet');
        if (!btn) return;
        if (window.innerWidth <= 900 && !isWalletConnected()) {
            btn.style.display = 'block';
        } else {
            btn.style.display = 'none';
        }
    }

    function setupMobileConnectWalletButton() {
        const btn = document.getElementById('mobile-connect-wallet');
        if (!btn) return;
        btn.onclick = connectWallet;
    }

    function setupBottomNav() {
        const navIds = ['nav-home', 'nav-explore', 'nav-notifications', 'nav-messages', 'nav-profile'];
        const mainSections = {
            'nav-home': 'tweet-feed',
            'nav-profile': 'profile-main',
            // Add more as you implement Explore, Notifications, Messages
        };
        navIds.forEach(id => {
            const nav = document.getElementById(id);
            if (!nav) return;
            nav.addEventListener('click', (e) => {
                e.preventDefault();
                // Highlight active
                navIds.forEach(i => {
                    const n = document.getElementById(i);
                    if (n) n.classList.remove('active');
                });
                nav.classList.add('active');
                // Show/hide main sections
                Object.values(mainSections).forEach(sec => {
                    const el = document.getElementById(sec);
                    if (el) el.style.display = 'none';
                });
                if (mainSections[id]) {
                    const el = document.getElementById(mainSections[id]);
                    if (el) el.style.display = 'block';
                }
                // Special: Home shows composer, Profile hides it
                const composer = document.querySelector('.tweet-composer');
                if (id === 'nav-home' && composer) composer.style.display = 'block';
                if (id === 'nav-profile' && composer) composer.style.display = 'none';
                if (id === 'nav-profile') showProfilePage();
            });
        });
    }

    // Update mobile connect wallet button on wallet state change
    function setupMobileWalletStateListeners() {
        setWalletCallbacks({
            onConnect: updateMobileConnectWalletButton,
            onDisconnect: updateMobileConnectWalletButton
        });
        window.addEventListener('resize', updateMobileConnectWalletButton);
    }

    setupSidebarProfileLink();
    updateSidebarProfileMeta();
    setupMobileConnectWalletButton();
    setupBottomNav();
    setupMobileWalletStateListeners();
    updateMobileConnectWalletButton();
}); 