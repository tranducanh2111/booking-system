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
      res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
    } else {
      res.send(data);
    }
  });
});

// API Routes
const apiRoutes = require('./src/routes/routes');
app.use('/api', apiRoutes);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'src', '404.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});