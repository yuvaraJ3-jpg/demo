/* =========================================================
   Malnad Water Purifier - script.js
   ---------------------------------------------------------
   Small vanilla JavaScript used only for:
   1. English / Kannada switching (text from translations.json)
   2. Remembering the chosen language between pages
   3. Filling phone / WhatsApp / email / map links from BUSINESS
   4. Phone menu toggle, missing-photo placeholders, form checks
   ========================================================= */

/* ---------------------------------------------------------
   BUSINESS DETAILS - EDIT THESE VALUES
   Every call, WhatsApp, email and map link on all five
   pages reads from here. Leave a value empty ("") until the
   owner confirms it; the site then shows a placeholder and
   points buttons to the Contact page instead.
   --------------------------------------------------------- */
const BUSINESS = {
  // INSERT BUSINESS PHONE NUMBER HERE - with country code, no spaces. Example format: "+91XXXXXXXXXX"
  phone: "",
  // How the phone number is shown on screen. Example format: "+91 XXXXX XXXXX"
  phoneDisplay: "",
  // INSERT WHATSAPP NUMBER HERE - digits only, with country code, no "+". Example format: "91XXXXXXXXXX"
  whatsapp: "",
  // INSERT BUSINESS EMAIL HERE
  email: "",
  // INSERT GOOGLE MAPS DIRECTIONS LINK HERE - e.g. a "Share > Copy link" URL from Google Maps
  mapsUrl: ""
};

const LANG_KEY = "mwp-lang";
const FALLBACK_HREF = "contact.html#contact-details";
let translations = null;
let currentLang = "en";

// English messages used when translations.json cannot load (file://)
const MSG_FALLBACK = {
  msg_required: "Please fill in this field.",
  msg_phone: "Please enter a valid phone number (10 digits).",
  msg_fix_errors: "Please correct the marked fields.",
  msg_whatsapp_opened: "WhatsApp is open with your details. Press send in WhatsApp. Your request is confirmed only after we reply.",
  msg_not_connected: "This form is not connected yet. Please call us or visit the shop."
};

/* ---------- Helpers ---------- */
function readStoredLang() {
  try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; }
}
function storeLang(lang) {
  try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode: ignore */ }
}

// Look up a key in the active language, then English, then null
function t(key) {
  if (!translations) return null;
  const active = translations[currentLang] || {};
  if (active[key] != null) return active[key];
  const en = translations.en || {};
  return en[key] != null ? en[key] : null;
}

/* ---------- Language ---------- */
function applyTranslations() {
  document.documentElement.lang = currentLang;

  if (translations) {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const value = t(el.dataset.i18n);
      if (value != null) el.textContent = value;
    });
    // Attribute translations: placeholder, aria-label, alt, meta content
    [["i18nPlaceholder", "placeholder"], ["i18nAria", "aria-label"], ["i18nAlt", "alt"], ["i18nContent", "content"]]
      .forEach(function (pair) {
        const attr = pair[0].replace(/[A-Z]/g, function (c) { return "-" + c.toLowerCase(); });
        document.querySelectorAll("[data-" + attr + "]").forEach(function (el) {
          const value = t(el.dataset[pair[0]]);
          if (value != null) el.setAttribute(pair[1], value);
        });
      });
  }

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === currentLang));
  });

  applyBusinessDetails();
  refreshFormMessages();
}

function setLanguage(lang) {
  currentLang = lang === "kn" ? "kn" : "en";
  storeLang(currentLang);
  applyTranslations();
}

function loadTranslations() {
  return fetch("translations.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) { translations = data; })
    .catch(function (err) {
      // Happens when pages are opened with file:// - see README.md
      console.warn("translations.json could not be loaded. English text from the HTML is shown.", err);
    });
}

/* ---------- Business details ---------- */
function whatsappUrl(message) {
  if (!BUSINESS.whatsapp) return null;
  const text = message || t("wa_greeting") || "";
  return "https://wa.me/" + BUSINESS.whatsapp + (text ? "?text=" + encodeURIComponent(text) : "");
}

function applyBusinessDetails() {
  const hrefs = {
    phone: BUSINESS.phone ? "tel:" + BUSINESS.phone : null,
    whatsapp: whatsappUrl(),
    email: BUSINESS.email ? "mailto:" + BUSINESS.email : null,
    maps: BUSINESS.mapsUrl || null
  };
  const texts = {
    phone: BUSINESS.phoneDisplay || BUSINESS.phone,
    whatsapp: BUSINESS.phoneDisplay || (BUSINESS.whatsapp ? "+" + BUSINESS.whatsapp : ""),
    email: BUSINESS.email
  };

  document.querySelectorAll("[data-biz-href]").forEach(function (el) {
    const type = el.dataset.bizHref;
    if (hrefs[type]) {
      el.href = hrefs[type];
      // Product cards: start the WhatsApp message with the product name
      if (type === "whatsapp" && el.dataset.waProduct) {
        const product = t(el.dataset.waProduct);
        el.href = whatsappUrl((t("wa_product_enquiry") || "") + " " + (product || ""));
      }
      if (type === "whatsapp" || type === "maps") {
        el.target = "_blank";
        el.rel = "noopener";
      }
    } else {
      // Not configured yet: send visitors to the contact details instead
      el.href = FALLBACK_HREF;
      el.removeAttribute("target");
    }
  });

  document.querySelectorAll("[data-biz-text]").forEach(function (el) {
    const value = texts[el.dataset.bizText];
    if (value) el.textContent = value;
  });
}

/* ---------- Phone menu ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      toggle.focus();
    }
  });
}

/* ---------- Photos: show the placeholder when a file is missing ---------- */
function initImages() {
  document.querySelectorAll(".media img").forEach(function (img) {
    function markMissing() { img.classList.add("is-missing"); }
    if (img.complete && img.naturalWidth === 0) markMissing();
    img.addEventListener("error", markMissing);
  });
}

/* ---------- Products: open a category from a link such as products.html#cat-ro ---------- */
function initProductFilter() {
  function fromHash() {
    const match = location.hash.match(/^#cat-([a-z]+)$/);
    const radio = match && document.getElementById("f-" + match[1]);
    if (radio) radio.checked = true;
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);
}

/* ---------- Forms ----------
   No data is stored or sent by this website. On submit:
   - If the form has an action URL (a form service the owner set up),
     the browser sends it there after the checks pass.
   - Otherwise, if a WhatsApp number is set, WhatsApp opens with the
     details typed in, so the customer can send them.
   - Otherwise a message asks the customer to call instead. */
function setFieldError(field, key) {
  const errorEl = document.getElementById(field.id + "-error");
  if (key) {
    field.setAttribute("aria-invalid", "true");
    if (errorEl) { errorEl.dataset.msgKey = key; errorEl.textContent = t(key) || MSG_FALLBACK[key] || ""; }
  } else {
    field.removeAttribute("aria-invalid");
    if (errorEl) { delete errorEl.dataset.msgKey; errorEl.textContent = ""; }
  }
}

function validateField(field) {
  const value = field.value.trim();
  if (field.required && !value) { setFieldError(field, "msg_required"); return false; }
  if (field.type === "tel" && value) {
    const digits = value.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) { setFieldError(field, "msg_phone"); return false; }
  }
  setFieldError(field, null);
  return true;
}

function setFormStatus(form, key, ok) {
  const status = form.querySelector(".form-status");
  if (!status) return;
  status.dataset.msgKey = key;
  status.classList.toggle("is-ok", !!ok);
  status.textContent = t(key) || MSG_FALLBACK[key] || "";
}

function refreshFormMessages() {
  document.querySelectorAll("[data-msg-key]").forEach(function (el) {
    const value = t(el.dataset.msgKey);
    if (value != null) el.textContent = value;
  });
}

function buildMessage(form) {
  const lines = [t(form.dataset.waTitle) || ""];
  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    if (!field.id || !field.value.trim()) return;
    const label = form.querySelector('label[for="' + field.id + '"] [data-i18n]');
    const value = field.tagName === "SELECT" ? field.options[field.selectedIndex].text : field.value.trim();
    lines.push((label ? label.textContent : field.name) + ": " + value);
  });
  return lines.join("\n");
}

function initForms() {
  document.querySelectorAll("form.js-enquiry").forEach(function (form) {
    form.setAttribute("novalidate", "");
    const fields = form.querySelectorAll("input, select, textarea");

    fields.forEach(function (field) {
      field.addEventListener("blur", function () {
        if (field.getAttribute("aria-invalid") === "true") validateField(field);
      });
    });

    form.addEventListener("submit", function (e) {
      let firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        e.preventDefault();
        setFormStatus(form, "msg_fix_errors", false);
        firstInvalid.focus();
        return;
      }

      // A form service URL is configured: let the browser submit normally
      if (form.getAttribute("action")) return;

      e.preventDefault();
      const url = whatsappUrl(buildMessage(form));
      if (url) {
        window.open(url, "_blank", "noopener");
        setFormStatus(form, "msg_whatsapp_opened", true);
      } else {
        setFormStatus(form, "msg_not_connected", false);
      }
    });
  });
}

/* ---------- Start ---------- */
document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", function () {
  initNav();
  initImages();
  initForms();
  initProductFilter();

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  document.querySelectorAll(".lang-switch button").forEach(function (btn) {
    btn.addEventListener("click", function () { setLanguage(btn.dataset.lang); });
  });

  currentLang = readStoredLang() === "kn" ? "kn" : "en";
  applyTranslations();
  loadTranslations().then(applyTranslations);
});
