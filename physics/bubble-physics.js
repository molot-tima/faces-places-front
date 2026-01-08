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

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => {
            this.updateDimensions();
            this.createBoundaries();
        });
        this.resizeObserver.observe(this.container);
    }

    /**
     * Add a bubble to the simulation
     * @param {string} id - Unique identifier for the bubble
     * @param {HTMLElement} element - DOM element representing the bubble
     * @param {number} size - Current size of the bubble
     */
    addBubble(id, element, size) {
        // Random position around center with some spread
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;

        const radius = size / 2;

        const body = this.Bodies.circle(x, y, radius + this.options.collisionPadding, {
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
