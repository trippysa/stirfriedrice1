// ===========================
// DISC GOLF GAME - CORE LOGIC
// ===========================

const Game = {
    // Game State
    state: 'ready', // ready, charging, throwing, flying, scored, missed
    attempts: 0,
    made: 0,

    // Physics Constants
    gravity: 0.4,
    maxPower: 100,
    powerChargeRate: 2,

    // Wind
    wind: 0,
    windMax: 3,

    // Player
    player: {
        x: 100,
        y: 0, // Will be set based on canvas height
        width: 60,
        height: 80,
        throwFrame: 0
    },

    // Disc
    disc: {
        x: 0,
        y: 0,
        radius: 8,
        vx: 0,
        vy: 0,
        active: false,
        trail: []
    },

    // Basket
    basket: {
        x: 0, // Will be set based on canvas width
        y: 0, // Will be set based on canvas height
        width: 50,
        height: 80,
        basketY: 0 // Top of basket opening
    },

    // Power
    power: 0,
    charging: false,

    // Initialize game
    init() {
        this.setupEventListeners();
        this.randomizeWind();
        this.updateUI();
    },

    // Set canvas-dependent positions
    setCanvasPositions(canvasWidth, canvasHeight) {
        // Player position (left side)
        this.player.y = canvasHeight - 100;

        // Basket position (right side)
        this.basket.x = canvasWidth - 150;
        this.basket.y = canvasHeight - 100;
        this.basket.basketY = this.basket.y;

        // Starting disc position
        this.disc.x = this.player.x + this.player.width;
        this.disc.y = this.player.y + 20;
    },

    // Setup event listeners
    setupEventListeners() {
        const canvas = document.getElementById('gameCanvas');
        const playAgainBtn = document.getElementById('playAgain');

        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.startCharging(e));
        canvas.addEventListener('mouseup', (e) => this.releaseDisc(e));

        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startCharging(e.touches[0]);
        });
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.releaseDisc(e);
        });

        // Play again button
        playAgainBtn.addEventListener('click', () => this.reset());
    },

    // Start charging power
    startCharging(e) {
        if (this.state === 'ready') {
            this.state = 'charging';
            this.charging = true;
            this.power = 0;
            document.getElementById('powerMeter').classList.remove('hidden');
        }
    },

    // Release disc
    releaseDisc(e) {
        if (this.state === 'charging' && this.charging) {
            this.charging = false;
            this.state = 'throwing';
            document.getElementById('powerMeter').classList.add('hidden');

            // Start throw animation
            setTimeout(() => {
                this.launchDisc();
            }, 100);

            this.attempts++;
            this.updateUI();
        }
    },

    // Launch the disc with physics
    launchDisc() {
        this.state = 'flying';
        this.disc.active = true;
        this.disc.trail = [];

        // Calculate velocity based on power - low arc, moderate distance
        const powerFactor = this.power / 100;
        this.disc.vx = 9 + (powerFactor * 6); // 9-15 horizontal velocity (moderate distance)
        this.disc.vy = -5 - (powerFactor * 3); // -5 to -8 vertical velocity (low arc)

        // Reset disc position
        this.disc.x = this.player.x + this.player.width;
        this.disc.y = this.player.y + 20;
    },

    // Update game state
    update() {
        // Charge power
        if (this.charging && this.power < this.maxPower) {
            this.power += this.powerChargeRate;
            if (this.power > this.maxPower) {
                this.power = this.maxPower;
            }
            this.updatePowerBar();
        }

        // Update disc physics
        if (this.disc.active) {
            // Apply wind force
            this.disc.vx += this.wind * 0.05;

            // Update position
            this.disc.x += this.disc.vx;
            this.disc.y += this.disc.vy;

            // Apply gravity
            this.disc.vy += this.gravity;

            // Add trail
            this.disc.trail.push({ x: this.disc.x, y: this.disc.y });
            if (this.disc.trail.length > 15) {
                this.disc.trail.shift();
            }

            // Check collision with basket
            if (this.checkBasketCollision()) {
                this.scoreBasket();
            }

            // Check if disc is off screen or hit ground
            const canvas = document.getElementById('gameCanvas');
            if (this.disc.y > canvas.height || this.disc.x > canvas.width + 50 || this.disc.x < -50) {
                this.missBasket();
            }
        }
    },

    // Check if disc hit the basket
    checkBasketCollision() {
        const discX = this.disc.x;
        const discY = this.disc.y;

        // Check if disc is in basket zone
        const inBasketX = discX >= this.basket.x - 10 && discX <= this.basket.x + this.basket.width + 10;
        const inBasketY = discY >= this.basket.basketY - 5 && discY <= this.basket.basketY + 30;

        // Also check if disc is moving downward (not upward)
        const movingDown = this.disc.vy > 0;

        return inBasketX && inBasketY && movingDown;
    },

    // Score a basket
    scoreBasket() {
        this.state = 'scored';
        this.disc.active = false;
        this.made++;
        this.updateUI();
        this.showWinMessage();
    },

    // Miss the basket
    missBasket() {
        this.state = 'missed';
        this.disc.active = false;

        // Reset after a delay
        setTimeout(() => {
            this.state = 'ready';
        }, 1000);
    },

    // Show win message
    showWinMessage() {
        document.getElementById('winMessage').classList.remove('hidden');
    },

    // Hide win message
    hideWinMessage() {
        document.getElementById('winMessage').classList.add('hidden');
    },

    // Reset game
    reset() {
        this.state = 'ready';
        this.power = 0;
        this.charging = false;
        this.disc.active = false;
        this.disc.trail = [];
        this.hideWinMessage();
        this.randomizeWind();
        this.updateUI();

        // Reset disc position
        const canvas = document.getElementById('gameCanvas');
        this.disc.x = this.player.x + this.player.width;
        this.disc.y = this.player.y + 20;
    },

    // Randomize wind
    randomizeWind() {
        this.wind = (Math.random() * this.windMax * 2) - this.windMax;
        this.updateWindDisplay();
    },

    // Update wind display
    updateWindDisplay() {
        const windDisplay = document.getElementById('windDisplay');
        const windStrength = Math.abs(this.wind);

        let arrow = '';
        if (this.wind > 0.5) {
            arrow = '→→';
        } else if (this.wind > 0.2) {
            arrow = '→';
        } else if (this.wind < -0.5) {
            arrow = '←←';
        } else if (this.wind < -0.2) {
            arrow = '←';
        } else {
            arrow = '–';
        }

        windDisplay.textContent = arrow;
    },

    // Update UI elements
    updateUI() {
        document.getElementById('attempts').textContent = this.attempts;
        document.getElementById('made').textContent = this.made;
    },

    // Update power bar
    updatePowerBar() {
        const powerBar = document.getElementById('powerBar');
        const percentage = (this.power / this.maxPower) * 100;
        powerBar.style.width = percentage + '%';
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
