// A Mixed Bag - Interactive Story Engine
(function() {
    'use strict';

    let currentPassage = 'start';
    let history = [];

    // DOM elements
    const storyText = document.getElementById('storyText');
    const choicesContainer = document.getElementById('choicesContainer');
    const restartBtn = document.getElementById('restartGame');

    // Initialize the game
    function init() {
        if (!STORY_DATA) {
            console.error('Story data not loaded!');
            return;
        }

        displayPassage('start');

        // Restart button listener
        if (restartBtn) {
            restartBtn.addEventListener('click', restart);
        }
    }

    // Display a passage
    function displayPassage(passageName) {
        const passage = STORY_DATA[passageName];

        if (!passage) {
            console.error(`Passage "${passageName}" not found!`);
            return;
        }

        // Update current passage
        currentPassage = passageName;
        history.push(passageName);

        // Display text with fade-in effect
        storyText.style.opacity = '0';
        setTimeout(() => {
            storyText.innerHTML = formatText(passage.text);
            storyText.style.opacity = '1';
        }, 150);

        // Display choices
        displayChoices(passage.choices);

        // Scroll to top smoothly
        const gameContainer = document.querySelector('.story-container');
        if (gameContainer) {
            gameContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Format text (replace line breaks, add paragraphs)
    function formatText(text) {
        // Split by double line breaks to create paragraphs
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            // Replace single line breaks with <br>
            const formatted = p.replace(/\n/g, '<br>');
            return `<p>${formatted}</p>`;
        }).join('');
    }

    // Display choices
    function displayChoices(choices) {
        choicesContainer.innerHTML = '';

        if (!choices || choices.length === 0) {
            // It's an ending - show restart button
            if (restartBtn) {
                restartBtn.style.display = 'inline-block';
            }
            return;
        }

        // Hide restart button
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }

        // Create choice buttons
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'choice-btn pixel-btn';
            button.textContent = `🥏 ${choice.text}`;
            button.setAttribute('data-goto', choice.goto);

            // Add staggered animation delay
            button.style.animationDelay = `${index * 0.1}s`;

            button.addEventListener('click', () => {
                handleChoice(choice.goto);
            });

            choicesContainer.appendChild(button);
        });
    }

    // Handle choice selection
    function handleChoice(passageName) {
        // Add click effect
        event.target.style.transform = 'scale(0.95)';
        setTimeout(() => {
            displayPassage(passageName);
        }, 150);
    }

    // Restart the game
    function restart() {
        history = [];
        currentPassage = 'start';
        displayPassage('start');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for potential debugging
    window.StoryEngine = {
        displayPassage,
        restart,
        getCurrentPassage: () => currentPassage,
        getHistory: () => history
    };
})();
