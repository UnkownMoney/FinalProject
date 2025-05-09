document.addEventListener("DOMContentLoaded", () => {
  // Initialize all functionalities
  if (document.getElementById('flashcard')) {
    initStudyMode();
  }
  if (document.getElementById('card-list')) {
    initViewCards();
  }
  if (document.getElementById('add-card-form')) {
    initAddCard();
  }
});

/* ===== STUDY MODE ===== */
function initStudyMode() {
  const flashcards = [];
  let currentCardIndex = 0;

  // Fetch flashcards
  fetch("/api/flashcards")
    .then(res => res.json())
    .then(data => {
      flashcards.push(...(Array.isArray(data) ? data : data.data || []));
      document.getElementById('total-cards').textContent = flashcards.length;
      showCard(currentCardIndex);
    })
    .catch(err => {
      console.error("Error loading cards:", err);
      document.getElementById('study-question').textContent = "Error loading flashcards";
    });

  // Show current card
  function showCard(index) {
    if (flashcards.length === 0) return;
    
    const card = flashcards[index];
    document.getElementById('study-question').textContent = card.question;
    document.getElementById('study-answer').textContent = card.answer;
    document.getElementById('card-position').textContent = index + 1;
    document.getElementById('flashcard').classList.remove('flipped');
    updateFlipButtonText();
  }

  // Flip functionality
  document.getElementById('flashcard').addEventListener('click', function() {
    this.classList.toggle('flipped');
    updateFlipButtonText();
  });

  // Flip button
  document.getElementById('flip-card').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('flashcard').classList.toggle('flipped');
    updateFlipButtonText();
  });

  // Next card button
  document.getElementById('next-card').addEventListener('click', function() {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showCard(currentCardIndex);
  });

  // Exit button
  document.getElementById('exit-study').addEventListener('click', function() {
    window.location.href = "/";
  });

  function updateFlipButtonText() {
    const isFlipped = document.getElementById('flashcard').classList.contains('flipped');
    document.getElementById('flip-card').textContent = isFlipped ? 'Show Question' : 'Show Answer';
  }
}

/* ===== VIEW CARDS ===== */
function initViewCards() {
  fetch('/api/flashcards')
    .then(res => res.json())
    .then(data => {
      const cards = Array.isArray(data) ? data : data.data || [];
      document.getElementById('card-count').textContent = cards.length;
      
      const cardList = document.getElementById('card-list');
      cardList.innerHTML = cards.length ? '' : '<p class="no-cards">No flashcards found</p>';
      
      cards.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card-item';
        cardEl.innerHTML = `
          <div class="card-question"><strong>Q:</strong> ${card.question}</div>
          <div class="card-answer"><strong>A:</strong> ${card.answer}</div>
          <div class="card-actions">
            <a href="/edit-card.html?id=${card.id}" class="btn-edit">Edit</a>
            <button class="btn-delete" data-id="${card.id}">Delete</button>
          </div>
        `;
        cardEl.querySelector('.btn-delete').addEventListener('click', deleteCard);
        cardList.appendChild(cardEl);
      });
    })
    .catch(err => {
      console.error('Error:', err);
      document.getElementById('card-list').innerHTML = '<p class="no-cards">Error loading cards</p>';
    });

  function deleteCard(e) {
    if (confirm('Delete this flashcard?')) {
      fetch(`/api/flashcards/${e.target.dataset.id}`, { method: 'DELETE' })
        .then(() => location.reload())
        .catch(err => console.error('Delete failed:', err));
    }
  }
}

/* ===== ADD CARD ===== */
function initAddCard() {
  document.getElementById('add-card-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const question = form.question.value.trim();
    const answer = form.answer.value.trim();

    if (!question || !answer) {
      alert('Please enter both question and answer');
      return;
    }

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      });

      if (response.ok) {
        alert('Card added successfully!');
        form.reset();
        window.location.href = '/view-cards.html';
      } else {
        throw new Error('Failed to add card');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding card. Please try again.');
    }
  });
}