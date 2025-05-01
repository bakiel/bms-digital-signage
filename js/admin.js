/**
 * BMS Digital Signage - Admin Panel JavaScript (NEW VERSION)
 */

// ===== Global Variables =====
let products = [];
let categories = [];
let settings = {};
let images = [];
let currentUser = null; // Track auth state

// ===== DOM Elements =====
// Sections
const loginSection = document.getElementById('login-section');
const adminInterface = document.getElementById('admin-interface');
const adminMainContent = document.getElementById('admin-main-content');
const adminSections = document.querySelectorAll('.admin-section'); // All content sections

// Login Form
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn'); // Login submit button

// Admin Interface Elements
const logoutBtn = document.getElementById('logout-btn');
const previewBtn = document.getElementById('preview-btn');
const sidebarLinks = document.querySelectorAll('.admin-sidebar .admin-nav a');

// Specific Section Containers (for loading content later)
const productsTableContainer = document.getElementById('products-table-container');
const categoriesTableContainer = document.getElementById('categories-table-container');
const imageGalleryContainer = document.getElementById('image-gallery-container');
const settingsFormContainer = document.getElementById('settings-form'); // The form itself

// Buttons within sections
const addProductBtn = document.getElementById('add-product-btn');
const addCategoryBtn = document.getElementById('add-category-btn');
const uploadImageBtn = document.getElementById('upload-image-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const uploadCsvBtn = document.getElementById('upload-csv-btn');
const csvFileInput = document.getElementById('csv-file-input');
const csvUploadResults = document.getElementById('csv-upload-results');

// Modals
const productModal = document.getElementById('product-modal'); // Reference to the main modal div
const categoryModal = document.getElementById('category-modal'); // Reference to the main modal div

// Category Modal Elements (Added)
const categoryModalTitle = document.getElementById('category-modal-title');
const categoryFormModal = document.getElementById('category-form'); // Form inside the modal
const categoryIdModalInput = document.getElementById('category-id-modal');
const categoryNameModalInput = document.getElementById('category-name-modal');
const categoryDescriptionModalInput = document.getElementById('category-description-modal');
const categoryOrderModalInput = document.getElementById('category-order-modal');
const categoryFeaturedModalCheckbox = document.getElementById('category-featured-modal');
const saveCategoryBtnModal = document.getElementById('save-category-btn-modal');
const cancelCategoryBtnModal = document.getElementById('cancel-category-btn-modal');
// Product Modal Elements (Added from previous step, ensure they are uncommented/present)
const productModalTitle = document.getElementById('product-modal-title');
const productFormModal = document.getElementById('product-form'); // Form inside the modal
const productIdModalInput = document.getElementById('product-id-modal');
const productNameModalInput = document.getElementById('product-name-modal');
const productDescriptionModalInput = document.getElementById('product-description-modal');
const productCategoryModalSelect = document.getElementById('product-category-modal');
const productImageModalSelect = document.getElementById('product-image-modal');
const productImagePreviewModal = document.getElementById('product-image-preview-modal');
const productPriceModalInput = document.getElementById('product-price-modal');
const productDurationModalInput = document.getElementById('product-duration-modal');
const productFeaturedModalCheckbox = document.getElementById('product-featured-modal');
const productSpecialModalCheckbox = document.getElementById('product-special-modal');
const saveProductBtnModal = document.getElementById('save-product-btn-modal');
const cancelProductBtnModal = document.getElementById('cancel-product-btn-modal');

// Toast Notifications (Assuming structure exists or add it)
const notificationToast = document.getElementById('notification-toast');
const toastMessage = document.getElementById('toast-message');
const closeToastBtn = document.getElementById('close-toast');


// ===== Initialization =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuth(); // Check authentication status on load
});

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Login
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    // Preview
     if (previewBtn) {
        previewBtn.addEventListener('click', previewDisplay);
    }
    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            showSection(sectionId);
            // Update active class
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Add listeners for section buttons
    if(addProductBtn) addProductBtn.addEventListener('click', () => showProductModal()); // Pass no ID for 'Add' mode
    if(addCategoryBtn) addCategoryBtn.addEventListener('click', () => showCategoryModal()); // Pass no ID for 'Add' mode
    if(uploadImageBtn) uploadImageBtn.addEventListener('click', uploadImage); // Connect image upload button
    if(saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings); // Connect settings save button

    // Add listeners for modal buttons
    if(saveProductBtnModal) saveProductBtnModal.addEventListener('click', saveProduct);
    if(cancelProductBtnModal) cancelProductBtnModal.addEventListener('click', hideProductModal);
    if(saveCategoryBtnModal) saveCategoryBtnModal.addEventListener('click', saveCategory);
    if(cancelCategoryBtnModal) cancelCategoryBtnModal.addEventListener('click', hideCategoryModal);

     if (uploadCsvBtn) {
        uploadCsvBtn.addEventListener('click', uploadCsv);
    }
    // Add other listeners (saveSettingsBtn, uploadImageBtn etc.) as functionality is built
}

// ===== Authentication =====

async function checkAuth() {
    console.log("Checking auth status...");
    try {
        const response = await fetch('../api/auth.php', { // Correct path from /admin/index.html
            method: 'GET',
            credentials: 'include' // Important for session cookies
        });

        // Allow 401 Unauthorized as a valid "not logged in" response
        if (!response.ok && response.status !== 401) {
            throw new Error(`Auth check failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.authenticated) {
            console.log("Authenticated.");
            currentUser = { authenticated: true };
            showAdminInterface();
            await loadInitialData(); // Load data only after showing interface
             // Show default section (e.g., products) after loading
             showSection('products');
             document.querySelector('.admin-nav a[data-section="products"]')?.classList.add('active');
        } else {
            console.log("Not authenticated.");
            showLoginSection();
        }
    } catch (error) {
        console.error('Error checking authentication:', error);
        // showToast('Failed to check auth status.', 'error'); // Add toast later
        showLoginSection(); // Fallback to login
    }
}

async function handleLogin(event) {
    event.preventDefault();
    if (!usernameInput || !passwordInput || !loginError) {
        console.error("CRITICAL: Login form elements (username, password, or error display) NOT FOUND in the DOM!");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
        loginError.textContent = 'Please enter username and password';
        console.log("DEBUG: handleLogin returning because username or password value is empty.");
        return;
    }
    loginError.textContent = ''; // Clear previous errors
    loginBtn.disabled = true; // Disable button during request
console.log(`Attempting login for user: ${username} with password length: ${password.length}`); // Log before try block
try {
    console.log("Inside try block, before fetch."); // Log inside try
    // Removed extra try block here
        const response = await fetch('../api/auth.php', { // Correct path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        console.log("Fetch request sent. Waiting for response..."); // Log after fetch initiated

        console.log(`Response status: ${response.status}`); // Log response status
        const result = await response.json();
        console.log("Response JSON parsed:", result); // Log parsed response

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        if (result.authenticated) {
            currentUser = { authenticated: true };
            passwordInput.value = ''; // Clear password field
            showAdminInterface();
            await loadInitialData();
            // Show default section
             showSection('products');
             document.querySelector('.admin-nav a[data-section="products"]')?.classList.add('active');
            // logActivity('Admin logged in', '🔑'); // Add logActivity later
        } else {
            loginError.textContent = result.message || 'Login failed.';
            passwordInput.value = '';
        }

    } catch (error) {
        console.error('Login error caught in CATCH block:', error); // More specific log
        loginError.textContent = error.message || 'Login failed. Please try again.';
        passwordInput.value = '';
    } finally {
         if(loginBtn) loginBtn.disabled = false; // Re-enable button
    }
} // Closing brace for handleLogin

async function logout() {
    console.log("Logging out...");
    try {
        await fetch('../api/auth.php', { // Correct path
            method: 'DELETE',
            credentials: 'include'
        });
        // Ignore response status, always log out client-side
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        currentUser = null;
        // logActivity('Admin logged out', '🚪'); // Add logActivity later
        showLoginSection();
        // Optionally clear displayed data
        if(productsTableContainer) productsTableContainer.innerHTML = '';
        if(categoriesTableContainer) categoriesTableContainer.innerHTML = '';
        if(imageGalleryContainer) imageGalleryContainer.innerHTML = '';
        // etc.
    }
}

// ===== UI Control =====

function showLoginSection() {
    if (loginSection) loginSection.style.display = 'block'; // Or 'flex' depending on CSS
    if (adminInterface) adminInterface.style.display = 'none';
}

function showAdminInterface() {
    if (loginSection) loginSection.style.display = 'none';
    if (adminInterface) adminInterface.style.display = 'grid'; // Match CSS display type
}

function showSection(sectionId) {
    adminSections.forEach(section => {
        if (section.id === `${sectionId}-section`) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
     // Update active link in sidebar
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}


// ===== Data Loading =====

async function loadInitialData() {
    console.log("Loading initial data...");
    // Use Promise.allSettled to continue even if one fails
    const results = await Promise.allSettled([
        loadProducts(),
        loadCategories(),
        loadSettings(),
        loadImages()
    ]);

    // Check results if needed
    results.forEach(result => {
        if (result.status === 'rejected') {
            console.error("Failed to load some initial data:", result.reason);
        }
    });

    console.log("Initial data loaded (or attempted).");
    // Initial population after loading
    populateProductsTable(); // Example
    populateCategoriesTable(); // Example
    populateImageGallery(); // Example
    populateSettingsForm(); // Example
    updateDashboard(); // Example
    updateProductImageSelect(); // Example for product modal dropdown
}

// --- API Interaction Functions (Keep previously refactored versions) ---
// NOTE: These functions might need adjustments based on the NEW HTML structure
// for modals, forms, and displaying results.

async function loadProducts() {
    console.log("Loading products...");
    try {
        const response = await fetch('../api/products.php'); // Correct path
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Products API Error: ${errorData.message || response.statusText}`);
        }
        const data = await response.json();
        products = data.products || [];
        console.log(`Loaded ${products.length} products.`);
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        // showToast(error.message || 'Failed to load products', 'error'); // Add toast later
        products = []; // Ensure products is an array on error
        return [];
    }
}

async function loadCategories() {
     console.log("Loading categories...");
    try {
        const response = await fetch('../api/categories.php'); // Correct path
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Categories API Error: ${errorData.message || response.statusText}`);
        }
        categories = await response.json() || [];
        console.log(`Loaded ${categories.length} categories.`);
        updateCategoryFilters(); // Update dropdowns that might depend on categories
        return categories;
    } catch (error) {
        console.error('Error loading categories:', error);
        // showToast(error.message || 'Failed to load categories', 'error'); // Add toast later
        categories = []; // Ensure categories is an array on error
        return [];
    }
}

async function loadSettings() {
     console.log("Loading settings...");
    try {
        const response = await fetch('../api/settings.php'); // Correct path
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Settings API Error: ${errorData.message || response.statusText}`);
        }
        settings = await response.json();
        console.log("Settings loaded.");
        return settings;
    } catch (error) {
        console.error('Error loading settings:', error);
        // showToast(error.message || 'Failed to load settings', 'error'); // Add toast later
        settings = {}; // Ensure settings is an object on error
        return {};
    }
}

async function loadImages() {
     console.log("Loading images...");
    try {
        const response = await fetch('../api/images.php'); // Correct path
         if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Images API Error: ${errorData.message || response.statusText}`);
        }
        images = await response.json() || [];
         console.log(`Loaded ${images.length} images.`);
        return images;
    } catch (error) {
        console.error('Error loading images:', error);
        // showToast(error.message || 'Failed to load images', 'error'); // Add toast later
        images = []; // Ensure images is an array on error
        return [];
    }
}

// ===== CRUD & Action Functions (Placeholders/Needs Integration) =====
// These functions contain the API logic but need to be connected
// to the new UI elements (modals, forms, tables)

async function saveProduct() {
    // Get data from the MODAL form elements
    const productId = productIdModalInput.value;
    const name = productNameModalInput.value.trim();
    const description = productDescriptionModalInput.value.trim();
    const categoryId = productCategoryModalSelect.value;
    const price = parseFloat(productPriceModalInput.value);
    const image = productImageModalSelect.value;
    const featured = productFeaturedModalCheckbox.checked;
    const isSpecial = productSpecialModalCheckbox.checked;
    const displayDuration = parseInt(productDurationModalInput.value);

    // Basic validation
    if (!name || !categoryId || isNaN(price) || price < 0 || !image || isNaN(displayDuration) || displayDuration < 1000) {
        showToast('Please fill in all required fields with valid data (Name, Category, Price, Image, Duration).', 'error');
        return;
    }

    const productData = {
        name, description, category: categoryId, price, image, featured, isSpecial, displayDuration,
        pricingType: 'single' // Assuming single pricing for now
    };

    // Add ID only if it exists (for PUT request)
    if (productId) {
        productData.id = productId;
    }

    const method = productId ? 'PUT' : 'POST';
    const url = '../api/products.php'; // Correct path

    saveProductBtnModal.disabled = true; // Disable button during save

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include credentials if needed by API
            body: JSON.stringify(productData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        showToast(result.message || `Product ${productId ? 'updated' : 'added'} successfully!`, 'success');
        hideProductModal();

        // Reload data and update UI
        await loadProducts();
        await loadCategories(); // Reload categories (counts might change)
        populateProductsTable();
        updateDashboard();
        // updateProductImageSelect(); // Already called by loadInitialData indirectly? Re-evaluate if needed here.

        // logActivity(`Product ${productId ? 'updated' : 'added'}: ${name}`, productId ? '✏️' : '➕'); // Add logActivity later

    } catch (error) {
        console.error('Error saving product:', error);
        showToast(`Failed to save product: ${error.message}`, 'error');
    } finally {
         if(saveProductBtnModal) saveProductBtnModal.disabled = false; // Re-enable button
    }
}

async function saveCategory() {
    // Get data from the MODAL form elements
    const categoryId = categoryIdModalInput.value;
    const name = categoryNameModalInput.value.trim();
    const description = categoryDescriptionModalInput.value.trim();
    const displayOrder = parseInt(categoryOrderModalInput.value);
    const featured = categoryFeaturedModalCheckbox.checked;

    // Basic validation
    if (!name || isNaN(displayOrder)) {
        showToast('Please provide a valid category name and display order.', 'error');
        return;
    }

    const categoryData = { name, description, displayOrder, featured };
    if (categoryId) {
        categoryData.id = categoryId; // Add ID only for PUT requests
    }

    const method = categoryId ? 'PUT' : 'POST';
    const url = '../api/categories.php'; // Correct path

    saveCategoryBtnModal.disabled = true; // Disable button

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(categoryData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        showToast(result.message || `Category ${categoryId ? 'updated' : 'added'} successfully!`, 'success');
        hideCategoryModal();

        // Reload data and update UI
        await loadCategories();
        await loadProducts(); // Products might depend on category names/counts
        populateCategoriesTable();
        populateProductsTable(); // Update product category names if needed
        updateDashboard();
        updateCategoryFilters(); // Update dropdowns

        // logActivity(`Category ${categoryId ? 'updated' : 'added'}: ${name}`, categoryId ? '✏️' : '➕'); // Add later

    } catch (error) {
        console.error('Error saving category:', error);
        showToast(`Failed to save category: ${error.message}`, 'error');
    } finally {
        if(saveCategoryBtnModal) saveCategoryBtnModal.disabled = false; // Re-enable button
    }
}

async function saveSettings() {
    // Ensure the container is the form itself
    const settingsForm = document.getElementById('settings-form'); // Get form reference
    if (!settingsForm || settingsForm.tagName !== 'FORM') {
        console.error("Settings form container not found or is not a FORM element.");
        return;
    }

    // Gather data from form into a structured object
    const newSettings = {
        slideDuration: parseInt(document.getElementById('slideDuration').value) || 8000,
        animationSpeed: document.getElementById('animationSpeed').value || 'normal',
        showWeather: document.getElementById('showWeather').checked,
        showClock: document.getElementById('showClock').checked,
        showNewsTicker: document.getElementById('showNewsTicker').checked,
        newsTickerContent: document.getElementById('newsTickerContent').value || '',
        autoFullscreen: document.getElementById('autoFullscreen').checked,
        autoFullscreenDelay: parseInt(document.getElementById('autoFullscreenDelay').value) || 30000,
        storeName: document.getElementById('storeName').value || '',
        storeLocation: document.getElementById('storeLocation').value || '',
        contactInfo: {
            phone: document.getElementById('contactPhone').value || '',
            email: document.getElementById('contactEmail').value || '',
            website: document.getElementById('contactWebsite').value || ''
        },
        displaySettings: {
            primaryColor: document.getElementById('primaryColor').value || '#000000',
            secondaryColor: document.getElementById('secondaryColor').value || '#000000',
            accentColor: document.getElementById('accentColor').value || '#000000',
            fontSize: document.getElementById('fontSize').value || 'normal'
        }
        // Password handled below
    };

    // Handle password confirmation
    const passwordInput = document.getElementById('adminPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password || confirmPassword) { // Only check/send if user entered something
        if (password !== confirmPassword) {
            showToast('Passwords do not match.', 'error');
            passwordInput.value = ''; // Clear fields
            confirmPasswordInput.value = '';
            return;
        }
         if (password) { // Only include if password is set and matches
            newSettings.adminPassword = password; // Send plain text, PHP will hash
        }
    }

    const saveBtn = document.getElementById('save-settings-btn'); // Get button reference
    if(saveBtn) saveBtn.disabled = true; // Disable button

    try {
        const response = await fetch('../api/settings.php', { // Correct path
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(newSettings),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        // Update local settings object with the saved data (excluding password)
        settings = result.settings || newSettings;
        delete settings.adminPassword; // Ensure plain text password isn't stored locally

        showToast(result.message || 'Settings saved successfully!', 'success');
        // logActivity('System settings updated', '⚙️'); // Add later

        // Clear password fields after successful save
        passwordInput.value = '';
        confirmPasswordInput.value = '';

        // Re-populate form to reflect saved state (optional, but good practice)
        populateSettingsForm(); // Re-populate with potentially updated values from server
        updateDashboard(); // Update dashboard if needed (e.g., last updated time)

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast(`Failed to save settings: ${error.message}`, 'error');
        // Clear password fields on error too
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    } finally {
        if(saveBtn) saveBtn.disabled = false; // Re-enable button
    }
}

async function uploadImage() {
    // Use the correct ID from the new HTML structure
    const fileInput = document.getElementById('image-file-input');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('Please select an image file to upload.', 'error');
        return;
    }
    const file = fileInput.files[0];

    // Basic validation (client-side) - keep for better UX
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        showToast('Invalid file type. Please upload JPG, PNG, GIF, SVG, or WebP.', 'error');
        return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showToast('File size exceeds 5MB limit.', 'error');
        return;
    }

    // Use FormData to send the file
    const formData = new FormData();
    formData.append('imageFile', file); // The key 'imageFile' must match the PHP $_FILES key

    // Ensure uploadImageBtn is defined and accessible in this scope, or get it again
    const uploadBtn = document.getElementById('upload-image-btn'); // Get button reference if not global
    if(uploadBtn) uploadBtn.disabled = true; // Disable button during upload

    try {
        const response = await fetch('../api/images.php', { // Correct path
            method: 'POST',
            body: formData,
            credentials: 'include'
            // No Content-Type header needed for FormData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        const uploadedFilename = result.filename;

        showToast(result.message || `Image "${uploadedFilename}" uploaded successfully!`, 'success');
        // logActivity(`Image uploaded: ${uploadedFilename}`, '🖼️'); // Add later

        // Clear the file input
        fileInput.value = '';

        // Reload image list and update UI
        await loadImages();
        populateImageGallery();
        updateDashboard();
        updateProductImageSelect(); // Update image dropdown in product modal

    } catch (error) {
        console.error('Error uploading image:', error);
        showToast(`Failed to upload image: ${error.message}`, 'error');
    } finally {
         if(uploadBtn) uploadBtn.disabled = false; // Re-enable button
    }
}

async function uploadCsv() {
    // Use correct IDs from HTML
    const fileInput = document.getElementById('csv-file-input');
    const resultsContainer = document.getElementById('csv-upload-results');
    const uploadBtn = document.getElementById('upload-csv-btn'); // Get button reference

    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        showToast('Please select a CSV file to upload.', 'error');
        return;
    }

    const file = fileInput.files[0];

    // Basic client-side validation (optional, server validates too)
    if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
         showToast('Invalid file type. Please select a CSV file.', 'error');
         return;
    }

    const formData = new FormData();
    formData.append('csvFile', file); // Key must match PHP $_FILES key

    // Clear previous results and show loading indicator
    if(resultsContainer) resultsContainer.innerHTML = '<i>Uploading and processing CSV...</i>';
    if(uploadBtn) uploadBtn.disabled = true; // Disable button during upload

    try {
        const response = await fetch('../api/bulk_upload.php', { // Correct path
            method: 'POST',
            body: formData,
            credentials: 'include' // Include credentials if auth is needed
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        // Display results
        let resultsHtml = `<p>${result.message || 'CSV processed.'}</p><ul>`;
        resultsHtml += `<li>Added: ${result.added || 0}</li>`;
        resultsHtml += `<li>Updated: ${result.updated || 0}</li>`;
        resultsHtml += `<li>Skipped: ${result.skipped || 0}</li>`;
        resultsHtml += `</ul>`;
        if (result.errors && result.errors.length > 0) {
            resultsHtml += `<p><strong>Errors/Warnings:</strong></p><ul class="error-list" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; padding: 5px; background: #f9f9f9;">`; // Basic styling for errors
            result.errors.forEach(err => {
                // Basic escaping to prevent HTML injection from error messages
                const escapedErr = err.replace(/</g, "<").replace(/>/g, ">");
                resultsHtml += `<li style="color: #dc3545;">${escapedErr}</li>`; // Red color for errors
            });
            resultsHtml += `</ul>`;
        }
        if(resultsContainer) resultsContainer.innerHTML = resultsHtml;

        showToast('CSV processing complete.', 'success');
        // logActivity(`Bulk upload processed: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`, '📊'); // Add later

        // Reload data and update UI
        await loadProducts();
        await loadCategories(); // In case categories were affected indirectly or counts changed
        populateProductsTable();
        populateCategoriesTable();
        updateDashboard();

    } catch (error) {
        console.error('Error uploading CSV:', error);
        if(resultsContainer) resultsContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        showToast(`Failed to upload CSV: ${error.message}`, 'error');
    } finally {
        // Clear the file input and re-enable button
        if (fileInput) fileInput.value = ''; // Clear selected file
        if (uploadBtn) uploadBtn.disabled = false;
    }
}

async function handleConfirmAction(action, id, name) { // Pass parameters directly
    // This function is now triggered by confirmDeleteProduct etc.
    // It assumes confirmation was already given.

    // hideConfirmModal(); // Hide a proper modal if implemented

    try {
        let response;
        let result;
        let url = '';
        let successMessage = '';
        let logMessage = '';
        let logIcon = '🗑️';

        switch (action) {
            case 'delete-product':
                if (!id) throw new Error("Product ID missing for deletion.");
                url = `../api/products.php?id=${encodeURIComponent(id)}`;
                response = await fetch(url, { method: 'DELETE', credentials: 'include' });
                result = await response.json();
                if (!response.ok) throw new Error(result.message || `HTTP error! status: ${response.status}`);
                successMessage = result.message || `Product deleted successfully!`;
                logMessage = `Product deleted: (ID: ${id})`;
                // Reload and update UI
                await loadProducts();
                populateProductsTable();
                updateDashboard();
                break;

            case 'delete-category':
                 if (!id) throw new Error("Category ID missing for deletion.");
                 url = `../api/categories.php?id=${encodeURIComponent(id)}`;
                 response = await fetch(url, { method: 'DELETE', credentials: 'include' });
                 result = await response.json();
                 if (!response.ok) throw new Error(result.message || `HTTP error! status: ${response.status}`);
                 successMessage = result.message || `Category deleted successfully!`;
                 logMessage = `Category deleted: (ID: ${id})`;
                 // Reload and update UI
                 await loadCategories();
                 await loadProducts(); // Need to update product counts potentially
                 populateCategoriesTable();
                 populateProductsTable();
                 updateDashboard();
                 updateCategoryFilters();
                break;

             case 'delete-image':
                if (!name) throw new Error("Image name missing for deletion.");
                 url = `../api/images.php?name=${encodeURIComponent(name)}`;
                 response = await fetch(url, { method: 'DELETE', credentials: 'include' });
                 result = await response.json();
                 if (!response.ok) throw new Error(result.message || `HTTP error! status: ${response.status}`);
                 successMessage = result.message || `Image deleted successfully!`;
                 logMessage = `Image deleted: ${name}`;
                 // Reload and update UI
                 await loadImages();
                 populateImageGallery();
                 updateDashboard();
                 updateProductImageSelect();
                break;

            default:
                console.warn('Unknown confirmation action:', action);
                return; // Exit if action is unknown
        }

        showToast(successMessage, 'success');
        // logActivity(logMessage, logIcon); // Add later

    } catch (error) {
         console.error(`Error during ${action}:`, error);
         showToast(`Failed to ${action.replace('-', ' ')}: ${error.message}`, 'error');
    }
}


// ===== UI Population Functions (Placeholders/Needs Implementation) =====
// These need to be implemented to render data into the new HTML structure

function populateProductsTable() {
    console.log("Populating products table...");
    if (!productsTableContainer) {
        console.error("Products table container not found");
        return;
    }
    if (!Array.isArray(products)) {
        console.error("Products data is not an array:", products);
         productsTableContainer.innerHTML = '<p class="error">Error loading products data.</p>';
        return;
    }
     if (!Array.isArray(categories)) {
        console.error("Categories data is not an array:", categories);
        // Continue, but category names might be missing
    }

    if (products.length === 0) {
        productsTableContainer.innerHTML = '<p>No products found. Use the "Add New Product" button to add one.</p>';
        return;
    }

    // Build HTML table string
    let tableHtml = `<table class="data-table">
        <thead>
            <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Featured</th>
                <th>Special</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    products.forEach(p => {
        // Find category name safely
        const category = categories.find(c => c.id === p.category);
        const categoryName = category ? category.name : (p.category || 'N/A'); // Show ID if name not found
        const price = typeof p.price === 'number' ? `P${p.price.toFixed(2)}` : 'N/A';

        tableHtml += `
            <tr data-product-id="${p.id}">
                <td><img src="../images/${p.image || 'placeholder.svg'}" alt="${p.name || 'Product'}" height="40" style="vertical-align: middle;"></td>
                <td>${p.name || 'No Name'}</td>
                <td>${categoryName}</td>
                <td>${price}</td>
                <td>${p.featured ? '✓' : '–'}</td>
                <td>${p.isSpecial ? '✓' : '–'}</td>
                <td class="actions-cell">
                    <button class="action-icon edit-product-btn" data-id="${p.id}" title="Edit Product">✏️</button>
                    <button class="action-icon delete-product-btn" data-id="${p.id}" title="Delete Product">🗑️</button>
                </td>
            </tr>`;
    });

    tableHtml += '</tbody></table>';
    productsTableContainer.innerHTML = tableHtml;

    // Add event listeners to the new buttons within the table
    productsTableContainer.querySelectorAll('.edit-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            editProduct(productId); // Assumes editProduct function exists
        });
    });
    productsTableContainer.querySelectorAll('.delete-product-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productId = btn.getAttribute('data-id');
            confirmDeleteProduct(productId); // Assumes confirmDeleteProduct function exists
        });
    });
}

function populateCategoriesTable() {
     console.log("Populating categories table...");
     if (!categoriesTableContainer) {
         console.error("Categories table container not found");
         return;
     }
      if (!Array.isArray(categories)) {
        console.error("Categories data is not an array:", categories);
         categoriesTableContainer.innerHTML = '<p class="error">Error loading categories data.</p>';
        return;
    }
     if (!Array.isArray(products)) {
        console.warn("Products data not available for category count.");
        // Continue without product counts
    }

     if (categories.length === 0) {
         categoriesTableContainer.innerHTML = '<p>No categories found. Use the "Add New Category" button to add one.</p>';
         return;
     }

     // Sort categories by displayOrder before rendering
     const sortedCategories = [...categories].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

     let tableHtml = `<table class="data-table">
        <thead>
            <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Order</th>
                <th>Featured</th>
                <th>Product Count</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>`;

    sortedCategories.forEach(cat => {
        // Count products in this category safely
        const productCount = Array.isArray(products) ? products.filter(p => p.category === cat.id).length : 'N/A';

        tableHtml += `
            <tr data-category-id="${cat.id}">
                <td>${cat.name || 'No Name'}</td>
                <td>${cat.description || ''}</td>
                <td>${cat.displayOrder ?? 'N/A'}</td>
                <td>${cat.featured ? '✓' : '–'}</td>
                <td>${productCount}</td>
                <td class="actions-cell">
                    <button class="action-icon edit-category-btn" data-id="${cat.id}" title="Edit Category">✏️</button>
                    <button class="action-icon delete-category-btn" data-id="${cat.id}" title="Delete Category">🗑️</button>
                </td>
            </tr>`;
    });

    tableHtml += '</tbody></table>';
    categoriesTableContainer.innerHTML = tableHtml;

     // Add event listeners to the new buttons within the table
    categoriesTableContainer.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.getAttribute('data-id');
            editCategory(categoryId); // Assumes editCategory function exists
        });
    });
    categoriesTableContainer.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.getAttribute('data-id');
            confirmDeleteCategory(categoryId); // Assumes confirmDeleteCategory function exists
        });
    });
}
function populateImageGallery() {
     console.log("Populating image gallery...");
     if (!imageGalleryContainer) {
         console.error("Image gallery container not found");
         return;
     }
      if (!Array.isArray(images)) {
        console.error("Images data is not an array:", images);
         imageGalleryContainer.innerHTML = '<p class="error">Error loading images data.</p>';
        return;
    }
     if (!Array.isArray(products)) {
        console.warn("Products data not available for image usage check.");
        // Continue without usage check
    }

     if (images.length === 0) {
         imageGalleryContainer.innerHTML = '<p>No images found. Use the "Upload Image" button to add some.</p>';
         return;
     }

     // Sort images alphabetically
     const sortedImages = [...images].sort((a, b) => a.localeCompare(b));

     let galleryHtml = '<div class="image-gallery-grid">'; // Use a grid for layout

    sortedImages.forEach(imgName => {
        // Check if image is in use safely
        const isUsed = Array.isArray(products) ? products.some(p => p.image === imgName) : false;

        galleryHtml += `
            <div class="image-item ${isUsed ? 'in-use' : ''}" data-image-name="${imgName}">
                <div class="image-container">
                    <img src="../images/${imgName}" alt="${imgName}" loading="lazy">
                    ${isUsed ? '<span class="image-badge">In Use</span>' : ''}
                </div>
                <div class="image-info">
                    <div class="image-name" title="${imgName}">${imgName}</div>
                    <div class="image-actions">
                        <button class="action-icon delete-image-btn" data-name="${imgName}" title="Delete Image" ${isUsed ? 'disabled' : ''}>🗑️</button>
                    </div>
                </div>
            </div>`;
    });

    galleryHtml += '</div>'; // Close grid
    imageGalleryContainer.innerHTML = galleryHtml;

     // Add event listeners for delete buttons
     imageGalleryContainer.querySelectorAll('.delete-image-btn').forEach(btn => {
         btn.addEventListener('click', () => {
             if (btn.disabled) return; // Don't do anything if disabled
             const imageName = btn.getAttribute('data-name');
             confirmDeleteImage(imageName);
         });
     });
}
function populateSettingsForm() {
     console.log("Populating settings form...");
     // Ensure the container is the form itself
     const settingsForm = document.getElementById('settings-form');
     if (!settingsForm || settingsForm.tagName !== 'FORM') {
         console.error("Settings form not found or is not a FORM element.");
         // If the container isn't the form, try finding the form within it
         // settingsForm = settingsFormContainer.querySelector('form');
         // if (!settingsForm) { ... return ... }
         return;
     }

     // Check if settings object is populated
     if (!settings || Object.keys(settings).length === 0) {
         console.warn("Settings data not available for populating form.");
         // Optionally display a message or try loading settings again
         // settingsForm.innerHTML = '<p>Loading settings...</p>';
         // loadSettings().then(populateSettingsForm); // Be careful of infinite loops
         return;
     }

     // Assuming fields exist as per the saveSettings function logic:
     try {
        // Ensure the form container is empty before potentially adding fields if needed,
        // but if fields are static in HTML, just populate them.
        // settingsForm.innerHTML = ''; // Uncomment if rebuilding form dynamically

        // Populate existing fields using IDs (ensure these IDs exist in admin/index.html)
        settingsForm.querySelector('#slideDuration').value = settings.slideDuration ?? 8000;
        settingsForm.querySelector('#animationSpeed').value = settings.animationSpeed ?? 'normal';
        settingsForm.querySelector('#showWeather').checked = settings.showWeather ?? false;
        settingsForm.querySelector('#showClock').checked = settings.showClock ?? false;
        settingsForm.querySelector('#showNewsTicker').checked = settings.showNewsTicker ?? false;
        settingsForm.querySelector('#newsTickerContent').value = settings.newsTickerContent ?? '';
        settingsForm.querySelector('#autoFullscreen').checked = settings.autoFullscreen ?? false;
        settingsForm.querySelector('#autoFullscreenDelay').value = settings.autoFullscreenDelay ?? 30000;
        settingsForm.querySelector('#storeName').value = settings.storeName ?? '';
        settingsForm.querySelector('#storeLocation').value = settings.storeLocation ?? '';
        settingsForm.querySelector('#contactPhone').value = settings.contactInfo?.phone ?? '';
        settingsForm.querySelector('#contactEmail').value = settings.contactInfo?.email ?? '';
        settingsForm.querySelector('#contactWebsite').value = settings.contactInfo?.website ?? '';
        settingsForm.querySelector('#primaryColor').value = settings.displaySettings?.primaryColor ?? '#000000';
        settingsForm.querySelector('#secondaryColor').value = settings.displaySettings?.secondaryColor ?? '#000000';
        settingsForm.querySelector('#accentColor').value = settings.displaySettings?.accentColor ?? '#000000';
        settingsForm.querySelector('#fontSize').value = settings.displaySettings?.fontSize ?? 'normal';

        // Clear password fields
        settingsForm.querySelector('#adminPassword').value = '';
        settingsForm.querySelector('#confirmPassword').value = '';
     } catch (error) {
         console.error("Error populating settings form:", error);
         // Avoid clearing the container if fields are static HTML
         // settingsForm.innerHTML = '<p class="error">Error displaying settings form.</p>';
         showToast("Error displaying settings form.", "error");
     }
     // Removed incorrect placeholder line that overwrote populated fields.
}

function updateDashboard() {
     console.log("Updating dashboard...");
     // Ensure elements exist before trying to update
     if (totalProductsElement) {
         totalProductsElement.textContent = Array.isArray(products) ? products.length : 'N/A';
     }
     if (totalCategoriesElement) {
         totalCategoriesElement.textContent = Array.isArray(categories) ? categories.length : 'N/A';
     }
      if (featuredProductsElement) {
         featuredProductsElement.textContent = Array.isArray(products) ? products.filter(p => p.featured).length : 'N/A';
     }
     if (totalImagesElement) {
         totalImagesElement.textContent = Array.isArray(images) ? images.length : 'N/A';
     }
     if (lastUpdatedTimeElement) {
        // Use the lastUpdated timestamp from settings if available
        const lastUpdated = settings.lastUpdated ? new Date(settings.lastUpdated) : null;
        lastUpdatedTimeElement.textContent = lastUpdated ? lastUpdated.toLocaleString() : 'N/A';
     }

     // Update the activity log display on the dashboard
     updateActivityLogUI();
}

function updateCategoryFilters() {
     console.log("Updating category filters/dropdowns...");
     // Populate the category dropdown in the product modal
     if (productCategoryModalSelect) {
        // Store current value if editing, before clearing
        const currentValue = productCategoryModalSelect.value;
        productCategoryModalSelect.innerHTML = '<option value="">-- Select Category --</option>'; // Clear existing options
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.id;
                option.textContent = cat.name;
                // Don't re-select here, let showProductModal handle it
                productCategoryModalSelect.appendChild(option);
            });
             // Restore value if it still exists after repopulating
             if (categories.some(cat => cat.id === currentValue)) {
                 productCategoryModalSelect.value = currentValue;
             }
        }
     } else {
         console.warn("Product category modal select not found.");
     }
     // TODO: Populate main filter dropdown if needed
}

function updateProductImageSelect() {
     console.log("Updating product image select...");
     // Populate the image dropdown in the product modal
     if (productImageModalSelect) {
         // Store current value if editing, before clearing
        const currentValue = productImageModalSelect.value;
        productImageModalSelect.innerHTML = '<option value="">-- Select Image --</option>'; // Clear existing options
         if (Array.isArray(images)) {
            images.forEach(imgName => {
                const option = document.createElement('option');
                option.value = imgName;
                option.textContent = imgName;
                 // Don't re-select here, let showProductModal handle it
                productImageModalSelect.appendChild(option);
            });
             // Restore value if it still exists after repopulating
             if (images.includes(currentValue)) {
                 productImageModalSelect.value = currentValue;
             }
         }
         // Add listener for preview (ensure it's added only once or remove/re-add)
         productImageModalSelect.removeEventListener('change', showProductImagePreview); // Prevent multiple listeners
         productImageModalSelect.addEventListener('change', showProductImagePreview);
     } else {
          console.warn("Product image modal select not found.");
     }
}

// Helper to show image preview in product modal (New)
function showProductImagePreview() {
    if (!productImageModalSelect || !productImagePreviewModal) return;
    const selectedImage = productImageModalSelect.value;
    if (selectedImage) {
        productImagePreviewModal.innerHTML = `<img src="../images/${selectedImage}" alt="Preview" style="max-height: 100px; max-width: 150px; margin-top: 5px;">`;
    } else {
        productImagePreviewModal.innerHTML = '';
    }
}

// --- Confirmation Modal Helpers (Placeholders) ---
function confirmDeleteProduct(id) {
    const product = products.find(p => p.id === id);
    const productName = product ? product.name : `ID: ${id}`;
    if (confirm(`Are you sure you want to delete product "${productName}"?`)) {
        handleConfirmAction('delete-product', id, null); // Pass action and id
    }
}
function confirmDeleteCategory(id) {
     const category = categories.find(c => c.id === id);
     const categoryName = category ? category.name : `ID: ${id}`;
     if (confirm(`Are you sure you want to delete category "${categoryName}"? This cannot be undone.`)) {
         handleConfirmAction('delete-category', id, null); // Pass action and id
     }
}
function confirmDeleteImage(name) {
      if (confirm(`Are you sure you want to delete image "${name}"? This cannot be undone if the image is not in use.`)) {
