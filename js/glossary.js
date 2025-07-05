document.addEventListener('DOMContentLoaded', () => {
  const glossaryTableBody = document.getElementById('glossary-table-body');
  const categoryFilter = document.getElementById('category-filter');
  const searchInput = document.getElementById('search-box');
  const popup = document.getElementById('term-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupDescription = document.getElementById('popup-description');
  const popupClose = document.getElementById('popup-close');

  let glossaryData = [];

  // Fetch glossary data from serverless function
  fetch('/.netlify/functions/glossary-get')
    .then(res => res.json())
    .then(data => {
      glossaryData = data;
      populateCategoryDropdown(data);
      renderGlossary(data);
    })
    .catch(err => {
      console.error('Failed to load glossary data:', err);
    });

  function populateCategoryDropdown(data) {
    const categories = [...new Set(data.map(term => term.category))].sort();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  function renderGlossary(data) {
    glossaryTableBody.innerHTML = '';

    const sorted = data.sort((a, b) => a.term.localeCompare(b.term));
    sorted.forEach(({ term, description, category }) => {
      const row = document.createElement('tr');

      const termCell = document.createElement('td');
      termCell.textContent = term;
      termCell.classList.add('term-cell');
      termCell.style.cursor = 'pointer';
      termCell.addEventListener('click', () => showPopup(term, description));

      const categoryCell = document.createElement('td');
      categoryCell.textContent = category;

      row.appendChild(termCell);
      row.appendChild(categoryCell);
      glossaryTableBody.appendChild(row);
    });
  }

  function showPopup(title, description) {
    popupTitle.textContent = title;
    popupDescription.textContent = description;
    popup.style.display = 'block';
  }

  popupClose.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.style.display = 'none';
    }
  });

  function applyFilters() {
    const selectedCategory = categoryFilter.value;
    const searchTerm = searchInput.value.trim().toLowerCase();

    let filtered = [...glossaryData];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(term => term.category === selectedCategory);
    }

    if (searchTerm !== '') {
      filtered = filtered.filter(term =>
        term.term.toLowerCase().includes(searchTerm) ||
        term.description.toLowerCase().includes(searchTerm)
      );
    }

    renderGlossary(filtered);
  }

  categoryFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
});
