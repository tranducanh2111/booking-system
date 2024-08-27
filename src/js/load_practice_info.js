export async function loadPracticeInfo() {
  try {
    const response = await fetch('/api/practice_info');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const practiceInfo = await response.json();
    displayPracticeInfo(practiceInfo);
  } catch (error) {
    console.error('Error fetching practice information:', error);
  }
}

// Append clinic informations to the UI
function displayPracticeInfo(practiceInfo) {
  document.getElementById('practice-note').innerHTML = practiceInfo.Notes || 'No notes available';
  document.getElementById('practice-name').innerHTML = practiceInfo.PracticeName || 'Practice Name';
  document.getElementById('practice-phone').innerHTML = practiceInfo.Phone || 'Practice Phone';
  document.getElementById('practice-phone-url').href = `tel:${practiceInfo.Phone || ''}`;
  document.getElementById('practice-email').innerHTML = practiceInfo.Email || 'Practice Email';
  document.getElementById('practice-email-url').href = `mailto:${practiceInfo.Email || ''}`;
  document.getElementById('practice-website').href = `https://${practiceInfo.Website || ''}`;
  document.getElementById('practice-logo').src = practiceInfo.Logo || '';
  document.getElementById('practice-address').innerHTML = `${practiceInfo.Address}, ${practiceInfo.Suburb}, ${practiceInfo.State}, ${practiceInfo.Postcode}, ${practiceInfo.Country}` || 'Undefined Address';
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadPracticeInfo);