document.addEventListener('DOMContentLoaded', () => {
  const glossaryList = document.getElementById('glossary-list');
  if (!glossaryList) {
    console.error('Glossary container #glossary-list not found.');
    return;
  }

  glossaryList.innerHTML = '<li>Loading glossary, please wait…</li>';

  fetch('/.netlify/functions/glossary-get')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch glossary.');
      return res.json();
    })
    .then(data => {
      glossaryList.innerHTML = '';

      if (!Array.isArray(data) || data.length === 0) {
        glossaryList.innerHTML = '<li>No glossary terms found.</li>';
        return;
      }

      // Group glossary entries by category
      const grouped = data.reduce((acc, { category, term, definition }) => {
        if (!acc[category]) acc[category] = [];
        acc[category].push({ term, definition });
        return acc;
      }, {});

      Object.entries(grouped).forEach(([category, terms]) => {
        // Add category header
        const categoryHeader = document.createElement('h2');
        categoryHeader.textContent = category;
        glossaryList.appendChild(categoryHeader);

        // Create nested ul for category terms
        const ul = document.createElement('ul');

        terms.forEach(({ term, definition }) => {
          const li = document.createElement('li');

          const termSpan = document.createElement('span');
          termSpan.textContent = term;
          termSpan.style.cursor = 'pointer';
          termSpan.title = 'Click to add this ingredient to your shopping list';
          termSpan.addEventListener('click', () => {
            addToShoppingList(term);
            alert(`Added "${term}" to your shopping list.`);
          });

          const defSpan = document.createElement('span');
          defSpan.textContent = ` — ${definition}`;

          li.appendChild(termSpan);
          li.appendChild(defSpan);
          ul.appendChild(li);
        });

        glossaryList.appendChild(ul);
      });
    })
    .catch(error => {
      glossaryList.innerHTML = `
        <li>Error loading glossary: ${error.message}</li>
        <li><button id="retryBtn">Retry</button></li>
      `;
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) retryBtn.addEventListener('click', () => location.reload());
      console.error('Glossary load error:', error);
    });
});

function addToShoppingList(term) {
  console.log(`Added to shopping list: ${term}`);
  // TODO: connect this to your real shopping list system
}
