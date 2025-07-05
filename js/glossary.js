document.addEventListener('DOMContentLoaded', () => {
  console.log("Glossary.js: Ready to fetch and display glossary data.");

  const glossaryList = document.getElementById('glossary-list');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const checkAllToggle = document.getElementById('checkAllToggle');
  const backToTopBtn = document.getElementById('backToTopBtn');

  // Bail out if any required element is missing — no room for silent failures.
  if (!glossaryList || !searchInput || !categoryFilter || !checkAllToggle || !backToTopBtn) {
    console.error('Glossary.js: Missing one or more required DOM elements.');
    return;
  }

  let glossaryData = [];

  // Create a floating definition box — hidden by default.
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

  // Close defBox on clicking outside or pressing Escape
  document.addEventListener('click', e => {
    if (!defBox.contains(e.target) && !e.target.classList.contains('glossary-term')) {
      defBox.style.display = 'none';
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') defBox.style.display = 'none';
  });

  // Fetch glossary data from serverless function, sort and store it
  async function fetchGlossary() {
    try {
      const res = await fetch('/.netlify/functions/glossary-get');
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Glossary data is not an array');

      glossaryData = data.sort((a, b) => a.term.localeCompare(b.term));
      renderGlossary(categoryFilter.value, searchInput.value);
    } catch (error) {
      glossaryList.innerHTML = `<li style="color:red;"><strong>Error loading glossary:</strong> ${error.message}</li>`;
      console.error('Glossary fetch failed:', error);
    }
  }

  // Render the glossary list filtered by category and search term
  function renderGlossary(category = 'all', search = '') {
    glossaryList.innerHTML = '';
    defBox.style.display = 'none';

    const query = search.trim().toLowerCase();

    const filtered = glossaryData.filter(({ term, definition, category: cat }) => {
      const categoryMatch = category === 'all' || cat === category;
      const searchMatch = term.toLowerCase().includes(query) || definition.toLowerCase().includes(query);
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
      checkbox.id = `chk-${term.replace(/\s+/g, '-').toLowerCase()}`;
      checkbox.className = 'glossary-checkbox';
      checkbox.setAttribute('aria-label', `Select glossary term ${term}`);

      // Label wraps term and category tag
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.className = 'glossary-label';

      // Term span - clickable, keyboard accessible, with aria attributes
      const termSpan = document.createElement('span');
      termSpan.className = 'glossary-term';
      termSpan.textContent = term;
      termSpan.tabIndex = 0;
      termSpan.setAttribute('role', 'button');
      termSpan.setAttribute('aria-haspopup', 'true');
      termSpan.style.cursor = 'pointer';
      termSpan.style.textDecoration = 'underline dotted';

      // Show definition on click or keyboard Enter/Space
      termSpan.addEventListener('click', () => showDefinition(termSpan, { term, definition }));
      termSpan.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDefinition(termSpan, { term, definition });
        }
      });

      label.appendChild(termSpan);

      // Category tag - subtle styling
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

  // Show the floating definition box near the clicked term
  function showDefinition(target, { term, definition }) {
    const rect = target.getBoundingClientRect();

    // Sanitize text (optional, depending on your source)
    defBox.innerHTML = `<strong>${escapeHtml(term)}</strong><br>${escapeHtml(definition)}`;

    // Position box below the term, adjust if close to viewport edges
    const top = window.scrollY + rect.bottom + 6;
    let left = window.scrollX + rect.left;

    const maxLeft = window.scrollX + window.innerWidth - defBox.offsetWidth - 10;
    if (left > maxLeft) left = maxLeft;

    defBox.style.top = `${top}px`;
    defBox.style.left = `${left}px`;
    defBox.style.display = 'block';
  }

  // Simple escape function to avoid HTML injection
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[m]);
  }

  // Check All toggle logic — set all checkboxes according to master toggle
  checkAllToggle.addEventListener('change', () => {
    document.querySelectorAll('.glossary-checkbox').forEach(chk => {
      chk.checked = checkAllToggle.checked;
    });
  });

  // Update master toggle state when individual checkboxes change
  glossaryList.addEventListener('change', e => {
    if (e.target.classList.contains('glossary-checkbox')) {
      updateCheckAllToggle();
    }
  });

  function updateCheckAllToggle() {
    const checkboxes = Array.from(document.querySelectorAll('.glossary-checkbox'));
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

  // Filter glossary live on input changes
  searchInput.addEventListener('input', () => renderGlossary(categoryFilter.value, searchInput.value));
  categoryFilter.addEventListener('change', () => renderGlossary(categoryFilter.value, searchInput.value));

  // Scroll smoothly back to top on button click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Kick things off
  fetchGlossary();

  // Stub for global print function (optional)
  window.printShoppingList = () => window.print();
});
