// build-products.js
//
// Runs automatically on every Netlify deploy (see netlify.toml's [build] command).
// Reads json/products.json and injects real, crawlable <div class="grid-card">
// markup directly into health-beauty.html, between the SSR_PRODUCTS_START/END
// markers - replacing the empty container search engines would otherwise see
// before any JavaScript runs.
//
// This does NOT replace the existing client-side JS (renderGrid, category
// filtering, etc). Real browsers still run that exactly as before - it just
// re-renders on top of this pre-rendered content on page load, which is
// harmless since the output is identical. This only changes what a crawler
// (or anyone with JS disabled/slow) sees in the raw HTML response.

const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, 'json', 'products.json');
const HTML_PATH = path.join(__dirname, 'health-beauty.html');
const START_MARKER = '<!-- SSR_PRODUCTS_START -->';
const END_MARKER = '<!-- SSR_PRODUCTS_END -->';

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Mirrors the same logic as extractPriceAndDesc() in health-beauty.html's
// client-side script, so the pre-rendered price matches exactly what the
// client JS would show.
function extractPrice(description) {
    if (description && description.startsWith('Price:')) {
        const parts = description.split('|');
        if (parts.length > 1) {
            return parts[0].replace('Price:', '').trim();
        }
    }
    return '';
}

function buildCardHtml(product, index) {
    const title = escapeHtml(product.title);
    const price = extractPrice(product.description);
    const priceHtml = price ? `<span class="product-price">${escapeHtml(price)}</span>` : '';

    return `
                    <div class="grid-card" onclick="openProductDetail(${index})" role="button" tabindex="0" aria-label="View details for ${title}">
                        <div class="card-inner">
                            <div class="card-image-box">
                                <img src="${escapeHtml(product.imageUrl)}" alt="${title}" loading="lazy">
                            </div>
                            <h4 class="card-title">${title}</h4>
                            ${priceHtml}
                        </div>
                    </div>
                `;
}

function run() {
    if (!fs.existsSync(PRODUCTS_PATH)) {
        console.warn('[build-products] products.json not found, skipping SSR injection.');
        return;
    }

    if (!fs.existsSync(HTML_PATH)) {
        console.warn('[build-products] health-beauty.html not found, skipping SSR injection.');
        return;
    }

    let products;
    try {
        products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
    } catch (err) {
        console.error('[build-products] Failed to parse products.json - leaving health-beauty.html untouched:', err.message);
        return;
    }

    if (!Array.isArray(products) || products.length === 0) {
        console.warn('[build-products] products.json is empty or not an array, skipping SSR injection.');
        return;
    }

    const cardsHtml = products.map(buildCardHtml).join('');
    const injectedBlock = `${START_MARKER}\n${cardsHtml}\n                ${END_MARKER}`;

    let html = fs.readFileSync(HTML_PATH, 'utf-8');

    const startIdx = html.indexOf(START_MARKER);
    const endIdx = html.indexOf(END_MARKER);

    if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
        console.error('[build-products] SSR markers not found in health-beauty.html - leaving it untouched.');
        return;
    }

    const before = html.slice(0, startIdx);
    const after = html.slice(endIdx + END_MARKER.length);

    html = before + injectedBlock + after;

    fs.writeFileSync(HTML_PATH, html, 'utf-8');
    console.log(`[build-products] Pre-rendered ${products.length} product cards into health-beauty.html.`);
}

run();
