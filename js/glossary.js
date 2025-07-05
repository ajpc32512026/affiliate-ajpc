document.addEventListener('DOMContentLoaded', () => {
  console.log("Glossary.js: Ready for table-based rendering.");

  const glossaryTableBody = document.querySelector('#glossary-table tbody');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (!glossaryTableBody || !searchInput || !categoryFilter || !backToTopBtn) {
    console.error("Glossary.js: Missing required DOM elements.");
    return;
  }

  let glossaryData = [];

  // Definition popup
  const defBox = document.createElement('div');
  defBox.id = 'definition-box';
  Object.assign(defBox.style, {
    position: 'absolute',
    backgroundColor: '#fff',
    border: '1px solid #aaa',
    padding: '10px',
    boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
    maxWidth: '320px',
    display: 'none',
    zIndex: 10000,
    borderRadius: '6px',
    fontSize: '14px',
    lineHeight: '1.4',
  });
  document.body.appendChild(defBox);

  // Hide definition box on outside click or ESC key
  document.addEventListener('click', e => {
    if (!defBox.contains(e.target) && !e.target.classList.contains('glossary-term')) {
      defBox.style.display = 'none';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') defBox.style.display = 'none';
  });

  // Fetch and render
  async function fetchGlossary() {
    try {
      const res = await fetch('/.netlify/functions/glossary-get');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error("Invalid glossary format.");

      glossaryData = data.sort((a, b) => a.term.localeCompare(b.term));
      renderGlossary();
    } catch (err) {
      glossaryTableBody.innerHTML = `<tr><td colspan="2" style="color: red;"><strong>Error:</strong> ${err.message}</td></tr>`;
      console.error("Glossary fetch failed:", err);
    }
  }

  function renderGlossary() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = glossaryData.filter(({ term, definition, category }) => {
      const matchesSearch =
        term.toLowerCase().includes(query) ||
        definition.toLowerCase().includes(query);
      const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    glossaryTableBody.innerHTML = '';

    if (filtered.length === 0) {
      glossaryTableBody.innerHTML = `<tr><td colspan="2"><em>No matching terms found.</em></td></tr>`;
      return;
    }

    for (const { term, definition } of filtered) {
      const row = document.createElement('tr');

      const termCell = document.createElement('td');
      const termSpan = document.createElement('span');
      termSpan.textContent = term;
      termSpan.className = 'glossary-term';
      termSpan.tabIndex = 0;
      termSpan.setAttribute('role', 'button');
      termSpan.setAttribute('aria-haspopup', 'true');
      termSpan.style.cursor = 'pointer';
      termSpan.style.textDecoration = 'underline dotted';

      termSpan.addEventListener('click', () => showDefinition(termSpan, { term, definition }));
      termSpan.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDefinition(termSpan, { term, definition });
        }
      });

      termCell.appendChild(termSpan);

      const defCell = document.createElement('td');
      defCell.textContent = truncate(definition, 100); // Show preview only

      row.appendChild(termCell);
      row.appendChild(defCell);
      glossaryTableBody.appendChild(row);
    }
  }

  function showDefinition(target, { term, definition }) {
    const rect = target.getBoundingClientRect();
    defBox.innerHTML = `<strong>${escapeHtml(term)}</strong><br>${escapeHtml(definition)}`;

    const top = window.scrollY + rect.bottom + 6;
    let left = window.scrollX + rect.left;

    const maxLeft = window.scrollX + window.innerWidth - defBox.offsetWidth - 10;
    if (left > maxLeft) left = maxLeft;

    defBox.style.top = `${top}px`;
    defBox.style.left = `${left}px`;
    defBox.style.display = 'block';
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[m]));
  }

  function truncate(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
  }

  // Events
  searchInput.addEventListener('input', renderGlossary);
  categoryFilter.addEventListener('change', renderGlossary);
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Let it rip
  fetchGlossary();
});
