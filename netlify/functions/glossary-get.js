import fs from 'fs/promises';
import path from 'path';

const GLOSSARY_PATH = path.join(process.cwd(), 'data', 'glossary-data.json');

export async function handler() {
  try {
    const content = await fs.readFile(GLOSSARY_PATH, 'utf-8');
    const glossary = JSON.parse(content);

    // Flatten nested object to array: [{ category, term, definition }, ...]
    const flat = [];
    for (const category in glossary) {
      for (const term in glossary[category]) {
        flat.push({
          category,
          term,
          definition: glossary[category][term]
        });
      }
    }

    // Sort alphabetically by category then term
    flat.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.term.localeCompare(b.term);
    });

    return {
      statusCode: 200,
      body: JSON.stringify(flat)
    };
  } catch (error) {
    console.error('Error loading glossary:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to load glossary.' })
    };
  }
}
