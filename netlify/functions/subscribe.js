exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Honeypot trap (consistent with send-contact.js)
    if (data['bot-field']) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Submission received (bot ignored).' }),
      };
    }

    const name = data.name?.trim();
    const email = data.email?.trim();

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required.' }),
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Please enter a valid email address.' }),
      };
    }

    const BREVO_LIST_ID = 7; // "Newsletter" list in Brevo

    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        attributes: name ? { FIRSTNAME: name } : undefined,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true, // If they already exist, update them instead of erroring - keeps re-signups painless
      }),
    });

    // Brevo returns 201 (created) or 204 (updated existing contact) on success
    if (brevoResponse.ok || brevoResponse.status === 204) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Successfully subscribed.' }),
      };
    }

    const errorBody = await brevoResponse.json().catch(() => ({}));
    console.error('[subscribe.js] Brevo API error:', brevoResponse.status, errorBody);
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Could not subscribe right now. Please try again later.' }),
    };

  } catch (error) {
    console.error('[subscribe.js] Fatal error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error. Please try again later.' }),
    };
  }
};
