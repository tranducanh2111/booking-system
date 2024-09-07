// load_practice_info.js
export async function loadPracticeInfo() {
  const practiceCode = getPracticeCodeFromURL();

  try {
    if (practiceCode !== "") {
      const response = await fetch(`/api/encrypt_practice_code/${practiceCode}`);
      if (!response.ok) {
        window.location.href = '/404';
        console.log('Network response was not ok');
      }
      const encryptedData = await response.json();
      const decryptedPracticeCode = await decryptPracticeCode(encryptedData);
      const practiceInfoResponse = await fetch(`/api/practice_info/${decryptedPracticeCode}`);
      if (!practiceInfoResponse.ok) {
        throw new Error('Error fetching practice information');
      }
      const encryptedPracticeInfo = await practiceInfoResponse.json();
      const decryptedPracticeInfo = JSON.parse(await decryptPracticeCode(encryptedPracticeInfo));
      displayPracticeInfo(decryptedPracticeInfo);
    } else {
      console.error('No practiceCode found in the URL');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to get the practiceCode from the URL
function getPracticeCodeFromURL() {
  const params = new URLSearchParams(window.location.search)
  const reqCode = decodeURI(params.toString()).replace("=", "");
  console.log(reqCode);
  return reqCode;
}

async function decryptPracticeCode(encryptedData) {
  const response = await fetch('/api/decrypt_practice_code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(encryptedData),
  });
  if (!response.ok) {
    throw new Error('Error decrypting practice code');
  }
  return await response.text();
}

// Append clinic informations to the UI
function displayPracticeInfo(practiceInfo) {
  document.getElementById('practice-name').innerHTML = practiceInfo.PracticeName || 'Practice Name';
  document.getElementById('practice-phone').innerHTML = practiceInfo.Phone || 'Practice Phone';
  document.getElementById('practice-phone-url').href = `tel:${practiceInfo.Phone || ''}`;
  document.getElementById('practice-email').innerHTML = practiceInfo.Email || 'Practice Email';
  document.getElementById('practice-email-url').href = `mailto:${practiceInfo.Email || ''}`;
  document.getElementById('practice-website').href = `https://${practiceInfo.Website || ''}`;
  document.getElementById('practice-logo').src = practiceInfo.Logo || '';
  document.getElementById('practice-address').innerHTML = `${practiceInfo.Address}, ${practiceInfo.Suburb}, ${practiceInfo.State}, ${practiceInfo.Postcode}, ${practiceInfo.Country}` || 'Undefined Address';

  if (document.getElementById('practice-note'))
  {
    document.getElementById('practice-note').innerHTML = practiceInfo.Notes || 'Clinic does not have any notes.';
  }
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadPracticeInfo);