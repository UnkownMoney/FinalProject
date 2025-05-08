// ✅ edit-card.js

document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("id");
  const questionInput = document.getElementById("edit-question");
  const answerInput = document.getElementById("edit-answer");
  const form = document.getElementById("edit-card-form");
  document.getElementById("card-id").value = cardId;

  fetch(`/api/flashcards/${cardId}`)
    .then((res) => res.json())
    .then((card) => {
      questionInput.value = card.question;
      answerInput.value = card.answer;
    })
    .catch(() => alert("Failed to load card"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = questionInput.value;
    const answer = answerInput.value;

    fetch(`/api/flashcards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer })
    })
      .then(() => window.location.href = "/view-cards")
      .catch(() => alert("Failed to update card"));
  });
});
