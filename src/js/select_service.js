// select_service.js
import { loadContent } from "./page_loader.js";
import { formatDate } from "./common_function.js";

const serviceDay = document.querySelector('.service-time');
const serviceSelect = document.getElementById('service');
const daySelectionContainer = document.getElementById('day-selection');
const selectedDayElement = document.getElementById('selected-day');
const beforeButton = document.getElementById('previous-day');
const afterButton = document.getElementById('next-day');
const morningSessionContainer = document.getElementById('morning-session');
const afternoonSessionContainer = document.getElementById('afternoon-session');
const appointmentStaffSelect = document.getElementById('appointment-staff');
const appointmentRoomSelect = document.getElementById('appointment-room');
const bookingButton = document.getElementById('request-appointment-booking');

let servicesData = [];
let selectedService = '';
let selectedDay = '';
let availableDays = [];
let selectedSession = null;

export function initSelectService() {
    // Initially hide service option and service time
    if (serviceDay) serviceDay.style.display = 'none';

    // Initially hide the booking button
    const bookingButton = document.getElementById('request-appointment-booking');
    if (bookingButton) {
        bookingButton.style.display = 'none';
    }
}

// Load service options, available date, and time from json file
export function initializeServiceSelection() {
    // Fetch data from JSON file
    fetch('/api/service-list')
        .then(response => response.json())
        .then(data => {
            servicesData = data.services;
            populateServiceOptions();
        })
        .catch(error => console.error('Error fetching data:', error));

    // Populate service options
    function populateServiceOptions() {
        servicesData.forEach(service => {
            const option = document.createElement('option');
            option.value = service.name;
            option.textContent = service.name;
            serviceSelect.appendChild(option);
        });
    }

    // Event listener for service select change
    serviceSelect.addEventListener('change', (event) => {
        selectedService = event.target.value;
        selectedDay = '';
        selectedDayElement.textContent = '';
        populateDayOptions(selectedService);
    });

    // Event listeners for before and after buttons
    if (beforeButton) {
        beforeButton.addEventListener('click', goToPreviousDay);
    }
    if (afterButton) {
        afterButton.addEventListener('click', goToNextDay);
    }
}

// Handle form submission for an appointment booking
export function proceedAppointmentRequest() {
    const form = document.forms['Proceed Appointment Request'];
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    data['service'] = document.getElementById('service').value;
    data['appointment-day'] = document.getElementById('selected-day').textContent;
    const selectedSession = document.querySelector('.session-btn.bg-primary');
    if (selectedSession) {
        data['appointment-time'] = selectedSession.textContent;
    }

    // Store form data in sessionStorage
    sessionStorage.setItem('appointmentBookingData', JSON.stringify(data));

    fetch('/proceed-appointment-request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadContent('checkout');
            } else {
                alert('Error booking an appointment. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
}

export function searchServiceAvailableTime(event) {
    // Prevent the default form submission
    event.preventDefault();

    const serviceSelect = document.getElementById('service');
    const preferDate = document.getElementById('prefer-date').value;

    if (!serviceSelect.value) {
        alert('Please select a service.');
        return;
    }

    // Fetch the data for the selected service
    fetch('/api/service-list')
        .then(response => response.json())
        .then(data => {
            const serviceData = data.services.find(service => service.name === serviceSelect.value);

            if (!serviceData) {
                alert('Selected service is not available.');
                return;
            }

            if (preferDate == "")
            {
                alert('Please select your preferred date.');
                return;
            }

            // Filter available days based on the preferred date (inclusive)
            const availableDays = serviceData.days.filter(dayObj => new Date(dayObj.date) >= new Date(preferDate));

            if (availableDays.length === 0) {
                alert('No available sessions for the selected date.');
                return;
            }

            populateDayOptions(serviceSelect.value);
            selectDay(availableDays[0].date); // Select the first available day

            if (serviceDay) {
                serviceDay.style.display = serviceSelect.value ? 'block' : 'none';
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Populate available days
function populateDayOptions(serviceName) {
    const service = servicesData.find(s => s.name === serviceName);
    if (!service) {
        console.log(`Service not found: ${serviceName}`); // Debugging line
        return;
    }

    availableDays = service.days.map(dayObj => dayObj.date).slice(0, 10); // Extract days

    daySelectionContainer.innerHTML = '';
    availableDays.forEach(day => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn d-flex align-items-center justify-content-center border border-black px-10 py-2 opacity-50';
        button.textContent = formatDate(day);

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

// Select day
function selectDay(day) {
    selectedDay = day;
    selectedDayElement.textContent = formatDate(day);

    // Update button styles
    updateButtonStyles(daySelectionContainer, formatDate(day));

    // Only populate time options if we have a selected service
    if (selectedService) {
        populateTimeOptions(selectedService, day);
    }

    if (bookingButton) {
        bookingButton.style.display = 'none';
    }
}

// Populate time options based on selected day
function populateTimeOptions(serviceName, day) {
    const service = servicesData.find(s => s.name === serviceName);
    if (!service) return;

    const dayObject = service.days.find(d => d.date === day);
    if (!dayObject) return;

    const sessions = dayObject.sessions || [];

    // Clear previous sessions
    morningSessionContainer.innerHTML = '';
    afternoonSessionContainer.innerHTML = '';
    appointmentStaffSelect.innerHTML = '<option value="" class="text-body" disabled selected hidden>Appointment Staff</option>';
    appointmentRoomSelect.innerHTML = '<option value="" class="text-body" disabled selected hidden>Appointment Room</option>';

    sessions.forEach(session => {
        if (session.available) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn session-btn d-flex align-items-center justify-content-center border border-black px-10 py-2 opacity-50';
            button.textContent = session.time;

            button.addEventListener('click', () => {
                selectSession(session, button);
            });

            const startTime = new Date(`1970-01-01T${session.time.split(' - ')[0]}`);

            if (startTime.getHours() < 12) {
                morningSessionContainer.appendChild(button);
            } else {
                afternoonSessionContainer.appendChild(button);
            }
        }
    });
}

// Select session
function selectSession(session, button) {
    selectedSession = session;

    // Clear previous selections and populate staff and room options
    appointmentStaffSelect.innerHTML = '';
    appointmentRoomSelect.innerHTML = '';

    const staffOption = document.createElement('option');
    staffOption.value = session.staff;
    staffOption.textContent = session.staff;
    staffOption.selected = true;
    appointmentStaffSelect.appendChild(staffOption);

    const roomOption = document.createElement('option');
    roomOption.value = session.location;
    roomOption.textContent = session.location;
    roomOption.selected = true;
    appointmentRoomSelect.appendChild(roomOption);

    updateButtonStyles(morningSessionContainer, session.time);
    updateButtonStyles(afternoonSessionContainer, session.time);
    toggleBookingButton();
}

function toggleBookingButton() {
    bookingButton.style.display = 'block';
}

function updateButtonStyles(container, activeText) {
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.textContent === activeText) {
            button.classList.remove('border-black', 'opacity-50');
            button.classList.add('bg-primary', 'text-white', 'border-primary');
        } else {
            button.classList.remove('bg-primary', 'text-white', 'border-primary');
            button.classList.add('border-black', 'opacity-50');
        }
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

// Example usage in your script
window.searchServiceAvailableTime = searchServiceAvailableTime;
window.proceedAppointmentRequest = proceedAppointmentRequest;