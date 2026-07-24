// featured-product.js
//
// Powers the rotating "featured product" spotlight on about.html's hero image.
// Picks one random product from json/products.json to showcase.
//
// The same pick persists across page views within one browser session (via
// sessionStorage) - so clicking around the site doesn't reroll it every time
// you land back on About - but opening the site again in a new tab/window
// (or after the browser was fully closed) gets a fresh random pick.
//
// If products.json can't be loaded for any reason, the original hardcoded
// jacket photo already in the HTML is left untouched as a fallback.

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'featuredProductId';

    const link = document.getElementById('featured-product-link');
    const img = document.getElementById('featured-product-img');
    const titleEl = document.getElementById('featured-product-title');
    const ribbon = document.getElementById('featured-product-ribbon');

    if (!link || !img) return; // Not on this page

    // Mirrors extractPriceAndDesc() in health-beauty.html: strips the
    // leading "Price: X |" segment off, leaving just the description text.
    function cleanDescription(description) {
        if (description && description.startsWith('Price:')) {
            const parts = description.split('|');
            if (parts.length > 1) {
                return parts.slice(1).join('|').trim();
            }
        }
        return description || '';
    }

    fetch('json/products.json')
        .then(response => response.json())
        .then(products => {
            if (!Array.isArray(products) || products.length === 0) return;

            let product = null;
            const storedId = sessionStorage.getItem(STORAGE_KEY);

            if (storedId) {
                product = products.find(p => p.id === storedId) || null;
            }

            if (!product) {
                product = products[Math.floor(Math.random() * products.length)];
                if (product.id) {
                    sessionStorage.setItem(STORAGE_KEY, product.id);
                }
            }

            const title = product.title || '';

            img.src = product.imageUrl;
            img.alt = title;
            link.href = product.affiliateLink || '#';
            link.setAttribute('aria-label', `Shop this look: ${title}`);

            if (titleEl) {
                titleEl.textContent = title;
            }

            if (ribbon) {
                ribbon.style.display = product.isNew ? 'block' : 'none';
            }
        })
        .catch(err => {
            console.warn('[featured-product] Could not load products.json, keeping fallback image.', err);
        });
});
