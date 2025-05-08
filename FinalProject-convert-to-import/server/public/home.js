document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded - home.js running');
    
    // Debug: Verify buttons exist
    const buttons = {
        add: document.getElementById('add-card-btn'),
        view: document.getElementById('view-cards-btn'),
        study: document.getElementById('study-mode-btn')
    };
    
    console.log('Found buttons:', {
        addButton: !!buttons.add,
        viewButton: !!buttons.view,
        studyButton: !!buttons.study
    });

    // Navigation handler
    const navigate = (path) => {
        console.log(`Navigating to: ${path}`);
        window.location.href = path;
    };

    // Event listeners with fallbacks
    if (buttons.add) {
        buttons.add.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Add Card button clicked');
            navigate('/add-card');
        });
    }

    if (buttons.view) {
        buttons.view.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('View Cards button clicked');
            navigate('/view-cards');
        });
    }

    if (buttons.study) {
        buttons.study.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Study Mode button clicked');
            navigate('/study-mode');
        });
    }

    // Generic handler for any .nav-button
    document.querySelectorAll('.nav-button').forEach(button => {
        if (!button.id) return;
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const route = button.id.replace('-btn', '');
            console.log(`Generic handler navigating to /${route}`);
            navigate(`/${route}`);
        });
    });

    // Debug: List all clickable elements
    console.log('All elements with click handlers:', 
        Array.from(document.querySelectorAll('[id*="-btn"]'))
            .map(el => ({ id: el.id, tag: el.tagName }))
    );
});