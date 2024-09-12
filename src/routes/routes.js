// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
// Database Connection
const { connectAdvanceNoticeDatabase, closeAdvanceNoticeDatabaseConnection } = require('../config/db_advance_notice');
const { connectConnectDatabase, closeConnectDatabaseConnection } = require('../config/db_connect');

// Handle request for loading the clinic notes
router.get('/practice_info/:id?', async (req, res) => {
  try {
    const db_advance_notice = connectAdvanceNoticeDatabase();
    let practiceCode = req.params.id;
    const practiceInfoQuery = `
      SELECT Notes, PracticeName, Phone, Email, Website, Logo, Address, Suburb, Postcode, State, Country
      FROM practice
      WHERE PracticeCode = ? AND isActive = 'Yes'`;
    
    const results = await new Promise((resolve, reject) => {
      db_advance_notice.query(practiceInfoQuery, [practiceCode], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (results.length > 0) {
      const encryptedResults = await encrypt(JSON.stringify(results[0])); // Convert to string
      res.json(encryptedResults);
    } else {
      res.status(404).json({ error: 'Practice information not found', redirect: '/404' });
    }
  } catch (error) {
    console.error('Error fetching practice information:', error);
    res.status(500).json({ error: 'Error fetching practice information' });
  } finally {
    closeAdvanceNoticeDatabaseConnection();
  }
});

// Handle the practice booking day preference
router.get('/earliest-booking/:id?', (req, res) => {
  const db_advance_notice = connectAdvanceNoticeDatabase();
  let practiceCode = req.params.id;
  const query = 'SELECT EarliestBooking FROM practice WHERE PracticeCode = ? AND isActive = "Yes"';
  
  db_advance_notice.query(query, [practiceCode], (err, results) => {
    if (err) {
      console.error('Error fetching earliest booking:', err);
      res.status(500).json({ error: 'Error fetching earliest booking' });
      return;
    }
    if (results.length > 0) {
      // Return the earliest booking directly without encryption
      res.json({ earliestBooking: results[0].EarliestBooking });
    } else {
      res.status(404).json({ error: 'Earliest booking information not found' });
    }
    closeAdvanceNoticeDatabaseConnection();
  });
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

const { encrypt, decrypt } = require('../utils/crypto');

// New route for encrypting practice code
router.get('/encrypt_practice_code/:id', async (req, res) => {
  try {
    const practiceCode = req.params.id;
    const encryptedData = await encrypt(practiceCode);
    res.json(encryptedData);
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({ error: 'Encryption failed' });
  }
});

// New route for decrypting practice code
router.post('/decrypt_practice_code', async (req, res) => {
  try {
    const encryptedData = req.body;
    const decryptedPracticeCode = await decrypt(encryptedData);
    res.send(decryptedPracticeCode);
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({ error: 'Decryption failed' });
  }
});

module.exports = router;