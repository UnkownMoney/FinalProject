
// Study Mode Functionality
const flashcard = document.getElementById('flashcard');
const studyQuestion = document.getElementById('study-question');
const studyAnswer = document.getElementById('study-answer');
const flipCardBtn = document.getElementById('flip-card');
const nextCardBtn = document.getElementById('next-card');
const exitStudyBtn = document.getElementById('exit-study');
const cardPosition = document.getElementById('card-position');
const totalCards = document.getElementById('total-cards');

let flashcards = [];
let currentCardIndex = 0;

// Initialize study mode
function initStudyMode() {
  fetch('/api/flashcards')
    .then(res => res.json())
    .then(data => {
      flashcards = data;
      totalCards.textContent = data.length;
      
      if (data.length === 0) {
        studyQuestion.textContent = "No flashcards available";
        return;
      }
      
      showCard(currentCardIndex);
    })
    .catch(err => {
      console.error("Error loading cards:", err);
      studyQuestion.textContent = "Error loading flashcards";
    });
}

// Show current card
function showCard(index) {
  if (index >= flashcards.length) {
    index = 0; // Loop back to first card
  }
  
  const card = flashcards[index];
  studyQuestion.textContent = card.question;
  studyAnswer.textContent = card.answer;
  cardPosition.textContent = index + 1;
  
  // Reset card to front
  flashcard.classList.remove('flipped');
}

// Event Listeners
if (flipCardBtn) {
  flipCardBtn.addEventListener('click', () => {
    flashcard.classList.toggle('flipped');
    flipCardBtn.textContent = flashcard.classList.contains('flipped') ? 'Show Question' : 'Show Answer';
  });
}

if (nextCardBtn) {
  nextCardBtn.addEventListener('click', () => {
    currentCardIndex = (currentCardIndex + 1) % flashcards.length;
    showCard(currentCardIndex);
  });
}

if (exitStudyBtn) {
  exitStudyBtn.addEventListener('click', () => {
    window.location.href = '/';
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initStudyMode);