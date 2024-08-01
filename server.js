const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
