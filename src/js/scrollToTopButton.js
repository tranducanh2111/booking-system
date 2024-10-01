// Get the button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// When the user scrolls down 100px from the top of the document, show the button
window.onscroll = function () {
    if (
        document.body.scrollTop > 20 ||
        document.documentElement.scrollTop > 20
    ) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
};

// When the user clicks on the button, scroll to the top of the document
scrollToTopBtn.addEventListener('click', function () {
    window.scrollTo({
        top: 0,
        behavior: 'smooth', // for smooth scrolling
    });
});
