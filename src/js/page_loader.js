// page_loader.js
export function loadContent(page) {
    const contentDiv = document.getElementById('content');
    fetch(`/components/${page}.html`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;

            // Load required script for the homepage page
            if (page === 'homepage') {
                // Load and initialize the popup_loader script
                import('./popup_loader.js')
                    .then(module => {
                        module.setupPopup();
                    })
                    .catch(error => console.error('Error loading popup_loader.js:', error));
                // Load and initialize the clinic_note script
                import('./load_clinic_note.js')
                    .then(module => {
                        module.loadClinicNotes();
                    })
                    .catch(error => console.error('Error loading load_clinic_note.js:', error));
            }

            // Load required script for the cancel page
            if (page === 'cancel') {
                // Load and initialize the cancel_appointment script
                import('./cancel_appointment.js')
                    .then(module => {
                        module.proceedCancellation();
                    })
                    .catch(error => console.error('Error loading cancel_appointment.js:', error));
            }

            // After loading the HTML, check if it's the select_service page to load the required js file
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
                // Load and initialize the booking_confirmation script
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