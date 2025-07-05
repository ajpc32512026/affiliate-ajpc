document.addEventListener('DOMContentLoaded', () => {
  const glossaryList = document.getElementById('glossary-list');
  if (!glossaryList) {
    console.error('Glossary container #glossary-list not found.');
    return;
  }

  // Show loading message while fetching data
  glossaryList.innerHTML = '<li>Loading glossary, please wait…</li>';

  fetch('/.netlify/functions/glossary-get')
    .then(response => {
      if (!response.ok) throw new Error('Failed to fetch glossary.');
      return response.json();
    })
    .then(data => {
      glossaryList.innerHTML = ''; // Clear loading message

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

      // Build and append sections for each category
      Object.entries(grouped).forEach(([category, terms]) => {
        const section = document.createElement('section');
        section.style.marginBottom = '30px';

        const header = document.createElement('h2');
        header.textContent = category;
        section.appendChild(header);

        const dl = document.createElement('dl');
        terms.forEach(({ term, definition }) => {
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
      });
    })
    .catch(error => {
      glossaryList.innerHTML = `
        <li>Error loading glossary: ${error.message}</li>
        <li><button id="retryBtn">Retry</button></li>
      `;
      const retryBtn = document.getElementById('retryBtn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => location.reload());
      }
      console.error('Glossary load error:', error);
    });
});

// Stub for adding terms to the shopping list — link this to your real logic
function addToShoppingList(term) {
  console.log(`Added to shopping list: ${term}`);
  // TODO: Integrate with your shopping list management system
}
