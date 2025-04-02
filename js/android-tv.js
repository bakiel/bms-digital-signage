/**
 * BMS Digital Signage - Premium Edition
 * Android TV JavaScript (android-tv.js)
 * Optimized for Mi TV Stick with remote control navigation
 */

// Global variables
let products = [];
let categories = [];
let settings = {};
let currentSlideIndex = 0;
let slideInterval;
let isPaused = false;
let currentCategory = 'all';
let filteredProducts = [];
let isFullscreen = false;
let controlsTimeout;
let loadingProgress = 0;

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.getElementById('progress-bar');
const storeName = document.getElementById('store-name');
const weatherWidget = document.getElementById('weather-widget');
const clock = document.getElementById('clock');
const tickerContent = document.getElementById('ticker-content');
const categoryList = document.getElementById('category-list');
const specialContainer = document.getElementById('special-container');
const productDisplay = document.getElementById('product-display');
const navigationIndicators = document.getElementById('navigation-indicators');
const footerContact = document.getElementById('footer-contact');
const controls = document.getElementById('controls');
const prevBtn = document.getElementById('prev-btn');
const pauseBtn = document.getElementById('pause-btn');
const nextBtn = document.getElementById('next-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const adminLink = document.getElementById('admin-link');

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Start loading sequence
    updateLoadingProgress(10, 'Initializing application...');
    
    // Start clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Load settings and data
    loadSettings()
        .then(() => {
            updateLoadingProgress(30, 'Settings loaded...');
            return loadData();
        })
        .then(() => {
            updateLoadingProgress(70, 'Product data loaded...');
            
            // Initialize UI components
            initializeUI();
            
            // Add event listeners
            setupEventListeners();
            
            // Complete loading
            updateLoadingProgress(100, 'Ready!');
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                startSlideshow();
            }, 500);
        })
        .catch(error => {
            console.error('Error during initialization:', error);
            alert('Error loading application data. Please refresh the page.');
        });
});

/**
 * Update loading progress
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Optional loading message
 */
function updateLoadingProgress(progress, message) {
    loadingProgress = progress;
    progressBar.style.width = `${progress}%`;
    
    if (message) {
        document.querySelector('.loading-text').textContent = message;
    }
}

/**
 * Load application settings
 */
async function loadSettings() {
    try {
        const response = await fetch('data/settings.json');
        if (!response.ok) {
            throw new Error('Failed to load settings');
        }
        
        settings = await response.json();
        
        // Apply settings
        applySettings();
        
        return settings;
    } catch (error) {
        console.error('Error loading settings:', error);
        // Use default settings
        settings = {
            slideDuration: 8000,
            animationSpeed: 'normal',
            showWeather: true,
            showClock: true,
            showNewsTicker: true,
            newsTickerContent: 'Welcome to BMS Digital Signage',
            autoFullscreen: false,
            defaultCategory: 'all',
            storeName: 'BMS Stationery',
            contactInfo: {
                phone: '+267 3939 000',
                email: 'info@bms.co.bw'
            }
        };
        
        applySettings();
        return settings;
    }
}

/**
 * Apply settings to the UI
 */
function applySettings() {
    // Apply store name
    storeName.textContent = settings.storeName || 'BMS Stationery';
    
    // Apply news ticker content
    if (settings.showNewsTicker && settings.newsTickerContent) {
        tickerContent.textContent = settings.newsTickerContent;
        document.querySelector('.news-ticker').style.display = 'block';
    } else {
        document.querySelector('.news-ticker').style.display = 'none';
    }
    
    // Apply clock visibility
    if (settings.showClock) {
        document.querySelector('.clock').style.display = 'block';
    } else {
        document.querySelector('.clock').style.display = 'none';
    }
    
    // Apply weather widget visibility
    if (settings.showWeather) {
        weatherWidget.style.display = 'flex';
        // Initialize weather data (if we had an API key)
        initializeWeather();
    } else {
        weatherWidget.style.display = 'none';
    }
    
    // Apply contact info
    if (settings.contactInfo) {
        let contactText = '';
        if (settings.contactInfo.phone) {
            contactText += `Contact: ${settings.contactInfo.phone}`;
        }
        if (settings.contactInfo.email) {
            contactText += ` | ${settings.contactInfo.email}`;
        }
        footerContact.textContent = contactText;
    }
    
    // Apply display settings if available
    if (settings.displaySettings) {
        const root = document.documentElement;
        
        if (settings.displaySettings.primaryColor) {
            root.style.setProperty('--primary-color', settings.displaySettings.primaryColor);
        }
        
        if (settings.displaySettings.secondaryColor) {
            root.style.setProperty('--secondary-color', settings.displaySettings.secondaryColor);
        }
        
        if (settings.displaySettings.accentColor) {
            root.style.setProperty('--accent-color', settings.displaySettings.accentColor);
        }
        
        if (settings.displaySettings.fontFamily) {
            document.body.style.fontFamily = settings.displaySettings.fontFamily;
        }
        
        if (settings.displaySettings.fontSize) {
            if (settings.displaySettings.fontSize === 'large') {
                document.body.style.fontSize = '110%';
            } else if (settings.displaySettings.fontSize === 'small') {
                document.body.style.fontSize = '90%';
            }
        }
    }
    
    // Auto fullscreen after delay
    if (settings.autoFullscreen && settings.autoFullscreenDelay) {
        setTimeout(() => {
            if (!isFullscreen) {
                toggleFullscreen();
            }
        }, settings.autoFullscreenDelay);
    }
}

/**
 * Initialize weather widget
 * Note: In a real implementation, this would connect to a weather API
 */
function initializeWeather() {
    // This is a placeholder for weather API integration
    // In a real implementation, we would fetch weather data from an API
    
    // For demo purposes, we'll just show some static weather data
    const weatherIcon = weatherWidget.querySelector('.weather-icon');
    const weatherTemp = weatherWidget.querySelector('.weather-temp');
    const weatherDesc = weatherWidget.querySelector('.weather-desc');
    
    // Set placeholder weather icon (using emoji for simplicity)
    weatherIcon.innerHTML = '☀️';
    weatherTemp.textContent = '28°C';
    weatherDesc.textContent = 'Sunny';
}

/**
 * Load product and category data
 */
async function loadData() {
    try {
        const response = await fetch('data/products.json');
        if (!response.ok) {
            throw new Error('Failed to load product data');
        }
        
        const data = await response.json();
        products = data.products || [];
        categories = data.categories || [];
        
        // Sort categories by display order
        categories.sort((a, b) => a.displayOrder - b.displayOrder);
        
        // Filter products by default category
        currentCategory = settings.defaultCategory || 'all';
        filterProductsByCategory(currentCategory);
        
        return { products, categories };
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

/**
 * Initialize UI components
 */
function initializeUI() {
    // Populate categories
    populateCategories();
    
    // Populate special offers
    populateSpecialOffers();
    
    // Create initial product slides
    createProductSlides();
}

/**
 * Populate category list
 */
function populateCategories() {
    // Clear existing categories (except "All Products")
    categoryList.innerHTML = '';
    
    // Add "All Products" category
    const allProductsItem = document.createElement('li');
    allProductsItem.className = 'category-item';
    allProductsItem.setAttribute('data-category', 'all');
    allProductsItem.setAttribute('tabindex', '0');
    if (currentCategory === 'all') {
        allProductsItem.classList.add('active');
    }
    
    allProductsItem.innerHTML = `
        <span class="category-name">All Products</span>
        <span class="category-count">${products.length}</span>
    `;
    
    allProductsItem.addEventListener('click', () => filterProductsByCategory('all'));
    allProductsItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            filterProductsByCategory('all');
            e.preventDefault();
        }
    });
    
    categoryList.appendChild(allProductsItem);
    
    // Add each category
    categories.forEach(category => {
        const categoryCount = products.filter(product => product.category === category.id).length;
        
        const categoryItem = document.createElement('li');
        categoryItem.className = 'category-item';
        categoryItem.setAttribute('data-category', category.id);
        categoryItem.setAttribute('tabindex', '0');
        if (currentCategory === category.id) {
            categoryItem.classList.add('active');
        }
        
        categoryItem.innerHTML = `
            <span class="category-name">${category.name}</span>
            <span class="category-count">${categoryCount}</span>
        `;
        
        categoryItem.addEventListener('click', () => filterProductsByCategory(category.id));
        categoryItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                filterProductsByCategory(category.id);
                e.preventDefault();
            }
        });
        
        categoryList.appendChild(categoryItem);
    });
}

/**
 * Populate special offers section
 */
function populateSpecialOffers() {
    // Clear existing special offers
    specialContainer.innerHTML = '';
    
    // Find products marked as special
    const specials = products.filter(product => product.isSpecial).slice(0, 3);
    
    if (specials.length === 0) {
        specialContainer.innerHTML = '<div class="special-item">No special offers available at this time.</div>';
        return;
    }
    
    // Add each special offer
    specials.forEach(product => {
        const specialItem = document.createElement('div');
        specialItem.className = 'special-item';
        specialItem.setAttribute('tabindex', '0');
        specialItem.innerHTML = `
            <div class="special-name">${product.name}</div>
            <div class="special-price">P${product.price.toFixed(2)}</div>
            <div class="special-desc">${product.description.substring(0, 80)}...</div>
        `;
        
        // Add click event to show this product
        specialItem.addEventListener('click', () => {
            const index = filteredProducts.findIndex(p => p.id === product.id);
            if (index !== -1) {
                showSlide(index);
            } else {
                // If product is not in current filtered list, switch to all products
                filterProductsByCategory('all');
                setTimeout(() => {
                    const newIndex = filteredProducts.findIndex(p => p.id === product.id);
                    if (newIndex !== -1) {
                        showSlide(newIndex);
                    }
                }, 100);
            }
        });
        
        specialItem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const index = filteredProducts.findIndex(p => p.id === product.id);
                if (index !== -1) {
                    showSlide(index);
                } else {
                    // If product is not in current filtered list, switch to all products
                    filterProductsByCategory('all');
                    setTimeout(() => {
                        const newIndex = filteredProducts.findIndex(p => p.id === product.id);
                        if (newIndex !== -1) {
                            showSlide(newIndex);
                        }
                    }, 100);
                }
                e.preventDefault();
            }
        });
        
        specialContainer.appendChild(specialItem);
    });
}

/**
 * Filter products by category
 * @param {string} categoryId - The category ID to filter by
 */
function filterProductsByCategory(categoryId) {
    // Update current category
    currentCategory = categoryId;
    
    // Update active category in UI
    document.querySelectorAll('.category-item').forEach(item => {
        if (item.getAttribute('data-category') === categoryId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Filter products
    filteredProducts = categoryId === 'all'
        ? [...products]
        : products.filter(product => product.category === categoryId);
    
    // Recreate product slides
    createProductSlides();
    
    // Reset slideshow
    currentSlideIndex = 0;
    showSlide(0);
    resetSlideshow();
}

/**
 * Create product slides
 */
function createProductSlides() {
    // Clear existing product display
    productDisplay.innerHTML = '';
    
    // If no products, show message
    if (filteredProducts.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'product-card current';
        emptyCard.innerHTML = `
            <div class="product-header">
                <div class="product-title">No Products Found</div>
                <div class="product-category">Empty Category</div>
            </div>
            <div class="product-content">
                <div class="product-info">
                    <h2 class="product-name">No Products Available</h2>
                    <p class="product-description">
                        There are no products available in this category. Please select another category.
                    </p>
                </div>
            </div>
            <div class="product-footer">
                <div class="product-id"></div>
                <div class="navigation-indicators"></div>
            </div>
        `;
        productDisplay.appendChild(emptyCard);
        return;
    }
    
    // Create a card for the current product
    const currentProduct = filteredProducts[currentSlideIndex];
    const category = categories.find(cat => cat.id === currentProduct.category);
    const categoryName = category ? category.name : 'Uncategorized';
    
    const currentCard = document.createElement('div');
    currentCard.className = 'product-card current';
    currentCard.innerHTML = createProductCardHTML(currentProduct, categoryName);
    productDisplay.appendChild(currentCard);
    
    // Create navigation indicators
    createNavigationIndicators();
}

/**
 * Create product card HTML
 * @param {Object} product - The product object
 * @param {string} categoryName - The category name
 * @returns {string} HTML for the product card
 */
function createProductCardHTML(product, categoryName) {
    return `
        <div class="product-header">
            <div class="product-title">${product.name}</div>
            <div class="product-category">${categoryName}</div>
        </div>
        <div class="product-content">
            <div class="product-image-container">
                <img src="images/${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h2 class="product-name">${product.name}</h2>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="price-label">Price:</span>
                    <span class="price-value">P${product.price.toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div class="product-footer">
            <div class="product-id">Product ID: ${product.id}</div>
            <div class="navigation-indicators" id="navigation-indicators"></div>
        </div>
    `;
}

/**
 * Create navigation indicators
 */
function createNavigationIndicators() {
    // Clear existing indicators
    navigationIndicators.innerHTML = '';
    
    // Create an indicator for each product
    filteredProducts.forEach((_, index) => {
        const indicator = document.createElement('div');
        indicator.className = 'nav-indicator';
        if (index === currentSlideIndex) {
            indicator.classList.add('active');
        }
        
        indicator.addEventListener('click', () => showSlide(index));
        
        navigationIndicators.appendChild(indicator);
    });
}

/**
 * Start slideshow
 */
function startSlideshow() {
    // Clear any existing interval
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    
    // Get slide duration from settings or use default
    const duration = settings.slideDuration || 8000;
    
    // Start new interval
    slideInterval = setInterval(() => {
        if (!isPaused) {
            showNextSlide();
        }
    }, duration);
}

/**
 * Reset slideshow timer
 */
function resetSlideshow() {
    clearInterval(slideInterval);
    startSlideshow();
}

/**
 * Show slide at specified index
 * @param {number} index - The index of the slide to show
 */
function showSlide(index) {
    if (filteredProducts.length === 0) return;
    
    // Ensure index is within bounds
    currentSlideIndex = (index + filteredProducts.length) % filteredProducts.length;
    
    // Get current product
    const currentProduct = filteredProducts[currentSlideIndex];
    const category = categories.find(cat => cat.id === currentProduct.category);
    const categoryName = category ? category.name : 'Uncategorized';
    
    // Update product card with animation
    const currentCard = productDisplay.querySelector('.product-card');
    
    // Create new card with updated content
    const newCard = document.createElement('div');
    newCard.className = 'product-card next';
    newCard.innerHTML = createProductCardHTML(currentProduct, categoryName);
    
    // Add new card to display
    productDisplay.appendChild(newCard);
    
    // Trigger reflow for animation
    void newCard.offsetWidth;
    
    // Start transition
    currentCard.classList.remove('current');
    currentCard.classList.add('prev');
    newCard.classList.remove('next');
    newCard.classList.add('current');
    
    // Remove old card after transition
    setTimeout(() => {
        if (currentCard.parentNode === productDisplay) {
            productDisplay.removeChild(currentCard);
        }
        
        // Update navigation indicators
        updateNavigationIndicators();
    }, 600); // Match transition duration
}

/**
 * Update navigation indicators
 */
function updateNavigationIndicators() {
    const indicators = navigationIndicators.querySelectorAll('.nav-indicator');
    
    indicators.forEach((indicator, index) => {
        if (index === currentSlideIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

/**
 * Show next slide
 */
function showNextSlide() {
    showSlide(currentSlideIndex + 1);
}

/**
 * Show previous slide
 */
function showPreviousSlide() {
    showSlide(currentSlideIndex - 1);
}

/**
 * Toggle pause state
 */
function togglePause() {
    isPaused = !isPaused;
    
    // Update pause button icon
    pauseBtn.querySelector('.control-icon').textContent = isPaused ? '▶' : '⏸';
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    const container = document.querySelector('.tv-container');
    
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen();
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        }
        
        isFullscreen = true;
        document.body.classList.add('fullscreen-active');
        fullscreenBtn.querySelector('.control-icon').textContent = '⛶';
        
        // Auto-hide controls after 3 seconds
        if (controlsTimeout) clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            controls.style.opacity = '0';
        }, 3000);
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        
        isFullscreen = false;
        document.body.classList.remove('fullscreen-active');
        fullscreenBtn.querySelector('.control-icon').textContent = '⛶';
        controls.style.opacity = '1';
        
        if (controlsTimeout) clearTimeout(controlsTimeout);
    }
}

/**
 * Update clock display
 */
function updateClock() {
    const now = new Date();
    
    // Format time as HH:MM:SS
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    clock.textContent = `${hours}:${minutes}:${seconds}`;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Control buttons
    prevBtn.addEventListener('click', () => {
        showPreviousSlide();
        resetSlideshow();
    });
    
    nextBtn.addEventListener('click', () => {
        showNextSlide();
        resetSlideshow();
    });
    
    pauseBtn.addEventListener('click', togglePause);
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyNavigation);
    
    // Show controls on mouse move in fullscreen
    document.addEventListener('mousemove', () => {
        if (isFullscreen) {
            controls.style.opacity = '1';
            
            if (controlsTimeout) clearTimeout(controlsTimeout);
            controlsTimeout = setTimeout(() => {
                controls.style.opacity = '0';
            }, 3000);
        }
    });
    
    // Fullscreen change event
    document.addEventListener('fullscreenchange', () => {
        isFullscreen = !!document.fullscreenElement;
        
        if (!isFullscreen) {
            document.body.classList.remove('fullscreen-active');
            controls.style.opacity = '1';
            if (controlsTimeout) clearTimeout(controlsTimeout);
        }
    });
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} e - The keyboard event
 */
function handleKeyNavigation(e) {
    switch (e.key) {
        case 'ArrowLeft':
            showPreviousSlide();
            resetSlideshow();
            break;
        case 'ArrowRight':
            showNextSlide();
            resetSlideshow();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
        case 'f':
            toggleFullscreen();
            break;
        case 'Escape':
            if (isFullscreen) {
                toggleFullscreen();
            }
            break;
    }
}
