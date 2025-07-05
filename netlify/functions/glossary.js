import fs from 'fs/promises';
import path from 'path';

const GLOSSARY_PATH = path.join(process.cwd(), 'data', 'glossary-data.json');
const SECRET = process.env.ADMIN_SECRET;

const send = (code, data) => ({
  statusCode: code,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

export default async function handler(event) {
  const token = event.headers['x-admin-token'];
  if (token !== SECRET) return send(401, { error: 'Unauthorized' });

  try {
    const fileContent = await fs.readFile(GLOSSARY_PATH, 'utf-8');
    const glossary = JSON.parse(fileContent);

    switch (event.httpMethod) {
      case 'GET':
        return send(200, glossary);

      case 'POST': {
        const { category, term, definition } = JSON.parse(event.body || '{}');
        if (!category || !term || !definition)
          return send(400, { error: 'Missing fields' });

        // Make sure category exists, or create it
        if (!glossary[category]) glossary[category] = {};

        // Add or update term
        glossary[category][term] = definition;

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        return send(201, { success: true });
      }

      case 'PUT': {
        const { category, term, definition } = JSON.parse(event.body || '{}');
        if (!category || !term || !definition)
          return send(400, { error: 'Missing fields' });

        if (!glossary[category] || !glossary[category][term])
          return send(404, { error: 'Term not found' });

        glossary[category][term] = definition;

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        return send(200, { success: true });
      }

      case 'DELETE': {
        const { category, term } = JSON.parse(event.body || '{}');
        if (!category || !term) return send(400, { error: 'Missing fields' });

        if (!glossary[category] || !glossary[category][term])
          return send(404, { error: 'Term not found' });

        delete glossary[category][term];

        // Clean empty category if needed
        if (Object.keys(glossary[category]).length === 0) {
          delete glossary[category];
        }

        await fs.writeFile(GLOSSARY_PATH, JSON.stringify(glossary, null, 2));
        return send(204, {});
      }

      default:
        return send(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    return send(500, { error: 'Internal Server Error', details: error.message });
  }
}
