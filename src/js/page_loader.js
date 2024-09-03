export function loadContent(page) {
    const contentDiv = document.getElementById('content');

    // Store the current page in sessionStorage
    sessionStorage.setItem('currentPage', page);

    import(`./load_practice_info.js`)
        .then(module => {
            module.loadPracticeInfo();
        })
        .catch(error => console.error('Error loading load_practice_info.js:', error));

    const cacheBuster = new Date().getTime(); // Generate a unique timestamp to bust the cache

    fetch(`/components/${page}.html?ts=${cacheBuster}`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;

            if (page === 'select_service') {
                import(`./select_service.js?ts=${cacheBuster}`)
                    .then(module => {
                        module.initializePreferredDate();
                        module.initSelectService();
                        module.initializeServiceSelection();
                    })
                    .catch(error => console.error('Error loading select_service.js:', error));
            }

            // Load scripts for other pages as necessary
            if (page === 'homepage') {
                import(`./popup_loader.js?ts=${cacheBuster}`)
                    .then(module => {
                        module.setupPopup();
                    })
                    .catch(error => console.error('Error loading popup_loader.js:', error));

                import(`./load_practice_info.js?ts=${cacheBuster}`)
                    .then(module => {
                        module.loadPracticeInfo();
                    })
                    .catch(error => console.error('Error loading load_practice_info.js:', error));
            }

            if (page === 'cancel') {
                import(`./cancel_appointment.js?ts=${cacheBuster}`)
                    .catch(error => console.error('Error loading cancel_appointment.js:', error));
            }

            if (page === 'checkout') {
                import(`./booking_confirmation.js?ts=${cacheBuster}`)
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
    const savedPage = sessionStorage.getItem('currentPage') || 'homepage';
    loadContent(savedPage);
});

// Expose loadContent function to global scope
window.loadContent = loadContent;