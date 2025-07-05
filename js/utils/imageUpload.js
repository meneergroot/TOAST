// Image upload utilities for TOAST

/**
 * Image configuration
 */
const IMAGE_CONFIG = {
    // Maximum file sizes (in bytes)
    MAX_PROFILE_SIZE: 100 * 1024, // 100KB
    MAX_TWEET_IMAGE_SIZE: 100 * 1024, // 100KB
    
    // Supported image types
    SUPPORTED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    
    // Image dimensions
    PROFILE_DIMENSIONS: {
        width: 200,
        height: 200
    },
    TWEET_IMAGE_DIMENSIONS: {
        width: 800,
        height: 600
    },
    
    // Storage paths
    STORAGE_PATH: 'images/',
    PROFILE_PREFIX: 'profile_',
    TWEET_PREFIX: 'tweet_'
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @param {string} type - Type of image ('profile' or 'tweet')
 * @returns {object} Validation result
 */
function validateImage(file, type = 'tweet') {
    const errors = [];
    
    // Check file type
    if (!IMAGE_CONFIG.SUPPORTED_TYPES.includes(file.type)) {
        errors.push('Unsupported file type. Please use JPEG, PNG, GIF, or WebP.');
    }
    
    // Check file size
    const maxSize = type === 'profile' ? IMAGE_CONFIG.MAX_PROFILE_SIZE : IMAGE_CONFIG.MAX_TWEET_IMAGE_SIZE;
    if (file.size > maxSize) {
        const maxSizeKB = maxSize / 1024;
        errors.push(`File size too large. Maximum size is ${maxSizeKB}KB.`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate unique filename
 * @param {string} prefix - File prefix
 * @param {string} extension - File extension
 * @returns {string} Unique filename
 */
function generateUniqueFilename(prefix, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}_${random}.${extension}`;
}

/**
 * Get file extension from MIME type
 * @param {string} mimeType - MIME type
 * @returns {string} File extension
 */
function getExtensionFromMimeType(mimeType) {
    const extensions = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp'
    };
    return extensions[mimeType] || 'jpg';
}

/**
 * Resize image using canvas
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {Promise<Blob>} Resized image blob
 */
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            // Set canvas dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to blob
            canvas.toBlob(resolve, file.type, 0.8);
        };
        
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Upload image file
 * @param {File} file - Image file to upload
 * @param {string} type - Type of image ('profile' or 'tweet')
 * @returns {Promise<object>} Upload result
 */
async function uploadImage(file, type = 'tweet') {
    try {
        // Validate file
        const validation = validateImage(file, type);
        if (!validation.isValid) {
            throw new Error(validation.errors.join(' '));
        }
        
        // Resize image if needed
        const dimensions = type === 'profile' ? IMAGE_CONFIG.PROFILE_DIMENSIONS : IMAGE_CONFIG.TWEET_IMAGE_DIMENSIONS;
        const resizedBlob = await resizeImage(file, dimensions.width, dimensions.height);
        
        // Generate filename
        const extension = getExtensionFromMimeType(file.type);
        const prefix = type === 'profile' ? IMAGE_CONFIG.PROFILE_PREFIX : IMAGE_CONFIG.TWEET_PREFIX;
        const filename = generateUniqueFilename(prefix, extension);
        
        // For GitHub Pages, we'll store the image data in localStorage
        // In a real app, you'd upload to a server
        const imageData = {
            filename,
            type: file.type,
            size: resizedBlob.size,
            data: await blobToBase64(resizedBlob),
            uploadedAt: Date.now(),
            uploadedBy: getWalletAddress() || 'anonymous'
        };
        
        // Store in localStorage
        ImageStorage.saveImage(filename, imageData);
        
        return {
            success: true,
            filename,
            url: `data:${file.type};base64,${imageData.data}`,
            size: resizedBlob.size
        };
        
    } catch (error) {
        console.error('Error uploading image:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Convert blob to base64
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} Base64 string
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Get image URL
 * @param {string} filename - Image filename
 * @returns {string} Image URL
 */
function getImageUrl(filename) {
    const imageData = ImageStorage.getImage(filename);
    if (imageData) {
        return `data:${imageData.type};base64,${imageData.data}`;
    }
    return null;
}

/**
 * Delete image
 * @param {string} filename - Image filename
 * @returns {boolean} Success status
 */
function deleteImage(filename) {
    return ImageStorage.deleteImage(filename);
}

/**
 * Get user's images
 * @param {string} userId - User ID
 * @returns {Array} User's images
 */
function getUserImages(userId) {
    return ImageStorage.getUserImages(userId);
}

/**
 * Get all images
 * @returns {Array} All images
 */
function getAllImages() {
    return ImageStorage.getAllImages();
}

/**
 * Clear all images
 */
function clearAllImages() {
    ImageStorage.clearAllImages();
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        IMAGE_CONFIG,
        validateImage,
        uploadImage,
        getImageUrl,
        deleteImage,
        getUserImages,
        getAllImages,
        clearAllImages
    };
} 