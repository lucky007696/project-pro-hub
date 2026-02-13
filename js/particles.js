// ===============================================
// ProjectPro Hub - Advanced Particles System
// Creates dynamic particle effects and backgrounds
// ===============================================

// === Main Particle System Class ===
class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.mousePosition = { x: 0, y: 0 };

        // Configuration
        this.config = {
            particleCount: options.particleCount || 50,
            particleSize: options.particleSize || { min: 1, max: 4 },
            particleSpeed: options.particleSpeed || { min: 0.1, max: 0.5 },
            particleColor: options.particleColor || 'rgba(173, 82, 230, 0.5)', // Violet
            connectionDistance: options.connectionDistance || 150,
            connectionColor: options.connectionColor || 'rgba(173, 82, 230, 0.2)', // Violet
            connectionWidth: options.connectionWidth || 1,
            interactive: options.interactive !== false,
            interactionRadius: options.interactionRadius || 200,
            useCanvas: options.useCanvas !== false,
            bounce: options.bounce !== false,
            ...options
        };

        this.init();
    }

    init() {
        if (this.config.useCanvas) {
            this.initCanvas();
        } else {
            this.initDOM();
        }

        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
    }

    initDOM() {
        this.container.style.position = 'relative';
    }

    resize() {
        if (!this.canvas) return;

        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    createParticles() {
        const count = this.config.particleCount;

        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        const size = this.random(this.config.particleSize.min, this.config.particleSize.max);

        return {
            x: Math.random() * (this.canvas?.width || this.container.offsetWidth),
            y: Math.random() * (this.canvas?.height || this.container.offsetHeight),
            vx: this.random(-this.config.particleSpeed.max, this.config.particleSpeed.max),
            vy: this.random(-this.config.particleSpeed.max, this.config.particleSpeed.max),
            size: size,
            opacity: Math.random() * 0.5 + 0.3,
            element: this.config.useCanvas ? null : this.createParticleElement(size)
        };
    }

    createParticleElement(size) {
        const el = document.createElement('div');
        el.style.position = 'absolute';
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.borderRadius = '50%';
        el.style.background = this.config.particleColor;
        el.style.pointerEvents = 'none';
        this.container.appendChild(el);
        return el;
    }

    setupEventListeners() {
        if (!this.config.interactive) return;

        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    updateParticle(particle) {
        const width = this.canvas?.width || this.container.offsetWidth;
        const height = this.canvas?.height || this.container.offsetHeight;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges or wrap around
        if (this.config.bounce) {
            if (particle.x <= 0 || particle.x >= width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(width, particle.x));
            }
            if (particle.y <= 0 || particle.y >= height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(height, particle.y));
            }
        } else {
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        }

        // Mouse interaction
        if (this.config.interactive) {
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.config.interactionRadius) {
                const force = (this.config.interactionRadius - distance) / this.config.interactionRadius;
                particle.vx -= (dx / distance) * force * 0.5;
                particle.vy -= (dy / distance) * force * 0.5;
            }
        }

        // Speed limiting
        const maxSpeed = this.config.particleSpeed.max * 2;
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (speed > maxSpeed) {
            particle.vx = (particle.vx / speed) * maxSpeed;
            particle.vy = (particle.vy / speed) * maxSpeed;
        }

        // Update DOM element if not using canvas
        if (particle.element) {
            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        }
    }

    drawParticle(particle) {
        if (!this.ctx) return;

        this.ctx.fillStyle = this.config.particleColor;
        this.ctx.globalAlpha = particle.opacity;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawConnections() {
        if (!this.ctx) return;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.config.connectionDistance) {
                    const opacity = 1 - (distance / this.config.connectionDistance);
                    this.ctx.strokeStyle = this.config.connectionColor.replace('0.2', opacity * 0.3);
                    this.ctx.lineWidth = this.config.connectionWidth;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.particles.forEach(particle => {
            this.updateParticle(particle);
            if (this.ctx) {
                this.drawParticle(particle);
            }
        });

        if (this.ctx && this.config.connectionDistance > 0) {
            this.drawConnections();
        }

        this.animationFrame = requestAnimationFrame(() => this.animate());
    }

    random(min, max) {
        return Math.random() * (max - min) + min;
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.canvas) {
            this.canvas.remove();
        }

        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.remove();
            }
        });

        this.particles = [];
    }
}

// === Floating Particles (Simple DOM-based) ===
class FloatingParticles {
    constructor(container, count = 50) {
        this.container = container;
        this.count = count;
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;

        particle.style.position = 'absolute';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = `rgba(173, 82, 230, ${Math.random() * 0.5 + 0.3})`;
        particle.style.borderRadius = '50%';
        particle.style.left = left + '%';
        particle.style.top = '100%';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `particleFloat ${duration}s ${delay}s infinite`;

        this.container.appendChild(particle);
    }
}

// === Star Field Effect ===
// === Star Field Effect ===
class StarField {
    constructor(container, density = 50) { // Reduced density as we have a bg image
        this.container = container;
        this.density = density;
        this.canvas = null;
        this.ctx = null;
        this.stars = [];
        this.shootingStars = [];
        this.lastShootingStar = 0;
        this.shootingStarInterval = 2000; // ms between shooting stars (approx)
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        this.createStars();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    createStars() {
        const area = this.canvas.width * this.canvas.height;
        const count = Math.floor(area / 10000 * this.density);

        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.02
            });
        }
    }

    createShootingStar() {
        const startX = Math.random() * this.canvas.width;
        const startY = Math.random() * (this.canvas.height / 2); // Top half only
        const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5; // ≈ 45 degrees
        const length = Math.random() * 100 + 50;
        const speed = Math.random() * 10 + 10;

        this.shootingStars.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: length,
            life: 1,
            decay: 0.01 + Math.random() * 0.02
        });
    }

    animate(timestamp) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Static Stars
        this.stars.forEach(star => {
            star.opacity += star.twinkleSpeed;
            if (star.opacity > 1 || star.opacity < 0) {
                star.twinkleSpeed *= -1;
            }

            this.ctx.fillStyle = `rgba(173, 82, 230, ${Math.abs(star.opacity)})`; // White stars for realism
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Shooting Stars
        if (!this.lastShootingStar || timestamp - this.lastShootingStar > this.shootingStarInterval) {
            if (Math.random() < 0.1) { // 10% chance per check after interval
                this.createShootingStar();
                this.lastShootingStar = timestamp;
                this.shootingStarInterval = Math.random() * 5000 + 2000;
            }
        }

        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            const s = this.shootingStars[i];

            s.x += s.vx;
            s.y += s.vy;
            s.life -= s.decay;

            if (s.life <= 0 || s.x > this.canvas.width || s.y > this.canvas.height) {
                this.shootingStars.splice(i, 1);
                continue;
            }

            // Draw tail
            const gradient = this.ctx.createLinearGradient(
                s.x, s.y,
                s.x - s.vx * 10, s.y - s.vy * 10 // Simulating length based on velocity
            );
            gradient.addColorStop(0, `rgba(255, 255, 255, ${s.life})`);
            gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(s.x, s.y);
            this.ctx.lineTo(s.x - s.vx * 3, s.y - s.vy * 3); // Trail length
            this.ctx.stroke();

            // Draw head
            this.ctx.fillStyle = `rgba(255, 255, 255, ${s.life})`;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = 'white';
        }
        this.ctx.shadowBlur = 0; // Reset

        requestAnimationFrame((t) => this.animate(t));
    }
}

// === Particle Explosion Effect ===
class ParticleExplosion {
    static explode(x, y, count = 20, container = document.body) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const angle = (Math.PI * 2 * i) / count;
            const velocity = Math.random() * 3 + 2;

            particle.style.position = 'fixed';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.borderRadius = '50%';
            particle.style.background = `rgba(173, 82, 230, ${Math.random()})`;
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';

            container.appendChild(particle);

            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            let life = 1;

            const animate = () => {
                const currentX = parseFloat(particle.style.left);
                const currentY = parseFloat(particle.style.top);

                particle.style.left = (currentX + vx) + 'px';
                particle.style.top = (currentY + vy) + 'px';
                particle.style.opacity = life;

                life -= 0.02;

                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    particle.remove();
                }
            };

            animate();
        }
    }
}

// === Confetti Effect ===
class ConfettiEffect {
    static celebrate(duration = 3000) {
        const colors = ['#ad52e6', '#ebb3ff', '#00f3ff', '#7000ff', '#2a1b5c']; // Violet/Cyan/Deep Blue
        const confettiCount = 100;
        const container = document.body;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size = Math.random() * 10 + 5;
                const left = Math.random() * 100;

                confetti.style.position = 'fixed';
                confetti.style.left = left + '%';
                confetti.style.top = '-10px';
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
                confetti.style.background = color;
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '10000';
                confetti.style.opacity = Math.random();

                container.appendChild(confetti);

                const fall = () => {
                    const currentTop = parseFloat(confetti.style.top);
                    const currentLeft = parseFloat(confetti.style.left);

                    confetti.style.top = (currentTop + Math.random() * 3 + 2) + 'px';
                    confetti.style.left = (currentLeft + (Math.random() - 0.5) * 2) + 'px';
                    confetti.style.transform = `rotate(${currentTop * 3}deg)`;

                    if (currentTop < window.innerHeight + 20) {
                        requestAnimationFrame(fall);
                    } else {
                        confetti.remove();
                    }
                };

                fall();
            }, i * (duration / confettiCount));
        }
    }
}

// === Matrix Rain Effect ===
class MatrixRain {
    constructor(container) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.columns = [];
        this.fontSize = 14;
        this.init();
    }

    init() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';

        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.resize();
        this.initColumns();
        this.animate();

        window.addEventListener('resize', () => {
            this.resize();
            this.initColumns();
        });
    }

    resize() {
        this.canvas.width = this.container.offsetWidth;
        this.canvas.height = this.container.offsetHeight;
    }

    initColumns() {
        const columnCount = Math.floor(this.canvas.width / this.fontSize);
        this.columns = Array(columnCount).fill(1);
    }

    animate() {
        this.ctx.fillStyle = 'rgba(10, 25, 47, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ad52e6'; // Violet Matrix
        this.ctx.font = this.fontSize + 'px monospace';

        this.columns.forEach((y, index) => {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            const x = index * this.fontSize;

            this.ctx.fillText(text, x, y * this.fontSize);

            if (y * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.columns[index] = 0;
            }

            this.columns[index]++;
        });

        setTimeout(() => requestAnimationFrame(() => this.animate()), 50);
    }
}

// === Initialize Particles ===
function initParticles(containerId = 'particles', options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`Container with id "${containerId}" not found`);
        return null;
    }

    return new ParticleSystem(container, options);
}

// === Export for use ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ParticleSystem,
        FloatingParticles,
        StarField,
        ParticleExplosion,
        ConfettiEffect,
        MatrixRain,
        initParticles
    };
}