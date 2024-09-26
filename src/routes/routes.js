// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { fetchDataFromPracticeInfo } = require('../js/api_requests');

// Database Connection
const {
  connectAdvanceNoticeDatabase,
  closeAdvanceNoticeDatabaseConnection,
  queryDatabase,
} = require('../config/db_connection');

// Centralized practice info
const practiceInfo = {
  IPAddressZT: 'localhost',
  ListeningPort: 81,
  APIEP: 'petbooqz/advancenotice/api/v1',
  APIUser: 'abcdef',
  APIPassword: '1234'
};

// Handle request for loading the clinic notes
router.get('/practice_info/:practiceCode', async (req, res) => {
  const practiceCode = req.params.practiceCode;
  if (!practiceCode) {
    return res.status(400).json({ error: 'No practice code provided' });
  }

  const db_advance_notice = connectAdvanceNoticeDatabase();
  const practiceInfoQuery = `
    SELECT Notes, PracticeName, Phone, Email, Website, Logo, Address, Suburb, Postcode, State, Country, IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword
    FROM practice
    WHERE PracticeCode = ? AND isActive = 'Yes'`;

  try {
    const results = await queryDatabase(db_advance_notice, practiceInfoQuery, [practiceCode]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ error: 'Practice information not found' });
    }
  } catch (error) {
    console.error('Error fetching practice information:', error);
    res.status(500).json({ error: 'Error fetching practice information' });
  } finally {
    closeAdvanceNoticeDatabaseConnection();
  }
});

// Handle the practice booking day preference
router.get('/earliest-booking/:id?', async (req, res) => {
  const db_advance_notice = connectAdvanceNoticeDatabase();
  const practiceCode = req.params.id;
  const query = 'SELECT EarliestBooking FROM practice WHERE PracticeCode = ? AND isActive = "Yes"';

  try {
    const results = await queryDatabase(db_advance_notice, query, [practiceCode]);
    if (results.length > 0) {
      res.json({ earliestBooking: results[0].EarliestBooking });
    } else {
      res.status(404).json({ error: 'Earliest booking information not found' });
    }
  } catch (err) {
    console.error('Error fetching earliest booking:', err);
    res.status(500).json({ error: 'Error fetching earliest booking' });
  } finally {
    closeAdvanceNoticeDatabaseConnection();
  }
});

router.post('/proceed-appointment-request', (req, res) => {
  const appointmentBookingData = req.body;
  // Process the appointment data here

  res.json({ success: true });
})

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

// Helper function to handle API requests
const handleApiRequest = async (req, res, method, request, data = '', params = '', practiceCode = '') => {
  try {
    const response = await fetchDataFromPracticeInfo(practiceInfo, method, request, data, params, practiceCode);
    res.json(response);
  } catch (error) {
    console.error(`Error in ${request}:`, error);
    res.status(500).json({ error: `Failed to ${request}` });
  }
};

// GET routes
router.get('/services', (req, res) => handleApiRequest(req, res, 'GET', 'services'));
router.get('/clientPatients/:clientcode', (req, res) => {
  const { clientcode } = req.params;
  handleApiRequest(req, res, 'GET', `clientPatients/${clientcode}`, { clientcode });
});
router.get('/clientReminders/:clientcode', (req, res) => {
  const { clientcode } = req.params;
  handleApiRequest(req, res, 'GET', `clientReminders/${clientcode}`, { clientcode });
});
router.get('/questions', (req, res) => handleApiRequest(req, res, 'GET', 'questions'));
router.get('/getSpecies', (req, res) => handleApiRequest(req, res, 'GET', 'getSpecies'));
router.get('/getBreedsBySpecies', (req, res) => {
  const { speciesId } = req.query;
  if (!speciesId) {
    return res.status(400).json({ error: 'Species ID is required' });
  }
  handleApiRequest(req, res, 'GET', 'getBreedsBySpecies', '', { speciesId });
});

// POST routes
router.post('/searchExistClient', (req, res) => {
  const { mobile, lastname, practiceCode } = req.body;
  if (!mobile && !lastname) {
    return res.status(400).json({ error: 'Mobile or last name is required' });
  }
  handleApiRequest(req, res, 'POST', 'searchexistClient', { mobile, lastname }, '', practiceCode);
});

router.post('/reserve', (req, res) => {
  const { sku, room, time, date, practiceCode } = req.body;
  if (!sku || !room || !time || !date || !practiceCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  handleApiRequest(req, res, 'POST', 'reserve', { sku, room, time, date }, '', practiceCode);
});

router.post('/findfreeSlots', (req, res) => {
  const { sku, room, date, practiceCode } = req.body;
  if (!sku || !date || !practiceCode) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  handleApiRequest(req, res, 'POST', 'findfreeSlots', { sku, room, date }, '', practiceCode);
});

router.post('/extendReservation', (req, res) => {
  const { reservationid, practiceCode } = req.body;
  if (!reservationid) {
    return res.status(400).json({ error: 'Missing reservation ID' });
  }
  handleApiRequest(req, res, 'POST', 'extendReservation', { reservationid }, '', practiceCode);
});

module.exports = router;