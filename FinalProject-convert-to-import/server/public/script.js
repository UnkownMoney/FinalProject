// ======================
// CONSTANTS AND UTILITIES
// ======================
const API_BASE = '/api/flashcards'; // Updated to match backend
const TOAST_DURATION = 3000;

// Safe DOM element selector
const getEl = (selector, parent = document) => {
  const el = parent.querySelector(selector);
  if (!el) console.warn(`Element not found: ${selector}`);
  return el;
};

// Display temporary notification
const showToast = (message, isError = false) => {
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : 'success'}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), TOAST_DURATION);
};

// Escape HTML for security
const escapeHtml = (unsafe) => {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ======================
// ADD CARD PAGE
// ======================
if (getEl('#add-card-page')) {
  const form = getEl('#flashcard-form');
  const submitBtn = getEl('#submit-btn', form);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    try {
      const formData = new FormData(form);
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.get('question').trim(),
          answer: formData.get('answer').trim()
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save flashcard');
      }

      showToast('Flashcard created successfully!');
      form.reset();
      setTimeout(() => window.location.href = '/view-cards', 1500);
    } catch (error) {
      showToast(error.message, true);
      console.error('Submission error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Flashcard';
    }
  });
}

// ======================
// VIEW CARDS PAGE
// ======================
if (getEl('#view-cards-page')) {
  const cardList = getEl('#flashcard-list');
  const cardCount = getEl('#card-count');
  let flashcards = [];

  // Format date for display
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
  };

  // Render flashcards to DOM
  const renderFlashcards = () => {
    if (!flashcards.length) {
      cardList.innerHTML = '<div class="no-cards">No flashcards yet. Add one to get started!</div>';
      cardCount.textContent = '0';
      return;
    }

    cardList.innerHTML = flashcards.map(card => `
      <div class="flashcard-item" data-id="${card.id}">
        <div class="card-content">
          <h3>${escapeHtml(card.question)}</h3>
          <div class="card-meta">
            <span>Created: ${formatDate(card.created_at)}</span>
            ${card.updated_at ? `<span> | Updated: ${formatDate(card.updated_at)}</span>` : ''}
          </div>
        </div>
        <div class="card-actions">
          <button class="btn study-btn" data-id="${card.id}">
            <i class="fas fa-book-open"></i> Study
          </button>
          <button class="btn delete-btn" data-id="${card.id}">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    document.querySelectorAll('.study-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.href = '/study-mode';
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
  };

  // Delete flashcard
  const handleDelete = async (e) => {
    const cardId = e.currentTarget.dataset.id;
    if (!confirm('Delete this flashcard permanently?')) return;

    try {
      const response = await fetch(`${API_BASE}/${cardId}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      flashcards = flashcards.filter(card => card.id !== cardId);
      renderFlashcards();
      showToast('Flashcard deleted successfully');
    } catch (error) {
      showToast(error.message, true);
      console.error('Delete error:', error);
    }
  };

  // Load all flashcards
  const loadFlashcards = async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to load flashcards');
      
      flashcards = await response.json();
      renderFlashcards();
    } catch (error) {
      showToast(error.message, true);
      console.error('Load error:', error);
    }
  };

  // Initialize
  loadFlashcards();
}

// ======================
// STUDY MODE PAGE
// ======================
if (getEl('#study-mode-page')) {
  const studyFront = getEl('#study-front');
  const studyBack = getEl('#study-back');
  const currentCardEl = getEl('#current-card');
  const totalCardsEl = getEl('#total-cards');
  const prevBtn = getEl('#study-prev');
  const nextBtn = getEl('#study-next');
  const flipBtn = getEl('#study-flip');
  const studyCard = getEl('.study-card');
  const backBtn = getEl('#back-to-list');

  let flashcards = [];
  let currentIndex = 0;
  let isFlipped = false;

  // Load flashcards for study
  const loadStudyCards = async () => {
    try {
      const response = await fetch(API_BASE);
      if (!response.ok) throw new Error('Failed to load flashcards');
      
      flashcards = await response.json();
      if (flashcards.length === 0) {
        studyFront.textContent = 'No flashcards available';
        return;
      }
      
      totalCardsEl.textContent = flashcards.length;
      showCard();
    } catch (error) {
      studyFront.textContent = 'Error loading flashcards';
      showToast(error.message, true);
      console.error('Study load error:', error);
    }
  };

  // Show current card
  const showCard = () => {
    const card = flashcards[currentIndex];
    studyFront.textContent = card.question;
    studyBack.textContent = card.answer;
    currentCardEl.textContent = currentIndex + 1;
    
    if (isFlipped) {
      studyCard.classList.add('flipped');
    } else {
      studyCard.classList.remove('flipped');
    }
  };

  // Event listeners
  flipBtn.addEventListener('click', () => {
    isFlipped = !isFlipped;
    studyCard.classList.toggle('flipped');
  });

  prevBtn.addEventListener('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
    isFlipped = false;
    showCard();
  });

  nextBtn.addEventListener('click', () => {
    if (flashcards.length === 0) return;
    currentIndex = (currentIndex + 1) % flashcards.length;
    isFlipped = false;
    showCard();
  });

  backBtn.addEventListener('click', () => {
    window.location.href = '/view-cards';
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (flashcards.length === 0) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        prevBtn.click();
        break;
      case 'ArrowRight':
        nextBtn.click();
        break;
      case ' ':
      case 'Enter':
        flipBtn.click();
        e.preventDefault();
        break;
    }
  });

  // Initialize
  loadStudyCards();
}
