// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();

// Database Connection
const {
  connectAdvanceNoticeDatabase,
  closeAdvanceNoticeDatabaseConnection,
  connectConnectDatabase,
  closeConnectDatabaseConnection,
  connectPetbooqzDatabase,
  closePetbooqzDatabaseConnection
} = require('../config/db_connection');

// Handle request for loading the clinic notes
router.get('/practice_info/:practiceCode', async (req, res) => {
  try {
    const practiceCode = req.params.practiceCode;
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

// API endpoint to fetch services from PB
// router.get('/services/:practiceCode?', async (req, res) => {
//   const { practiceCode } = req.params; // Use practiceCode directly
//   const headers = req.headers;

//   if (!practiceCode) {
//     return res.status(400).json({ error: 'No practice code provided' });
//   }

//   try {
//     const practiceInfo = {
//       IPAddressZT: 'petbooqz.yourlocalvet.com.au',
//       APIEP: 'advancenotice/api/v1',
//       APIUser: 'abcdef',
//       APIPassword: '1234'
//     };

//     const method = 'GET';
//     const request = 'services';

//     const data = await fetchDataFromPracticeInfo(practiceInfo, method, request, practiceCode);
//     res.json(data); // Send the fetched data as a response
//   } catch (error) {
//     console.error('Error fetching services:', error);
//     res.status(500).json({ error: 'Failed to fetch services' });
//   }
// });

// API endpoint to fetch services from PB 
router.get('/services/:practiceCode?', async (req, res) => {
  try {
    const practiceCode = req.params.practiceCode;
    const headers = req.headers;

    if (!practiceCode) {
      return res.status(400).json({ error: 'No practice code provided' });
    }

    // Connect to the database
    const db_petbooqz = connectPetbooqzDatabase();

    // Fetch practice info using the practice code
    const practiceServiceQuery = `
      SELECT DISTINCT SKU, ItemName
      FROM services
      WHERE ClinicCode = ?
      AND UPPER(GoodsServices) LIKE '%PROCEDURE%'
      AND Status = 'Current'
      AND DisplayOnline LIKE '%Yes%'
      ORDER BY ItemName ASC;`;
    
    const results = await new Promise((resolve, reject) => {
      db_petbooqz.query(practiceServiceQuery, [practiceCode], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (results.length > 0) {
      const categories = results.map((service) => ({
        sku: service.SKU,
        name: service.ItemName,
      }));

      res.json({
        messagecode: "Success",
        categories: categories,
      });
    } else {
      res.status(404).json({ error: "Practice services not found" });
    }
  } catch (error) {
    console.error("Error fetching practice services:", error);
    res.status(500).json({ error: "Error fetching practice services" });
  } finally {
    closePetbooqzDatabaseConnection();
  }
});

// API Endpoint to search clients from PB
router.get('/searchClient/:practiceCode', async (req, res) => {
  try {
    const practiceCode = req.params.practiceCode;
    const { mobile, email, mastercode } = req.query;

    if (!practiceCode) {
      return res.status(400).json({ error: 'No practice code provided' });
    }

    if (!mastercode && !mobile && !email) {
      return res.status(400).json({ error: 'Information is required to connect' });
    }

    // Connect to the database
    const db_petbooqz = connectPetbooqzDatabase();

    // Construct the query
    let query = `
      SELECT mastercode, Mobile, email, ContactTitle, ContactFirst, ContactLast, Address, City, State, Postcode
      FROM clientdb
      WHERE UPPER(Active) = 'CURRENT'
      AND ClinicCode = ?`;

    const queryParams = [practiceCode];

    if (mastercode) {
      query += ' AND mastercode = ?';
      queryParams.push(mastercode);
    } else if (mobile) {
      query += ' AND Mobile = ?';
      queryParams.push(mobile);
    } else {
      query += ' AND email = ?';
      queryParams.push(email);
    }

    const results = await new Promise((resolve, reject) => {
      db_petbooqz.query(query, queryParams, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (results.length > 1) {
      return res.status(400).json({ error: 'There was an error loading your record' });
    } else if (results.length === 0) {
      return res.status(404).json({ error: 'Could not find client' });
    }

    res.json({
      messagecode: "Success",
      client: results[0]
    });

  } catch (error) {
    console.error("Error searching for client:", error);
    res.status(500).json({ error: "Error searching for client" });
  } finally {
    closePetbooqzDatabaseConnection();
  }
});

// API endpoint to get patients by practice code and client code
router.get('/clientPatients/:practiceCode', async (req, res) => {
  try {
    const { practiceCode } = req.params;
    const { clientCode } = req.query;

    if (!practiceCode) {
      return res.status(400).json({ error: 'Practice code is required' });
    }

    if (!clientCode) {
      return res.status(400).json({ error: 'Client code is required' });
    }

    // Connect to the database
    const db_petbooqz = connectPetbooqzDatabase();

    const query = `
      SELECT p.PatientCode, p.FirstName, p.Sex, p.Desexed, p.Species AS SpeciesCode,
             p.DateOfBirth, p.Breed, p.BreedCode, b.VeNOMID, p.Picture,
             s.Group AS Species
      FROM patients AS p
      LEFT JOIN Species AS s ON s.VeNOMID = p.Species
      LEFT JOIN Breeds AS b ON p.BreedCode = b.BreedCode
      WHERE p.ClientCode = ?
      AND p.ClinicCode = ?
      AND UPPER(p.Deceased) = 'CURRENT'
    `;

    const results = await new Promise((resolve, reject) => {
      db_petbooqz.query(query, [clientCode, practiceCode], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    const patients = results.map(row => ({
      PatientCode: row.PatientCode,
      FirstName: row.FirstName,
      Sex: row.Sex,
      Desexed: row.Desexed,
      SpeciesCode: row.SpeciesCode,
      DateOfBirth: row.DateOfBirth,
      Breed: row.Breed,
      BreedCode: row.VeNOMID,
      Species: row.Species
    }));

    res.json({
      messagecode: "Success",
      patients: patients
    });

  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Error fetching patients' });
  } finally {
    closePetbooqzDatabaseConnection();
  }
});

module.exports = router;