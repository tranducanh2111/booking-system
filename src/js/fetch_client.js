document.addEventListener('DOMContentLoaded', function() {
    // Get the overlay
    var overlay = document.getElementById("overlay");

    // Get the button that opens the modal
    var btn = document.querySelector("#openPopup");

    // Get the cancel button inside the popup
    var cancelBtn = document.querySelector("#cancelBtn");

    // Function to show the overlay and dim other elements
    function showOverlay() {
        overlay.style.display = "block";
        
        // Select all child elements of <main> except #overlay
        var mainChildren = document.querySelectorAll("main > *");
        mainChildren.forEach(function(child) {
            if (child !== overlay) {
                child.style.opacity = "0.5";
            }
        });
    }

    // Function to hide the overlay and restore opacity
    function hideOverlay() {
        overlay.style.display = "none";
        
        // Restore opacity for all child elements of <main>
        var mainChildren = document.querySelectorAll("main > *");
        mainChildren.forEach(function(child) {
            if (child !== overlay) {
                child.style.opacity = "1";
            }
        });
    }

    // When the user clicks the button, open the modal
    btn.onclick = showOverlay;

    // When the user clicks the cancel button, close the popup
    cancelBtn.onclick = hideOverlay;
});