/* ============================================================
   ROYALSWAD — DEEPA Enterprises | app.js
   ============================================================
   CUSTOMISATION GUIDE:
   - Change WhatsApp number: search "wa.me" and replace the number
   - Change business hours / enquiry message: search "sendEnquiry"
   - Disable custom cursor: comment out the CURSOR section
   ============================================================ */

/* ===== CUSTOM CURSOR (desktop only) ===== */
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  // Smooth lag for the ring
  rx += (mx - rx) * 0.15;
  ry += (my - ry) * 0.15;
  if (cursor)     { cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }
  if (cursorRing) { cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px'; }
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Enlarge cursor on interactive elements
document.querySelectorAll('a, button, .category-card, .product-card, .why-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor?.classList.add('hover');
    cursorRing?.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor?.classList.remove('hover');
    cursorRing?.classList.remove('hover');
  });
});


/* ===== NAVBAR — turns dark on scroll ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});


/* ===== MOBILE HAMBURGER MENU ===== */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

// Close menu when any link is clicked
document.querySelectorAll('.mob-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});


/* ===== SCROLL REVEAL ANIMATIONS ===== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Small delay so multiple elements in view don't all pop at once
      setTimeout(() => entry.target.classList.add('visible'), 100);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Stagger children inside grids
document.querySelectorAll('.products-grid, .categories-grid, .why-grid').forEach(grid => {
  grid.querySelectorAll('.reveal').forEach((child, i) => {
    child.style.transitionDelay = (i * 0.1) + 's';
  });
});


/* ===== WHATSAPP ENQUIRY FORM ===== */
// ↓ Change this phone number to your WhatsApp business number
const WHATSAPP_NUMBER = '917262038383';
const CATEGORY_LABELS = {
  'indian-spices': 'Indian Spices',
  'ready-to-eat-cook': 'Ready to Eat & Cook',
  'dehydrated-products': 'Dehydrated Products'
};

let _productsDataPromise = null;

function getProductsData() {
  if (_productsDataPromise) return _productsDataPromise;
  _productsDataPromise = fetch('data/products.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(products => Array.isArray(products) ? products : []);
  return _productsDataPromise;
}

function buildCategoryUrl(category) {
  return `products.html?category=${encodeURIComponent(category)}`;
}

function openCategoryEnquiry(category) {
  const label = CATEGORY_LABELS[category] || category;
  const message = encodeURIComponent(
    `Hello Royalswad!\n\nI am interested in your ${label} range.\nPlease share product details and pricing.`
  );
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
}

async function onCategoryCardClick(event) {
  event.preventDefault();
  const category = event.currentTarget.dataset.category;
  if (!category) return;

  try {
    const products = await getProductsData();
    const hasProducts = products.some(product => product?.category === category);
    if (hasProducts) {
      window.location.href = buildCategoryUrl(category);
      return;
    }
    openCategoryEnquiry(category);
  } catch (error) {
    console.error(error);
    window.location.href = buildCategoryUrl(category);
  }
}

function bindCategoryNavigation() {
  document.querySelectorAll('.category-card[data-category]').forEach(card => {
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.addEventListener('click', onCategoryCardClick);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
  });
}

bindCategoryNavigation();

document.getElementById('sendEnquiry')?.addEventListener('click', () => {
  const name    = document.getElementById('eq-name').value.trim();
  const phone   = document.getElementById('eq-phone').value.trim();
  const product = document.getElementById('eq-product').value.trim();

  if (!name || !phone) {
    alert('Please enter your name and phone number.');
    return;
  }

  // ↓ Customise this message template as needed
  const message = encodeURIComponent(
    `Hello Royalswad!\n\nName: ${name}\nPhone: ${phone}\nProduct Enquiry: ${product || 'General Enquiry'}\n\nPlease share more details about your products.`
  );

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
});


/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});


/* ===== LANGUAGE SWITCHER (i18n) ===== */
// Reads TRANSLATIONS from translations.js (loaded before this script).
// Saves the chosen language in localStorage and re-renders all
// data-i18n / data-i18n-html / data-i18n-placeholder elements.
(function () {
  const DEFAULT_LANG = 'en';

  function applyTranslations() {
    const lang = localStorage.getItem('lang') || DEFAULT_LANG;
    const map  = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    const fb   = TRANSLATIONS[DEFAULT_LANG];

    // Update <html lang> and <title>
    document.documentElement.lang = lang;
    if (map.pageTitle) document.title = map.pageTitle;

    // textContent updates (plain text, no HTML markup)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = key in map ? map[key] : (key in fb ? fb[key] : key);
    });

    // innerHTML updates (for elements that contain <em>, <br>, etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.dataset.i18nHtml;
      el.innerHTML = key in map ? map[key] : (key in fb ? fb[key] : key);
    });

    // placeholder attribute updates
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = key in map ? map[key] : (key in fb ? fb[key] : key);
    });

    // Mark the active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // Attach click handlers to every language button (desktop + mobile)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      localStorage.setItem('lang', btn.dataset.lang);
      applyTranslations();
    });
  });

  // Apply on initial load
  applyTranslations();
}());

document.addEventListener("contextmenu",function(e){
  e.preventDefault()
},false)
