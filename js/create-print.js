// create-print.js
//
// Called by prints-manager.html to fully automate adding a new ShutterPrints
// item: creates a real Stripe Product, a tax-inclusive Price for it, and a
// Payment Link - then hands the resulting checkout URL back to the browser
// so it can be saved straight into prints.json. Replaces the old manual
// "go set this up in the Stripe dashboard yourself" step.
//
// Requires STRIPE_SECRET_KEY to be set as a Netlify environment variable.
// Only ever runs server-side - the secret key is never exposed to the browser.

const Stripe = require('stripe');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        console.error('[create-print.js] Missing STRIPE_SECRET_KEY environment variable.');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server is not configured correctly (missing Stripe key). Add STRIPE_SECRET_KEY in your Netlify environment variables.' }),
        };
    }

    try {
        const data = JSON.parse(event.body);

        const title = data.title?.trim();
        const description = data.description?.trim();
        const rawPrice = parseFloat(data.price);
        const imageUrl = data.imageUrl?.trim(); // Optional - must be a real public https:// URL if provided

        if (!title || !description || !rawPrice || rawPrice <= 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Title, description, and a price greater than 0 are all required.' }),
            };
        }

        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // 1. Create the Product
        const product = await stripe.products.create({
            name: title,
            description: description,
            // Stripe requires a real reachable https:// URL here - skip entirely
            // if one wasn't supplied (e.g. the image hasn't been deployed yet).
            images: (imageUrl && imageUrl.startsWith('https://')) ? [imageUrl] : undefined,
        });

        // 2. Create a tax-inclusive Price for it (matches "Include tax in price: Yes"
        // in the dashboard, so this doesn't need to be set by hand every time)
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(rawPrice * 100),
            currency: 'aud',
            tax_behavior: 'inclusive',
        });

        // 3. Create a Payment Link for that price - this is the actual checkout
        // URL that goes into prints.json as the affiliateLink
        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                affiliateLink: paymentLink.url,
                productId: product.id,
                priceId: price.id,
            }),
        };
    } catch (error) {
        console.error('[create-print.js] Fatal error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message || 'Server error creating the Stripe product. Please try again.' }),
        };
    }
};
