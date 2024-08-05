// page_loader.js
export function loadContent(page) {
    const contentDiv = document.getElementById('content');
    fetch(`/components/${page}.html`)
        .then(response => response.text())
        .then(html => {
            contentDiv.innerHTML = html;
        })
        .catch(() => {
            contentDiv.innerHTML = '<h2>404</h2><p>Page not found.</p>';
        });
}

// Load the default content
document.addEventListener('DOMContentLoaded', () => {
    loadContent('homepage');
});

// Expose loadContent function to global scope
window.loadContent = loadContent;