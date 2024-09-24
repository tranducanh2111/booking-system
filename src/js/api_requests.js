// src/js/api_requests.js
const axios = require('axios');

async function fetchDataFromPracticeInfo(practiceInfo, method, request, body = null, params = null, practiceCode) {
    const { IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword } = practiceInfo;
    // const { IPAddressZT, APIEP, APIUser, APIPassword } = practiceInfo;

    const url = `http://${IPAddressZT}:${ListeningPort}/${APIEP}/${request}`;
    // const url = `https://${IPAddressZT}/${APIEP}/${request}`;
    
    const auth = {
        username: APIUser,
        password: APIPassword
    };

    try {
        const response = await axios({
            method: method,
            url: url,
            auth: auth,
            data: body,
            params: params,
            headers: {
                'client_practice': practiceCode
            }
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

module.exports = { fetchDataFromPracticeInfo };