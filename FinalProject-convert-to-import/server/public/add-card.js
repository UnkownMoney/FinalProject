// ✅ Complete add-card.js with word count validation
document.addEventListener('DOMContentLoaded', () => {
  // Initialize word counters
  setupWordCounters();
  
  // Form submission handler
  document.getElementById("add-card-form").addEventListener("submit", handleFormSubmit);
});

// Main form handler
async function handleFormSubmit(e) {
  e.preventDefault();
  clearErrors();

  const question = document.getElementById("question").value.trim();
  const answer = document.getElementById("answer").value.trim();
  let isValid = true;

  // Validate question
  if (!question) {
    showError("question-error", "Question is required!");
    markInvalid("question");
    isValid = false;
  } else if (getWordCount(question) > 100) {
    showError("question-error", "Question exceeds 100 words!");
    markInvalid("question");
    isValid = false;
  }

  // Validate answer
  if (!answer) {
    showError("answer-error", "Answer is required!");
    markInvalid("answer");
    isValid = false;
  } else if (getWordCount(answer) > 100) {
    showError("answer-error", "Answer exceeds 100 words!");
    markInvalid("answer");
    isValid = false;
  }

  // Submit if valid
  if (isValid) {
    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add card");
      }

      window.location.href = "/view-cards";
    } catch (err) {
     const msg = err.message || err.error || "Failed to add card";
if (msg.toLowerCase().includes("question")) {
  showError("question-error", msg);
  markInvalid("question");
} else if (msg.toLowerCase().includes("answer")) {
  showError("answer-error", msg);
  markInvalid("answer");
} else {
  showError("question-error", msg);  // fallback
}

    }
  }
}

// Word counter setup
function setupWordCounters() {
  const fields = [
    { id: "question", counter: "question-word-counter" },
    { id: "answer", counter: "answer-word-counter" }
  ];

  fields.forEach(({ id, counter }) => {
    const textarea = document.getElementById(id);
    const counterElement = document.getElementById(counter);

    textarea.addEventListener("input", () => {
      const wordCount = getWordCount(textarea.value);
      counterElement.textContent = `${wordCount}/100 words`;
      
      // Visual feedback when approaching limit
      if (wordCount > 100) {
        counterElement.style.color = "#dc3545";
      } else {
        counterElement.style.color = "";
      }
    });
  });
}

// Helper functions
function getWordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function showError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function markInvalid(elementId) {
  document.getElementById(elementId).classList.add("invalid");
}

function clearErrors() {
  document.querySelectorAll(".error-message").forEach(el => {
    el.textContent = "";
    el.style.display = "none";
  });
  document.querySelectorAll("textarea").forEach(el => {
    el.classList.remove("invalid");
  });
}