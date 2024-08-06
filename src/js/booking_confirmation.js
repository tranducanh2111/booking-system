function moveToNext(current, nextFieldID) {
    if (current.value.length >= current.maxLength) {
        document.getElementById(nextFieldID).focus();
    }
}

// Format the card number input and update card network image
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("card-number");
    const industryIdentifier = document.getElementById("industry-identfier");
    const bankIdentifier = document.getElementById("bank-identifier");

    const cardNetworkImages = {
        "3": "svg/icons/amex.svg",
        "4": "svg/icons/visa.svg",
        "5": "svg/icons/mastercard.svg",
        "2": "svg/icons/mastercard.svg"
    };

    // Load BINs from JSON file
    let bankIINs = {};
    fetch('/api/bank-bin')
        .then(response => response.json())
        .then(data => {
            bankIINs = data;
            // Initialize input handling after loading data
            input.addEventListener("input", () => {
                const value = input.value.replace(/\s/g, '');
                input.value = formatInput(value);
                updateCardNetworkImage(value);
                if (value.length >= 6) {
                    updateBankImage(value);
                }
            });
        })
        .catch(error => console.error('Error loading BIN data:', error));

    const formatInput = (value) => {
        const digits = value.replace(/\D/g, '');
        return digits.match(/.{1,4}/g)?.join(' ') || '';
    };

    const updateCardNetworkImage = (value) => {
        const firstDigit = value.charAt(0);
        const imagePath = cardNetworkImages[firstDigit] || "svg/icons/visa.svg";
        industryIdentifier.innerHTML = `<img src="${imagePath}" height="24" alt="Card Network Icon">`;
    };

    const updateBankImage = (value) => {
        const firstSixDigits = value.slice(0, 6);
        for (const [bank, iins] of Object.entries(bankIINs)) {
            if (iins.includes(firstSixDigits)) {
                const bankName = bank.split(' ')[0].toLowerCase();
                bankIdentifier.innerHTML = `<img src="svg/bank-logos/${bankName}.svg" height="32" alt="${bank} Logo">`;
                return;
            }
        }
        // Default image if no match found
        // bankIdentifier.innerHTML = `<img src="svg/bank-logos/anz.svg" height="32" alt="Default Bank Logo">`;
    };

    input.addEventListener("input", () => {
        const value = input.value.replace(/\s/g, '');
        input.value = formatInput(value);
        updateCardNetworkImage(value);
        if (value.length >= 6) {
            updateBankImage(value);
        }
    });
});