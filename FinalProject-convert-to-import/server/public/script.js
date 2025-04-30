document.addEventListener('DOMContentLoaded', function () {
  // Safe DOM element getter with error handling
  function getElement(id) {
    const el = document.getElementById(id);
    if (!el) {
      console.error(`Element with ID '${id}' not found`);
      return null;
    }
    return el;
  }

  // Get all DOM elements safely
  const elements = {
    form: getElement('flashcard-form'),
    list: getElement('flashcard-list'),
    heading: getElement('view-all-cards'),
    studySection: document.querySelector('.study-section'),
    flashcardsSection: document.querySelector('.flashcards-section'),
    backToListBtn: getElement('back-to-list'),
    studyFront: getElement('study-front'),
    studyBack: getElement('study-back'),
    studyPrevBtn: getElement('study-prev'),
    studyNextBtn: getElement('study-next'),
    studyFlipBtn: getElement('study-flip'),
    studyCounter: document.querySelector('.study-counter'),
    cardCounter: document.querySelector('.card-counter'),
    questionInput: getElement('question'),
    answerInput: getElement('answer'),
    errorContainer: getElement('error-container') || document.body
  };

  if (!elements.form || !elements.list) {
    showCriticalError();
    return;
  }

  let flashcards = [];
  let currentCardIndex = 0;

  function init() {
    try {
      setupEventListeners();
      loadFlashcards();
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to initialize application');
    }
  }

  function showCriticalError() {
    document.body.innerHTML = `
      <div class="error" style="padding: 2rem; text-align: center;">
        <h2>Application Error</h2>
        <p>Critical components missing - please refresh the page</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">Refresh Page</button>
      </div>
    `;
  }

  function showError(message, element = elements.errorContainer) {
    element.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button class="retry-btn">Retry</button>
      </div>
    `;
    element.querySelector('.retry-btn').addEventListener('click', () => location.reload());
  }

  function setupEventListeners() {
    try {
      if (elements.heading) elements.heading.addEventListener('click', showAllCards);
      elements.form.addEventListener('submit', handleFormSubmit);
      if (elements.backToListBtn) elements.backToListBtn.addEventListener('click', showAllCards);
      if (elements.studyPrevBtn) elements.studyPrevBtn.addEventListener('click', showPreviousCard);
      if (elements.studyNextBtn) elements.studyNextBtn.addEventListener('click', showNextCard);
      if (elements.studyFlipBtn) elements.studyFlipBtn.addEventListener('click', flipCard);

      const studyContainer = document.querySelector('.study-card-container');
      if (studyContainer) studyContainer.addEventListener('click', flipCard);
    } catch (error) {
      console.error('Event listener setup error:', error);
      showError('Failed to set up event listeners');
    }
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderFlashcards() {
    try {
      if (!flashcards.length) {
        elements.list.innerHTML = '<div class="no-cards">No flashcards yet. Add one to get started!</div>';
        return;
      }

      elements.list.innerHTML = flashcards.map((card, index) => `
        <div class="flashcard-item" data-id="${card.id}">
          <div class="flashcard-content">
            <div class="flashcard-question">${escapeHtml(card.question)}</div>
            <div class="flashcard-answer" style="display: none;">${escapeHtml(card.answer)}</div>
          </div>
          <div class="flashcard-actions">
            <button class="study-btn" data-index="${index}">Study</button>
            <button class="edit-btn" data-id="${card.id}">Edit</button>
            <button class="delete-btn" data-id="${card.id}">Delete</button>
            <button class="toggle-answer-btn">Show Answer</button>
          </div>
        </div>
      `).join('');

      // Attach event listeners to dynamic elements
      document.querySelectorAll('.study-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          currentCardIndex = parseInt(e.target.dataset.index);
          showStudySection();
        });
      });

      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDeleteClick);
      });

      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', handleEditClick);
      });

      document.querySelectorAll('.toggle-answer-btn').forEach(btn => {
        btn.addEventListener('click', toggleAnswerVisibility);
      });

    } catch (error) {
      console.error('Error rendering flashcards:', error);
      showError('Failed to display flashcards');
    }
  }

  function toggleAnswerVisibility(e) {
    const cardItem = e.target.closest('.flashcard-item');
    const answer = cardItem.querySelector('.flashcard-answer');
    const visible = answer.style.display === 'block';
    answer.style.display = visible ? 'none' : 'block';
    e.target.textContent = visible ? 'Show Answer' : 'Hide Answer';
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const question = elements.questionInput.value.trim();
    const answer = elements.answerInput.value.trim();

    if (!question || !answer) {
      showError('Please fill in both question and answer fields');
      return;
    }

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save flashcard');
      }

      const newCard = await response.json();
      flashcards.push(newCard);
      renderFlashcards();
      updateCounters();
      elements.form.reset();

    } catch (error) {
      console.error('Save failed:', error);
      showError(error.message || 'Could not save flashcard. Please try again.');
    }
  }

  async function handleEditClick(e) {
    const cardId = e.target.dataset.id;
    const card = flashcards.find(card => card.id === cardId);
    
    if (!card) return;

    const newQuestion = prompt('Edit Question:', card.question);
    if (newQuestion === null) return;

    const newAnswer = prompt('Edit Answer:', card.answer);
    if (newAnswer === null) return;

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: newQuestion, answer: newAnswer })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Update failed');
      }

      const updatedCard = await response.json();
      Object.assign(card, updatedCard);
      renderFlashcards();
      
      if (elements.studySection.style.display === 'block' && 
          flashcards[currentCardIndex]?.id === cardId) {
        updateStudyCard();
      }

    } catch (error) {
      console.error('Edit failed:', error);
      showError(error.message || 'Could not update flashcard. Please try again.');
    }
  }

  async function handleDeleteClick(e) {
    const cardId = e.target.dataset.id;
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      const response = await fetch(`/api/flashcards/${cardId}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      flashcards = flashcards.filter(card => card.id !== cardId);
      renderFlashcards();
      updateCounters();

      if (elements.studySection.style.display === 'block') {
        if (flashcards.length === 0) {
          showAllCards();
        } else if (currentCardIndex >= flashcards.length) {
          currentCardIndex = flashcards.length - 1;
          updateStudyCard();
        }
      }

    } catch (error) {
      console.error('Delete failed:', error);
      showError(error.message || 'Could not delete flashcard. Please try again.');
    }
  }

  async function loadFlashcards() {
    try {
      const response = await fetch('/api/flashcards');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Load failed');
      }

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      flashcards = data;
      renderFlashcards();
      updateCounters();

    } catch (error) {
      console.error('Load failed:', error);
      showError(error.message || 'Failed to load flashcards. Please refresh.');
    }
  }

  function updateCounters() {
    if (elements.cardCounter) {
      elements.cardCounter.textContent = `${flashcards.length} card${flashcards.length !== 1 ? 's' : ''}`;
    }
  }

  function showAllCards() {
    if (elements.studySection) elements.studySection.style.display = 'none';
    if (elements.flashcardsSection) elements.flashcardsSection.style.display = 'block';
  }

  function showStudySection() {
    if (!flashcards.length) return;
    if (elements.flashcardsSection) elements.flashcardsSection.style.display = 'none';
    if (elements.studySection) elements.studySection.style.display = 'block';
    updateStudyCard();
  }

  function updateStudyCard() {
    if (!flashcards.length) return;

    const card = flashcards[currentCardIndex];
    if (elements.studyFront) elements.studyFront.textContent = card.question;
    if (elements.studyBack) elements.studyBack.textContent = card.answer;
    if (elements.studyCounter) {
      elements.studyCounter.textContent = `${currentCardIndex + 1}/${flashcards.length}`;
    }

    const studyCard = document.querySelector('.study-card');
    if (studyCard) studyCard.classList.remove('flipped');
  }

  function showNextCard() {
    if (!flashcards.length) return;
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    updateStudyCard();
  }

  function showPreviousCard() {
    if (!flashcards.length) return;
    currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
    updateStudyCard();
  }

  function flipCard() {
    const studyCard = document.querySelector('.study-card');
    if (studyCard) studyCard.classList.toggle('flipped');
  }

  init();
});