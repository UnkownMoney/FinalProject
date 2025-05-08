// ✅ add-card.js

document.getElementById("add-card-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const question = document.getElementById("question").value;
    const answer = document.getElementById("answer").value;
  
    fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, answer })
    })
      .then((res) => res.json())
      .then(() => window.location.href = "/view-cards")
      .catch((err) => alert("Failed to add card"));
  });