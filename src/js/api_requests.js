const axios = require('axios');

async function fetchDataFromPracticeInfo(practiceInfo, method, request, practiceCode) {
    // const { IPAddressZT, ListeningPort, APIEP, APIUser, APIPassword } = practiceInfo;
    const { IPAddressZT, APIEP, APIUser, APIPassword } = practiceInfo;

    // const url = `http://${IPAddressZT}:${ListeningPort}/${APIEP}/${request}`;
    const url = `https://${IPAddressZT}/${APIEP}/${request}`;
    
    const auth = {
        username: APIUser,
        password: APIPassword
    };

    try {
        const response = await axios({
            method: method,
            url: url,
            auth: auth,
            headers: {
                'client_practice': practiceCode // Add the practice code here
            }
        });
        return response.data; // Return the data from the response
    } catch (error) {
        console.error('Error fetching data from the API:', error);
        throw error; // Rethrow the error for further handling
    }
}

module.exports = { fetchDataFromPracticeInfo };