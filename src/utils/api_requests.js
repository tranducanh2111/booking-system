// src/js/api_requests.js
const axios = require('axios');

// Database Connection
const { getAdvanceNoticePool } = require('../config/db_connection');

// Get the data from the practice
async function fetchDataFromPracticeInfo(
    practiceInfo,
    method,
    request,
    body = null,
    params = null,
    practiceCode
) {
    const { IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword } =
        practiceInfo;

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
                CLIENT_PRACTICE: practiceCode,
            },
        });
        return response.data; // Return the data from the response
    } catch (error) {
        if (error.response) {
            console.error(
                'Error fetching data from the API:',
                error.response.data
            );
            console.error('Status code:', error.response.status);
        } else {
            console.error('Error fetching data from the API:', error.message);
        }
        throw new Error('Failed to fetch data from the practice API');
    }
}

// Get practice connection IP Address and endpoint
async function getPracticeConnection(practiceCode, connection) {
    const practiceInfoQuery = `
      SELECT IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword
      FROM practice
      WHERE PracticeCode = ? AND isActive = 'Yes'`;

    try {
        const [results] = await connection.query(practiceInfoQuery, [
            practiceCode,
        ]);
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
    params = {},
    connection
) => {
    const practiceCode = req.params.practiceCode;

    if (!practiceCode) {
        return res.status(400).json({ error: 'No practice code provided' });
    }

    try {
        const practiceCodeRequested = await getPracticeConnection(
            practiceCode,
            connection
        );

        if (!practiceCodeRequested) {
            return res
                .status(400)
                .json({ error: `Can't establish the practice connection` });
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
const handleGetRequest = async (req, res, apiEndpoint, params = {}) => {
    const pool = getAdvanceNoticePool();
    const connection = await pool.getConnection();
    try {
        await handleApiRequest(
            req,
            res,
            'GET',
            apiEndpoint,
            {},
            params,
            connection
        );
    } finally {
        connection.release();
    }
};

// Utility function for POST requests
// const handlePostRequest = async (req, res, apiEndpoint, requiredFields) => {
//     const missingFields = requiredFields.filter((field) => !req.body[field]);

//     if (missingFields.length) {
//         return res.status(400).json({
//             error: `Missing required fields: ${missingFields.join(', ')}`,
//         });
//     }

//     const pool = getAdvanceNoticePool();
//     const connection = await pool.getConnection();
//     try {
//         await handleApiRequest(
//             req,
//             res,
//             'POST',
//             apiEndpoint,
//             req.body,
//             {},
//             connection
//         );
//     } finally {
//         connection.release();
//     }
// };

const handlePostRequest = async (
    req,
    res,
    apiEndpoint,
    requiredFields,
    optionalFields = []
) => {
    const missingFields = requiredFields.filter((field) => req.body[field] == null);

    if (missingFields.length) {
        console.error('Missing required fields:', missingFields);
        return res.status(400).json({
            error: `Missing required fields: ${missingFields.join(', ')}`,
        });
    }

    let requestBody = {};
    // Add required fields to requestBody
    requiredFields.forEach((field) => {
        requestBody[field] = req.body[field];
    });

    optionalFields.forEach((field) => {
        if (req.body[field] !== undefined && req.body[field] !== null) {
            requestBody[field] = req.body[field];
        } 
    });

    console.log('Final request body before API call:', requestBody);

    const pool = getAdvanceNoticePool();
    const connection = await pool.getConnection();
    try {
        await handleApiRequest(
            req,
            res,
            'POST',
            apiEndpoint,
            requestBody,
            {},
            connection
        );
    } finally {
        connection.release();
    }
};



module.exports = {
    handleGetRequest,
    handlePostRequest,
};
