/**
 * Bubble Manager
 * Manages category bubbles with state cycling and UI updates
 */

class BubbleManager {
    // State definitions with sizes and colors
    static STATES = {
        DISLIKE: {
            id: 'dislike',
            label: 'Не интересно',
            shortLabel: '👎',
            size: 60,
            order: 0,
            colorClass: 'bubble-dislike'
        },
        NEUTRAL: {
            id: 'neutral',
            label: 'Нейтрально',
            shortLabel: '😐',
            size: 80,
            order: 1,
            colorClass: 'bubble-neutral'
        },
        LIKE: {
            id: 'like',
            label: 'Нравится',
            shortLabel: '👍',
            size: 100,
            order: 2,
            colorClass: 'bubble-like'
        },
        STRONGLY_LIKE: {
            id: 'strongly_like',
            label: 'Обожаю!',
            shortLabel: '❤️',
            size: 120,
            order: 3,
            colorClass: 'bubble-strongly-like'
        }
    };

    static STATE_ORDER = ['DISLIKE', 'NEUTRAL', 'LIKE', 'STRONGLY_LIKE'];

    constructor(container, physics, categories, options = {}) {
        this.container = container;
        this.physics = physics;
        this.categories = categories;
        this.options = {
            defaultState: 'NEUTRAL',
            onStateChange: null,
            animationDuration: 300,
            ...options
        };

        this.categoryStates = new Map(); // categoryId -> state name
        this.categoryElements = new Map(); // categoryId -> DOM element

        this.init();
    }

    init() {
        this.createBubbles();
    }

    /**
     * Create bubble elements for all categories
     */
    createBubbles() {
        this.categories.forEach((category, index) => {
            const state = BubbleManager.STATES[this.options.defaultState];
            this.categoryStates.set(category.id, this.options.defaultState);

            const bubble = this.createBubbleElement(category, state);
            this.container.appendChild(bubble);
            this.categoryElements.set(category.id, bubble);

            // Add to physics simulation with slight delay for visual effect
            setTimeout(() => {
                this.physics.addBubble(category.id, bubble, state.size);
            }, index * 50);
        });
    }

    /**
     * Create a single bubble DOM element
     */
    createBubbleElement(category, state) {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${state.colorClass}`;
        bubble.dataset.categoryId = category.id;
        bubble.style.width = `${state.size}px`;
        bubble.style.height = `${state.size}px`;

        // Inner content
        bubble.innerHTML = `
            <div class="bubble-content">
                <span class="bubble-emoji">${category.emoji}</span>
                <span class="bubble-name">${category.name}</span>
                <span class="bubble-state">${state.shortLabel}</span>
            </div>
            <div class="bubble-glow" style="background: ${category.gradient}"></div>
        `;

        // Click handler for state cycling
        bubble.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.cycleState(category.id);
        });

        // Add touch feedback
        bubble.addEventListener('touchstart', () => {
            bubble.classList.add('bubble-pressed');
        }, { passive: true });

        bubble.addEventListener('touchend', () => {
            bubble.classList.remove('bubble-pressed');
        }, { passive: true });

        return bubble;
    }

    /**
     * Cycle to next state for a category
     */
    cycleState(categoryId) {
        const currentStateName = this.categoryStates.get(categoryId);
        const currentIndex = BubbleManager.STATE_ORDER.indexOf(currentStateName);
        const nextIndex = (currentIndex + 1) % BubbleManager.STATE_ORDER.length;
        const nextStateName = BubbleManager.STATE_ORDER[nextIndex];

        this.setState(categoryId, nextStateName);
    }

    /**
     * Set specific state for a category
     */
    setState(categoryId, stateName) {
        const state = BubbleManager.STATES[stateName];
        const bubble = this.categoryElements.get(categoryId);
        const oldStateName = this.categoryStates.get(categoryId);
        const oldState = BubbleManager.STATES[oldStateName];

        if (!state || !bubble) return;

        // Update state tracking
        this.categoryStates.set(categoryId, stateName);

        // Remove old state class, add new one
        bubble.classList.remove(oldState.colorClass);
        bubble.classList.add(state.colorClass);

        // Animate size change
        bubble.classList.add('bubble-animating');
        bubble.style.width = `${state.size}px`;
        bubble.style.height = `${state.size}px`;

        // Update state indicator
        const stateEl = bubble.querySelector('.bubble-state');
        if (stateEl) {
            stateEl.textContent = state.shortLabel;
        }

        // Update physics
        this.physics.updateBubbleSize(categoryId, state.size);

        // Remove animation class after transition
        setTimeout(() => {
            bubble.classList.remove('bubble-animating');
        }, this.options.animationDuration);

        // Trigger callback
        if (this.options.onStateChange) {
            this.options.onStateChange(categoryId, stateName, state);
        }

        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    /**
     * Get current state of a category
     */
    getState(categoryId) {
        const stateName = this.categoryStates.get(categoryId);
        return {
            stateName,
            state: BubbleManager.STATES[stateName]
        };
    }

    /**
     * Get all category states
     */
    getAllStates() {
        const states = {};
        for (const [categoryId, stateName] of this.categoryStates) {
            states[categoryId] = {
                stateName,
                state: BubbleManager.STATES[stateName]
            };
        }
        return states;
    }

    /**
     * Get preferences in a simplified format for saving
     */
    getPreferences() {
        const preferences = {};
        for (const [categoryId, stateName] of this.categoryStates) {
            preferences[categoryId] = BubbleManager.STATES[stateName].id;
        }
        return preferences;
    }

    /**
     * Load preferences from saved data
     */
    loadPreferences(preferences) {
        for (const [categoryId, stateId] of Object.entries(preferences)) {
            const stateName = BubbleManager.STATE_ORDER.find(
                name => BubbleManager.STATES[name].id === stateId
            );
            if (stateName && this.categoryStates.has(categoryId)) {
                this.setState(categoryId, stateName);
            }
        }
    }

    /**
     * Reset all categories to default state
     */
    resetAll() {
        for (const categoryId of this.categoryStates.keys()) {
            this.setState(categoryId, this.options.defaultState);
        }
    }

    /**
     * Destroy manager and cleanup
     */
    destroy() {
        for (const [categoryId, element] of this.categoryElements) {
            element.remove();
        }
        this.categoryStates.clear();
        this.categoryElements.clear();
    }
}

// Export for module use or attach to window for script use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BubbleManager;
} else {
    window.BubbleManager = BubbleManager;
}
