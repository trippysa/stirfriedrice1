// ===========================
// DISC GOLF GAME - CANVAS RENDERING
// ===========================

const GameCanvas = {
    canvas: null,
    ctx: null,
    animationId: null,

    // Initialize canvas
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Start animation loop
        this.animate();
    },

    // Resize canvas
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const aspectRatio = 16 / 9;

        // Set canvas dimensions
        this.canvas.width = Math.min(container.clientWidth - 12, 800);
        this.canvas.height = this.canvas.width / aspectRatio;

        // Update game positions based on new canvas size
        Game.setCanvasPositions(this.canvas.width, this.canvas.height);
    },

    // Main animation loop
    animate() {
        // Update game logic
        Game.update();

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw scene
        this.drawBackground();
        this.drawBasket();
        this.drawPlayer();
        if (Game.disc.active || Game.disc.trail.length > 0) {
            this.drawDiscTrail();
            this.drawDisc();
        }

        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    },

    // Draw background (sky, ground, pond, trees)
    drawBackground() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.6);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#98D8E8');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, w, h * 0.6);

        // Sun
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(w - 100, 80, 40, 0, Math.PI * 2);
        ctx.fill();

        // Clouds (simple pixel style)
        this.drawCloud(150, 60, 60);
        this.drawCloud(w - 250, 100, 50);

        // Ground
        const groundGradient = ctx.createLinearGradient(0, h * 0.6, 0, h);
        groundGradient.addColorStop(0, '#7EC850');
        groundGradient.addColorStop(1, '#5D9741');
        ctx.fillStyle = groundGradient;
        ctx.fillRect(0, h * 0.6, w, h * 0.4);

        // Pond (middle of scene)
        const pondY = h * 0.65;
        const pondX = w * 0.4;
        ctx.fillStyle = '#4A90E2';
        ctx.beginPath();
        ctx.ellipse(pondX, pondY, 80, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pond shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(pondX - 20, pondY - 10, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trees (pixel style)
        this.drawTree(w * 0.2, h * 0.55, 40);
        this.drawTree(w * 0.7, h * 0.5, 35);
        this.drawTree(w * 0.85, h * 0.58, 45);
    },

    // Draw a cloud
    drawCloud(x, y, size) {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        // Pixel-style cloud (three circles)
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.6, 0, Math.PI * 2);
        ctx.arc(x + size * 1.2, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    },

    // Draw a tree
    drawTree(x, y, height) {
        const ctx = this.ctx;

        // Trunk
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 5, y, 10, height);

        // Foliage (triangle for pine tree style)
        ctx.fillStyle = '#2D5016';
        ctx.beginPath();
        ctx.moveTo(x, y - height * 0.5);
        ctx.lineTo(x - height * 0.6, y + height * 0.3);
        ctx.lineTo(x + height * 0.6, y + height * 0.3);
        ctx.closePath();
        ctx.fill();

        // Second layer
        ctx.beginPath();
        ctx.moveTo(x, y - height * 0.2);
        ctx.lineTo(x - height * 0.5, y + height * 0.5);
        ctx.lineTo(x + height * 0.5, y + height * 0.5);
        ctx.closePath();
        ctx.fill();
    },

    // Draw player character
    drawPlayer() {
        const ctx = this.ctx;
        const p = Game.player;

        // Determine throw animation frame based on game state
        let throwProgress = 0;
        if (Game.state === 'charging') {
            throwProgress = Game.power / 100;
        } else if (Game.state === 'throwing') {
            throwProgress = 1;
        }

        // Body (simple rectangle for now - will be replaced with photo sprite)
        ctx.fillStyle = '#2196F3';
        ctx.fillRect(p.x, p.y + 20, p.width * 0.5, p.height * 0.6);

        // Head
        ctx.fillStyle = '#FFDBAC';
        ctx.beginPath();
        ctx.arc(p.x + 15, p.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();

        // Throwing arm
        ctx.strokeStyle = '#FFDBAC';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';

        const armExtension = throwProgress * 30;
        ctx.beginPath();
        ctx.moveTo(p.x + 25, p.y + 30);
        ctx.lineTo(p.x + 40 + armExtension, p.y + 20 - throwProgress * 10);
        ctx.stroke();

        // Legs
        ctx.strokeStyle = '#1976D2';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(p.x + 15, p.y + 60);
        ctx.lineTo(p.x + 10, p.y + 80);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p.x + 20, p.y + 60);
        ctx.lineTo(p.x + 25, p.y + 80);
        ctx.stroke();
    },

    // Draw disc golf basket
    drawBasket() {
        const ctx = this.ctx;
        const b = Game.basket;
        const centerX = b.x + b.width / 2;

        // Pole (metal)
        ctx.fillStyle = '#555';
        ctx.fillRect(centerX - 4, b.y, 8, b.height);

        // Pole highlight
        ctx.fillStyle = '#888';
        ctx.fillRect(centerX - 3, b.y, 2, b.height);

        // Top horizontal bar (catching bar)
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(centerX - 25, b.y - 5, 50, 8);

        // Bar highlight
        ctx.fillStyle = '#FFED4E';
        ctx.fillRect(centerX - 25, b.y - 5, 50, 3);

        // Hanging chains (more realistic)
        ctx.strokeStyle = '#AAA';
        ctx.lineWidth = 1.5;

        const numChains = 10;
        for (let i = 0; i < numChains; i++) {
            const spacing = 50 / (numChains - 1);
            const chainX = (centerX - 25) + (i * spacing);

            ctx.beginPath();
            ctx.moveTo(chainX, b.y + 3);
            ctx.lineTo(chainX, b.y + 35);
            ctx.stroke();
        }

        // Basket bottom tray (yellow metal)
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(centerX, b.y + 38, 22, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shadow under tray
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, b.y + 39, 20, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    },

    // Draw disc trail
    drawDiscTrail() {
        const ctx = this.ctx;
        const trail = Game.disc.trail;

        for (let i = 0; i < trail.length; i++) {
            const point = trail[i];
            const alpha = (i / trail.length) * 0.5;

            ctx.fillStyle = `rgba(255, 107, 53, ${alpha})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    // Draw disc
    drawDisc() {
        if (!Game.disc.active && Game.disc.trail.length === 0) {
            return;
        }

        const ctx = this.ctx;
        const d = Game.disc;

        // Disc shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(d.x, d.y + 5, d.radius * 1.2, d.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main disc
        ctx.fillStyle = '#FF6B35';
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Disc shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(d.x - 2, d.y - 2, d.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Disc rotation lines (for spin effect)
        ctx.strokeStyle = '#D84315';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x - d.radius * 0.6, d.y);
        ctx.lineTo(d.x + d.radius * 0.6, d.y);
        ctx.stroke();
    }
};

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    GameCanvas.init();
});
