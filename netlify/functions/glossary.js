import fs from 'fs/promises';
import path from 'path';

const GLOSSARY_PATH = path.join(process.cwd(), 'data', 'glossary-data.json');
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';

const jsonResponse = (statusCode, data = {}) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export default async function handler(event) {
  try {
    const token = event.headers['x-admin-token'];
    if (token !== ADMIN_SECRET) {
      return jsonResponse(401, { error: 'Unauthorized' });
    }

    // Load glossary from file
    const fileRaw = await fs.readFile(GLOSSARY_PATH, 'utf-8');
    const glossary = JSON.parse(fileRaw);

    switch (event.httpMethod) {
      case 'GET':
        // Return full glossary data
        return jsonResponse(200, glossary);

      case 'POST': {
        // Add new term or category
        const { category, term, definition } = JSON.parse(event.body || '{}');
        if (!category || !term || !definition) {
          return jsonResponse(400, { error: 'Missing required fields: category, term, definition' });
        }

        if (!glossary[category]) {
          glossary[category] = {};
        }

        glossary[category][term] = definition;

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        return jsonResponse(201, { success: true, message: `"${term}" added to "${category}"` });
      }

      case 'PUT': {
        // Update existing term
        const { category, term, definition } = JSON.parse(event.body || '{}');
        if (!category || !term || !definition) {
          return jsonResponse(400, { error: 'Missing required fields: category, term, definition' });
        }

        if (!glossary[category] || !(term in glossary[category])) {
          return jsonResponse(404, { error: `Term "${term}" in category "${category}" not found` });
        }

        glossary[category][term] = definition;

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        return jsonResponse(200, { success: true, message: `"${term}" updated in "${category}"` });
      }

      case 'DELETE': {
        // Remove a term, clean up empty category
        const { category, term } = JSON.parse(event.body || '{}');
        if (!category || !term) {
          return jsonResponse(400, { error: 'Missing required fields: category, term' });
        }

        if (!glossary[category] || !(term in glossary[category])) {
          return jsonResponse(404, { error: `Term "${term}" in category "${category}" not found` });
        }

        delete glossary[category][term];

        if (Object.keys(glossary[category]).length === 0) {
          delete glossary[category];
        }

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        // 204 No Content means success but no body, so send empty string for safety
        return { statusCode: 204, headers: {}, body: '' };
      }

      default:
        return jsonResponse(405, { error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Glossary API error:', err);
    return jsonResponse(500, { error: 'Internal Server Error', details: err.message });
  }
}
