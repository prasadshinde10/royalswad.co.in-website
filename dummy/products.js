const productsGrid = document.getElementById('productsGrid');
const FALLBACK_IMAGE = 'images/product-placeholder.svg';

if (!productsGrid) {
  console.error('Products grid container not found.');
}

function clearGrid() {
  productsGrid.textContent = '';
}

function showMessage(message) {
  clearGrid();
  const text = document.createElement('p');
  text.className = 'message';
  text.textContent = message;
  productsGrid.append(text);
}

function getSafeImagePath(imagePath) {
  if (typeof imagePath === 'string' && imagePath.startsWith('images/')) {
    return imagePath;
  }
  return FALLBACK_IMAGE;
}

function getSafeName(name) {
  return typeof name === 'string' && name.trim() ? name.trim() : 'Product';
}

function getSafeDescription(description) {
  if (typeof description === 'string' && description.trim()) {
    return description.trim();
  }
  return 'Description coming soon.';
}

function renderProducts(products) {
  clearGrid();

  products.forEach((product) => {
    const safeName = getSafeName(product.name);

    const card = document.createElement('article');
    card.className = 'product-card';

    const image = document.createElement('img');
    image.src = getSafeImagePath(product.image);
    image.alt = `Image of ${safeName}`;
    image.loading = 'lazy';
    image.onerror = () => {
      image.onerror = null;
      image.src = FALLBACK_IMAGE;
    };

    const body = document.createElement('div');
    body.className = 'product-body';

    const title = document.createElement('h2');
    title.textContent = safeName;

    const description = document.createElement('p');
    description.textContent = getSafeDescription(product.description);

    body.append(title, description);
    card.append(image, body);
    productsGrid.append(card);
  });
}

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products (HTTP ${response.status}).`);
    }

    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      showMessage('No products available right now.');
      return;
    }

    renderProducts(products);
  } catch (error) {
    showMessage('Unable to load products at the moment.');
    console.error(error);
  }
}

if (productsGrid) {
  loadProducts();
}
