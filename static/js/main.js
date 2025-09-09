// Main JavaScript for 상상렌트카 - Optimized version
document.addEventListener('DOMContentLoaded', function() {
    // Register Service Worker for caching
    registerServiceWorker();

    // Detect WebP support for better image optimization
    detectWebPSupport();

    // Performance optimization: Use requestAnimationFrame for smooth animations
    requestAnimationFrame(() => {
        // Initialize lazy loading for images
        initLazyLoading();

        // Initialize animations
        initAnimations();

        // Initialize smooth scrolling
        initSmoothScrolling();

        // Initialize phone call handlers
        initPhoneHandlers();

        // Initialize image galleries
        initImageGalleries();

        // Initialize form enhancements
        initFormEnhancements();
    });
});

// Animation initialization
function initAnimations() {
    // Add fade-in animation to elements when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe car cards and other elements
    document.querySelectorAll('.car-card, .company-story-card, .wedding-photo-card').forEach(el => {
        observer.observe(el);
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Phone call handlers
function initPhoneHandlers() {
    // Add click tracking for phone calls
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function() {
            // Track phone call attempts (for analytics if needed)
            console.log('Phone call initiated:', this.href);
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
}

// Image gallery functionality - Optimized for performance
function initImageGalleries() {
    // Modern carousel implementation without Bootstrap dependency
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        initModernCarousel(carousel);
    });

    // Wedding gallery lightbox functionality
    initWeddingGallery();
}

// Modern carousel implementation
function initModernCarousel(carousel) {
    const items = carousel.querySelectorAll('.carousel-item');
    const indicators = carousel.querySelectorAll('.carousel-indicator');
    let currentIndex = 0;
    let intervalId = null;

    function showSlide(index) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        currentIndex = index;
    }

    function nextSlide() {
        const nextIndex = (currentIndex + 1) % items.length;
        showSlide(nextIndex);
    }

    function startAutoPlay() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    // Initialize
    showSlide(0);
    startAutoPlay();

    // Event listeners
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });
}

// Wedding gallery initialization
function initWeddingGallery() {
    const weddingCards = document.querySelectorAll('.wedding-photo-card');
    
    weddingCards.forEach(card => {
        card.addEventListener('click', function() {
            const imageSrc = this.getAttribute('data-image');
            const modalImage = document.querySelector('#modalImage');
            
            if (modalImage && imageSrc) {
                modalImage.src = imageSrc;
            }
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Form enhancements - Optimized version
function initFormEnhancements() {
    // Add loading states to forms with better UX
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                // Prevent double submission
                submitBtn.disabled = true;
                const originalText = submitBtn.innerHTML;

                // Add loading spinner
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    처리중...
                `;

                // Re-enable button after 10 seconds as fallback
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }, 10000);
            }
        });
    });

    // File upload preview for admin car form - Optimized
    const imageInput = document.querySelector('input[name="images"]');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewImages(this);
        });
    }

    // Auto-format phone numbers with better validation
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });

        // Add input validation
        input.addEventListener('blur', function() {
            if (this.value && !isValidPhoneNumber(this.value)) {
                this.classList.add('border-red-500');
                showValidationError(this, '올바른 전화번호 형식을 입력해주세요');
            } else {
                this.classList.remove('border-red-500');
                hideValidationError(this);
            }
        });
    });
}

// Phone number validation
function isValidPhoneNumber(phone) {
    // Vietnamese phone number validation
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9 && cleanPhone.length <= 12;
}

// Validation error display
function showValidationError(input, message) {
    let errorElement = input.parentNode.querySelector('.validation-error');
    if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'validation-error text-red-500 text-sm mt-1';
        input.parentNode.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function hideValidationError(input) {
    const errorElement = input.parentNode.querySelector('.validation-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Image preview functionality
function previewImages(input) {
    const files = input.files;
    const previewContainer = document.createElement('div');
    previewContainer.className = 'mt-3 row';
    previewContainer.id = 'imagePreview';
    
    // Remove existing preview
    const existingPreview = document.querySelector('#imagePreview');
    if (existingPreview) {
        existingPreview.remove();
    }
    
    if (files.length > 0) {
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const col = document.createElement('div');
                    col.className = 'col-md-3 mb-2';
                    
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.className = 'img-thumbnail';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    
                    col.appendChild(img);
                    previewContainer.appendChild(col);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.parentNode.insertBefore(previewContainer, input.nextSibling);
    }
}

// Phone number formatting
function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    // Format for Vietnamese numbers
    if (value.startsWith('84')) {
        value = '+84 ' + value.substring(2);
    } else if (value.startsWith('0')) {
        value = '+84 ' + value.substring(1);
    }
    
    input.value = value;
}

// Service Worker registration for caching and offline support
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        // Only register in production or when explicitly enabled
        const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
        const isSecure = location.protocol === 'https:' || isLocalhost;

        if (isSecure) {
            navigator.serviceWorker.register('/static/js/sw.js', { scope: '/' })
                .then(registration => {
                    console.log('Service Worker registered successfully:', registration.scope);

                    // Handle updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content is available, show update notification
                                    showUpdateNotification();
                                }
                            });
                        }
                    });
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }
}

function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="font-medium">새로운 버전이 있습니다!</p>
                <p class="text-sm opacity-90">새로고침하여 업데이트하세요.</p>
            </div>
            <button onclick="location.reload()" class="ml-4 bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm font-medium transition-colors">
                새로고침
            </button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="absolute top-2 right-2 text-blue-200 hover:text-white">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 10000);
}

// WebP support detection for better image optimization
function detectWebPSupport() {
    // Check WebP support using canvas
    function checkWebP() {
        return new Promise(resolve => {
            const webP = new Image();
            webP.onload = webP.onerror = function() {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Add appropriate class to body based on WebP support
    checkWebP().then(hasWebP => {
        document.documentElement.classList.add(hasWebP ? 'webp' : 'no-webp');

        // Store in localStorage for future visits
        localStorage.setItem('webp-support', hasWebP ? 'true' : 'false');
    });

    // Use cached result if available
    const cached = localStorage.getItem('webp-support');
    if (cached !== null) {
        document.documentElement.classList.add(cached === 'true' ? 'webp' : 'no-webp');
    }
}

// Lazy loading for images - Performance optimization
function initLazyLoading() {
    // Check if browser supports Intersection Observer
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            // Load images 50px before they enter the viewport
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });

        // Also observe regular images for progressive enhancement
        const regularImages = document.querySelectorAll('img:not([data-src])');
        regularImages.forEach(img => {
            // Add loading="lazy" if not already present
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    } else {
        // Fallback for browsers without Intersection Observer
        loadAllImages();
    }
}

function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (src) {
        img.src = src;
        img.removeAttribute('data-src');

        // Add loading class for smooth transition
        img.classList.add('image-loading');

        img.addEventListener('load', function() {
            img.classList.remove('image-loading');
            img.classList.add('image-loaded');
        });

        img.addEventListener('error', function() {
            // Fallback to placeholder on error
            img.src = '/static/images/placeholder.jpg';
        });
    }
}

function loadAllImages() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => loadImage(img));
}

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '100px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Loading overlay
function showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.className = 'position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
    overlay.style.zIndex = '9999';
    overlay.innerHTML = `
        <div class="text-center">
            <i class="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
            <p class="h5">로딩중...</p>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoadingOverlay() {
    const overlay = document.querySelector('#loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Export functions for use in other scripts
window.V0RentCar = {
    showNotification,
    showLoadingOverlay,
    hideLoadingOverlay,
    formatPhoneNumber
};

// Easter egg - Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length && 
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        // Add special effect
        document.body.style.animation = 'rainbow 2s linear infinite';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 5000);
        
        showNotification('🚀 상상렌트카 숨겨진 기능이 활성화되었습니다!', 'info');
    }
});

// Add rainbow animation
const rainbowCSS = `
@keyframes rainbow {
    0% { filter: hue-rotate(0deg); }
    100% { filter: hue-rotate(360deg); }
}
`;

const style = document.createElement('style');
style.textContent = rainbowCSS;
document.head.appendChild(style);
