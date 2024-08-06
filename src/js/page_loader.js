// page_loader.js
export function loadContent(page) {
    const contentDiv = document.getElementById('content');
    fetch(`/components/${page}.html`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;

            // After loading the HTML, check if it's the select_service page
            if (page === 'select_service') {
                // Load and initialize the select_service script
                import('./select_service.js')
                    .then(module => {
                        module.initSelectService();
                        module.initializeServiceSelection();
                    })
                    .catch(error => console.error('Error loading select_service.js:', error));
            }

            // Load and initialize the booking_confirmation script if needed
            if (page === 'checkout') {
                // Load and initialize the select_service script
                import('./booking_confirmation.js')
                    .then(module => {
                        module.initializeCheckoutPage();
                    })
                    .catch(error => console.error('Error loading booking_confirmation.js:', error));
            }
        })
        .catch(() => {
            contentDiv.innerHTML = '<h2>404</h2><p>Page not found.</p>';
        });
}

// Load the default content
document.addEventListener('DOMContentLoaded', () => {
    loadContent('homepage');
});

// Expose loadContent function to global scope
window.loadContent = loadContent;