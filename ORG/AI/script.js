const products = [
    { id: 1, name: "Sienna serving bowl", category: "serve", price: 48, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85", description: "Hand-finished stoneware with a warm, generous shape for salads and shared sides." },
    { id: 2, name: "Olivewood spoon", category: "cook", price: 22, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85", description: "A smooth, durable kitchen companion that feels better with every use." },
    { id: 3, name: "Linen napkin set", category: "ritual", price: 34, image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85", description: "Washed linen in a quiet oat shade. Sold as a set of four." },
    { id: 4, name: "Salt cellar", category: "cook", price: 28, image: "https://images.unsplash.com/photo-1606913084603-3e7702b01627?auto=format&fit=crop&w=900&q=85", description: "Keep your finishing salt close in a small tactile oak vessel." },
    { id: 5, name: "Amber oil bottle", category: "ritual", price: 39, image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=900&q=85", description: "A dark glass bottle with a precise pourer for olive oil and dressings." },
    { id: 6, name: "Speckled dinner plate", category: "serve", price: 26, image: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=85", description: "A softly irregular plate that makes even toast feel like a proper meal." }
];

const gallery = document.querySelector("#gallery");
const loading = document.querySelector("#loading");
const modal = document.querySelector("#modal");
const modalImage = document.querySelector("#modal-image");
const modalInfo = document.querySelector("#modal-info");

function renderProducts(category = "all") {
    const visibleProducts = category === "all" ? products : products.filter((product) => product.category === category);
    gallery.innerHTML = visibleProducts.map((product, index) => `
        <article class="product-card" style="animation-delay: ${index * 70}ms">
            <button class="product-image-button" data-product="${product.id}" aria-label="View ${product.name}">
                <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="view-label">View details</span>
            </button>
            <div class="product-info"><span class="product-category">${product.category}</span><h2 class="product-name">${product.name}</h2><p class="product-description">${product.description}</p><strong class="product-price">$${product.price.toFixed(2)}</strong></div>
        </article>
    `).join("");
}

function closeModal() { modal.classList.remove("active"); modal.setAttribute("aria-hidden", "true"); }
function openModal(product) { modalImage.src = product.image; modalImage.alt = product.name; modalInfo.innerHTML = `<span class="product-category">${product.category}</span><h2>${product.name}</h2><p>${product.description}</p><strong>$${product.price.toFixed(2)}</strong>`; modal.classList.add("active"); modal.setAttribute("aria-hidden", "false"); }

document.querySelectorAll(".category-btn").forEach((button) => button.addEventListener("click", () => {
    document.querySelector(".category-btn.active").classList.remove("active");
    button.classList.add("active");
    renderProducts(button.dataset.category);
}));
gallery.addEventListener("click", (event) => { const button = event.target.closest("[data-product]"); if (button) openModal(products.find((product) => product.id === Number(button.dataset.product))); });
document.querySelector(".close-modal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
loading.classList.remove("active");
renderProducts();