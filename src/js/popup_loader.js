// popup_loader.js
async function setupPopup() {
    try {
        // Wait for the popup window content loaded completely
        await loadPopupContent();

        const clientFormButton = document.getElementById('open_client_type_popup');
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup_choose_client_type');
        const cancelBtn = document.getElementById('cancelBtn');
        const existingClientBtn = document.getElementById('existingClientBtn');

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
    } catch (error) {
        console.error('Error setting up popup:', error);
    }
}

// Function that simulates an async operation, e.g., fetching data or loading content
async function loadPopupContent() {
    // Simulate async operation
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000); // 1-second delay
    });
}

// Call the async function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupPopup();
});