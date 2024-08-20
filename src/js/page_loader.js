export function loadContent(page) {
    const contentDiv = document.getElementById('content');

    // Store the current page in sessionStorage
    sessionStorage.setItem('currentPage', page);

    fetch(`/components/${page}.html`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;

            // search clients locally
            if (page === 'search_client') {
                import('./client_search.js')
                .then(module => {
                    module.setupClientSearch();
                })
                .catch(error => console.error('Error loading client_search.js:', error));
            }

            // Load required script for the homepage page
            if (page === 'homepage') {
                import('./popup_loader.js')
                    .then(module => {
                        module.setupPopup();
                    })
                    .catch(error => console.error('Error loading popup_loader.js:', error));

                import('./load_clinic_note.js')
                    .then(module => {
                        module.loadClinicNotes();
                    })
                    .catch(error => console.error('Error loading load_clinic_note.js:', error));
            }

            // Load required script for the cancel page
            if (page === 'cancel') {
                import('./cancel_appointment.js')
                    .then(module => {
                        module.proceedCancellation();
                    })
                    .catch(error => console.error('Error loading cancel_appointment.js:', error));
            }

            if (page === 'select_service') {
                import('./select_service.js')
                    .then(module => {
                        module.initSelectService();
                        module.initializeServiceSelection();
                    })
                    .catch(error => console.error('Error loading select_service.js:', error));
            }

            if (page === 'checkout') {
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
    // Check if there is a saved page in sessionStorage
    const savedPage = sessionStorage.getItem('currentPage');

    if (savedPage) {
        loadContent(savedPage);
    } else {
        // Load the default homepage if no page is saved
        loadContent('homepage');
    }
});

// Expose loadContent function to global scope
window.loadContent = loadContent;