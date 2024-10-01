// js/cancel_appointment.js

import { loadContent } from "./page_loader.js";

export function proceedCancellation() {
    const form = document.forms['Cancel Appointment'];
    const formData = new FormData(form);
    const cancelAppointmentRequestData = Object.fromEntries(formData);

    // Retrieve form data
    cancelAppointmentRequestData['apptcode'] = document.getElementById('apptcode').textContent;
    cancelAppointmentRequestData['mobile'] = document.getElementById('mobile').textContent;

    fetch('/cancel_appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(cancelAppointmentRequestData)
    })
    .then(response => response.json())
    .then(cancelAppointmentRequestData => {
        if (cancelAppointmentRequestData.success) {
            // Remove data for the cancel appointment request
            sessionStorage.removeItem('cancelAppointmentRequestData');
            // Redirect to the cancel_confirmation page
            loadContent('cancel_confirmation');
            // Avoid the user can access the cancel_confirmation page
            sessionStorage.removeItem('currentPage');
        } else {
            alert('Error cancelling appointment. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

window.proceedCancellation = proceedCancellation;