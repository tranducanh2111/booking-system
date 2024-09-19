// src/routes/routes.js
const express = require('express');
const path = require('path');
const router = express.Router();
const { format, addMinutes, parseISO } = require('date-fns');

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
  const practiceCode = req.params.practiceCode;
  if (!practiceCode) {
    return res.status(400).json({ error: 'No practice code provided' });
  }

  const db_petbooqz = connectPetbooqzDatabase();
  const practiceServiceQuery = `
    SELECT DISTINCT SKU, ItemName
    FROM services
    WHERE ClinicCode = ?
    AND UPPER(GoodsServices) LIKE '%PROCEDURE%'
    AND Status = 'Current'
    AND DisplayOnline LIKE '%Yes%'
    ORDER BY ItemName ASC;`;

  try {
    const results = await queryDatabase(db_petbooqz, practiceServiceQuery, [practiceCode]);
    if (results.length > 0) {
      const categories = results.map(service => ({
        sku: service.SKU,
        name: service.ItemName,
      }));
      res.json({ messagecode: "Success", categories });
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
router.post('/searchExistClient/:practiceCode', async (req, res) => {
  try {
    const practiceCode = req.params.practiceCode;
    const { mobile, lastname } = req.query;

    if (!practiceCode) {
      return res.status(400).json({ error: 'No practice code provided' });
    }

    if (!lastname && !mobile) {
      return res.status(400).json({ error: 'Information is required to connect' });
    }

    // Connect to the database
    const db_petbooqz = connectPetbooqzDatabase();

    // Construct the query
    let query = `
      SELECT id, mastercode, ContactTitle, ContactFirst, ContactLast, Mobile, email
      FROM clientdb
      WHERE UPPER(Active) = 'CURRENT'
      AND ClinicCode = ?`;

    if (mobile) {
      query += ' AND UPPER(Mobile) = UPPER(?)';
      queryParams.push(mobile);
    } 
    if (lastname) {
      query += ' AND UPPER(ContactLast) = UPPER(?)';
      queryParams.push(lastname);
    }

    const results = await queryDatabase(db_petbooqz, query, [practiceCode]);

    if (results.length === 0) {
      return res.json({ message: "Error", error: "No clients found with the provided details." });
    } else if (results.length > 1) {
      return res.json({ message: "Error", error: "Multiple clients found with the same mobile and last name." });
    }

    const row = results[0];
    const response = {
      client: {
        clientcode: row.mastercode,
        title: row.ContactTitle,
        firstName: row.ContactFirst,
        lastname: row.ContactLast,
        mobile: mobile,
        email: row.email
      },
      DateRequested: new Date().toISOString(),
      code: generateReservationId(),
      messagecode: 'Success'
    };

    res.json(response);

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

    const results = await queryDatabase(db_petbooqz, query, [clientCode, practiceCode]);

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

router.post('/makeReservation', async (req, res) => {
  try {
    const { sku, room, time, date, staff, practiceCode } = req.body;

    // Validate input
    if (!sku || !room || !time || !date || !practiceCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if booking is in the past
    const currentDateTime = new Date();
    const requestedDateTime = new Date(`${date}T${time}`);
    if (requestedDateTime < currentDateTime) {
      return res.status(400).json({ error: 'Cannot book in the past' });
    }

    // Fetch the ApptBlock (duration) for the service
    // Create Connection to the PB Database
    const db_petbooqz = connectPetbooqzDatabase();

    // Retrieve the service duration
    const serviceDataQuery = `
      SELECT ApptBlock
      FROM services
      WHERE SKU = ? AND ClinicCode = ?
    `;

    const serviceDataResults = await queryDatabase(db_petbooqz, serviceDataQuery, [sku, practiceCode]);

    if (!serviceDataResults || serviceDataResults.length === 0) {
      return res.status(404).json({ error: 'Service not found for the given SKU' });
    }


    const duration = serviceDataResults.ApptBlock > 0 ? serviceDataResults.ApptBlock : 15;
    const consultTime = 15; // Assuming default consult time is 15 minutes
    const blocks = Math.ceil(duration / consultTime);

    // Start and End Time of the appointment
    const start = new Date(`${date}T${time}`);
    const end = addMinutes(start, duration);

    // // Check if the slot is already taken
    const existingAppointmentQuery = `
      SELECT *
      FROM daybook
      WHERE Start >= ?
      AND End <= ?
      AND staffcode = ?
      AND ClinicCode = ?
    `;

    const existingAppointmentResults = await queryDatabase(db_petbooqz, existingAppointmentQuery, [start, end, room, practiceCode]);

    if (existingAppointmentResults.length > 0) {
      return res.status(409).json({ error: 'Sorry, this slot has been taken' });
    }

    // Get ColumnID
    const columnId = await getColumnId(db_petbooqz, date, room, practiceCode);

    const reservationId = generateReservationId();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // Reservation expire after 8 mins
    const expires = new Date(Date.now() + 8 * 60000).toISOString().slice(0, 19).replace('T', ' ');

    const contents = Buffer.from(JSON.stringify(req.body)).toString('base64');
    const reason = 'Temporary Reservation';

    // // Begin transaction
    await beginTransaction(db_petbooqz);

    try {
      // Query to insert a temp record to the PB.reservations
      const insertReservationQuery = `
      INSERT INTO reservations (ReservationId, DateCreated, Status, ApptId, Contents, Expires, ClinicCode) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      // Query to insert a temp record to the PB.daybook
      const insertDaybookQuery = `
      INSERT INTO daybook (ApptID, Appdate, AppTime, entered_by, Reason, staffcode, Extended, ObjectId, Start, End, ClinicCode, Blocks, ApptCode, Created, ColumnID, Appstatus) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      // Insert into reservations table
      await queryDatabase(db_petbooqz, insertReservationQuery, [reservationId, now, 'RESERVATION', reservationId, contents, expires, practiceCode]);

      // Insert into daybook table
      await queryDatabase(db_petbooqz, insertDaybookQuery, [reservationId, date, time, staff || null, reason, room, reservationId, reservationId, start, end, practiceCode, blocks, sku, now, columnId, 'Online']);

      await commitTransaction(db_petbooqz);

      res.json({
        messagecode: 'Success',
        ReservationId: reservationId,
        CreateTime: now,
        ExpiryTime: expires
      });
    } catch (error) {
      await rollbackTransaction(db_petbooqz);
      throw error;
    }
  } catch (error) {
    console.error('Error making reservation:', error);
    res.status(500).json({ error: 'Error making reservation' });
  } finally {
    // Close the Petbooqz database connection
    closePetbooqzDatabaseConnection();
  }
});

// Get ColumnID for the Appointment
async function getColumnId(dbConnection, date, room, practiceCode) {
  const weekday = new Date(date).toLocaleString('en-us', { weekday: 'long' });
  console.log("Weekday:", weekday);
  const query = `
    SELECT ColumnID 
    FROM daybookColumn 
    WHERE daytext = ? 
    AND staff = ? 
    AND ClinicCode = ?
  `;
  
  try {
    const columnIDResults = await queryDatabase(dbConnection, query, [weekday, room, practiceCode]);

    if (columnIDResults.length === 0) {
      throw new Error('Room is not available');
    }
    return columnIDResults[0].ColumnID;
  } catch (error) {
    console.error('Error getting ColumnID:', error);
    throw error;
  }
}

// Generate Unique ID for the temporary reservation
function generateReservationId() {
  // This is a simplified version of the PBIDv4 function
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = router;