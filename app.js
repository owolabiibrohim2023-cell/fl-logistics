/* ============================================================
   FL LOGISTICS — app.js
   Shared module: CONFIG, Firebase init, navbar/footer, helpers.
   Every page imports from this file. Loaded as type="module".
============================================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ============================================================
   ⭐⭐ EDIT HERE #1 — FIREBASE KEYS ⭐⭐
   Firebase Console → Project Settings → "Your apps" → Web app.
   Paste your own values below. Until you do, the site shows a
   friendly "not connected yet" message instead of crashing.
============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyCInFgxLCJZojGC00tF06An5sA7Yw0-V2s",
  authDomain: "fl-logistics-ce201.firebaseapp.com",
  projectId: "fl-logistics-ce201",
  storageBucket: "fl-logistics-ce201.firebasestorage.app",
  messagingSenderId: "1019619053229",
  appId: "1:1019619053229:web:cc8fafd437c7f6a23bc024",
  measurementId: "G-18N6XXDW0F"
};
/* ============================================================
   ⭐⭐ EDIT HERE #2 — ALL BUSINESS DETAILS ⭐⭐
============================================================ */
export const CONFIG = {
  businessName: "FL Logistics",
  tagline: "Reliable and affordable logistics. Your goods are safe until they reach their final destination.",
  phoneDisplay: "0813 740 7197",
  phoneIntl: "+2348137407197",
  whatsappNumber: "2348137407197", // digits only, no +
  email: "info@example.com", // EDIT: your business email
  address: "Ste 48, Ogba Shopping Arcade (LSDPC), Ijaiye Road, Ogba, Lagos 101233, Lagos State, Nigeria",
  mapsQuery: "Ogba Shopping Arcade LSDPC Ijaiye Road Ogba Lagos",
  // Working hours (24h clock). Open daily.
  openHour: 8,   // ⭐ EDIT opening time (8 = 8:00 AM)
  closeHour: 18, // 18 = 6:00 PM
  siteUrl: "https://example.com", // EDIT after deploy (used in tracking links)
  // Bank details shown on Payment page — EDIT
  bank: { accountName: "FL Logistics", accountNumber: "0123456789", bankName: "Your Bank Name" },
  // Feature switches
  features: { emailAlerts: true, smsAlerts: true },
  // EmailJS FALLBACK (only if Cloud Functions not deployed). See Part 6 notes.
  emailjs: { enabled: false, publicKey: "PASTE_EMAILJS_PUBLIC_KEY", serviceId: "PASTE_SERVICE_ID", templateId: "PASTE_TEMPLATE_ID" },
  socials: { instagram: "https://instagram.com/", facebook: "https://facebook.com/", x: "https://x.com/" }, // EDIT
  // Order statuses, in order (timeline). "Cancelled" handled separately.
  statuses: ["Order Placed", "Confirmed", "Picked Up", "In Transit", "Out for Delivery", "Delivered"],
  paymentStatuses: ["Pending", "Paid", "COD"],
  services: ["Same-day", "Express", "Interstate", "Standard"],
  packageTypes: ["Documents", "Parcel", "Food", "Clothing", "Electronics", "Fragile", "Other"],
  /* Price ESTIMATOR (editable; final price always confirmed on WhatsApp).
     base = first 1kg, perKg = each extra kg. zone multiplier applied. */
  pricing: {
    "Same-day":  { base: 3000, perKg: 600 },
    "Express":   { base: 5000, perKg: 900 },
    "Interstate":{ base: 6500, perKg: 1200 },
    "Standard":  { base: 2000, perKg: 400 }
  },
  zones: { "Lagos Mainland": 1.0, "Lagos Island": 1.3, "Outskirts": 1.6, "Interstate": 1.0 },
  // Rate table shown on pricing.html (admin can later override from Firestore "pricing/main")
  rateTable: [
    { service: "Standard (Lagos, next day)", w1: "₦2,000", w5: "₦3,600", w10: "₦5,600" },
    { service: "Same-day (Lagos)",          w1: "₦3,000", w5: "₦5,400", w10: "₦8,400" },
    { service: "Express (2–4 hrs, Lagos)",  w1: "₦5,000", w5: "₦8,600", w10: "₦13,100" },
    { service: "Interstate (per parcel)",   w1: "₦6,500", w5: "₦11,300", w10: "₦17,300" }
  ],
  coverage: ["Lagos (all areas)", "Abuja (FCT)", "Oyo (Ibadan)", "Rivers (Port Harcourt)",
    "Ogun (Abeokuta, Sango-Ota)", "Delta (Asaba, Warri)", "Anambra (Onitsha, Awka)",
    "Enugu", "Kano", "Kaduna", "Kwara (Ilorin)", "Ondo (Akure)", "Osun (Osogbo)", "Edo (Benin City)"],
  prohibitedItems: ["Cash, jewellery and precious stones", "Illegal drugs and contraband",
    "Weapons, ammunition and explosives", "Flammable liquids, gases and chemicals",
    "Live animals", "Perishable food without cold packaging", "Stolen or illegal goods"],
  // EDIT these placeholder testimonials
  testimonials: [
    { name: "Adaeze, Online Vendor — Ikeja", text: "FL Logistics picks up my customers' orders every day. Fast, careful and they always communicate. My repeat customers have doubled." },
    { name: "Tunde, Yaba", text: "I tracked my parcel live on my phone and the rider called before arriving. Delivered same day, no stories. Highly recommended." },
    { name: "Blessing, Lekki", text: "Affordable interstate delivery to Abuja. I got SMS and email updates at every step until it was delivered. Very professional." }
  ]
};

/* ---------------- Firebase init (safe if not configured) ---------------- */
export const firebaseReady = !firebaseConfig.apiKey.includes("PASTE");
export let auth = null, db = null;
if (firebaseReady) {
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (e) { console.error("Firebase init failed:", e); }
}
export function requireFirebase() {
  if (firebaseReady && db) return true;
  toast("Our online system is not connected yet. Please chat with us on WhatsApp and we will book it for you.", "error");
  return false;
}

/* ---------------- Tiny helpers ---------------- */
export const $  = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
export const esc = (s = "") => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const fmtMoney = n => "₦" + Number(n || 0).toLocaleString("en-NG");
export const fmtDateTime = ts => {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
};
export const waLink = (message, number = CONFIG.whatsappNumber) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
export const trackingLink = id => `${CONFIG.siteUrl}/track.html?id=${id}`;

/** Nigerian phone validation: accepts 0813…, +234…, 234… */
export function isValidNgPhone(raw = "") {
  const p = String(raw).replace(/[\s()-]/g, "");
  return /^(\+234|234|0)[789][01]\d{8}$/.test(p);
}
/** Normalise to +234XXXXXXXXXX (needed by Termii SMS) */
export function normalizeNgPhone(raw = "") {
  let p = String(raw).replace(/[\s()-]/g, "");
  if (p.startsWith("0")) p = "+234" + p.slice(1);
  else if (p.startsWith("234")) p = "+" + p;
  return p;
}
export const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());

/** Order ID: FLG-XXXXX (unambiguous characters) */
export function genOrderId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return "FLG-" + s;
}

/** Estimated price (final price confirmed on WhatsApp) */
export function estimatePrice(serviceType, weightKg, zone = "Lagos Mainland", stops = 1) {
  const p = CONFIG.pricing[serviceType] || CONFIG.pricing["Standard"];
  const w = Math.max(1, Number(weightKg) || 1);
  const zoneMult = serviceType === "Interstate" ? 1 : (CONFIG.zones[zone] || 1);
  const base = (p.base + (w - 1) * p.perKg) * zoneMult;
  const extraStops = Math.max(0, stops - 1) * 1200; // per extra drop-off
  return Math.round((base + extraStops) / 100) * 100;
}

/** Open / closed right now (Africa/Lagos) */
export function businessOpen() {
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos", hour: "numeric", hour12: false }));
  return hour >= CONFIG.openHour && hour < CONFIG.closeHour;
}
const fmtHour = h => { const hh = ((h + 11) % 12) + 1; return `${hh}:00 ${h < 12 ? "AM" : "PM"}`; };
export const hoursText = () => `Open daily, ${fmtHour(CONFIG.openHour)} – ${fmtHour(CONFIG.closeHour)}`;

/* ---------------- Toasts ---------------- */
export function toast(message, type = "info") {
  let wrap = $("#toastWrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.id = "toastWrap"; document.body.appendChild(wrap); }
  const t = document.createElement("div");
  t.className = "toast " + (type === "success" ? "success" : type === "error" ? "error" : "");
  t.innerHTML = `<i class="fa-solid ${type === "success" ? "fa-circle-check" : type === "error" ? "fa-triangle-exclamation" : "fa-circle-info"}"></i><span>${esc(message)}</span>`;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 4600);
}

/* ---------------- Confirm dialog (returns Promise<boolean>) ---------------- */
export function confirmDialog(title, message, confirmText = "Yes, continue") {
  return new Promise(resolve => {
    const ov = document.createElement("div");
    ov.className = "modal-overlay open";
    ov.innerHTML = `<div class="modal" role="alertdialog" aria-modal="true">
      <h3>${esc(title)}</h3><p class="muted">${esc(message)}</p>
      <div class="btn-row" style="margin-top:18px">
        <button class="btn btn-danger" data-yes>${esc(confirmText)}</button>
        <button class="btn btn-ghost" data-no>Cancel</button></div></div>`;
    document.body.appendChild(ov);
    const done = v => { ov.remove(); resolve(v); };
    ov.querySelector("[data-yes]").onclick = () => done(true);
    ov.querySelector("[data-no]").onclick = () => done(false);
    ov.addEventListener("click", e => { if (e.target === ov) done(false); });
  });
}

/* ---------------- Form field error helpers ---------------- */
export function setFieldError(input, msg) {
  if (!input) return;
  input.classList.toggle("invalid", !!msg);
  const err = input.closest(".field")?.querySelector(".field-error");
  if (err) { err.textContent = msg || ""; err.classList.toggle("show", !!msg); }
}
export function copyText(text, okMsg = "Copied!") {
  navigator.clipboard?.writeText(text).then(
    () => toast(okMsg, "success"),
    () => toast("Copy failed — please copy it manually.", "error"));
}
/* Recent order IDs on this device (guest-friendly) */
export function rememberOrderId(id) {
  try {
    const list = JSON.parse(localStorage.getItem("fl_recent_orders") || "[]");
    localStorage.setItem("fl_recent_orders", JSON.stringify([...new Set([id, ...list])].slice(0, 6)));
  } catch {}
}
export const recentOrderIds = () => { try { return JSON.parse(localStorage.getItem("fl_recent_orders") || "[]"); } catch { return []; } };

/** Prefilled WhatsApp booking message (exact agreed format) */
export function bookingWhatsAppMessage(o) {
  return `Hello FL Logistics, I'd like to book a delivery.

Order ID: ${o.orderId}
Name: ${o.senderName}
Phone: ${o.senderPhone}
Pickup: ${o.pickupAddress}
Drop-off: ${o.dropoffAddress}
Receiver: ${o.receiverName} (${o.receiverPhone})
Package: ${o.packageType}${o.packageDescription ? " — " + o.packageDescription : ""} (${o.weightKg || 1}kg)
Service: ${o.serviceType}
Date: ${o.pickupDate || ""} ${o.pickupTime || ""}

Please confirm the price and payment details.`;
}

/* ============================================================
   SHARED CHROME — navbar, footer, floating buttons.
   Pages just include: <div id="siteHeader"></div> … <div id="siteFooter"></div>
============================================================ */
const NAV_LINKS = [
  ["index.html", "Home"], ["services.html", "Services"], ["pricing.html", "Pricing & Coverage"],
  ["track.html", "Track Order"], ["about.html", "About"], ["faq.html", "FAQ"], ["contact.html", "Contact"]
];
export function renderChrome(active = "") {
  const open = businessOpen();
  const headerEl = $("#siteHeader");
  if (headerEl) {
    headerEl.innerHTML = `
    <div class="topbar"><div class="container">
      <span><i class="fa-solid fa-location-dot"></i> Ogba, Lagos &nbsp;·&nbsp; ${hoursText()}</span>
      <span><span class="open-badge ${open ? "open" : "closed"}">${open ? "Open now · until " + fmtHour(CONFIG.closeHour) : "Closed now · Opens " + fmtHour(CONFIG.openHour)}</span>
      &nbsp;<a href="tel:${CONFIG.phoneIntl}"><i class="fa-solid fa-phone"></i> ${CONFIG.phoneDisplay}</a></span>
    </div></div>
    <header class="site"><div class="container nav-wrap">
      <a class="logo" href="index.html" aria-label="FL Logistics home">
        <span class="logo-mark" aria-hidden="true"><span>F</span><b>L</b></span>
        <span class="logo-copy"><span class="logo-name">FL <b>LOGISTICS</b></span><small>Reliable · Affordable · Safe</small></span></a>
      <nav class="main-nav" aria-label="Main">
        ${NAV_LINKS.map(([h, t]) => `<a href="${h}" ${active === h ? 'aria-current="page" style="background:var(--blue-light);color:var(--blue)"' : ""}>${t}</a>`).join("")}
      </nav>
      <div class="nav-actions">
        <span id="authArea"><!-- filled by auth listener -->
          <a class="btn btn-ghost" href="login.html">Sign In</a>
          <a class="btn btn-blue" href="signup.html">Sign Up</a></span>
        <a class="btn btn-orange" href="book.html"><i class="fa-solid fa-box"></i> Book a Delivery</a>
        <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
    <nav class="mobile-menu" id="mobileMenu" aria-label="Mobile">
      ${NAV_LINKS.map(([h, t]) => `<a href="${h}">${t}</a>`).join("")}
      <a href="payment.html">Payment Info</a><a href="careers.html">Join as a Rider</a>
      <span id="authAreaMobile"><a href="login.html">Sign In</a><a href="signup.html">Sign Up</a></span>
    </nav></header>`;
    const ham = $("#hamburger"), menu = $("#mobileMenu");
    ham.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      ham.setAttribute("aria-expanded", isOpen);
      ham.innerHTML = `<i class="fa-solid fa-${isOpen ? "xmark" : "bars"}"></i>`;
    });
  }
  const footerEl = $("#siteFooter");
  if (footerEl) {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.mapsQuery)}`;
    footerEl.innerHTML = `
    <footer class="site"><div class="container">
      <div class="grid grid-4">
        <div><h4>FL Logistics</h4><p style="font-size:.93rem">${esc(CONFIG.tagline)}</p>
          <div class="social-row">
            <a href="${CONFIG.socials.instagram}" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
            <a href="${CONFIG.socials.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
            <a href="${CONFIG.socials.x}" target="_blank" rel="noopener" aria-label="X (Twitter)"><i class="fa-brands fa-x-twitter"></i></a>
            <a href="${waLink("Hello FL Logistics, I have a question.")}" target="_blank" rel="noopener" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
          </div></div>
        <div><h4>Quick Links</h4><ul>
          <li><a href="book.html">Book a Delivery</a></li><li><a href="track.html">Track Order</a></li>
          <li><a href="services.html">Our Services</a></li><li><a href="pricing.html">Pricing &amp; Coverage</a></li>
          <li><a href="payment.html">Payment Info</a></li><li><a href="careers.html">Join as a Rider</a></li></ul></div>
        <div><h4>Company</h4><ul>
          <li><a href="about.html">About Us</a></li><li><a href="faq.html">FAQ</a></li>
          <li><a href="contact.html">Contact Us</a></li><li><a href="legal.html#terms">Terms</a></li>
          <li><a href="legal.html#privacy">Privacy Policy</a></li><li><a href="legal.html#claims">Claims &amp; Refunds</a></li></ul></div>
        <div><h4>Contact</h4><ul>
          <li><i class="fa-solid fa-location-dot"></i> ${esc(CONFIG.address)}</li>
          <li><a href="tel:${CONFIG.phoneIntl}"><i class="fa-solid fa-phone"></i> ${CONFIG.phoneDisplay}</a></li>
          <li><a href="${waLink("Hello FL Logistics!")}" target="_blank" rel="noopener"><i class="fa-brands fa-whatsapp"></i> Chat on WhatsApp</a></li>
          <li><i class="fa-regular fa-clock"></i> ${hoursText()}</li>
          <li><a href="${mapsUrl}" target="_blank" rel="noopener"><i class="fa-solid fa-diamond-turn-right"></i> Get Directions (Google Maps)</a></li></ul></div>
      </div>
      <div class="footer-bottom">© ${new Date().getFullYear()} FL Logistics, Ogba Lagos, Nigeria. All rights reserved.</div>
    </div></footer>`;
  }
  /* Floating WhatsApp + back-to-top + mobile sticky CTA */
  document.body.insertAdjacentHTML("beforeend", `
    <a class="wa-float" data-tip="Chat with us" aria-label="Chat with us on WhatsApp" target="_blank" rel="noopener"
       href="${waLink("Hello FL Logistics, I need help with a delivery.")}"><i class="fa-brands fa-whatsapp"></i></a>
    <button id="backTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
    <div class="mobile-cta">
      <a class="btn btn-blue" href="tel:${CONFIG.phoneIntl}"><i class="fa-solid fa-phone"></i> Call Now</a>
      <a class="btn btn-orange" href="book.html"><i class="fa-solid fa-box"></i> Book a Delivery</a>
    </div>`);
  const bt = $("#backTop");
  addEventListener("scroll", () => bt.classList.toggle("show", scrollY > 600), { passive: true });
  bt.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  initReveal(); initAuthNav();
}

/* Navbar auth state: logged-out buttons ↔ name dropdown */
function initAuthNav() {
  if (!auth) return;
  onAuthStateChanged(auth, async user => {
    const area = $("#authArea"), mobile = $("#authAreaMobile");
    if (!area) return;
    if (!user) {
      area.innerHTML = `<a class="btn btn-ghost" href="login.html">Sign In</a><a class="btn btn-blue" href="signup.html">Sign Up</a>`;
      if (mobile) mobile.innerHTML = `<a href="login.html">Sign In</a><a href="signup.html">Sign Up</a>`;
      document.dispatchEvent(new CustomEvent("fl-auth", { detail: { user: null, profile: null } }));
      return;
    }
    let profile = null, name = user.displayName || user.email;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) { profile = snap.data(); name = profile.fullName || name; }
    } catch {}
    const first = esc(String(name).split(" ")[0]);
    const dashLink = profile?.role === "admin" ? "admin.html" : profile?.role === "rider" ? "rider.html" : "account.html";
    area.innerHTML = `
      <div class="account-menu">
        <button class="account-btn" id="accountBtn"><i class="fa-solid fa-circle-user"></i> Hi, ${first} <i class="fa-solid fa-chevron-down" style="font-size:.7rem"></i></button>
        <div class="account-dropdown" id="accountDropdown">
          <a href="${dashLink}"><i class="fa-solid fa-gauge"></i> My Dashboard</a>
          <a href="account.html#orders"><i class="fa-solid fa-box-open"></i> My Orders</a>
          <a href="account.html#profile"><i class="fa-solid fa-user-gear"></i> Profile</a>
          <button id="logoutBtn"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
        </div></div>`;
    if (mobile) mobile.innerHTML = `<a href="${dashLink}">My Dashboard</a><a href="#" id="logoutBtnM">Logout</a>`;
    const dd = $("#accountDropdown");
    $("#accountBtn").addEventListener("click", e => { e.stopPropagation(); dd.classList.toggle("open"); });
    document.addEventListener("click", () => dd.classList.remove("open"));
    const doLogout = async e => { e.preventDefault(); await signOut(auth); toast("You have signed out.", "success"); location.href = "index.html"; };
    $("#logoutBtn")?.addEventListener("click", doLogout);
    $("#logoutBtnM")?.addEventListener("click", doLogout);
    document.dispatchEvent(new CustomEvent("fl-auth", { detail: { user, profile } }));
  });
}
/** Pages call this to run code once auth state is known. cb(user, profile) */
export function onAuthReady(cb) {
  if (!auth) { cb(null, null); return; }
  let done = false;
  document.addEventListener("fl-auth", e => { done = true; cb(e.detail.user, e.detail.profile); });
  setTimeout(() => { if (!done) cb(auth.currentUser, null); }, 4000); // safety net on slow networks
}

/* Scroll-reveal */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("visible")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  document.documentElement.classList.add("has-reveal");
  els.forEach(e => io.observe(e));
}