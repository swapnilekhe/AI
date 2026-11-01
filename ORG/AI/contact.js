const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");

contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    contactStatus.hidden = false;
    contactForm.reset();
});
