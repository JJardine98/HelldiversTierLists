document.addEventListener('DOMContentLoaded', () => {
    // Initialize Sortable for each tier container and choices grid
    const containers = document.querySelectorAll('.tier-items, .choices-grid');
    
    containers.forEach(container => {
        new Sortable(container, {
            group: 'tier-list', // Allows dragging between all containers
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

    // Color picker functionality
    const colorPicker = document.getElementById('tier-color');
    let selectedTier = null;

    // Handle tier label click for color selection
    document.querySelectorAll('.tier-label').forEach(label => {
        label.addEventListener('click', () => {
            selectedTier = label;
            colorPicker.value = getComputedStyle(label).backgroundColor;
        });
    });

    // Update tier color when color picker changes
    colorPicker.addEventListener('input', (e) => {
        if (selectedTier) {
            selectedTier.style.backgroundColor = e.target.value;
            // Adjust text color based on background brightness
            const brightness = getBrightness(e.target.value);
            selectedTier.style.color = brightness > 128 ? '#000' : '#fff';
        }
    });

    // Custom tier functionality
    const addTierButton = document.getElementById('add-tier');
    const customTiersContainer = document.getElementById('custom-tiers');
    let customTierCount = 0;

    addTierButton.addEventListener('click', () => {
        customTierCount++;
        const tierId = `custom-tier-${customTierCount}`;
        
        const tierRow = document.createElement('div');
        tierRow.className = 'custom-tier-row';
        tierRow.innerHTML = `
            <div class="tier-label" contenteditable="true">Custom Tier ${customTierCount}</div>
            <div class="tier-items" id="${tierId}"></div>
            <button class="delete-tier" title="Delete tier">×</button>
        `;

        // Add click handler for color selection
        const tierLabel = tierRow.querySelector('.tier-label');
        tierLabel.addEventListener('click', () => {
            selectedTier = tierLabel;
            colorPicker.value = getComputedStyle(tierLabel).backgroundColor;
        });

        // Initialize Sortable for the new tier
        new Sortable(tierRow.querySelector('.tier-items'), {
            group: 'tier-list',
            animation: 150,
            ghostClass: 'item-ghost',
            dragClass: 'item-dragging',
            chosenClass: 'item-chosen',
            dragEnd: function(evt) {
                evt.item.style.animation = 'drop-item 0.3s ease-out forwards';
                setTimeout(() => {
                    evt.item.style.animation = '';
                }, 300);
            }
        });

        // Add delete functionality
        const deleteButton = tierRow.querySelector('.delete-tier');
        deleteButton.addEventListener('click', () => {
            tierRow.remove();
        });

        // Add tier to container
        customTiersContainer.appendChild(tierRow);
    });
});

// Helper function to calculate color brightness
function getBrightness(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return ((r * 299) + (g * 587) + (b * 114)) / 1000;
}

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