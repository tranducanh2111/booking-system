async function setupPopup() {
    try {
        // Assume this function fetches or loads something asynchronously
        await loadPopupContent(); // Replace with your actual async operation

        const clientFormButton = document.getElementById('open_client_type_popup');
        const overlay = document.getElementById('overlay');
        const popup = document.getElementById('popup_choose_client_type');
        const cancelBtn = document.getElementById('cancelBtn');

        console.log("Client Form Button:", clientFormButton);
        console.log("Overlay:", overlay);
        console.log("Popup:", popup);
        console.log("Cancel Button:", cancelBtn);

        if (clientFormButton) {
            clientFormButton.addEventListener('click', () => {
                overlay.style.display = 'block';
                popup.style.display = 'block';
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                popup.style.display = 'none';
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