import { loadContent } from './page_loader.js';

export function initializeCheckoutPage() {
    const input = document.getElementById('card-number');
    const industryIdentifier = document.getElementById('industry-identfier');
    const bankIdentifier = document.getElementById('bank-identifier');

    // Default Payment
    bankIdentifier.innerHTML = `<img src="svg/bank-logos/stripe.svg" alt="Stripe" height="32">`;
    industryIdentifier.innerHTML = `<img src="svg/icons/visa.svg" alt="Visa Icon" height="32">`;

    const cardNetworkImages = {
        3: 'svg/icons/amex.svg',
        4: 'svg/icons/visa.svg',
        5: 'svg/icons/mastercard.svg',
        2: 'svg/icons/mastercard.svg',
    };

    let bankIINs = {};

    fetchBankIINs()
        .then(() => {
            input.addEventListener('input', handleInput);
        })
        .catch((error) => console.error('Error loading BIN data:', error));

    function fetchBankIINs() {
        return fetch('/api/bank-bin')
            .then((response) => response.json())
            .then((data) => {
                bankIINs = data;
            });
    }

    function handleInput() {
        const value = input.value.replace(/\s/g, '');
        input.value = formatInput(value);
        updateCardNetworkImage(value);
        if (value.length >= 6) {
            updateBankImage(value);
        }
    }

    function formatInput(value) {
        const digits = value.replace(/\D/g, '');
        return digits.match(/.{1,4}/g)?.join(' ') || '';
    }

    function updateCardNetworkImage(value) {
        const firstDigit = value.charAt(0);
        const imagePath = cardNetworkImages[firstDigit] || 'svg/icons/visa.svg';
        industryIdentifier.innerHTML = `<img src="${imagePath}" alt="Card Network" height="32">`;
    }

    function updateBankImage(value) {
        const firstSixDigits = value.slice(0, 6);
        for (const [bank, iins] of Object.entries(bankIINs)) {
            if (iins.includes(firstSixDigits)) {
                const bankName = bank.split(' ')[0].toLowerCase();
                bankIdentifier.innerHTML = `<img src="svg/bank-logos/${bankName}.svg" alt="${bank}">`;
                return;
            }
        }
        // Default image if no match found
        bankIdentifier.innerHTML = `<img src="svg/bank-logos/stripe.svg" alt="Stripe" height="32">`;
    }

    populateAppointmentData();

    document
        .getElementById('card-number')
        .addEventListener('input', function () {
            moveToNext(this, 'card-holder');
        });
    document
        .getElementById('card-expiry-month')
        .addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            moveToNext(this, 'card-expiry-year');
        });
    document
        .getElementById('card-expiry-year')
        .addEventListener('input', function (e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            moveToNext(this, 'card-cvv');
        });
    document.getElementById('card-cvv').addEventListener('input', function (e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// In credit card, user can auto switch to the next input once the length of current input is reached
export function moveToNext(currentInput, nextInputId) {
    if (currentInput.value.length === currentInput.maxLength) {
        document.getElementById(nextInputId).focus();
    }
}

// Redirect user to the select_service if the user wants to change the service
export function chooseOtherService() {
    loadContent('select_service');
}

// Redirect user to the homepage if the user wants to cancel the booking reservation
export function cancelAppointmentReservation() {
    loadContent('homepage');

    // Remove session storage for temporary booking data
    populateAppointmentData();
}

function populateAppointmentData() {
    const appointmentBookingData = JSON.parse(
        sessionStorage.getItem('appointmentBookingData')
    );
    if (appointmentBookingData) {
        document.getElementById('confirm-service').textContent =
            appointmentBookingData['service'];
        document.getElementById('confirm-service-date').textContent =
            appointmentBookingData['appointment-day'];
        document.getElementById('confirm-service-time').textContent =
            appointmentBookingData['appointment-time'];

        // Remove session storage for temporary booking data
        // sessionStorage.removeItem('appointmentBookingData');
    }
}

window.moveToNext = moveToNext;
window.chooseOtherService = chooseOtherService;
window.cancelAppointmentReservation = cancelAppointmentReservation;
