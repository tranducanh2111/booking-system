// cancel_appointment.js

// Wait for the DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Find the form element
    const form = document.forms['Cancel Appointment'];

    // Add event listener for form submission
    form.addEventListener('submit', function(event) {
        // Prevent default form submission
        event.preventDefault();

        // Perform any form validation here if needed

        // Redirect to cancel_confirmation.html
        window.location.href = '/pages/cancel_confirmation.html';
    });
});