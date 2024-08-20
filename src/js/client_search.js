export function setupClientSearch() {
    const searchexclient = document.getElementById('se_client');
    const errorMessage = document.getElementById('errorMessage');

    if (searchexclient) {
        searchexclient.addEventListener('click', function (e) {
            e.preventDefault();

            const lastName = document.getElementById('lname').value.trim();
            const mobile = document.getElementById('mobile').value.trim();

            // Clear previous error message
            errorMessage.style.display = 'none';
            errorMessage.innerText = '';

            if (!lastName || !mobile) {
                errorMessage.style.display = 'block';
                errorMessage.innerText = 'Both last name and mobile are required.';
                return;
            }

            // Prepare the data to be sent to the server
            const data = new URLSearchParams();
            data.append('lastName', lastName);
            data.append('mobile', mobile);

            axios.post('https://localhost/petbooqz/Advancenotice/api/v1/searchexistclient', data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'CLIENT_PRACTICE': '9999'
                }
            })
            .then(response => {
                const result = response.data;
                if (result.error) {
                    // Display the error message
                    errorMessage.style.display = 'block';
                    errorMessage.innerText = result.error;
                } else {
                    // Handle the case where the client is found
                    console.log('Client found:', result);
                    errorMessage.style.display = 'block';
                    errorMessage.innerText = 'We found you!';
                    // Redirect to another page or perform another action
                    // loadContent('select_service'); 
                }
            })
            .catch(error => {
                console.error('Error:', error);
                errorMessage.style.display = 'block';
                errorMessage.innerText = 'An error occurred while searching for the client.';
            });
        });
    }
}
