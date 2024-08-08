export function loadClinicNotes() {
  console.log("Clinic Note Loaded")
    fetch('/api/clinic-notes')
      .then(response => response.json())
      .then(data => {
        const clinicNoteSection = document.querySelector('.clinic-note');
        clinicNoteSection.innerHTML = ''; // Clear existing content
  
        data.clinicNotes.forEach(note => {
          const noteElement = document.createElement('p');
          noteElement.className = 'text-body';
          noteElement.innerHTML = `
            ${note.greeting}
            <br><br>
            ${note.content}
            <br><br>
            ${note.closing}
            <br><br>${note.signature}
          `;
          clinicNoteSection.appendChild(noteElement);
        });
      })
      .catch(error => console.error('Error loading clinic notes:', error));
  }
  
// Call this function when the page loads
document.addEventListener('DOMContentLoaded', loadClinicNotes);