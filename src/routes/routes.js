// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
const {
    handleGetRequest,
    handlePostRequest,
} = require('../utils/api_requests');

// Database Connection
const {
    getAdvanceNoticePool,
    queryDatabase,
} = require('../config/db_connection');

// Import rate limiters
const { generalLimiter, apiLimiter } = require('../config/rate_limit');

// Apply general rate limiter to all routes
router.use(generalLimiter);

// Apply stricter rate limiter to API routes
router.use('/practice/', apiLimiter);

// Log Middleware to check if rate limiters are applied
router.use((req, res, next) => {
    console.log(
        `Request Method: ${req.method}, Request URL: ${req.originalUrl}`
    );
    console.log(
        `Using General Limiter: ${!!req.rateLimit}, API Limiter: ${req.path.startsWith('/practice/') ? !!apiLimiter : false}`
    );
    next();
});

// Handle request for loading the clinic notes
router.get('/practice/practiceinfo/:practiceCode', async (req, res) => {
    const practiceCode = req.params.practiceCode;
    if (!practiceCode) {
        return res.status(400).json({ error: 'No practice code provided' });
    }

    const pool = getAdvanceNoticePool();
    const practiceInfoQuery = `
        SELECT PracticeName, Phone, Email, Website, Logo, Address, Suburb, Postcode, State, Country, IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword, AllowChooseRoom, EarliestBooking, Notes
        FROM practice
        WHERE PracticeCode = ? AND isActive = 'Yes'`;

    try {
        const results = await queryDatabase(pool, practiceInfoQuery, [
            practiceCode,
        ]);
        if (results.length > 0) {
            results[0].messagecode = 'Success';
            res.json(results[0]);
        } else {
            res.status(404).json({ error: 'Practice information not found' });
        }
    } catch (error) {
        console.error('Error fetching practice information:', error);
        res.status(500).json({ error: 'Error fetching practice information' });
    }
});

// Handle the practice booking day preference
router.get('/practice/earliest-booking/:id?', async (req, res) => {
    const pool = getAdvanceNoticePool();
    const practiceCode = req.params.id;
    const query =
        'SELECT EarliestBooking FROM practice WHERE PracticeCode = ? AND isActive = "Yes"';

    try {
        const results = await queryDatabase(pool, query, [practiceCode]);
        if (results.length > 0) {
            res.json({ earliestBooking: results[0].EarliestBooking });
        } else {
            res.status(404).json({
                error: 'Earliest booking information not found',
            });
        }
    } catch (err) {
        console.error('Error fetching earliest booking:', err);
        res.status(500).json({ error: 'Error fetching earliest booking' });
    }
});

router.post('/proceed-appointment-request', (req, res) => {
    const appointmentBookingData = req.body;
    // Process the appointment data here

    res.json({ success: true });
});

router.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'components', 'checkout.html'));
});

// Handle request for loading the service data (services, available date and time)
router.get('/service-list', (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/service-list.json'));
});

// Handle request for loading the bank BIN
router.get('/bank-bin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../data/bank-bin.json'));
});

// GET routes
router.get('/practice/services/:practiceCode', (req, res) =>
    handleGetRequest(req, res, 'services')
);
router.get('/practice/clientPatients/:practiceCode/:clientcode', (req, res) =>
    handleGetRequest(req, res, `clientPatients/${req.params.clientcode}`, {
        clientcode: req.params.clientcode,
    })
);
router.get('/practice/clientReminders/:practiceCode/:clientcode', (req, res) =>
    handleGetRequest(req, res, `clientReminders/${req.params.clientcode}`, {
        clientcode: req.params.clientcode,
    })
);
router.get('/practice/questions/:practiceCode', (req, res) =>
    handleGetRequest(req, res, 'questions')
);
router.get('/practice/getSpecies/:practiceCode', (req, res) =>
    handleGetRequest(req, res, 'getSpecies')
);
router.get('/practice/getBreedsBySpecies/:practiceCode', (req, res) => {
    const { speciesId } = req.query;
    if (!speciesId) {
        return res.status(400).json({ error: 'Species ID is required' });
    }
    handleGetRequest(req, res, 'getBreedsBySpecies', { speciesId });
});

// POST routes
router.post('/practice/searchexistClient/:practiceCode', (req, res) =>
    handlePostRequest(req, res, 'searchexistClient', ['mobile', 'lastname'])
);
router.post('/practice/reserve/:practiceCode', (req, res) =>
    handlePostRequest(req, res, 'reserve', ['sku', 'room', 'time', 'date'])
);

router.post('/practice/findfreeSlots/:practiceCode', (req, res) => {
    handlePostRequest(req, res, 'findfreeSlots', ['sku', 'date'], ['room']);
});

router.post('/practice/extendReservation/:practiceCode', (req, res) =>
    handlePostRequest(req, res, 'extendReservation', ['reservationid'])
);

router.post('/practice/finaliseReservation/:practiceCode', (req, res) => {
    handlePostRequest(
        req, 
        res, 
        'finaliseReservation', 
        ['reservationid', 'firstname', 'lastname', 'mobile', 'email','patientname','breed', 'venomid', 'species', 'dob', 'sex', 'notes', 'sex'], 
        ['clientcode', 'patientcode'] 
    );
});


router.post('/practice/getrooms/:practiceCode', (req, res) =>
    handlePostRequest(req, res, 'getrooms', ['sku'])
);

module.exports = router;
