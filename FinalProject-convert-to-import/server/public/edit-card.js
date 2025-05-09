document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const cardId = params.get("id");
  const questionInput = document.getElementById("edit-question");
  const answerInput = document.getElementById("edit-answer");
  const form = document.getElementById("edit-card-form");
  
  if (!cardId) {
    alert("Invalid card ID");
    window.location.href = "/view-cards";
    return;
  }

  document.getElementById("card-id").value = cardId;

  // Show loading state
  form.classList.add("loading");

  fetch(`/api/flashcards/${cardId}`)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load card");
      return res.json();
    })
    .then((card) => {
      questionInput.value = card.question;
      answerInput.value = card.answer;
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Failed to load card. Please try again.");
      window.location.href = "/view-cards";
    })
    .finally(() => {
      form.classList.remove("loading");
    });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
      alert("Please fill in both question and answer");
      return;
    }

    // Show loading state during submission
    form.classList.add("loading");

    fetch(`/api/flashcards/${cardId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update card");
        window.location.href = "/view-cards";
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to update card. Please try again.");
      })
      .finally(() => {
        form.classList.remove("loading");
      });
  });
});