document.addEventListener('DOMContentLoaded', () => {
  const glossaryList = document.getElementById('glossary-list');
  glossaryList.innerHTML = '<li>Loading glossary, please wait…</li>';

  fetch('/.netlify/functions/glossary-get')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch glossary.');
      return res.json();
    })
    .then(data => {
      glossaryList.innerHTML = '';

      if (!data.length) {
        glossaryList.innerHTML = '<li>No glossary terms found.</li>';
        return;
      }

      // Group by category
      const grouped = data.reduce((acc, { category, term, definition }) => {
        if (!acc[category]) acc[category] = [];
        acc[category].push({ term, definition });
        return acc;
      }, {});

      for (const category of Object.keys(grouped)) {
        const section = document.createElement('section');
        section.style.marginBottom = '30px';

        const h2 = document.createElement('h2');
        h2.textContent = category;
        section.appendChild(h2);

        const dl = document.createElement('dl');
        grouped[category].forEach(({ term, definition }) => {
          const dt = document.createElement('dt');
          dt.textContent = term;
          dt.style.cursor = 'pointer';
          dt.title = 'Click to add this ingredient to your shopping list';
          dt.addEventListener('click', () => {
            addToShoppingList(term);
            alert(`Added "${term}" to your shopping list.`);
          });

          const dd = document.createElement('dd');
          dd.textContent = definition;

          dl.appendChild(dt);
          dl.appendChild(dd);
        });

        section.appendChild(dl);
        glossaryList.appendChild(section);
      }
    })
    .catch(err => {
      glossaryList.innerHTML = `
        <li>Error loading glossary: ${err.message}</li>
        <li><button id="retryBtn">Retry</button></li>
      `;
      document.getElementById('retryBtn').addEventListener('click', () => location.reload());
      console.error('Glossary load error:', err);
    });
});

function addToShoppingList(term) {
  console.log(`Added to shopping list: ${term}`);
  // Hook into your actual shopping list logic here
}
