// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { format, addMinutes, parseISO } = require('date-fns');
const { fetchDataFromPracticeInfo } = require('../js/api_requests');

// Database Connection
const {
  connectAdvanceNoticeDatabase,
  closeAdvanceNoticeDatabaseConnection,
  connectConnectDatabase,
  closeConnectDatabaseConnection,
  connectPetbooqzDatabase,
  closePetbooqzDatabaseConnection,
  queryDatabase,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
} = require('../config/db_connection');

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

// API endpoint to fetch services from PB
router.get('/services/:practiceCode?', async (req, res) => {
  const { practiceCode } = req.params;

  if (!practiceCode) {
    return res.status(400).json({ error: 'No practice code provided' });
  }

  try {
    const practiceInfo = {
      IPAddressZT: 'localhost',
      ListeningPort: 81, 
      APIEP: 'petbooqz/advancenotice/api/v1',
      APIUser: 'abcdef',
      APIPassword: '1234'
    };

    const method = 'GET';
    const request = 'services';

    const data = await fetchDataFromPracticeInfo(practiceInfo, method, request, practiceCode);
    res.json(data); // Send the fetched data as a response
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});



module.exports = router;