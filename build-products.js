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

// Same as extractPrice(), but strips currency symbols/letters down to a
// plain number (e.g. "AU$17.95" -> "17.95"), since schema.org's Offer.price
// expects a bare numeric string, not a formatted display price.
function extractNumericPrice(description) {
    const price = extractPrice(description);
    const match = price.match(/[\d.]+/);
    return match ? match[0] : '';
}

// Strips the "Price: X |" prefix off, returning just the human-readable
// description text (mirrors extractPriceAndDesc()'s cleanDesc in the client JS).
function extractCleanDesc(description) {
    if (description && description.startsWith('Price:')) {
        const parts = description.split('|');
        if (parts.length > 1) {
            return parts.slice(1).join('|').trim();
        }
    }
    return description || '';
}

function buildCardHtml(product, index) {
    const title = escapeHtml(product.title);
    const price = extractPrice(product.description);
    const priceHtml = price ? `<span class="product-price">${escapeHtml(price)}</span>` : '';
    const newRibbonHtml = product.isNew ? '<div class="ribbon-new">New</div>' : '';

    return `
                    <div class="grid-card" onclick="openProductDetail(${index})" role="button" tabindex="0" aria-label="View details for ${title}">
                        ${newRibbonHtml}
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

// Builds a single schema.org ItemList of Products from the same data used to
// render the visible cards, so search engines can show price/image rich
// snippets for individual products without any extra content to maintain.
function buildProductJsonLd(products) {
    const itemListElement = products.map((product, index) => {
        const numericPrice = extractNumericPrice(product.description);
        const offer = {
            '@type': 'Offer',
            url: product.affiliateLink || undefined,
            priceCurrency: 'AUD',
            price: numericPrice || undefined,
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: product.source || 'Shein',
            },
        };

        return {
            '@type': 'ListItem',
            position: index + 1,
            item: {
                '@type': 'Product',
                name: product.title,
                image: product.imageUrl,
                description: extractCleanDesc(product.description),
                offers: offer,
            },
        };
    });

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement,
    };

    // Escape "<" so nothing inside product text (e.g. a stray "</script>")
    // can break out of the script tag.
    const safeJson = JSON.stringify(jsonLd).replace(/</g, '\\u003c');

    return `<script type="application/ld+json">${safeJson}</script>`;
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
        const rawProducts = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));
        // Mirror the same "newest first" ordering used by the client-side JS
        // in health-beauty.html, so crawlers/no-JS visitors see the exact
        // same product order as everyone else.
        const hasDates = Array.isArray(rawProducts) && rawProducts.every(p => p.dateAdded);
        products = Array.isArray(rawProducts)
            ? (hasDates
                ? [...rawProducts].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
                : [...rawProducts].reverse())
            : rawProducts;
    } catch (err) {
        console.error('[build-products] Failed to parse products.json - leaving health-beauty.html untouched:', err.message);
        return;
    }

    if (!Array.isArray(products) || products.length === 0) {
        console.warn('[build-products] products.json is empty or not an array, skipping SSR injection.');
        return;
    }

    const cardsHtml = products.map(buildCardHtml).join('');
    const productJsonLd = buildProductJsonLd(products);
    const injectedBlock = `${START_MARKER}\n${cardsHtml}\n                ${productJsonLd}\n                ${END_MARKER}`;

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
