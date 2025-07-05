// Wallet hook for managing Phantom wallet connections

/**
 * Wallet connection state
 */
let walletState = {
    connected: false,
    publicKey: null,
    address: null,
    balance: 0,
    loading: false,
    error: null
};

/**
 * Wallet connection callbacks
 */
let walletCallbacks = {
    onConnect: null,
    onDisconnect: null,
    onError: null,
    onBalanceChange: null
};

/**
 * Initialize wallet connection
 */
function initWallet() {
    // Check if Phantom wallet is installed
    if (!window.solana || !window.solana.isPhantom) {
        console.error('Phantom wallet is not installed');
        walletState.error = ERROR_MESSAGES.WALLET.NOT_INSTALLED;
        return false;
    }

    // Set up wallet event listeners
    window.solana.on('connect', handleWalletConnect);
    window.solana.on('disconnect', handleWalletDisconnect);
    window.solana.on('accountChanged', handleAccountChanged);

    // Check if already connected
    if (window.solana.isConnected) {
        handleWalletConnect();
    }

    return true;
}

/**
 * Handle wallet connection
 */
function handleWalletConnect() {
    try {
        const publicKey = window.solana.publicKey;
        const address = publicKey.toString();
        
        walletState = {
            ...walletState,
            connected: true,
            publicKey,
            address,
            error: null
        };

        // Update UI
        updateWalletUI();
        
        // Fetch balance
        fetchWalletBalance();
        
        // Save connection state
        WalletStorage.setConnectionState({
            connected: true,
            address,
            publicKey: publicKey.toString()
        });

        // Call callback
        if (walletCallbacks.onConnect) {
            walletCallbacks.onConnect(walletState);
        }

        console.log('Wallet connected:', address);
    } catch (error) {
        console.error('Error connecting wallet:', error);
        handleWalletError(error);
    }
}

/**
 * Handle wallet disconnection
 */
function handleWalletDisconnect() {
    walletState = {
        ...walletState,
        connected: false,
        publicKey: null,
        address: null,
        balance: 0,
        error: null
    };

    // Update UI
    updateWalletUI();
    
    // Clear connection state
    WalletStorage.clearConnectionState();

    // Call callback
    if (walletCallbacks.onDisconnect) {
        walletCallbacks.onDisconnect();
    }

    console.log('Wallet disconnected');
}

/**
 * Handle account change
 */
function handleAccountChanged(publicKey) {
    if (publicKey) {
        handleWalletConnect();
    } else {
        handleWalletDisconnect();
    }
}

/**
 * Handle wallet errors
 */
function handleWalletError(error) {
    walletState = {
        ...walletState,
        error: error.message || ERROR_MESSAGES.WALLET.CONNECTION_FAILED,
        loading: false
    };

    // Update UI
    updateWalletUI();

    // Call callback
    if (walletCallbacks.onError) {
        walletCallbacks.onError(error);
    }

    console.error('Wallet error:', error);
}

/**
 * Connect to Phantom wallet
 */
async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) {
        const error = new Error(ERROR_MESSAGES.WALLET.NOT_INSTALLED);
        handleWalletError(error);
        return false;
    }

    try {
        walletState.loading = true;
        updateWalletUI();

        const response = await window.solana.connect();
        return true;
    } catch (error) {
        handleWalletError(error);
        return false;
    }
}

/**
 * Disconnect from Phantom wallet
 */
async function disconnectWallet() {
    if (!window.solana) return;

    try {
        await window.solana.disconnect();
    } catch (error) {
        console.error('Error disconnecting wallet:', error);
    }
}

/**
 * Fetch wallet balance
 */
async function fetchWalletBalance() {
    if (!walletState.connected || !walletState.publicKey) return;

    try {
        // Create connection to Solana
        const connection = new solanaWeb3.Connection(SOLANA_CONFIG.MAINNET.endpoint);
        
        // Get SOL balance
        const solBalance = await connection.getBalance(walletState.publicKey);
        
        // Get USDC balance (you would need to implement token account lookup)
        // For now, we'll use a placeholder
        const usdcBalance = 0; // This would be fetched from token account
        
        walletState = {
            ...walletState,
            balance: solBalance
        };

        // Update UI
        updateWalletUI();
        
        // Save balance
        WalletStorage.setBalance(solBalance);

        // Call callback
        if (walletCallbacks.onBalanceChange) {
            walletCallbacks.onBalanceChange(solBalance);
        }

        console.log('Balance updated:', solBalance);
    } catch (error) {
        console.error('Error fetching balance:', error);
    }
}

/**
 * Update wallet UI elements
 */
function updateWalletUI() {
    const walletStatus = document.getElementById('wallet-status');
    const connectButton = document.getElementById('connect-wallet');
    const walletInfo = document.getElementById('wallet-info');
    const walletAddress = document.getElementById('wallet-address');
    const walletBalance = document.getElementById('wallet-balance');
    const userAvatar = document.getElementById('user-avatar');

    if (!walletStatus || !connectButton) return;

    if (walletState.connected) {
        // Update wallet status
        walletStatus.innerHTML = `
            <i class="fas fa-wallet"></i>
            <span>Connected</span>
        `;
        walletStatus.className = 'wallet-status connected';

        // Update connect button
        connectButton.innerHTML = `
            <i class="fas fa-plug"></i>
            Disconnect
        `;
        connectButton.onclick = disconnectWallet;

        // Show wallet info
        if (walletInfo) {
            walletInfo.style.display = 'block';
        }

        // Update wallet address
        if (walletAddress) {
            walletAddress.textContent = truncateAddress(walletState.address);
        }

        // Update wallet balance
        if (walletBalance) {
            const solBalance = walletState.balance / 1e9; // Convert lamports to SOL
            walletBalance.textContent = `${solBalance.toFixed(4)} SOL`;
        }

        // Update user avatar
        if (userAvatar) {
            userAvatar.src = generateAvatarUrl(walletState.address);
        }
    } else {
        // Update wallet status
        walletStatus.innerHTML = `
            <i class="fas fa-wallet"></i>
            <span>Connect Wallet</span>
        `;
        walletStatus.className = 'wallet-status';

        // Update connect button
        connectButton.innerHTML = `
            <i class="fas fa-plug"></i>
            Connect Phantom
        `;
        connectButton.onclick = connectWallet;

        // Hide wallet info
        if (walletInfo) {
            walletInfo.style.display = 'none';
        }

        // Reset user avatar
        if (userAvatar) {
            userAvatar.src = 'https://via.placeholder.com/40';
        }
    }

    // Handle loading state
    if (walletState.loading) {
        connectButton.disabled = true;
        connectButton.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Connecting...
        `;
    } else {
        connectButton.disabled = false;
    }

    // Handle error state
    if (walletState.error) {
        walletStatus.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>Error</span>
        `;
        walletStatus.className = 'wallet-status error';
    }
}

/**
 * Get current wallet state
 */
function getWalletState() {
    return { ...walletState };
}

/**
 * Check if wallet is connected
 */
function isWalletConnected() {
    return walletState.connected;
}

/**
 * Get wallet address
 */
function getWalletAddress() {
    return walletState.address;
}

/**
 * Get wallet public key
 */
function getWalletPublicKey() {
    return walletState.publicKey;
}

/**
 * Get wallet balance
 */
function getWalletBalance() {
    return walletState.balance;
}

/**
 * Set wallet callbacks
 */
function setWalletCallbacks(callbacks) {
    walletCallbacks = { ...walletCallbacks, ...callbacks };
}

/**
 * Check if user has sufficient balance for action
 */
function hasSufficientBalance(requiredAmount) {
    // Convert required amount to lamports (assuming SOL for now)
    const requiredLamports = requiredAmount * 1e9;
    return walletState.balance >= requiredLamports;
}

/**
 * Get user display name
 */
function getUserDisplayName() {
    if (!walletState.address) return 'Anonymous User';
    return generateDisplayName(walletState.address);
}

/**
 * Get user username
 */
function getUserUsername() {
    if (!walletState.address) return 'anonymous';
    return generateUsername(walletState.address);
}

/**
 * Get user avatar URL
 */
function getUserAvatarUrl() {
    if (!walletState.address) return 'https://via.placeholder.com/40';
    return generateAvatarUrl(walletState.address);
}

/**
 * Sign a message with the wallet
 */
async function signMessage(message) {
    if (!walletState.connected || !window.solana) {
        throw new Error('Wallet not connected');
    }

    try {
        const encodedMessage = new TextEncoder().encode(message);
        const signedMessage = await window.solana.signMessage(encodedMessage, 'utf8');
        return signedMessage;
    } catch (error) {
        console.error('Error signing message:', error);
        throw error;
    }
}

/**
 * Sign a transaction
 */
async function signTransaction(transaction) {
    if (!walletState.connected || !window.solana) {
        throw new Error('Wallet not connected');
    }

    try {
        const signedTransaction = await window.solana.signTransaction(transaction);
        return signedTransaction;
    } catch (error) {
        console.error('Error signing transaction:', error);
        throw error;
    }
}

/**
 * Sign all transactions
 */
async function signAllTransactions(transactions) {
    if (!walletState.connected || !window.solana) {
        throw new Error('Wallet not connected');
    }

    try {
        const signedTransactions = await window.solana.signAllTransactions(transactions);
        return signedTransactions;
    } catch (error) {
        console.error('Error signing transactions:', error);
        throw error;
    }
}

/**
 * Request airdrop (for testing on devnet)
 */
async function requestAirdrop(amount = 1) {
    if (!walletState.connected || !walletState.publicKey) {
        throw new Error('Wallet not connected');
    }

    try {
        const connection = new solanaWeb3.Connection(SOLANA_CONFIG.DEVNET.endpoint);
        const signature = await connection.requestAirdrop(
            walletState.publicKey,
            amount * solanaWeb3.LAMPORTS_PER_SOL
        );
        
        await connection.confirmTransaction(signature);
        
        // Refresh balance
        await fetchWalletBalance();
        
        return signature;
    } catch (error) {
        console.error('Error requesting airdrop:', error);
        throw error;
    }
}

// Export wallet functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initWallet,
        connectWallet,
        disconnectWallet,
        getWalletState,
        isWalletConnected,
        getWalletAddress,
        getWalletPublicKey,
        getWalletBalance,
        setWalletCallbacks,
        hasSufficientBalance,
        getUserDisplayName,
        getUserUsername,
        getUserAvatarUrl,
        signMessage,
        signTransaction,
        signAllTransactions,
        requestAirdrop
    };
} 