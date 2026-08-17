// featured-product.js

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'featuredProductId';

    const link = document.getElementById('featured-product-link');
    const img = document.getElementById('featured-product-img');
    const titleEl = document.getElementById('featured-product-title');
    const ribbon = document.getElementById('featured-product-ribbon');

    if (!link || !img) return; // Not on this page

    function cleanDescription(description) {
        if (description && description.startsWith('Price:')) {
            const parts = description.split('|');
            if (parts.length > 1) {
                return parts.slice(1).join('|').trim();
            }
        }
        return description || '';
    }

    // Helper to resolve images to Point B destination flat folder structural layout
    function sanitizeImageUrl(url) {
        if (!url) return '';
        const filename = url.split('/').pop();
        return `media/posts/${filename}`;
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

            img.src = sanitizeImageUrl(product.imageUrl);
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