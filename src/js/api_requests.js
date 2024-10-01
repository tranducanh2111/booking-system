// src/js/api_requests.js
const axios = require('axios');

// Database Connection
const {
    getAdvanceNoticePool,
    queryDatabase,
} = require('../config/db_connection');

// Get the data from the practice
async function fetchDataFromPracticeInfo(
    practiceInfo,
    method,
    request,
    body = null,
    params = null,
    practiceCode
) {
    const { IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword } = practiceInfo;

    // Construct the base URL
    let url = `http://${IPAddressZT}:${ListeningPort}/${APIEP}/${request}`;

    // Clean up the URL to remove redundant slashes
    url = url.replace(/([^:]\/)\/+/g, '$1');

    console.log(url);

    const auth = {
        username: APIUser,
        password: APIPassword,
    };

    try {
        const response = await axios({
            method: method,
            url: url,
            auth: auth,
            data: body,
            params: params,
            headers: {
                client_practice: practiceCode,
            },
        });
        return response.data; // Return the data from the response
    } catch (error) {
        if (error.response) {
            console.error('Error fetching data from the API:', error.response.data);
            console.error('Status code:', error.response.status);
        } else {
            console.error('Error fetching data from the API:', error.message);
        }
        throw error;
    }
}

// Get practice connection IP Address and endpoint
async function getPracticeConnection(practiceCode) {
    const pool = getAdvanceNoticePool();
    const practiceInfoQuery = `
      SELECT IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword
      FROM practice
      WHERE PracticeCode = ? AND isActive = 'Yes'`;

    try {
        const results = await queryDatabase(pool, practiceInfoQuery, [practiceCode]);
        if (results.length > 0) {
            return results[0];
        } else {
            throw new Error('Practice information not found');
        }
    } catch (error) {
        console.error('Error fetching practice connection:', error);
        throw error;
    }
}

// Handle API requests
const handleApiRequest = async (
    req,
    res,
    method,
    request,
    data = {},
    params = {}
) => {
    const practiceCode = req.params.practiceCode;

    if (!practiceCode) {
        return res.status(400).json({ error: 'No practice code provided' });
    }

    try {
        const practiceCodeRequested = await getPracticeConnection(practiceCode);

        if (!practiceCodeRequested) {
            return res.status(400).json({ error: `Can't establish the practice connection` });
        }

        const practiceInfo = {
            IPAddressZT: practiceCodeRequested.IPAddressZT,
            ListeningPort: practiceCodeRequested.ListeningPort,
            APIEP: practiceCodeRequested.APIEP,
            APIUser: practiceCodeRequested.APIUser,
            APIPassword: practiceCodeRequested.APIPassword,
        };

        const response = await fetchDataFromPracticeInfo(
            practiceInfo,
            method,
            request,
            data,
            params,
            practiceCode
        );
        res.json(response);
    } catch (error) {
        console.error(`Error in ${request}:`, error);
        res.status(500).json({ error: `Failed to ${request}` });
    }
};

// Utility function for GET requests
const handleGetRequest = (req, res, apiEndpoint, params = {}) => {
    handleApiRequest(req, res, 'GET', apiEndpoint, {}, params);
};

// Utility function for POST requests
const handlePostRequest = (req, res, apiEndpoint, requiredFields) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length) {
        return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`,
        });
    }

    handleApiRequest(req, res, 'POST', apiEndpoint, req.body);
};

module.exports = {
    handleGetRequest,
    handlePostRequest,
};