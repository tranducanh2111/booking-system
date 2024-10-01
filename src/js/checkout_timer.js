let timeoutDuration = 8 * 60 * 1000; // 8 minutes in milliseconds
let extensionDuration = 3 * 60 * 1000; // 3 minutes in milliseconds
let timeoutId;

export function startCheckoutTimer() {
    console.log("start timeout process");
    timeoutId = setTimeout(showTimeoutPopup, timeoutDuration);
}

function showTimeoutPopup() {
    const userChoice = confirm("Your session is about to expire. Would you like to extend it for another 3 minutes?");
    if (userChoice) {
        resetTimer();
    } else {
        redirectToHomepage();
    }
}

function resetTimer() {
    console.log("start extend timeout process");
    clearTimeout(timeoutId);
    timeoutId = setTimeout(showTimeoutPopup, extensionDuration);
}

function redirectToHomepage() {
    sessionStorage.removeItem('appointmentBookingData');
    sessionStorage.removeItem('currentPage');
    location.reload();
}

// Start the timer when the checkout page is loaded
document.addEventListener('DOMContentLoaded', startCheckoutTimer);
