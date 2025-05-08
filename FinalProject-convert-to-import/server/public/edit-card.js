document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cardId = urlParams.get('id');
    
    if (!cardId) {
      alert('No card ID specified');
      window.location.href = '/';
      return;
    }
  
    document.getElementById('card-id').value = cardId;
  
    // Load existing card data
    fetch(`/api/flashcards/${cardId}`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('question').value = data.question;
        document.getElementById('answer').value = data.answer;
      })
      .catch(err => {
        console.error('Error loading card:', err);
        alert('Error loading card data');
      });
  
    // Handle form submission
    document.getElementById('edit-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(`/api/flashcards/${cardId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: document.getElementById('question').value,
            answer: document.getElementById('answer').value
          })
        });
  
        if (!response.ok) throw new Error('Update failed');
        
        alert('Card updated successfully!');
        window.location.href = '/view-cards';
      } catch (err) {
        console.error('Update error:', err);
        alert('Error updating card');
      }
    });
  });