document.getElementById('flashcard-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const question = document.getElementById('question').value;
    const answer = document.getElementById('answer').value;
    
    try {
        const response = await fetch('/api/flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question, answer })
        });
        
        if (response.ok) {
            alert('Flashcard added successfully!');
            document.getElementById('flashcard-form').reset();
        } else {
            throw new Error('Failed to add flashcard');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding flashcard');
    }
});