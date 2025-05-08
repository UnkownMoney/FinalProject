document.addEventListener("DOMContentLoaded", () => {
  const cardList = document.getElementById("card-list");
  const cardCountDisplay = document.getElementById("card-count");
  const startStudyBtn = document.getElementById("start-study-btn");
  const studyModeContainer = document.getElementById("study-mode");
  const studyCardContainer = document.getElementById("study-card");
  const nextCardBtn = document.getElementById("next-card-btn");
  const exitStudyBtn = document.getElementById("exit-study-btn");

  let flashcards = [];
  let currentCardIndex = 0;

  // Fetch flashcards
  fetch("/api/flashcards")
    .then((res) => res.json())
    .then((cards) => {
      flashcards = cards;
      cardList.innerHTML = "";

      cardCountDisplay.textContent = `Total Cards: ${cards.length}`;

      if (cards.length === 0) {
        cardList.innerHTML = "<p>No flashcards found.</p>";
        return;
      }

      // Display each card
      cards.forEach((card) => {
        const cardEl = document.createElement("div");
        cardEl.classList.add("flashcard");
        cardEl.innerHTML = `
          <div class="flashcard-inner">
            <div class="flashcard-front"><strong>Q:</strong> ${card.question}</div>
            <div class="flashcard-back"><strong>A:</strong> ${card.answer}</div>
          </div>
          <div class="card-buttons">
            <button class="edit-btn btn" data-id="${card.id}">Edit</button>
            <button class="delete-btn btn" data-id="${card.id}">Delete</button>
          </div>
        `;

        // Flip on click
        cardEl.addEventListener("click", () => {
          cardEl.classList.toggle("flipped");
        });

        cardList.appendChild(cardEl);
      });

      // Edit button behavior
      document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          window.location.href = `/edit-card?id=${id}`;
        });
      });

      // Delete button behavior
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          fetch(`/api/flashcards/${id}`, { method: "DELETE" })
            .then(() => location.reload())
            .catch(() => alert("Error deleting card"));
        });
      });
    })
    .catch((err) => {
      console.error("Error loading cards:", err);
      cardList.innerHTML = "<p>Failed to load flashcards.</p>";
    });

  // Start Study Mode
  if (startStudyBtn) {
    startStudyBtn.addEventListener("click", () => {
      if (flashcards.length === 0) {
        alert("No flashcards to study.");
        return;
      }
      currentCardIndex = 0;
      cardList.style.display = "none";
      startStudyBtn.style.display = "none";
      studyModeContainer.style.display = "block";
      showCard(currentCardIndex);
    });
  }

  // Render card with flip for study mode
  function showCard(index) {
    const card = flashcards[index];
    studyCardContainer.innerHTML = `
      <div class="flashcard flipped" id="study-flashcard">
        <div class="flashcard-inner">
          <div class="flashcard-front">${card.question}</div>
          <div class="flashcard-back">${card.answer}</div>
        </div>
      </div>
      <div class="study-controls">
        <button class="btn show" id="flip-card-btn">Show Answer</button>
        <button class="btn next" id="next-card-btn-inner">Next Card</button>
        <button class="btn exit" id="exit-study-btn-inner">Exit Study Mode</button>
      </div>
    `;

    // Flip card
    document.getElementById("flip-card-btn").addEventListener("click", () => {
      document.getElementById("study-flashcard").classList.toggle("flipped");
    });

    // Next card
    document.getElementById("next-card-btn-inner").addEventListener("click", () => {
      currentCardIndex++;
      if (currentCardIndex >= flashcards.length) {
        alert("You've finished studying all the cards!");
        exitStudy();
      } else {
        showCard(currentCardIndex);
      }
    });

    // Exit
    document.getElementById("exit-study-btn-inner").addEventListener("click", () => {
      exitStudy();
    });
  }

  function exitStudy() {
    studyModeContainer.style.display = "none";
    cardList.style.display = "block";
    startStudyBtn.style.display = "inline";
  }
});

// View Cards Functionality
function initViewCards() {
  const cardList = document.getElementById('card-list');
  const cardCount = document.getElementById('card-count');
  
  if (!cardList) return; // Only run on view-cards.html

  fetch('/api/flashcards')
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => {
      const cards = Array.isArray(data) ? data : data.data || [];
      cardCount.textContent = cards.length;
      
      if (cards.length === 0) {
        cardList.innerHTML = '<p class="no-cards">No flashcards found. <a href="/add-card.html">Add your first card</a></p>';
        return;
      }
      
      cardList.innerHTML = cards.map(card => `
        <div class="card-item">
          <div class="card-question"><strong>Q:</strong> ${card.question}</div>
          <div class="card-answer"><strong>A:</strong> ${card.answer}</div>
          <div class="card-actions">
            <a href="/edit-card.html?id=${card.id}" class="btn-edit">Edit</a>
            <button class="btn-delete" data-id="${card.id}">Delete</button>
          </div>
        </div>
      `).join('');
      
      // Add delete handlers
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (confirm('Delete this flashcard?')) {
            fetch(`/api/flashcards/${btn.dataset.id}`, { method: 'DELETE' })
              .then(() => location.reload())
              .catch(err => console.error('Delete failed:', err));
          }
        });
      });
    })
    .catch(err => {
      console.error('Fetch error:', err);
      cardList.innerHTML = `<p class="no-cards">Error loading flashcards: ${err.message}</p>`;
    });
}

// Initialize based on current page
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('card-list')) {
    initViewCards();
  }
  // Your other initialization code for other pages...
});
