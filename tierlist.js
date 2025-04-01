document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sortable for each tier container
    const containers = document.querySelectorAll('.tier-items');
    
    containers.forEach(container => {
        new Sortable(container, {
            group: 'tier-list', // Allows dragging between containers
            animation: 150,
            ghostClass: 'item-ghost',
            dragClass: 'item-dragging',
            chosenClass: 'item-chosen',
            dragEnd: function(evt) {
                // Add drop animation
                evt.item.style.animation = 'drop-item 0.3s ease-out forwards';
                setTimeout(() => {
                    evt.item.style.animation = '';
                }, 300);
            }
        });
    });
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    .item-ghost {
        opacity: 0.5;
        background: rgba(255, 255, 255, 0.1);
        border: 2px dashed rgba(255, 255, 255, 0.3);
    }
    
    .item-dragging {
        opacity: 0.7;
        cursor: grabbing;
        transform: scale(1.05);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    }
    
    .item-chosen {
        background: rgba(255, 255, 255, 0.1);
    }
    
    @keyframes drop-item {
        0% { transform: scale(1.05); box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        70% { transform: scale(0.98); }
        100% { transform: scale(1); box-shadow: none; }
    }
`;
document.head.appendChild(style);