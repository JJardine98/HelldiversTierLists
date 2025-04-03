document.addEventListener('DOMContentLoaded', () => {
    // Only apply faction themes if we're on the primary weapons page
    const isPrimaryWeaponsPage = window.location.pathname.includes('primary-weapons.html');
    if (!isPrimaryWeaponsPage) return;

    let autoScrollInterval = null;
    const scrollSpeed = 5; // Reduced from 10 to 5 pixels per interval for smoother scrolling
    const scrollThreshold = 250; // Increased from 150 to 250 pixels for earlier activation

    // Faction theming
    const factionThemes = {
        automatons: {
            primary: '#8B0000',
            secondary: '#5c0000',
            accent: '#cc0000',
            background: 'linear-gradient(45deg, #2a0000, #3d0000)'
        },
        terminids: {
            primary: '#CD853F',
            secondary: '#8B5E34',
            accent: '#DEB887',
            background: 'linear-gradient(45deg, #3d2b1f, #5c422f)'
        },
        illuminate: {
            primary: '#4B0082',
            secondary: '#330057',
            accent: '#7b00d3',
            background: 'linear-gradient(45deg, #1a002e, #2a004b)'
        }
    };

    // Add faction selection functionality
    const factionButtons = document.querySelectorAll('.faction-button');
    const container = document.querySelector('.container');
    const header = document.querySelector('header');
    
    // Function to apply theme
    const applyTheme = (faction) => {
        const theme = factionThemes[faction];
        
        // Remove previous faction classes
        container.classList.remove('automatons-theme', 'terminids-theme', 'illuminate-theme');
        // Add new faction class
        container.classList.add(`${faction}-theme`);
        
        // Update header text
        const titleText = document.querySelector('h1');
        titleText.textContent = `Primary Weapons Tier List - ${faction.charAt(0).toUpperCase() + faction.slice(1)}`;
        
        // Update theme colors
        document.documentElement.style.setProperty('--theme-primary', theme.primary);
        document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
        document.documentElement.style.setProperty('--theme-accent', theme.accent);
        document.documentElement.style.setProperty('--theme-background', theme.background);
        
        // Update active button state
        factionButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-faction="${faction}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Add faction icon to header logo area
        const headerLogo = document.querySelector('.header-logo');
        if (headerLogo) {
            headerLogo.innerHTML = ''; // Clear existing content
            const factionIcon = document.createElement('img');
            factionIcon.src = `../images/factions/${faction}.webp`;
            factionIcon.alt = faction;
            factionIcon.className = 'faction-icon';
            headerLogo.appendChild(factionIcon);
        }
    };
    
    factionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const faction = button.dataset.faction;
            applyTheme(faction);
        });
    });

    // Set default theme to Automatons
    applyTheme('automatons');

    // Initialize Sortable for each tier container and choices grid
    const containers = document.querySelectorAll('.tier-items, .choices-grid');
    
    containers.forEach(container => {
        new Sortable(container, {
            group: 'tier-list', // Allows dragging between all containers
            animation: 150,
            ghostClass: 'item-ghost',
            dragClass: 'item-dragging',
            chosenClass: 'item-chosen',
            onStart: function() {
                // Start checking for auto-scroll when drag begins
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(checkForAutoScroll, 16); // ~60fps
            },
            onEnd: function(evt) {
                // Clear auto-scroll when drag ends
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
                // Add drop animation
                evt.item.style.animation = 'drop-item 0.3s ease-out forwards';
                setTimeout(() => {
                    evt.item.style.animation = '';
                }, 300);
            }
        });
    });

    function checkForAutoScroll() {
        const draggingElement = document.querySelector('.item-dragging');
        if (!draggingElement) return;

        const rect = draggingElement.getBoundingClientRect();
        const topY = rect.top;
        const bottomY = rect.bottom;
        const windowHeight = window.innerHeight;

        // Scroll up if near top
        if (topY < scrollThreshold) {
            window.scrollBy(0, -scrollSpeed);
        }
        // Scroll down if near bottom
        else if (bottomY > windowHeight - scrollThreshold) {
            window.scrollBy(0, scrollSpeed);
        }
    }

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

    // Reset functionality
    const resetButton = document.getElementById('reset-tiers');
    const choicesGrid = document.getElementById('choices');
    
    resetButton.addEventListener('click', () => {
        // Get all items from tier containers
        const tierItems = Array.from(document.querySelectorAll('.tier-items .item'));
        
        // Move each item back to choices
        tierItems.forEach(item => {
            // Remove the item from its current container
            if (item.parentNode) {
                item.parentNode.removeChild(item);
            }
            // Add it to the choices grid
            choicesGrid.appendChild(item);
            // Add drop animation
            item.style.animation = 'drop-item 0.3s ease-out forwards';
            setTimeout(() => {
                item.style.animation = '';
            }, 300);
        });
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
            onStart: function() {
                // Start checking for auto-scroll when drag begins
                if (autoScrollInterval) clearInterval(autoScrollInterval);
                autoScrollInterval = setInterval(checkForAutoScroll, 16);
            },
            onEnd: function(evt) {
                // Clear auto-scroll when drag ends
                if (autoScrollInterval) {
                    clearInterval(autoScrollInterval);
                    autoScrollInterval = null;
                }
                evt.item.style.animation = 'drop-item 0.3s ease-out forwards';
                setTimeout(() => {
                    evt.item.style.animation = '';
                }, 300);
            }
        });

        // Add delete functionality
        const deleteButton = tierRow.querySelector('.delete-tier');
        deleteButton.addEventListener('click', () => {
            // Get all items in the tier being deleted
            const tierItems = tierRow.querySelector('.tier-items').children;
            
            // Move each item back to the choices grid
            while (tierItems.length > 0) {
                const item = tierItems[0];
                document.getElementById('choices').appendChild(item);
            }
            
            // Now remove the tier
            tierRow.remove();
        });

        // Add tier to container
        customTiersContainer.appendChild(tierRow);
    });

    // Update faction-specific styles
    const factionStyles = document.createElement('style');
    factionStyles.textContent = `
        .primary-weapons-page {
            --theme-primary: #4a4a4a;
            --theme-secondary: #333333;
            --theme-accent: #666666;
            --theme-background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
        }

        .container {
            transition: background 0.3s ease;
        }

        .header-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            width: 100%;
        }

        .header-logo {
            display: flex;
            justify-content: center;
            height: 64px;
            margin-bottom: 1rem;
        }

        .header-logo .faction-icon {
            width: 64px;
            height: 64px;
            transition: transform 0.3s ease;
        }

        .faction-selector {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin: 1rem 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding-top: 1rem;
        }

        .faction-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border: 2px solid var(--theme-accent);
            background: var(--theme-secondary);
            color: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .faction-button:hover {
            background: var(--theme-accent);
            transform: translateY(-2px);
        }

        .faction-button.active {
            background: var(--theme-accent);
            box-shadow: 0 0 10px var(--theme-accent);
        }

        .faction-icon {
            width: 24px;
            height: 24px;
            margin-right: 0.5rem;
        }

        .automatons-theme { background: var(--theme-background); }
        .terminids-theme { background: var(--theme-background); }
        .illuminate-theme { background: var(--theme-background); }

        .tier-label {
            background: var(--theme-primary);
            transition: background-color 0.3s ease;
        }

        .tier-items {
            background: var(--theme-secondary);
            transition: background-color 0.3s ease;
        }

        h1, .choices-section h2 {
            color: white;
        }

        .subtitle {
            color: #cccccc;
        }
    `;
    document.head.appendChild(factionStyles);
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

    .reset-button {
        background-color: #ff4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        transition: background-color 0.2s, transform 0.1s;
    }

    .reset-button:hover {
        background-color: #ff6666;
        transform: translateY(-1px);
    }

    .reset-button:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);