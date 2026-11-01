const cart = JSON.parse(localStorage.getItem("tableTideCart") || "[]");
const orderItems = document.querySelector("#orderItems");
const subtotal = document.querySelector("#subtotal");
const total = document.querySelector("#total");
const checkoutForm = document.querySelector("#checkoutForm");

function renderSummary() {
    const amount = cart.reduce((sum, item) => sum + item.price, 0);
    orderItems.innerHTML = cart.length ? cart.map((item) => `<div class="summary-item"><span>${item.name}</span><span>$${item.price.toFixed(2)}</span></div>`).join("") : "<p>Your order is empty. Return to the menu to add something delicious.</p>";
    subtotal.textContent = `$${amount.toFixed(2)}`;
    total.textContent = `$${amount.toFixed(2)}`;
}

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!cart.length || !checkoutForm.reportValidity()) return;
    localStorage.removeItem("tableTideCart");
    document.querySelector("#checkoutLayout").hidden = true;
    document.querySelector("#successPanel").hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
});

renderSummary();