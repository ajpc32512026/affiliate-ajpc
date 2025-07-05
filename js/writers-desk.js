// === Writer's Desk Script ===

// === Notes System ===
const editor = document.getElementById('editor');
const placeholder = document.getElementById('placeholder');
const notesContainer = document.getElementById('notesContainer');

function togglePlaceholder() {
  placeholder.style.display = editor.innerText.trim() === "" ? "block" : "none";
}

editor.addEventListener('input', togglePlaceholder);
editor.addEventListener('focus', togglePlaceholder);
editor.addEventListener('blur', togglePlaceholder);

function saveCard() {
  const content = editor.innerHTML.trim();
  if (!content) return alert("You can't save empty notes.");

  const card = {
    id: Date.now(),
    content
  };

  let notes = JSON.parse(localStorage.getItem("aj_cards") || "[]");
  notes.push(card);
  localStorage.setItem("aj_cards", JSON.stringify(notes));
  renderNotes();
  editor.innerHTML = "";
  togglePlaceholder();
}

function renderNotes() {
  notesContainer.innerHTML = "";
  const notes = JSON.parse(localStorage.getItem("aj_cards") || "[]");

  notes.forEach(note => {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.setAttribute("data-id", note.id);
    card.innerHTML = `
      <div class="card-content" contenteditable="false">${note.content}</div>
      <div class="card-buttons">
        <button onclick="editCard(${note.id})">Edit</button>
        <button onclick="deleteCard(${note.id})">Delete</button>
      </div>
    `;
    notesContainer.appendChild(card);
  });
}

function editCard(id) {
  const notes = JSON.parse(localStorage.getItem("aj_cards") || "[]");
  const card = document.querySelector(`.note-card[data-id='${id}'] .card-content`);
  const buttons = card.nextElementSibling;

  if (card.contentEditable === "false") {
    card.contentEditable = "true";
    card.focus();
    buttons.querySelector("button").textContent = "Save";
  } else {
    card.contentEditable = "false";
    const updatedContent = card.innerHTML.trim();
    const index = notes.findIndex(n => n.id === id);
    if (index > -1) {
      notes[index].content = updatedContent;
      localStorage.setItem("aj_cards", JSON.stringify(notes));
    }
    buttons.querySelector("button").textContent = "Edit";
  }
}

function deleteCard(id) {
  let notes = JSON.parse(localStorage.getItem("aj_cards") || "[]");
  notes = notes.filter(n => n.id !== id);
  localStorage.setItem("aj_cards", JSON.stringify(notes));
  renderNotes();
}

// === Glossary System (Cloud-Based) ===
const API_ENDPOINT = '/.netlify/functions/glossary';
const ADMIN_TOKEN = 'REPLACE_ME_WITH_SECRET';

async function glossaryAPI(method, body = {}) {
  const res = await fetch(API_ENDPOINT, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': ADMIN_TOKEN
    },
    body: method === 'GET' ? null : JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'Glossary API error');
  }

  return res.status === 204 ? {} : res.json();
}

async function saveGlossaryTerm() {
  const term = document.getElementById('glossary-term').value.trim();
  const definition = document.getElementById('glossary-definition').value.trim();

  if (!term || !definition) {
    return alert("Both term and definition are required.");
  }

  try {
    await glossaryAPI('POST', { term, definition });
    alert(`Saved “${term}” to the glossary.`);
    document.getElementById('glossary-term').value = '';
    document.getElementById('glossary-definition').value = '';
    loadGlossary();
  } catch (err) {
    alert("Failed to save: " + err.message);
  }
}

async function deleteGlossaryTerm(term) {
  if (!confirm(`Delete "${term}" from the glossary?`)) return;
  try {
    await glossaryAPI('DELETE', { term });
    loadGlossary();
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
}

async function loadGlossary() {
  const list = document.getElementById('glossary-list');
  if (!list) return;

  list.innerHTML = '';
  try {
    const glossary = await glossaryAPI('GET');
    glossary
      .sort((a, b) => a.term.localeCompare(b.term))
      .forEach(({ term, definition }) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <strong>${term}</strong>: ${definition}
          <button class="glossary-delete" data-term="${term}">🗑</button>
        `;
        list.appendChild(li);
      });
  } catch (err) {
    list.innerHTML = `<li>Error loading glossary: ${err.message}</li>`;
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('glossary-delete')) {
    const term = e.target.dataset.term;
    deleteGlossaryTerm(term);
  }
});

window.onload = () => {
  renderNotes();
  togglePlaceholder();
  loadGlossary();
};
