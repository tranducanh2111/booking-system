// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
// Database Connection Handle
const { connectAdvanceNoticeDatabase, closeAdvanceNoticeDatabaseConnection } = require('./src/config/db_advance_notice');
const { connectConnectDatabase, closeConnectDatabaseConnection } = require('./src/config/db_connect');

const app = express();
const port = 3500;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Serve static files from the 'src' directory for components
app.use('/components', express.static(path.join(__dirname, 'src/components')));
// Serve static files from the 'src/styles' directory
app.use('/styles', express.static(path.join(__dirname, 'src/styles')));
// Serve static files from the 'src/js' directory
app.use('/js', express.static(path.join(__dirname, 'src/js')));

// Route to serve the single page application
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

// Route to serve component content
app.get('/components/:component', (req, res) => {
  const componentPath = path.join(__dirname, 'src', 'components', `${req.params.component}.html`);
  fs.readFile(componentPath, 'utf8', (err, data) => {
    if (err) {
      res.status(404).send('Component not found');
    } else {
      res.send(data);
    }
  });
});

// Handle cancel appointment request
app.post('/cancel_appointment', (req, res) => {
  const appointmentCancellationData = req.body;

  res.json({ success: true });
})

// Handle booking appointment request
app.post('/proceed-appointment-request', (req, res) => {
  const appointmentBookingData = req.body;
  // Process the appointment data here

  res.json({ success: true });
})

app.get('/checkout', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'components', 'checkout.html'));
});

// Handle request for loading the clinic notes
app.get('/api/practice_info', (req, res) => {
  // Require connection to the database
  const db_advance_notice = connectAdvanceNoticeDatabase();

  const practiceInfoQuery = `
    SELECT Notes, PracticeName, Phone, Email, Website, Logo, Address, Suburb, Postcode, State, Country
    FROM practice
    WHERE PracticeCode = '9999' AND isActive = 'Yes'`

  db_advance_notice.query(practiceInfoQuery, (err, results) => {
    if (err) {
      console.error('Error fetching practice information:', err);
      res.status(500).json({ error: 'Error fetching practice information' });
      return;
    }

    // Store data retrieved from the database about the clinic
    // Check if results are available
    if (results.length > 0) {
      // Send the entire practice information as JSON
      res.json(results[0]);
    } else {
      // Handle case where no data is found
      res.status(404).json({ error: 'Practice information not found' });
    }
  });

  // Close the database connection
  closeAdvanceNoticeDatabaseConnection();
});

// Handle the practice booking day preference
app.get('/api/earliest-booking', (req, res) => {
  const db_advance_notice = connectAdvanceNoticeDatabase();

  const query = 'SELECT EarliestBooking FROM practice WHERE PracticeCode = "9999" AND isActive = "Yes"';

  db_advance_notice.query(query, (err, results) => {
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

// Handle request for loading the service data (services, available date and time)
app.get('/api/service-list', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/service-list.json'));
});

// Handle request for loading the bank BIN
app.get('/api/bank-bin', (req, res) => {
  res.sendFile(path.join(__dirname, 'data/bank-bin.json'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});