// Image upload component for TOAST

/**
 * Create image upload element
 * @param {string} type - Type of upload ('profile' or 'tweet')
 * @param {function} onUpload - Callback when image is uploaded
 * @returns {HTMLElement} Upload element
 */
function createImageUploadElement(type = 'tweet', onUpload = null) {
    const uploadElement = document.createElement('div');
    uploadElement.className = 'image-upload';
    uploadElement.dataset.type = type;

    const maxSize = type === 'profile' ? IMAGE_CONFIG.MAX_PROFILE_SIZE : IMAGE_CONFIG.MAX_TWEET_IMAGE_SIZE;
    const maxSizeKB = maxSize / 1024;

    uploadElement.innerHTML = `
        <div class="upload-area" data-type="${type}">
            <div class="upload-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p class="upload-text">Click to upload or drag & drop</p>
                <p class="upload-hint">${type === 'profile' ? 'Profile picture' : 'Tweet image'} (max ${maxSizeKB}KB)</p>
                ${type === 'profile' ? '<p class="upload-fee"><i class="fas fa-dollar-sign"></i> $1.00 fee</p>' : ''}
                <p class="upload-formats">JPEG, PNG, GIF, WebP</p>
            </div>
            <input type="file" class="file-input" accept="image/*" style="display: none;">
        </div>
        <div class="upload-preview" style="display: none;">
            <img class="preview-image" alt="Preview">
            <div class="preview-actions">
                <button class="btn btn-sm btn-secondary remove-image">
                    <i class="fas fa-trash"></i>
                    Remove
                </button>
            </div>
        </div>
        <div class="upload-progress" style="display: none;">
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
            <span class="progress-text">Uploading...</span>
        </div>
        <div class="upload-error" style="display: none;">
            <i class="fas fa-exclamation-triangle"></i>
            <span class="error-text"></span>
        </div>
    `;

    // Add event listeners
    setupImageUploadEvents(uploadElement, onUpload);

    return uploadElement;
}

/**
 * Setup image upload event listeners
 * @param {HTMLElement} element - Upload element
 * @param {function} onUpload - Upload callback
 */
function setupImageUploadEvents(element, onUpload) {
    const uploadArea = element.querySelector('.upload-area');
    const fileInput = element.querySelector('.file-input');
    const preview = element.querySelector('.upload-preview');
    const previewImage = element.querySelector('.preview-image');
    const removeButton = element.querySelector('.remove-image');
    const progress = element.querySelector('.upload-progress');
    const error = element.querySelector('.upload-error');
    const type = element.dataset.type;

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleFileUpload(file, element, onUpload);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            await handleFileUpload(file, element, onUpload);
        }
    });

    // Remove image
    removeButton.addEventListener('click', () => {
        clearImageUpload(element);
        if (onUpload) {
            onUpload(null);
        }
    });
}

/**
 * Handle file upload
 * @param {File} file - File to upload
 * @param {HTMLElement} element - Upload element
 * @param {function} onUpload - Upload callback
 */
async function handleFileUpload(file, element, onUpload) {
    const type = element.dataset.type;
    const uploadArea = element.querySelector('.upload-area');
    const preview = element.querySelector('.upload-preview');
    const previewImage = element.querySelector('.preview-image');
    const progress = element.querySelector('.upload-progress');
    const error = element.querySelector('.upload-error');

    // Clear previous error
    hideUploadError(element);

    // Validate file
    const validation = validateImage(file, type);
    if (!validation.isValid) {
        showUploadError(element, validation.errors.join(' '));
        return;
    }

    // Show progress
    showUploadProgress(element);

    try {
        // For profile pictures, check if user has sufficient balance first
        if (type === 'profile') {
            const requiredBalance = TRANSACTION_CONFIG.FEES.PROFILE_PICTURE;
            if (!hasSufficientBalance(requiredBalance)) {
                showUploadError(element, `Insufficient USDC balance. Required: $${requiredBalance}`);
                return;
            }
        }
        
        // Upload image
        const result = await uploadImage(file, type);
        
        if (result.success) {
            // For profile pictures, process the transaction
            if (type === 'profile') {
                try {
                    const transactionResult = await createProfilePictureTransaction();
                    if (transactionResult.success) {
                        // Show preview
                        previewImage.src = result.url;
                        uploadArea.style.display = 'none';
                        preview.style.display = 'block';
                        
                        // Call callback
                        if (onUpload) {
                            onUpload(result);
                        }
                        
                        showToast(SUCCESS_MESSAGES.PROFILE.UPDATED, 'success');
                    } else {
                        showUploadError(element, 'Transaction failed. Please try again.');
                    }
                } catch (txError) {
                    showUploadError(element, txError.message || 'Transaction failed');
                }
            } else {
                // For tweet images, no transaction needed
                previewImage.src = result.url;
                uploadArea.style.display = 'none';
                preview.style.display = 'block';
                
                // Call callback
                if (onUpload) {
                    onUpload(result);
                }
                
                showToast(`Image uploaded successfully! (${(result.size / 1024).toFixed(1)}KB)`, 'success');
            }
        } else {
            showUploadError(element, result.error);
        }
    } catch (err) {
        showUploadError(element, err.message || 'Upload failed');
    } finally {
        hideUploadProgress(element);
    }
}

/**
 * Show upload progress
 * @param {HTMLElement} element - Upload element
 */
function showUploadProgress(element) {
    const progress = element.querySelector('.upload-progress');
    progress.style.display = 'block';
}

/**
 * Hide upload progress
 * @param {HTMLElement} element - Upload element
 */
function hideUploadProgress(element) {
    const progress = element.querySelector('.upload-progress');
    progress.style.display = 'none';
}

/**
 * Show upload error
 * @param {HTMLElement} element - Upload element
 * @param {string} message - Error message
 */
function showUploadError(element, message) {
    const error = element.querySelector('.upload-error');
    const errorText = element.querySelector('.error-text');
    errorText.textContent = message;
    error.style.display = 'block';
}

/**
 * Hide upload error
 * @param {HTMLElement} element - Upload element
 */
function hideUploadError(element) {
    const error = element.querySelector('.upload-error');
    error.style.display = 'none';
}

/**
 * Clear image upload
 * @param {HTMLElement} element - Upload element
 */
function clearImageUpload(element) {
    const uploadArea = element.querySelector('.upload-area');
    const preview = element.querySelector('.upload-preview');
    const fileInput = element.querySelector('.file-input');
    
    uploadArea.style.display = 'block';
    preview.style.display = 'none';
    fileInput.value = '';
    hideUploadError(element);
}

/**
 * Get uploaded image from element
 * @param {HTMLElement} element - Upload element
 * @returns {object|null} Image data or null
 */
function getUploadedImage(element) {
    const previewImage = element.querySelector('.preview-image');
    if (previewImage && previewImage.src && !previewImage.src.includes('data:image/svg')) {
        return {
            url: previewImage.src,
            filename: previewImage.dataset.filename
        };
    }
    return null;
}

/**
 * Set uploaded image in element
 * @param {HTMLElement} element - Upload element
 * @param {string} imageUrl - Image URL
 * @param {string} filename - Image filename
 */
function setUploadedImage(element, imageUrl, filename = null) {
    const uploadArea = element.querySelector('.upload-area');
    const preview = element.querySelector('.upload-preview');
    const previewImage = element.querySelector('.preview-image');
    
    if (imageUrl) {
        previewImage.src = imageUrl;
        if (filename) {
            previewImage.dataset.filename = filename;
        }
        uploadArea.style.display = 'none';
        preview.style.display = 'block';
    } else {
        clearImageUpload(element);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createImageUploadElement,
        setupImageUploadEvents,
        handleFileUpload,
        getUploadedImage,
        setUploadedImage,
        clearImageUpload
    };
} 