// Main JavaScript for V0렌트카
document.addEventListener('DOMContentLoaded', function() {
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

// Image gallery functionality
function initImageGalleries() {
    // Car detail carousel auto-play pause on hover
    const carCarousel = document.querySelector('#carCarousel');
    if (carCarousel) {
        const carousel = new bootstrap.Carousel(carCarousel, {
            interval: 5000,
            wrap: true
        });
        
        carCarousel.addEventListener('mouseenter', () => {
            carousel.pause();
        });
        
        carCarousel.addEventListener('mouseleave', () => {
            carousel.cycle();
        });
    }
    
    // Wedding gallery lightbox functionality
    initWeddingGallery();
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

// Form enhancements
function initFormEnhancements() {
    // Add loading states to forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>처리중...';
                
                // Add loading class to form
                this.classList.add('loading');
            }
        });
    });
    
    // File upload preview for admin car form
    const imageInput = document.querySelector('input[name="images"]');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            previewImages(this);
        });
    }
    
    // Auto-format phone numbers
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
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
        
        showNotification('🚀 V0렌트카 숨겨진 기능이 활성화되었습니다!', 'info');
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
