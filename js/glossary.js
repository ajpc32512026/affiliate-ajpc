document.addEventListener('DOMContentLoaded', () => {
  console.log("Glossary.js: Loaded and ready to fetch live data.");

  const glossaryList = document.getElementById('glossary-list');
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const checkAllToggle = document.getElementById('checkAllToggle');
  const backToTopBtn = document.getElementById('backToTopBtn');

  let glossaryData = [];

  // Create the floating definition box (hidden by default)
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

  // Hide the definition box if clicking outside or pressing Escape
  document.addEventListener('click', (e) => {
    if (!defBox.contains(e.target) && !e.target.classList.contains('glossary-term')) {
      defBox.style.display = 'none';
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      defBox.style.display = 'none';
    }
  });

  // Fetch glossary data from backend function
  async function fetchGlossary() {
    try {
      const res = await fetch('/.netlify/functions/glossary-get');
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (!Array.isArray(data)) throw new Error('Glossary data malformed');

      glossaryData = data;
      glossaryData.sort((a, b) => a.term.localeCompare(b.term));

      renderGlossary(categoryFilter.value, searchInput.value);
    } catch (err) {
      glossaryList.innerHTML = `<li style="color:red;">Error loading glossary: ${err.message}</li>`;
      console.error('Glossary fetch error:', err);
    }
  }

  // Render the glossary list applying search and category filters
  function renderGlossary(filterCategory = 'all', searchTerm = '') {
    glossaryList.innerHTML = '';
    defBox.style.display = 'none';

    const search = searchTerm.trim().toLowerCase();

    const filtered = glossaryData.filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesSearch = item.term.toLowerCase().includes(search) || item.definition.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      glossaryList.innerHTML = `<li><em>No matching glossary terms found.</em></li>`;
      resetCheckAllToggle();
      return;
    }

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'glossary-item';

      // Checkbox for selecting the term
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = `chk-${item.term.replace(/\s+/g, '-')}`;
      checkbox.className = 'glossary-checkbox';

      // Label to hold term and category
      const label = document.createElement('label');
      label.setAttribute('for', checkbox.id);
      label.className = 'glossary-label';

      // Term span: clickable, keyboard accessible, shows definition inline
      const termSpan = document.createElement('span');
      termSpan.className = 'glossary-term';
      termSpan.textContent = item.term;
      termSpan.tabIndex = 0; // keyboard focus
      termSpan.setAttribute('role', 'button');
      termSpan.setAttribute('aria-haspopup', 'true');
      termSpan.style.cursor = 'pointer';
      termSpan.style.textDecoration = 'underline dotted';

      termSpan.addEventListener('click', (e) => showDefinition(e.target, item));
      termSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showDefinition(e.target, item);
        }
      });

      label.appendChild(termSpan);

      // Category tag displayed next to term
      const catSpan = document.createElement('span');
      catSpan.className = 'glossary-category';
      catSpan.textContent = ` [${item.category}]`;
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

  // Show definition box near the clicked term
  function showDefinition(target, item) {
    const rect = target.getBoundingClientRect();
    defBox.innerHTML = `<strong>${item.term}</strong><br>${item.definition}`;
    defBox.style.top = `${window.scrollY + rect.bottom + 5}px`;
    defBox.style.left = `${window.scrollX + rect.left}px`;
    defBox.style.display = 'block';
  }

  // "Check All" toggle handler
  checkAllToggle.addEventListener('change', () => {
    const checkboxes = document.querySelectorAll('.glossary-checkbox');
    checkboxes.forEach(chk => chk.checked = checkAllToggle.checked);
  });

  // Update "Check All" toggle state based on individual checkboxes
  glossaryList.addEventListener('change', (e) => {
    if (e.target && e.target.classList.contains('glossary-checkbox')) {
      updateCheckAllToggle();
    }
  });

  function updateCheckAllToggle() {
    const checkboxes = document.querySelectorAll('.glossary-checkbox');
    if (checkboxes.length === 0) {
      checkAllToggle.checked = false;
      checkAllToggle.indeterminate = false;
      return;
    }

    const total = checkboxes.length;
    const checkedCount = Array.from(checkboxes).filter(chk => chk.checked).length;

    if (checkedCount === 0) {
      checkAllToggle.checked = false;
      checkAllToggle.indeterminate = false;
    } else if (checkedCount === total) {
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

  // React to search input changes
  searchInput.addEventListener('input', () => {
    renderGlossary(categoryFilter.value, searchInput.value);
  });

  // React to category filter changes
  categoryFilter.addEventListener('change', () => {
    renderGlossary(categoryFilter.value, searchInput.value);
  });

  // Smooth scroll to top on button click
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Start things off by fetching and rendering glossary
  fetchGlossary();

  // Optional: global print function for selected shopping list or glossary (can be extended)
  window.printShoppingList = function() {
    window.print();
  };
});
