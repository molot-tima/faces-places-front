/**
 * Bubble Physics Engine
 * A physics simulation for interactive category bubbles using Matter.js
 */

class BubblePhysics {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            attractionStrength: 0.0008,
            dampingFactor: 0.05,
            collisionPadding: 8,
            minBubbleSize: 50,
            maxBubbleSize: 120,
            ...options
        };

        // Matter.js modules
        this.Engine = Matter.Engine;
        this.Render = Matter.Render;
        this.World = Matter.World;
        this.Bodies = Matter.Bodies;
        this.Body = Matter.Body;
        this.Events = Matter.Events;
        this.Mouse = Matter.Mouse;
        this.MouseConstraint = Matter.MouseConstraint;
        this.Composite = Matter.Composite;

        this.engine = null;
        this.world = null;
        this.bubbles = new Map(); // Map of bubble ID to bubble data
        this.bubbleElements = new Map(); // Map of bubble ID to DOM element
        this.animationId = null;
        this.centerX = 0;
        this.centerY = 0;
        this.bubbleIndex = 0; // For spiral placement

        // Drag state tracking
        this.mouseConstraint = null;
        this.isDragging = false;
        this.dragStartTime = 0;
        this.dragStartPos = { x: 0, y: 0 };
        this.draggedBody = null;
        this.onDragEnd = null; // Callback when drag ends

        this.init();
    }

    init() {
        // Create Matter.js engine
        this.engine = this.Engine.create({
            enableSleeping: false
        });
        this.world = this.engine.world;

        // Disable gravity - we'll use custom attraction
        this.engine.world.gravity.y = 0;
        this.engine.world.gravity.x = 0;

        // Calculate container dimensions
        this.updateDimensions();

        // Create boundary walls (invisible)
        this.createBoundaries();

        // Setup mouse/touch drag
        this.setupMouseConstraint();

        // Setup resize observer
        this.setupResizeObserver();

        // Start physics loop
        this.startPhysicsLoop();
    }

    updateDimensions() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
    }

    createBoundaries() {
        const wallThickness = 100;
        const padding = 20;

        // Remove existing boundaries
        if (this.boundaries) {
            this.World.remove(this.world, this.boundaries);
        }

        this.boundaries = [
            // Top wall
            this.Bodies.rectangle(
                this.width / 2, -wallThickness / 2 + padding,
                this.width + wallThickness * 2, wallThickness,
                { isStatic: true, label: 'wall' }
            ),
            // Bottom wall
            this.Bodies.rectangle(
                this.width / 2, this.height + wallThickness / 2 - padding,
                this.width + wallThickness * 2, wallThickness,
                { isStatic: true, label: 'wall' }
            ),
            // Left wall
            this.Bodies.rectangle(
                -wallThickness / 2 + padding, this.height / 2,
                wallThickness, this.height + wallThickness * 2,
                { isStatic: true, label: 'wall' }
            ),
            // Right wall
            this.Bodies.rectangle(
                this.width + wallThickness / 2 - padding, this.height / 2,
                wallThickness, this.height + wallThickness * 2,
                { isStatic: true, label: 'wall' }
            )
        ];

        this.World.add(this.world, this.boundaries);
    }

    /**
     * Setup mouse/touch drag constraint
     */
    setupMouseConstraint() {
        // Create mouse
        this.mouse = this.Mouse.create(this.container);

        // Fix for high DPI displays
        this.mouse.pixelRatio = window.devicePixelRatio || 1;

        // Create mouse constraint
        this.mouseConstraint = this.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                damping: 0.3,
                render: { visible: false }
            }
        });

        this.World.add(this.world, this.mouseConstraint);

        // Track drag start
        this.Events.on(this.mouseConstraint, 'startdrag', (event) => {
            this.isDragging = true;
            this.dragStartTime = Date.now();
            this.dragStartPos = { ...event.mouse.position };
            this.draggedBody = event.body;

            // Add dragging class to element
            const bubbleData = this.getBubbleByBody(event.body);
            if (bubbleData) {
                bubbleData.element.classList.add('bubble-dragging');
            }
        });

        // Track drag end
        this.Events.on(this.mouseConstraint, 'enddrag', (event) => {
            const dragDuration = Date.now() - this.dragStartTime;
            const dragDistance = Math.sqrt(
                Math.pow(event.mouse.position.x - this.dragStartPos.x, 2) +
                Math.pow(event.mouse.position.y - this.dragStartPos.y, 2)
            );

            // Remove dragging class
            const bubbleData = this.getBubbleByBody(event.body);
            if (bubbleData) {
                bubbleData.element.classList.remove('bubble-dragging');
            }

            // Determine if this was a click or a drag
            // Click: short duration AND small movement
            const isClick = dragDuration < 200 && dragDistance < 10;

            if (this.onDragEnd) {
                this.onDragEnd({
                    body: event.body,
                    isClick,
                    isDrag: !isClick,
                    bubbleId: event.body.label
                });
            }

            this.isDragging = false;
            this.draggedBody = null;
        });

        // Handle touch events for mobile
        this.setupTouchHandling();
    }

    /**
     * Setup touch event handling for mobile devices
     */
    setupTouchHandling() {
        // Prevent default touch behavior to avoid scrolling
        this.container.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    /**
     * Get bubble data by physics body
     */
    getBubbleByBody(body) {
        for (const [id, bubbleData] of this.bubbles) {
            if (bubbleData.body === body) {
                return bubbleData;
            }
        }
        return null;
    }

    /**
     * Calculate spiral position to avoid initial collisions
     * Uses Fermat's spiral for even distribution
     */
    calculateSpiralPosition(index, totalCount, bubbleSize) {
        // Golden angle in radians
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));

        // Calculate position using Fermat's spiral
        const angle = index * goldenAngle;

        // Spacing based on bubble size with padding
        const baseRadius = bubbleSize + 20;
        const radius = baseRadius * Math.sqrt(index + 1);

        // Calculate position relative to center
        const x = this.centerX + radius * Math.cos(angle);
        const y = this.centerY + radius * Math.sin(angle);

        return { x, y };
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateDimensions();
            this.createBoundaries();

            // Update mouse constraint for new dimensions
            if (this.mouse) {
                this.mouse.pixelRatio = window.devicePixelRatio || 1;
            }
        });
        this.resizeObserver.observe(this.container);
    }

    /**
     * Add a bubble to the simulation
     * @param {string} id - Unique identifier for the bubble
     * @param {HTMLElement} element - DOM element representing the bubble
     * @param {number} size - Current size of the bubble
     * @param {number} index - Index of this bubble (for positioning)
     * @param {number} totalCount - Total number of bubbles
     */
    addBubble(id, element, size, index = 0, totalCount = 1) {
        const radius = size / 2;

        // Use spiral positioning to avoid collisions
        const pos = this.calculateSpiralPosition(index, totalCount, size);

        const body = this.Bodies.circle(pos.x, pos.y, radius + this.options.collisionPadding, {
            friction: 0.1,
            frictionAir: this.options.dampingFactor,
            restitution: 0.3,
            label: id,
            collisionFilter: {
                group: 0,
                category: 0x0001,
                mask: 0x0001
            }
        });

        this.World.add(this.world, body);

        this.bubbles.set(id, {
            body,
            element,
            size,
            radius
        });

        this.bubbleElements.set(id, element);
    }

    /**
     * Update bubble size (when state changes)
     * @param {string} id - Bubble identifier
     * @param {number} newSize - New size
     */
    updateBubbleSize(id, newSize) {
        const bubbleData = this.bubbles.get(id);
        if (!bubbleData) return;

        const oldRadius = bubbleData.radius;
        const newRadius = newSize / 2;
        const scale = (newRadius + this.options.collisionPadding) / (oldRadius + this.options.collisionPadding);

        // Scale the body
        this.Body.scale(bubbleData.body, scale, scale);

        // Update stored data
        bubbleData.size = newSize;
        bubbleData.radius = newRadius;

        // Add a small impulse to help repositioning
        const impulseStrength = 0.002;
        const angle = Math.random() * Math.PI * 2;
        this.Body.applyForce(bubbleData.body, bubbleData.body.position, {
            x: Math.cos(angle) * impulseStrength,
            y: Math.sin(angle) * impulseStrength
        });
    }

    /**
     * Remove a bubble from simulation
     * @param {string} id - Bubble identifier
     */
    removeBubble(id) {
        const bubbleData = this.bubbles.get(id);
        if (!bubbleData) return;

        this.World.remove(this.world, bubbleData.body);
        this.bubbles.delete(id);
        this.bubbleElements.delete(id);
    }

    /**
     * Apply attraction force towards center
     */
    applyAttractionForces() {
        for (const [id, bubbleData] of this.bubbles) {
            const body = bubbleData.body;

            // Don't apply attraction to dragged body
            if (this.isDragging && body === this.draggedBody) {
                continue;
            }

            const pos = body.position;

            // Calculate direction to center
            const dx = this.centerX - pos.x;
            const dy = this.centerY - pos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 1) {
                // Normalize and apply attraction force
                const forceMultiplier = this.options.attractionStrength * (distance / 100);
                const fx = (dx / distance) * forceMultiplier;
                const fy = (dy / distance) * forceMultiplier;

                this.Body.applyForce(body, pos, { x: fx, y: fy });
            }
        }
    }

    /**
     * Update DOM elements to match physics positions
     */
    updateDOMPositions() {
        for (const [id, bubbleData] of this.bubbles) {
            const body = bubbleData.body;
            const element = bubbleData.element;

            const x = body.position.x - bubbleData.radius;
            const y = body.position.y - bubbleData.radius;

            element.style.transform = `translate(${x}px, ${y}px)`;
        }
    }

    /**
     * Main physics loop
     */
    startPhysicsLoop() {
        const loop = () => {
            // Apply attraction to center
            this.applyAttractionForces();

            // Update physics
            this.Engine.update(this.engine, 1000 / 60);

            // Update DOM
            this.updateDOMPositions();

            this.animationId = requestAnimationFrame(loop);
        };

        loop();
    }

    /**
     * Stop the physics simulation
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    /**
     * Resume the physics simulation
     */
    resume() {
        if (!this.animationId) {
            this.startPhysicsLoop();
        }
    }

    /**
     * Destroy the simulation and cleanup
     */
    destroy() {
        this.stop();

        // Remove mouse constraint
        if (this.mouseConstraint) {
            this.World.remove(this.world, this.mouseConstraint);
        }

        this.World.clear(this.world);
        this.Engine.clear(this.engine);
        this.bubbles.clear();
        this.bubbleElements.clear();
    }
}

// Export for module use or attach to window for script use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BubblePhysics;
} else {
    window.BubblePhysics = BubblePhysics;
}
