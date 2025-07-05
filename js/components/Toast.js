// Toast component for displaying notifications

/**
 * Toast queue
 */
let toastQueue = [];

/**
 * Active toasts
 */
let activeToasts = [];

/**
 * Toast container
 */
let toastContainer = null;

/**
 * Initialize toast system
 */
function initToast() {
    // Create toast container if it doesn't exist
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/**
 * Show a toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds (default: 5000)
 */
function showToast(message, type = 'info', duration = APP_CONFIG.UI.TOAST_DURATION) {
    if (!toastContainer) {
        initToast();
    }

    const toast = createToastElement(message, type);
    const toastId = generateId();
    toast.dataset.toastId = toastId;

    // Add to queue
    toastQueue.push({
        id: toastId,
        element: toast,
        duration: duration
    });

    // Process queue
    processToastQueue();
}

/**
 * Create toast element
 * @param {string} message - Toast message
 * @param {string} type - Toast type
 * @returns {HTMLElement} Toast element
 */
function createToastElement(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);
    
    toast.innerHTML = `
        <i class="toast-icon ${icon}"></i>
        <div class="toast-message">${escapeHtml(message)}</div>
        <button class="toast-close" onclick="closeToast(this.parentElement.dataset.toastId)">
            <i class="fas fa-times"></i>
        </button>
    `;

    return toast;
}

/**
 * Get icon for toast type
 * @param {string} type - Toast type
 * @returns {string} Icon class
 */
function getToastIcon(type) {
    switch (type) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'warning':
            return 'fas fa-exclamation-triangle';
        case 'info':
        default:
            return 'fas fa-info-circle';
    }
}

/**
 * Process toast queue
 */
function processToastQueue() {
    if (toastQueue.length === 0 || activeToasts.length >= 3) {
        return;
    }

    const toastData = toastQueue.shift();
    const { element, duration, id } = toastData;

    // Add to active toasts
    activeToasts.push(id);

    // Add to container
    toastContainer.appendChild(element);

    // Auto remove after duration
    if (duration > 0) {
        setTimeout(() => {
            closeToast(id);
        }, duration);
    }

    // Process next toast
    setTimeout(processToastQueue, 100);
}

/**
 * Close a specific toast
 * @param {string} toastId - Toast ID to close
 */
function closeToast(toastId) {
    const toast = toastContainer.querySelector(`[data-toast-id="${toastId}"]`);
    if (!toast) return;

    // Add removing class for animation
    toast.classList.add('removing');

    // Remove from active toasts
    activeToasts = activeToasts.filter(id => id !== toastId);

    // Remove element after animation
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        
        // Process queue for next toast
        processToastQueue();
    }, 300);
}

/**
 * Close all toasts
 */
function closeAllToasts() {
    const toasts = toastContainer.querySelectorAll('.toast');
    toasts.forEach(toast => {
        const toastId = toast.dataset.toastId;
        if (toastId) {
            closeToast(toastId);
        }
    });
}

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
function showSuccessToast(message, duration = APP_CONFIG.UI.TOAST_DURATION) {
    showToast(message, 'success', duration);
}

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
function showErrorToast(message, duration = APP_CONFIG.UI.TOAST_DURATION) {
    showToast(message, 'error', duration);
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
function showWarningToast(message, duration = APP_CONFIG.UI.TOAST_DURATION) {
    showToast(message, 'warning', duration);
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
function showInfoToast(message, duration = APP_CONFIG.UI.TOAST_DURATION) {
    showToast(message, 'info', duration);
}

/**
 * Show transaction status toast
 * @param {string} message - Status message
 * @param {string} status - Transaction status
 * @param {number} duration - Duration in milliseconds
 */
function showTransactionToast(message, status = 'pending', duration = 0) {
    let type = 'info';
    
    switch (status) {
        case 'success':
            type = 'success';
            break;
        case 'error':
            type = 'error';
            break;
        case 'pending':
            type = 'warning';
            break;
    }

    showToast(message, type, duration);
}

/**
 * Show wallet connection toast
 * @param {string} message - Connection message
 * @param {string} status - Connection status
 * @param {number} duration - Duration in milliseconds
 */
function showWalletToast(message, status = 'info', duration = APP_CONFIG.UI.TOAST_DURATION) {
    let type = 'info';
    
    switch (status) {
        case 'connected':
            type = 'success';
            break;
        case 'disconnected':
            type = 'warning';
            break;
        case 'error':
            type = 'error';
            break;
    }

    showToast(message, type, duration);
}

/**
 * Show loading toast (persistent until manually closed)
 * @param {string} message - Loading message
 * @returns {string} Toast ID for later closing
 */
function showLoadingToast(message = 'Loading...') {
    const toastId = generateId();
    const toast = createToastElement(message, 'info');
    toast.dataset.toastId = toastId;
    
    // Replace icon with spinner
    const icon = toast.querySelector('.toast-icon');
    icon.className = 'toast-icon fas fa-spinner fa-spin';
    
    // Remove close button for loading toasts
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.remove();
    }

    // Add to active toasts
    activeToasts.push(toastId);
    
    // Add to container
    if (!toastContainer) {
        initToast();
    }
    toastContainer.appendChild(toast);

    return toastId;
}

/**
 * Update loading toast message
 * @param {string} toastId - Toast ID
 * @param {string} message - New message
 */
function updateLoadingToast(toastId, message) {
    const toast = toastContainer.querySelector(`[data-toast-id="${toastId}"]`);
    if (toast) {
        const messageElement = toast.querySelector('.toast-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
}

/**
 * Show toast with action buttons
 * @param {string} message - Toast message
 * @param {Array} actions - Array of action objects with text and onClick
 * @param {string} type - Toast type
 * @param {number} duration - Duration in milliseconds
 */
function showActionToast(message, actions = [], type = 'info', duration = 0) {
    const toast = createToastElement(message, type);
    const toastId = generateId();
    toast.dataset.toastId = toastId;

    // Remove default close button
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.remove();
    }

    // Add action buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'toast-actions';
    
    actions.forEach((action, index) => {
        const button = document.createElement('button');
        button.className = `btn btn-sm ${action.primary ? 'btn-primary' : 'btn-secondary'}`;
        button.textContent = action.text;
        button.onclick = () => {
            if (action.onClick) {
                action.onClick();
            }
            closeToast(toastId);
        };
        actionsContainer.appendChild(button);
    });

    // Add close button if no actions
    if (actions.length === 0) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-sm btn-secondary';
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => closeToast(toastId);
        actionsContainer.appendChild(closeBtn);
    }

    toast.appendChild(actionsContainer);

    // Add to queue
    toastQueue.push({
        id: toastId,
        element: toast,
        duration: duration
    });

    // Process queue
    processToastQueue();
}

/**
 * Show confirmation toast
 * @param {string} message - Confirmation message
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @param {string} confirmText - Confirm button text
 * @param {string} cancelText - Cancel button text
 */
function showConfirmToast(message, onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel') {
    const actions = [
        {
            text: confirmText,
            primary: true,
            onClick: onConfirm
        },
        {
            text: cancelText,
            primary: false,
            onClick: onCancel
        }
    ];

    showActionToast(message, actions, 'warning', 0);
}

/**
 * Show input toast
 * @param {string} message - Input message
 * @param {Function} onSubmit - Submit callback with input value
 * @param {string} placeholder - Input placeholder
 * @param {string} submitText - Submit button text
 * @param {string} cancelText - Cancel button text
 */
function showInputToast(message, onSubmit, placeholder = '', submitText = 'Submit', cancelText = 'Cancel') {
    const toast = createToastElement(message, 'info');
    const toastId = generateId();
    toast.dataset.toastId = toastId;

    // Remove default close button
    const closeButton = toast.querySelector('.toast-close');
    if (closeButton) {
        closeButton.remove();
    }

    // Add input field
    const inputContainer = document.createElement('div');
    inputContainer.className = 'toast-input-container';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'toast-input';
    input.placeholder = placeholder;
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'toast-actions';
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-sm btn-primary';
    submitBtn.textContent = submitText;
    submitBtn.onclick = () => {
        const value = input.value.trim();
        if (value) {
            onSubmit(value);
            closeToast(toastId);
        }
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-sm btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => closeToast(toastId);
    
    actionsContainer.appendChild(submitBtn);
    actionsContainer.appendChild(cancelBtn);
    
    inputContainer.appendChild(input);
    inputContainer.appendChild(actionsContainer);
    toast.appendChild(inputContainer);

    // Add to queue
    toastQueue.push({
        id: toastId,
        element: toast,
        duration: 0
    });

    // Process queue
    processToastQueue();
    
    // Focus input
    setTimeout(() => {
        input.focus();
    }, 100);
}

/**
 * Get active toast count
 * @returns {number} Number of active toasts
 */
function getActiveToastCount() {
    return activeToasts.length;
}

/**
 * Get toast queue length
 * @returns {number} Number of toasts in queue
 */
function getToastQueueLength() {
    return toastQueue.length;
}

// Export toast functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initToast,
        showToast,
        showSuccessToast,
        showErrorToast,
        showWarningToast,
        showInfoToast,
        showTransactionToast,
        showWalletToast,
        showLoadingToast,
        updateLoadingToast,
        showActionToast,
        showConfirmToast,
        showInputToast,
        closeToast,
        closeAllToasts,
        getActiveToastCount,
        getToastQueueLength
    };
} 