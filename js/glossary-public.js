document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('glossary-container');
  container.innerHTML = '<p>Loading glossary, please wait…</p>';

  fetch('/.netlify/functions/glossary-get')
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch glossary.');
      return res.json();
    })
    .then(data => {
      container.innerHTML = '';

      if (!data || Object.keys(data).length === 0) {
        container.innerHTML = '<p>No glossary terms found.</p>';
        return;
      }

      for (const [category, terms] of Object.entries(data)) {
        const section = document.createElement('section');
        section.style.marginBottom = '30px';

        const h2 = document.createElement('h2');
        h2.textContent = category;
        section.appendChild(h2);

        const dl = document.createElement('dl');

        for (const [term, definition] of Object.entries(terms)) {
          const dt = document.createElement('dt');
          dt.textContent = term;
          dt.style.cursor = 'pointer';
          dt.title = 'Click to add this ingredient to your shopping list';
          dt.addEventListener('click', () => {
            addToShoppingList(term);
            showToast(`Added "${term}" to your shopping list.`);
          });

          const dd = document.createElement('dd');
          dd.textContent = definition;

          dl.appendChild(dt);
          dl.appendChild(dd);
        }

        section.appendChild(dl);
        container.appendChild(section);
      }
    })
    .catch(err => {
      container.innerHTML = `
        <p>Error loading glossary: ${err.message}</p>
        <button id="retryBtn">Retry</button>
      `;
      document.getElementById('retryBtn').addEventListener('click', () => location.reload());
      console.error('Glossary load error:', err);
    });
});

function addToShoppingList(term) {
  console.log(`Added to shopping list: ${term}`);
  // Hook your real shopping list logic here
}

function showToast(message) {
  // Simple toast example
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.background = '#333';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '5px';
  toast.style.opacity = '0.9';
  toast.style.zIndex = '1000';

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}
