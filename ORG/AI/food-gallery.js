const menuItems = [
    { id: 1, name: "Miso mushroom toast", category: "savory", price: 14, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=900&q=85" },
    { id: 2, name: "Citrus ricotta bowl", category: "fresh", price: 12, image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=900&q=85" },
    { id: 3, name: "Chili crisp noodles", category: "savory", price: 16, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=85" },
    { id: 4, name: "Strawberry cloud cake", category: "sweet", price: 11, image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=85" },
    { id: 5, name: "Green garden salad", category: "fresh", price: 13, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85" },
    { id: 6, name: "Dark chocolate tart", category: "sweet", price: 10, image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=900&q=85" }
];
let cart = JSON.parse(localStorage.getItem("tableTideCart") || "[]");
let modalItem = null;
const productGrid = document.querySelector("#productGrid");
const cartSidebar = document.querySelector("#cartSidebar");
const cartItems = document.querySelector("#cartItems");
const labels = { en: { view: "View details", add: "Add to cart", remove: "Remove", empty: "Your cart is waiting for something delicious." }, mr: { view: "तपशील पाहा", add: "कार्टमध्ये जोडा", remove: "काढा", empty: "तुमची कार्ट स्वादिष्ट पदार्थाची वाट पाहत आहे." } };
function uiLabels() { return labels[localStorage.getItem("tableTideLanguage")] || labels.en; }

function renderMenu(filter = "all") {
    const items = filter === "all" ? menuItems : menuItems.filter((item) => item.category === filter);
    const text = uiLabels();
    productGrid.innerHTML = items.map((item, index) => `<article class="product-card" style="animation-delay:${index * 70}ms"><button class="product-image-button" data-open="${item.id}" aria-label="${text.view}: ${item.name}"><img class="product-image" src="${item.image}" alt="${item.name}" loading="lazy"><span class="view-label">${text.view}</span></button><div class="product-info"><span class="product-category">${item.category}</span><h2 class="product-name">${item.name}</h2><strong class="product-price">$${item.price.toFixed(2)}</strong><button class="add-btn" data-add="${item.id}">${text.add}</button></div></article>`).join("");
}
function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const text = uiLabels();
    localStorage.setItem("tableTideCart", JSON.stringify(cart));
    document.querySelector("#cartCount").textContent = cart.length;
    document.querySelector("#cartTotal").textContent = `$${total.toFixed(2)}`;
    cartItems.innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-item"><div><h3>${item.name}</h3><p>$${item.price.toFixed(2)}</p></div><button class="remove-item" data-remove="${index}">${text.remove}</button></div>`).join("") : `<p>${text.empty}</p>`;
}
function addToCart(item) {
    cart.push(item);
    renderCart();
    cartSidebar.classList.add("active");
}
document.querySelectorAll(".filter-btn").forEach((button) => button.addEventListener("click", () => { document.querySelector(".filter-btn.active").classList.remove("active"); button.classList.add("active"); renderMenu(button.dataset.filter); }));
productGrid.addEventListener("click", (event) => { const add = event.target.closest("[data-add]"); const open = event.target.closest("[data-open]"); if (add) addToCart(menuItems.find((item) => item.id === Number(add.dataset.add))); if (open) window.location.href = `product-details.html?id=${open.dataset.open}`; });
document.querySelector("#addModalToCart").addEventListener("click", () => { if (modalItem) addToCart(modalItem); document.querySelector("#productModal").classList.remove("active"); });
document.querySelector("#closeModal").addEventListener("click", () => document.querySelector("#productModal").classList.remove("active"));
cartItems.addEventListener("click", (event) => { const remove = event.target.closest("[data-remove]"); if (remove) { cart.splice(Number(remove.dataset.remove), 1); renderCart(); } });
document.querySelector("#cartToggle").addEventListener("click", () => cartSidebar.classList.add("active"));
document.querySelector("#closeCart").addEventListener("click", () => cartSidebar.classList.remove("active"));
document.querySelector("#checkoutBtn").addEventListener("click", () => { if (cart.length) window.location.href = "checkout.html"; });
renderMenu();
renderCart();
window.addEventListener("languagechange", () => { renderMenu(document.querySelector(".filter-btn.active").dataset.filter); renderCart(); });