const axios = require('axios');

const practiceCode = 'FVV001'; // Replace with a valid practice code
const url = `http://localhost:3500/api/practice/services/${practiceCode}`;
const numberOfRequests = 20; // Number of concurrent requests

async function makeRequests() {
    const requests = [];

    for (let i = 0; i < numberOfRequests; i++) {
        requests.push(axios.get(url).catch(error => {
            console.error(`Request ${i + 1} failed:`, error.message);
        }));
    }

    await Promise.all(requests);
    console.log('All requests have been processed.');
}

makeRequests();
