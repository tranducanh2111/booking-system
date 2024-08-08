// popup_loader.js
import { loadContent } from './page_loader.js';

export function setupPopup() {
        const clientFormButton = document.getElementById('open_client_type_popup');
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup_choose_client_type');
        const cancelBtn = document.getElementById('cancelBtn');
        const existingClientBtn = document.getElementById('existingClientBtn');
        const GuestBtn = document.getElementById('GuestBtn');

        // Open the popup for the index.html page
        if (clientFormButton) {
            clientFormButton.addEventListener('click', () => {
                overlay.style.display = 'block';
                popup.style.display = 'block';
            });
        }

        // Close the Popup Layout
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                popup.style.display = 'none';
            });
        }

        // Redirect users to the search_client.html page for old clients
        if (existingClientBtn) {
            existingClientBtn.addEventListener('click', () => {
                loadContent('search_client');
            });
        }

        // Redirect users to the search_service.html page for old clients
        if (GuestBtn) {
            GuestBtn.addEventListener('click', () => {
                loadContent('select_service');
            });
        }
}

// Call the async function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupPopup();
});