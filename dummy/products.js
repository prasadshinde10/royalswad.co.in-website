const productsGrid = document.getElementById('productsGrid');

function renderProducts(products) {
  productsGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product-body">
        <h2>${product.name}</h2>
        <p>${product.description}</p>
      </div>
    </article>
  `).join('');
}

async function loadProducts() {
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) {
      throw new Error('Failed to load products.');
    }

    const products = await response.json();

    if (!Array.isArray(products) || products.length === 0) {
      productsGrid.innerHTML = '<p class="message">No products available right now.</p>';
      return;
    }

    renderProducts(products);
  } catch (error) {
    productsGrid.innerHTML = '<p class="message">Unable to load products at the moment.</p>';
    console.error(error);
  }
}

loadProducts();
