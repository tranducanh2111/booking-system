// js/cancel_appointment.js

import { loadContent } from "./page_loader.js";

export function proceedCancellation() {
    const form = document.forms['Cancel Appointment'];
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    fetch('/cancel_appointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadContent('cancel_confirmation');
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