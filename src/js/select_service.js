// select_service.js
console.log("select_service.js loaded");

const clientDetailSection = document.querySelector('.client-detail');
const patientDetailSection = document.querySelector('.patient-detail');

const requiredFields = ['fname', 'lname', 'email', 'mobile', 'patient-name', 'patient-gender', 'patient-breed', 'patient-species'];

export function initSelectService() {
    const serviceSelect = document.getElementById('service');
    const serviceDay = document.querySelector('.service-time');
    const serviceTime = document.querySelector('#appointment-time');

    // Initially hide service option and service time
    if (serviceDay) serviceDay.style.display = 'none';
    if (clientDetailSection) clientDetailSection.style.display = 'none';
    if (patientDetailSection) patientDetailSection.style.display = 'none';

    // Initially hide the booking button
    const bookingButton = document.getElementById('request-appointment-booking');
    if (bookingButton) {
        bookingButton.style.display = 'none';
    }

    // Add event listener to service select
    if (serviceSelect) {
        serviceSelect.addEventListener('change', function() {
            if (serviceDay) {
                serviceDay.style.display = this.value ? 'block' : 'none';
            }
        });
    }

    // Add event listener to service time
    if (serviceTime) {
        serviceTime.addEventListener('change', function() {
            if (clientDetailSection && patientDetailSection && serviceTime.value != "") {
                clientDetailSection.style.display = 'block';
                patientDetailSection.style.display = 'block';
                toggleBookingButton();
            }
        });
    }

    // Add event listeners to all input fields
    const clientInputs = clientDetailSection.querySelectorAll('input, select');
    const patientInputs = patientDetailSection.querySelectorAll('input, select');

    // Add event listeners to specific input fields
    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', toggleBookingButton);
        }
    });
}

function checkAllFieldsFilled() {
    
    return requiredFields.every(id => {
        const input = document.getElementById(id);
        return input && input.value.trim() !== '';
    });
}

function toggleBookingButton() {
    const bookingButton = document.getElementById('request-appointment-booking');
    if (bookingButton) {
        bookingButton.style.display = checkAllFieldsFilled() ? 'block' : 'none';
    }
}

// Load service options, available date and time from json file
export function initializeServiceSelection() {
    console.log("select service function event loaded");
    const serviceSelect = document.getElementById('service');
    const daySelectionContainer = document.getElementById('day-selection');
    const appointmentTimeSelect = document.getElementById('appointment-time');
    const selectedDayElement = document.getElementById('selected-day');
    const beforeButton = document.getElementById('previous-day');
    const afterButton = document.getElementById('next-day');

    let servicesData = [];
    let selectedService = '';
    let selectedDay = '';
    let availableDays = [];

    // Fetch data from JSON file
    fetch('/api/service-list')
        .then(response => response.json())
        .then(data => {
            console.log('Data:', data);
            servicesData = data.services;
            populateServiceOptions();
        })
        .catch(error => console.error('Error fetching data:', error));

    // Populate service options
    function populateServiceOptions() {
        console.log('Populating service options with:', servicesData);
        servicesData.forEach(service => {
            const option = document.createElement('option');
            option.value = service.name;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    }

    function populateDayOptions(serviceName) {
        const service = servicesData.find(s => s.name === serviceName);
        if (!service) return;
    
        // Limit to the first 7 days
        availableDays = Object.keys(service.availableDays).slice(0, 7);
    
        daySelectionContainer.innerHTML = '';
        availableDays.forEach(day => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn d-flex align-items-center justify-content-center border border-black px-10 py-2 opacity-50';
            button.textContent = day;
    
            button.addEventListener('click', () => {
                selectDay(day);
            });
    
            daySelectionContainer.appendChild(button);
        });
    
        // Auto-select the first day if available
        if (availableDays.length > 0) {
            selectDay(availableDays[0]);
        }
    }

    function selectDay(day) {
        selectedDay = day;
        selectedDayElement.textContent = day;
    
        clientDetailSection.style.display = 'none';
        patientDetailSection.style.display = 'none';
        
        // Update button styles
        const buttons = daySelectionContainer.querySelectorAll('button');
        buttons.forEach(button => {
            if (button.textContent === day) {
                button.classList.remove('border-black', 'opacity-50');
                button.classList.add('bg-primary', 'text-white', 'border-primary');
            } else {
                button.classList.remove('bg-primary', 'text-white', 'border-primary');
                button.classList.add('border-black', 'opacity-50');
            }
        });
    
        // Only populate time options if we have a selected service
        if (selectedService) {
            populateTimeOptions(selectedService, day);
        }
    }

    // Populate time options based on selected day
    function populateTimeOptions(serviceName, day) {
        const service = servicesData.find(s => s.name === serviceName);
        if (!service) return;

        const times = service.availableDays[day] || [];
        appointmentTimeSelect.innerHTML = '<option value="" class="text-body" disabled selected hidden>Appointment Time</option>';
        times.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            appointmentTimeSelect.appendChild(option);
        });
    }

    // Navigate to the previous available day
    function goToPreviousDay() {
        const currentIndex = availableDays.indexOf(selectedDay);
        if (currentIndex > 0) {
            selectDay(availableDays[currentIndex - 1]);
        }
    }

    // Navigate to the next available day
    function goToNextDay() {
        const currentIndex = availableDays.indexOf(selectedDay);
        if (currentIndex < availableDays.length - 1) {
            selectDay(availableDays[currentIndex + 1]);
        }
    }

    // Event listener for service select change
    serviceSelect.addEventListener('change', (event) => {
        selectedService = event.target.value;
        selectedDay = '';
        selectedDayElement.textContent = '';
        populateDayOptions(selectedService);
        appointmentTimeSelect.innerHTML = '<option value="" class="text-body" disabled selected hidden>Appointment Time</option>';
    
        if (selectedService) {
            populateDayOptions(selectedService);
        }
    });

    // Event listeners for before and after buttons
    if (beforeButton) {
        beforeButton.addEventListener('click', goToPreviousDay);
    }
    if (afterButton) {
        afterButton.addEventListener('click', goToNextDay);
    }
}
