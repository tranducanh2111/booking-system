export function initializeCheckoutPage() {
    const input = document.getElementById("card-number");
    const industryIdentifier = document.getElementById("industry-identfier");
    const bankIdentifier = document.getElementById("bank-identifier");

    const cardNetworkImages = {
        "3": "svg/icons/amex.svg",
        "4": "svg/icons/visa.svg",
        "5": "svg/icons/mastercard.svg",
        "2": "svg/icons/mastercard.svg"
    };

    let bankIINs = {};

    fetchBankIINs()
        .then(() => {
            input.addEventListener("input", handleInput);
        })
        .catch(error => console.error('Error loading BIN data:', error));

    function fetchBankIINs() {
        return fetch('/api/bank-bin')
            .then(response => response.json())
            .then(data => {
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
        const imagePath = cardNetworkImages[firstDigit] || "svg/icons/visa.svg";
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
        bankIdentifier.innerHTML = `<img src="svg/bank-logos/commonwealth-bank.svg" alt="commonwealth-bank">`;
    }

    populateAppointmentData();

    document.getElementById("card-number").addEventListener("input", function() {
        moveToNext(this, 'card-holder');
    });
    document.getElementById("card-expiry-month").addEventListener("input", function() {
        moveToNext(this, 'card-expiry-year');
    });
    document.getElementById("card-expiry-year").addEventListener("input", function() {
        moveToNext(this, 'card-cvv');
    });
}

// Define moveToNext function if it's required
export function moveToNext(currentInput, nextInputId) {
    if (currentInput.value.length === currentInput.maxLength) {
        document.getElementById(nextInputId).focus();
    }
}

function populateAppointmentData() {
    const appointmentBookingData = JSON.parse(sessionStorage.getItem('appointmentBookingData'));
    if (appointmentBookingData) {
        document.getElementById('client-title-name').textContent = `${appointmentBookingData.title} ${appointmentBookingData.fname} ${appointmentBookingData.lname}`;
        document.getElementById('client-email').textContent = appointmentBookingData.email;
        document.getElementById('client-mobile').textContent = appointmentBookingData.mobile;
        document.getElementById('confirm-patient-name').textContent = appointmentBookingData['patient-name'];
        document.getElementById('confirm-patient-species').textContent = appointmentBookingData['patient-species'];
        document.getElementById('confirm-patient-breed').textContent = appointmentBookingData['patient-breed'];
        document.getElementById('confirm-patient-dob').textContent = formatDate(appointmentBookingData['patient-dob']);
        document.getElementById('confirm-service').textContent = appointmentBookingData['service'];
        document.getElementById('confirm-service-date').textContent = appointmentBookingData['appointment-day'];
        document.getElementById('confirm-service-time').textContent = appointmentBookingData['appointment-time'];

        document.getElementById('service-item-1').textContent = appointmentBookingData['service'];
        
        // You may need to adjust these IDs based on your actual HTML structure
        sessionStorage.removeItem('appointmentBookingData');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    if (isNaN(date)) {
        return "No Birthday";
    }
    else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}

window.moveToNext = moveToNext;