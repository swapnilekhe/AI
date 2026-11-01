import { useEffect, useMemo, useState } from "react";
import { foodItems, translations } from "./data";
import "./styles.css";

const readCart = () => JSON.parse(localStorage.getItem("tableTideCart") || "[]");
const getView = () => new URLSearchParams(window.location.search).get("view") || "catalog";
const getDetailId = () => Number(new URLSearchParams(window.location.search).get("id")) || 1;

function go(view, id) {
  const query = view === "catalog" ? "" : `?view=${view}${id ? `&id=${id}` : ""}`;
  window.history.pushState({}, "", `${window.location.pathname}${query}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Language({ language, setLanguage }) {
  return <select className="language-select" value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language"><option value="en">English</option><option value="mr">मराठी</option></select>;
}

function Header({ t, language, setLanguage, food = false }) {
  return <header className={food ? "site-header food-header" : "site-header catalog-header"}>
    <div className="topline"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a><div className="header-actions"><button className="text-link" onClick={() => go(food ? "catalog" : "food")}>{food ? t.catalog : t.food} <span aria-hidden="true">&rarr;</span></button><button className="text-link" onClick={() => go("about")}>{t.about}</button><button className="text-link" onClick={() => go("contact")}>{t.contactPage}</button><Language language={language} setLanguage={setLanguage} /></div></div>
    <p className="eyebrow">{food ? (language === "mr" ? "थोडी भूक लागली आहे?" : "A little hungry?") : (language === "mr" ? "दररोजच्या टेबलसाठी निवडक संग्रह" : "A considered collection for the everyday table")}</p>
    <h1>{food ? <>Good food,<br /><em>no small talk.</em></> : <>Objects that make<br /><em>meals memorable.</em></>}</h1>
    <p className="header-copy">{food ? (language === "mr" ? "मेनू पाहा, तुमचा मूड निवडा आणि जेवणाला सुरुवात करू द्या." : "Browse the menu, choose your mood, and let dinner take it from there.") : (language === "mr" ? "स्वयंपाक, वाढणे आणि एकत्र जेवण्यासाठी सुंदर साधने आणि छोट्या सवयी शोधा." : "Explore beautiful tools, textures, and small rituals for cooking, serving, and sharing.")}</p>
  </header>;
}

function Catalog({ t, language, setLanguage }) {
  const [category, setCategory] = useState("all");
  const [modal, setModal] = useState(null);
  const products = [{ name: "Sienna serving bowl", category: "serve", price: 48, image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85", description: "Hand-finished stoneware with a warm, generous shape for salads and shared sides." }, { name: "Olivewood spoon", category: "cook", price: 22, image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=900&q=85", description: "A smooth, durable kitchen companion that feels better with every use." }, { name: "Linen napkin set", category: "ritual", price: 34, image: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85", description: "Washed linen in a quiet oat shade. Sold as a set of four." }];
  const shown = category === "all" ? products : products.filter((product) => product.category === category);
  return <><Header t={t} language={language} setLanguage={setLanguage} /><nav className="filter-bar">{["all", "serve", "cook", "ritual"].map((item) => <button className={category === item ? "filter active" : "filter"} key={item} onClick={() => setCategory(item)}>{item === "all" ? (language === "mr" ? "सर्व" : "Everything") : item}</button>)}</nav><main className="content-grid">{shown.map((product) => <article className="shop-card" key={product.name}><button className="image-button" onClick={() => setModal(product)}><img src={product.image} alt={product.name} /><span>{language === "mr" ? "तपशील पाहा" : "View details"}</span></button><div className="card-copy"><small>{product.category}</small><h2>{product.name}</h2><p>{product.description}</p><strong>${product.price.toFixed(2)}</strong></div></article>)}</main>{modal && <div className="overlay" onClick={() => setModal(null)}><div className="catalog-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)}>&times;</button><img src={modal.image} alt={modal.name} /><div><small>{modal.category}</small><h2>{modal.name}</h2><p>{modal.description}</p><strong>${modal.price.toFixed(2)}</strong></div></div></div>}</>;
}

function FoodGallery({ t, language, setLanguage, cart, setCart }) {
  const [category, setCategory] = useState("all");
  const shown = category === "all" ? foodItems : foodItems.filter((item) => item.category === category);
  const add = (item) => setCart([...cart, item]);
  return <><Header t={t} language={language} setLanguage={setLanguage} food /><nav className="filter-bar">{["all", "savory", "fresh", "sweet"].map((item) => <button className={category === item ? "filter active" : "filter"} key={item} onClick={() => setCategory(item)}>{t[item]}</button>)}</nav><main className="content-grid food-grid">{shown.map((item) => <article className="food-card" key={item.id}><button className="image-button" onClick={() => go("detail", item.id)}><img src={item.image} alt={item.name} /><span>{t.details}</span></button><div className="card-copy"><small>{item.category}</small><h2>{item.name}</h2><strong>${item.price.toFixed(2)}</strong><button className="add-button" onClick={() => add(item)}>{t.add}</button></div></article>)}</main><Cart t={t} cart={cart} setCart={setCart} /> </>;
}

function Cart({ t, cart, setCart }) {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const [open, setOpen] = useState(false);
  return <><button className="cart-fab" onClick={() => setOpen(true)}>{t.cart} <b>{cart.length}</b></button>{open && <aside className="cart-panel"><div className="cart-heading"><h2>{t.yourCart}</h2><button onClick={() => setOpen(false)}>&times;</button></div>{cart.length ? cart.map((item, index) => <div className="cart-row" key={`${item.id}-${index}`}><span>{item.name}<small>${item.price.toFixed(2)}</small></span><button onClick={() => setCart(cart.filter((_, itemIndex) => itemIndex !== index))}>{t.remove}</button></div>) : <p>{t.empty}</p>}<div className="cart-total"><span>{t.total}</span><strong>${total.toFixed(2)}</strong></div><button className="checkout-button" disabled={!cart.length} onClick={() => go("checkout")}>{t.checkout}</button></aside>}</>;
}

function Details({ t, language, setLanguage, cart, setCart }) {
  const item = foodItems.find((food) => food.id === getDetailId()) || foodItems[0];
  const [image, setImage] = useState(item.images[0]);
  return <><div className="page-shell"><div className="simple-header"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a><div className="header-actions"><button className="text-link" onClick={() => go("food")}>&larr; {t.back}</button><Language language={language} setLanguage={setLanguage} /></div></div><main className="detail-layout"><div><img className="detail-image" src={image} alt={item.name} /><div className="thumbnails">{item.images.map((source) => <button className={image === source ? "thumb active" : "thumb"} key={source} onClick={() => setImage(source)}><img src={source} alt="" /></button>)}</div></div><div className="detail-copy"><small>{item.category}</small><h1>{item.name}</h1><p>{item.description}</p><div className="buy-line"><strong>${item.price.toFixed(2)}</strong><button className="add-button" onClick={() => setCart([...cart, item])}>{t.add} &rarr;</button></div><p className="detail-message">{language === "mr" ? "प्रत्येक सर्व्हिंगसाठी अंदाजे पोषण माहिती." : "Nutrition information is estimated per serving."}</p></div></main><section className="notes-grid"><article><small>{t.whatGoesIn}</small><h2>{t.ingredients}</h2><p>{item.ingredients}</p></article><article><small>{t.goodToKnow}</small><h2>{t.nutrition}</h2><div className="vitamin-grid">{item.vitamins.map(([vitamin, source]) => <div className="vitamin" key={vitamin}><strong>Vitamin {vitamin}</strong><span>{source}</span></div>)}</div><p className="detail-message">{t.note}</p></article></section></div><Cart t={t} cart={cart} setCart={setCart} /></>;
}

function Checkout({ t, language, setLanguage, cart, setCart }) {
  const [complete, setComplete] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  if (complete) return <div className="page-shell centered"><div className="simple-header"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a><Language language={language} setLanguage={setLanguage} /></div><div className="success"><small>{t.confirmed}</small><h1>{language === "mr" ? "टेबलवर भेटूया." : "Thank you for joining the table."}</h1><p>{t.success}</p><button className="checkout-button" onClick={() => go("food")}>{t.returnMenu}</button></div></div>;
  return <div className="page-shell"><div className="simple-header"><a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a><div className="header-actions"><button className="text-link" onClick={() => go("food")}>&larr; {t.back}</button><Language language={language} setLanguage={setLanguage} /></div></div><main className="checkout-layout"><form className="form-panel" onSubmit={(event) => { event.preventDefault(); if (cart.length) { localStorage.removeItem("tableTideCart"); setCart([]); setComplete(true); } }}><small>{language === "mr" ? "आता तुमचेच" : "Almost yours"}</small><h1>{language === "mr" ? "तुमची ऑर्डर पूर्ण करा." : <>Finish your<br /><em>order.</em></>}</h1>{[[t.contact, [[t.email, "email"], [t.name, "text"], [t.address, "text"], [t.city, "text"], [t.postcode, "text"]]], [t.payment, [[t.card, "text"], [t.expiry, "text"], [t.cvc, "text"]]]].map(([legend, fields]) => <fieldset key={legend}><legend>{legend}</legend>{fields.map(([label, type]) => <label key={label}>{label}<input type={type} required /></label>)}</fieldset>)}<button className="checkout-button" disabled={!cart.length}>{t.placeOrder} &rarr;</button></form><aside className="order-panel"><small>{t.order}</small>{cart.map((item, index) => <div className="order-row" key={`${item.id}-${index}`}><span>{item.name}</span><strong>${item.price.toFixed(2)}</strong></div>)}<div className="cart-total"><span>{t.total}</span><strong>${total.toFixed(2)}</strong></div></aside></main></div>;
}

function About({ t, language, setLanguage }) {
  return <div className="page-shell centered">
    <div className="simple-header">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a>
      <div className="header-actions">
        <button className="text-link" onClick={() => go("catalog")}>{t.catalog}</button>
        <Language language={language} setLanguage={setLanguage} />
      </div>
    </div>
    <div className="about-content">
      <h1>{t.aboutTitle}</h1>
      <p className="eyebrow">{t.aboutSubtitle}</p>
      <p className="about-description">{t.aboutDescription}</p>
      <div className="about-values">
        <article>
          <h3>{language === "mr" ? "साध्या घटक" : "Simple Ingredients"}</h3>
          <p>{language === "mr" ? "आम्ही लोकली आणि सतत उपलब्ध असलेल्या पदार्थांचा वापर करतो." : "We use locally sourced and seasonal ingredients."}</p>
        </article>
        <article>
          <h3>{language === "mr" ? "समर्पित तयारी" : "Thoughtful Preparation"}</h3>
          <p>{language === "mr" ? "प्रत्येक पदार्थ आभाराने तयार केला जातो." : "Every dish is crafted with care and attention."}</p>
        </article>
        <article>
          <h3>{language === "mr" ? "शांत टेबल" : "Peaceful Table"}</h3>
          <p>{language === "mr" ? "आमचा हेतू तुमच्या टेबलवर ताप आणि पोषण आनंद आणणे आहे." : "Our mission is to bring warmth and nourishment to your table."}</p>
        </article>
      </div>
    </div>
  </div>;
}

function Contact({ t, language, setLanguage }) {
  return <div className="page-shell">
    <div className="simple-header">
      <a className="brand" href="#" onClick={(event) => { event.preventDefault(); go("catalog"); }}>Table &amp; Tide</a>
      <div className="header-actions">
        <button className="text-link" onClick={() => go("catalog")}>{t.catalog}</button>
        <button className="text-link" onClick={() => go("about")}>{t.about}</button>
        <Language language={language} setLanguage={setLanguage} />
      </div>
    </div>
    <main className="contact-layout">
      <div className="contact-info">
        <h1>{t.contactTitle}</h1>
        <p className="eyebrow">{t.contactSubtitle}</p>
        <p className="contact-description">{t.contactDescription}</p>
        
        <div className="contact-details">
          <div className="detail-item">
            <span className="detail-label">{t.contactEmail}</span>
            <span className="detail-value">hello@tableandtide.com</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t.contactAddress}</span>
            <span className="detail-value">{t.addressPlaceholder}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t.contactPhone}</span>
            <span className="detail-value">{t.phonePlaceholder}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">{t.contactHours}</span>
            <span className="detail-value">{t.hoursPlaceholder}</span>
          </div>
        </div>
      </div>
      
      <form className="contact-form" onSubmit={(event) => { event.preventDefault(); alert(language === "mr" ? "संदेश आम्हाला पाठवला आहे!" : "Message sent to us!"); }}>
        <h2>{language === "mr" ? "संदेश पाठवा" : "Send a Message"}</h2>
        <div className="form-group">
          <label htmlFor="contact-name">{t.name}</label>
          <input type="text" id="contact-name" placeholder={language === "mr" ? "तुमचे नाव" : "Your name"} required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-email">{t.email}</label>
          <input type="email" id="contact-email" placeholder={t.emailPlaceholder} required />
        </div>
        <div className="form-group">
          <label htmlFor="contact-message">{language === "mr" ? "संदेश" : "Message"}</label>
          <textarea id="contact-message" rows="5" placeholder={language === "mr" ? "तुमचा संदेश येथे लिहा..." : "Write your message here..."} required></textarea>
        </div>
        <button type="submit" className="checkout-button">{t.sendButton}</button>
      </form>
    </main>
  </div>;
}

export default function App() {
  const [view, setView] = useState(getView());
  const [language, setLanguage] = useState(localStorage.getItem("tableTideLanguage") || "en");
  const [cart, setCart] = useState(readCart);
  useEffect(() => { localStorage.setItem("tableTideCart", JSON.stringify(cart)); localStorage.setItem("tableTideLanguage", language); document.documentElement.lang = language === "mr" ? "mr" : "en"; }, [cart, language]);
  useEffect(() => { const onPopState = () => setView(getView()); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);
  const t = useMemo(() => translations[language], [language]);
  if (view === "food") return <FoodGallery t={t} language={language} setLanguage={setLanguage} cart={cart} setCart={setCart} />;
  if (view === "detail") return <Details t={t} language={language} setLanguage={setLanguage} cart={cart} setCart={setCart} />;
  if (view === "checkout") return <Checkout t={t} language={language} setLanguage={setLanguage} cart={cart} setCart={setCart} />;
  if (view === "about") return <About t={t} language={language} setLanguage={setLanguage} />;
  if (view === "contact") return <Contact t={t} language={language} setLanguage={setLanguage} />;
  return <Catalog t={t} language={language} setLanguage={setLanguage} />;
}
