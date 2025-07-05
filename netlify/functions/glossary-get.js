import fs from 'fs/promises';
import path from 'path';

const GLOSSARY_PATH = path.resolve('data/glossary-data.json'); // Adjust this to your actual path

export async function handler() {
  try {
    const file = await fs.readFile(GLOSSARY_PATH, 'utf-8');
    const rawGlossary = JSON.parse(file);

    // Flatten the nested object into an array of { category, term, definition }
    const flat = [];

    for (const category in rawGlossary) {
      const terms = rawGlossary[category];
      for (const term in terms) {
        flat.push({
          category,
          term,
          definition: terms[term]
        });
      }
    }

    // Sort alphabetically by category, then by term
    flat.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.term.localeCompare(b.term);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(flat)
    };
  } catch (err) {
    console.error('Failed to load glossary:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load glossary.' })
    };
  }
}
