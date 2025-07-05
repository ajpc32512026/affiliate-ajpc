(() => {
  const products = [
    "VC Toner",
    "VC Serum",
    "Hyaluronic Acid",
    "Retinol Cream",
    "Sunscreen SPF 50",
    "Aloe Vera Soap",
    "Barbie Whitening Soap",
    "Charcoal Niacinamide Soap",
    "Cocoberry Soap",
    "Guava Acne Soap",
    "Kili Power Whitening Soap",
    "Kojic Bleaching Soap",
    "Scar Remover Soap",
    "Sunflower Collagen Soap"
  ];

  const selectedProducts = {};
  const input = document.getElementById("productsInput");
  const suggestions = document.getElementById("productsSuggestions");
  const selectedContainer = document.getElementById("selectedProducts");

  // Styles for suggestions (move to CSS later)
  const style = document.createElement("style");
  style.textContent = `
    .product-suggestions {
      position: absolute;
      background: white;
      border: 1px solid #ccc;
      max-height: 150px;
      overflow-y: auto;
      z-index: 1000;
      width: 100%;
    }
    .product-suggestions div {
      padding: 8px;
      cursor: pointer;
    }
    .product-suggestions div:hover {
      background-color: #f0f0f0;
    }
    #selectedProducts div {
      margin-bottom: 6px;
    }
    #selectedProducts button {
      margin: 0 5px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Render cart items
  function renderSelectedProducts() {
    if (!selectedContainer) return;
    selectedContainer.innerHTML = '';

    Object.entries(selectedProducts).forEach(([product, quantity]) => {
      const item = document.createElement("div");

      // Sanitize for safety in attributes
      const safeProduct = product.replace(/'/g, "\\'").replace(/"/g, "&quot;");

      item.innerHTML = `
        <strong>${product}</strong>
        <button class="adjust-btn" data-product="${safeProduct}" data-change="-1">−</button>
        <span>${quantity}</span>
        <button class="adjust-btn" data-product="${safeProduct}" data-change="1">+</button>
      `;

      selectedContainer.appendChild(item);
    });
  }

  // Adjust quantity function
  function adjustQuantity(product, change) {
    if (!(product in selectedProducts)) selectedProducts[product] = 0;
    selectedProducts[product] += change;
    if (selectedProducts[product] <= 0) delete selectedProducts[product];
    renderSelectedProducts();
  }
  window.adjustQuantity = adjustQuantity; // expose globally if needed

  // Event delegation for + and − buttons
  selectedContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("adjust-btn")) {
      const product = e.target.dataset.product;
      const change = Number(e.target.dataset.change);
      adjustQuantity(product, change);
    }
  });

  // Input event for suggestions
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    suggestions.innerHTML = "";

    if (!query) return;

    const matches = products.filter((product) =>
      product.toLowerCase().includes(query)
    );

    matches.forEach((match) => {
      const div = document.createElement("div");
      div.textContent = match;
      div.addEventListener("click", () => {
        // Add or increment product in cart
        if (selectedProducts[match]) {
          selectedProducts[match]++;
        } else {
          selectedProducts[match] = 1;
        }
        renderSelectedProducts();

        // Clear input and suggestions
        input.value = "";
        suggestions.innerHTML = "";
        input.focus();
      });
      suggestions.appendChild(div);
    });
  });

  // Hide suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) {
      suggestions.innerHTML = "";
    }
  });

  // Enter key adds product typed (if exact match or just add typed)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const product = input.value.trim();
      if (!product) return;

      // Add or increment product in cart
      if (selectedProducts[product]) {
        selectedProducts[product]++;
      } else {
        selectedProducts[product] = 1;
      }
      renderSelectedProducts();
      input.value = "";
      suggestions.innerHTML = "";
    }
  });

  // Optional: preload from URL param
  const urlParams = new URLSearchParams(window.location.search);
  const initialProduct = urlParams.get("product");
  if (initialProduct && products.includes(initialProduct)) {
    selectedProducts[initialProduct] = 1;
    renderSelectedProducts();
  }
})();
