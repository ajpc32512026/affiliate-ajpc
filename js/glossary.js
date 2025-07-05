document.addEventListener('DOMContentLoaded', () => {
  console.log("Glossary.js: Loaded and ready to fetch live data.");

  const glossaryList = document.getElementById('glossary-list');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const checkAllToggle = document.getElementById('checkAllToggle');
  const backToTopBtn = document.getElementById('backToTopBtn');

  if (!glossaryList || !searchInput || !categoryFilter || !checkAllToggle || !backToTopBtn) {
    console.error('One or more required elements are missing from the DOM.');
    return;
  }

  let glossaryData = [];

  // Create floating definition box, hidden by default
  const defBox = document.createElement('div');
  defBox.id = 'definition-box';
  Object.assign(defBox.style, {
    position: 'absolute',
    backgroundColor: '#fff',
    border: '1px solid #aaa',
    padding: '10px',
    boxShadow: '2px 2px 8px rgba(0,0,0,0.2)',
    maxWidth: '300px',
    display: 'none',
    zIndex: 1000,
    borderRadius: '4px',
    fontSize: '14px',
  });
  document.body.appendChild(defBox);

  // Hide definition box when clicking outside or pressing Escape
  document.addEventListener('click', e => {
    if (!defBox.contains(e.target) && !e.target.classList.contains('glossary-term')) {
      defBox.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') defBox.style.display = 'none';
  });

  // Fetch glossary data, sort by term, then render
  async function fetchGlossary() {
    try {
      const res = await fetch('/.netlify/functions/glossary-get');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Glossary data malformed');

      glossaryData = data.sort((a, b) => a.term.localeCompare(b.term));
      renderGlossary(categoryFilter.value, searchInput.value);
    } catch (err) {
      glossaryList.innerHTML = `<li style="color:red;">Error loading glossary: ${err.message}</li>`;
      console.error('Glossary fetch error:', err);
    }
  }

  // Render glossary list, applying category and search filters
  function renderGlossary(category = 'all', search = '') {
    glossaryList.innerHTML = '';
    defBox.style.display = 'none';

    const searchTerm = search.trim().toLowerCase();

    const filtered = glossaryData.filter(({ term, definition, category: cat }) => {
      const categoryMatch = category === 'all' || cat === category;
      const searchMatch =
        term.toLowerCase().includes(searchTerm) ||
        definition.toLowerCase().includes(searchTerm);
      return categoryMatch && searchMatch;
    });

    if (!filtered.length) {
      glossaryList.innerHTML = `<li><em>No matching glossary terms found.</em></li>`;
      resetCheckAllToggle();
      return;
    }

    filtered.forEach(({ term, definition, category }) => {
      const li = document.createElement('li');
      li.className = 'glossary-item';

      // Checkbox for selection
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `chk-${term.replace(/\s+/g, '-')}`;
      checkbox.className = 'glossary-checkbox';

      // Label holding term and category
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.className = 'glossary-label';

      // Term span - clickable and keyboard accessible
      const termSpan = document.createElement('span');
      termSpan.className = 'glossary-term';
      termSpan.textContent = term;
      termSpan.tabIndex = 0;
      termSpan.setAttribute('role', 'button');
      termSpan.setAttribute('aria-haspopup', 'true');
      termSpan.style.cursor = 'pointer';
      termSpan.style.textDecoration = 'underline dotted';

      termSpan.addEventListener('click', e => showDefinition(e.target, { term, definition }));
      termSpan.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDefinition(e.target, { term, definition });
        }
      });

      label.appendChild(termSpan);

      // Category tag
      const catSpan = document.createElement('span');
      catSpan.className = 'glossary-category';
      catSpan.textContent = ` [${category}]`;
      Object.assign(catSpan.style, {
        marginLeft: '6px',
        fontStyle: 'italic',
        color: '#555',
      });
      label.appendChild(catSpan);

      li.appendChild(checkbox);
      li.appendChild(label);

      glossaryList.appendChild(li);
    });

    resetCheckAllToggle();
  }

  // Show floating definition box next to clicked term
  function showDefinition(target, { term, definition }) {
    const rect = target.getBoundingClientRect();
    defBox.innerHTML = `<strong>${term}</strong><br>${definition}`;
    defBox.style.top = `${window.scrollY + rect.bottom + 5}px`;
    defBox.style.left = `${window.scrollX + rect.left}px`;
    defBox.style.display = 'block';
  }

  // Check All toggle logic
  checkAllToggle.addEventListener('change', () => {
    document.querySelectorAll('.glossary-checkbox').forEach(chk => {
      chk.checked = checkAllToggle.checked;
    });
  });

  // Update Check All toggle state when individual checkboxes change
  glossaryList.addEventListener('change', e => {
    if (e.target.classList.contains('glossary-checkbox')) {
      updateCheckAllToggle();
    }
  });

  function updateCheckAllToggle() {
    const checkboxes = [...document.querySelectorAll('.glossary-checkbox')];
    if (!checkboxes.length) {
      resetCheckAllToggle();
      return;
    }

    const checkedCount = checkboxes.filter(chk => chk.checked).length;

    if (checkedCount === 0) {
      checkAllToggle.checked = false;
      checkAllToggle.indeterminate = false;
    } else if (checkedCount === checkboxes.length) {
      checkAllToggle.checked = true;
      checkAllToggle.indeterminate = false;
    } else {
      checkAllToggle.checked = false;
      checkAllToggle.indeterminate = true;
    }
  }

  function resetCheckAllToggle() {
    checkAllToggle.checked = false;
    checkAllToggle.indeterminate = false;
  }

  // React to search input and category filter changes
  searchInput.addEventListener('input', () => renderGlossary(categoryFilter.value, searchInput.value));
  categoryFilter.addEventListener('change', () => renderGlossary(categoryFilter.value, searchInput.value));

  // Smooth scroll to top on button click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Kickoff: fetch glossary data and render
  fetchGlossary();

  // Optional global print function stub
  window.printShoppingList = () => window.print();
});
