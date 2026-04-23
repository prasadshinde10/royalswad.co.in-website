/* ============================================================
   ROYALSWAD — products.js
   Loads products from data/products.json and renders them
   using the active language stored in localStorage.
   Translations come from translations.js (loaded first).
   ============================================================ */

const productsGrid  = document.getElementById('productsGrid');
const FALLBACK_IMAGE = 'images/product-placeholder.svg';
const DEFAULT_LANG   = 'en';

if (!productsGrid) {
  console.error('Products grid container not found.');
}

/* ---- helpers ---- */
function getLang() {
  return localStorage.getItem('lang') || DEFAULT_LANG;
}

/** Convert a product's English name to its translation key slug.
 *  e.g. "Chicken masala" → "chicken_masala"
 */
function nameToSlug(name) {
  return name.toLowerCase().trim().replace(/[\s-]+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/** Look up a translation key for the current language, fall back to English. */
function t(key) {
  const lang = getLang();
  const map  = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) || {};
  const fb   = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[DEFAULT_LANG]) || {};
  return map[key] !== undefined ? map[key] : (fb[key] !== undefined ? fb[key] : key);
}

/** Apply page-level translations (title, header text, back link, lang buttons). */
function applyPageTranslations() {
  const lang = getLang();

  // <title>
  document.title = t('products.pageTitle');

  // <html lang>
  document.documentElement.lang = lang;

  // elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });

  // active lang button state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

/* ---- grid rendering ---- */
function clearGrid() {
  productsGrid.textContent = '';
}

function showMessage(msg) {
  clearGrid();
  const p = document.createElement('p');
  p.className = 'message';
  p.textContent = msg;
  productsGrid.append(p);
}

function getSafeImagePath(imagePath) {
  return typeof imagePath === 'string' && imagePath.startsWith('images/')
    ? imagePath
    : FALLBACK_IMAGE;
}

function renderProducts(products) {
  clearGrid();

  products.forEach(product => {
    const slug    = nameToSlug(product.name || '');
    const nameKey = `p.${slug}.name`;
    const descKey = `p.${slug}.desc`;

    /* Use translation if available; fall back to the raw JSON value */
    const displayName = t(nameKey) !== nameKey ? t(nameKey)
                      : (product.name  || 'Product');
    const displayDesc = t(descKey) !== descKey ? t(descKey)
                      : (product.description || 'Description coming soon.');

    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.src     = getSafeImagePath(product.image);
    image.alt     = displayName;
    image.loading = 'lazy';
    image.onerror = () => { image.onerror = null; image.src = FALLBACK_IMAGE; };

    const body  = document.createElement('div');
    body.className = 'product-body';

    const title = document.createElement('h2');
    title.textContent = displayName;

    const desc = document.createElement('p');
    desc.textContent = displayDesc;

    body.append(title, desc);
    card.append(image, body);
    productsGrid.append(card);
  });
}

/* ---- data loading ---- */
let _cachedProducts = null;

async function loadProducts() {
  if (_cachedProducts) { renderProducts(_cachedProducts); return; }
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const products = await response.json();
    if (!Array.isArray(products) || products.length === 0) {
      showMessage('No products available right now.');
      return;
    }
    _cachedProducts = products;
    renderProducts(products);
  } catch (err) {
    showMessage('Unable to load products at the moment.');
    console.error(err);
  }
}

/* ---- language switcher ---- */
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    localStorage.setItem('lang', btn.dataset.lang);
    applyPageTranslations();
    /* Re-render product cards with new language */
    if (_cachedProducts) renderProducts(_cachedProducts);
  });
});

/* ---- init ---- */
applyPageTranslations();
if (productsGrid) loadProducts();

document.addEventListener('contextmenu', e => e.preventDefault(), false);
