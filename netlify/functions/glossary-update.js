const fs = require('fs').promises;
const path = require('path');

const AUTH_USER = process.env.GLOSSARY_USER || 'admin';
const AUTH_PASS = process.env.GLOSSARY_PASS || 'adminpass';

// Decode Basic Auth header, returning { user, pass } or null
function decodeBasicAuth(authHeader) {
  if (!authHeader || !authHeader.startsWith('Basic ')) return null;
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [user, pass] = credentials.split(':');
  return { user, pass };
}

exports.handler = async function(event) {
  // Only allow POST — updating the glossary is a serious business
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed. Use POST to update glossary.'
    };
  }

  // Check Authorization header against expected user/pass
  const auth = decodeBasicAuth(event.headers.authorization);
  if (!auth || auth.user !== AUTH_USER || auth.pass !== AUTH_PASS) {
    return {
      statusCode: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Glossary"' },
      body: 'Unauthorized: Invalid credentials.'
    };
  }

  try {
    // Parse incoming JSON body for term and definition
    const newTerm = JSON.parse(event.body);

    // Validate inputs: must be non-empty strings
    if (
      !newTerm.term || typeof newTerm.term !== 'string' || !newTerm.term.trim() ||
      !newTerm.definition || typeof newTerm.definition !== 'string' || !newTerm.definition.trim()
    ) {
      return {
        statusCode: 400,
        body: 'Bad Request: Both "term" and "definition" fields are required and must be non-empty strings.'
      };
    }

    // Basic sanitization: strip any HTML tags (minimal protection)
    const sanitize = str => str.replace(/<\/?[^>]+(>|$)/g, "").trim();

    const term = sanitize(newTerm.term);
    const definition = sanitize(newTerm.definition);

    // Resolve path to glossary JSON file relative to current file
    const filePath = path.resolve(__dirname, 'glossary-data.json');

    // Read existing glossary data, parse JSON array
    const data = await fs.readFile(filePath, 'utf-8');
    const glossary = JSON.parse(data);

    // Check if term exists (case-insensitive)
    const index = glossary.findIndex(item => item.term.toLowerCase() === term.toLowerCase());

    if (index > -1) {
      // Update definition for existing term
      glossary[index].definition = definition;
    } else {
      // Add new term to glossary
      glossary.push({ term, definition });
    }

    // Write updated glossary back to file, formatted nicely
    await fs.writeFile(filePath, JSON.stringify(glossary, null, 2), 'utf-8');

    // Success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Glossary updated: "${term}" saved successfully.` }),
    };

  } catch (err) {
    // Log errors server-side for diagnosis
    console.error('❌ Glossary update error:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: Failed to update glossary.' }),
    };
  }
};
