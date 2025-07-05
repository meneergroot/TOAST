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
}); 