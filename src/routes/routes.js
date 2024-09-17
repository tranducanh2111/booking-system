// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
// Remove the decrypt function import
// const { decrypt } = require('../utils/crypto'); 
const { fetchDataFromPracticeInfo } = require('../js/api_requests');

// Database Connection
const { connectAdvanceNoticeDatabase, closeAdvanceNoticeDatabaseConnection } = require('../config/db_advance_notice');
const { connectConnectDatabase, closeConnectDatabaseConnection } = require('../config/db_connect');

// Handle request for loading the clinic notes
router.get('/practice_info/:practiceCode?', async (req, res) => {
  try {
    const practiceCode = req.params.practiceCode; // Use practiceCode directly
    if (!practiceCode) {
      return res.status(400).json({ error: 'No practice code provided' });
    }

    // Connect to the database
    const db_advance_notice = connectAdvanceNoticeDatabase();

    // Fetch practice info using the practice code
    const practiceInfoQuery = `
      SELECT Notes, PracticeName, Phone, Email, Website, Logo, Address, Suburb, Postcode, State, Country, IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword
      FROM practice
      WHERE PracticeCode = ? AND isActive = 'Yes'`;
    
    const results = await new Promise((resolve, reject) => {
      db_advance_notice.query(practiceInfoQuery, [practiceCode], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (results.length > 0) {
      res.json(results[0]); // Return the results directly
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
router.get('/earliest-booking/:practiceCode?', async (req, res) => {
  const { practiceCode } = req.params; // Use practiceCode directly

  if (!practiceCode) {
    return res.status(400).json({ error: 'No practice code provided' });
  }

  try {
    const db_advance_notice = connectAdvanceNoticeDatabase();
    const query = 'SELECT EarliestBooking FROM practice WHERE PracticeCode = ? AND isActive = "Yes"';
    
    db_advance_notice.query(query, [practiceCode], (err, results) => {
      if (err) {
        console.error('Error fetching earliest booking:', err);
        res.status(500).json({ error: 'Error fetching earliest booking' });
        return;
      }
      if (results.length > 0) {
        res.json({ earliestBooking: results[0].EarliestBooking });
      } else {
        res.status(404).json({ error: 'Earliest booking information not found' });
      }
      closeAdvanceNoticeDatabaseConnection();
    });
  } catch (error) {
    console.error('Error fetching earliest booking:', error);
    res.status(500).json({ error: 'Error fetching earliest booking' });
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
  const { practiceCode } = req.params; // Use practiceCode directly
  const headers = req.headers;

  if (!practiceCode) {
    return res.status(400).json({ error: 'No practice code provided' });
  }

  try {
    const practiceInfo = {
      IPAddressZT: 'petbooqz.yourlocalvet.com.au',
      APIEP: 'advancenotice/api/v1',
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