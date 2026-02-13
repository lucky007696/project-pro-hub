// ===============================================
// ProjectPro Hub - Advanced Animations JavaScript
// Handles scroll-triggered animations and interactive effects
// ===============================================

// === Intersection Observer for Scroll Animations ===
class AnimationObserver {
    constructor() {
        this.observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver(
            this.handleIntersection.bind(this),
            this.observerOptions
        );
        
        this.init();
    }
    
    init() {
        // Observe all elements with animation attributes
        const animatedElements = document.querySelectorAll('[data-aos]');
        animatedElements.forEach(el => {
            this.prepareElement(el);
            this.observer.observe(el);
        });
    }
    
    prepareElement(element) {
        // Set initial state
        element.style.opacity = '0';
        element.style.transition = `all ${element.dataset.duration || '0.6s'} ease`;
        
        // Apply initial transform based on animation type
        const animationType = element.dataset.aos;
        switch(animationType) {
            case 'fade-up':
            case 'slide-up':
                element.style.transform = 'translateY(30px)';
                break;
            case 'fade-down':
            case 'slide-down':
                element.style.transform = 'translateY(-30px)';
                break;
            case 'fade-left':
            case 'slide-left':
                element.style.transform = 'translateX(30px)';
                break;
            case 'fade-right':
            case 'slide-right':
                element.style.transform = 'translateX(-30px)';
                break;
            case 'zoom-in':
                element.style.transform = 'scale(0.8)';
                break;
            case 'zoom-out':
                element.style.transform = 'scale(1.2)';
                break;
            case 'flip-up':
                element.style.transform = 'perspective(1000px) rotateX(-90deg)';
                break;
            case 'flip-left':
                element.style.transform = 'perspective(1000px) rotateY(90deg)';
                break;
            default:
                element.style.transform = 'translateY(20px)';
        }
    }
    
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.animateElement(entry.target);
            } else if (entry.target.dataset.repeat === 'true') {
                this.resetElement(entry.target);
            }
        });
    }
    
    animateElement(element) {
        const delay = parseInt(element.dataset.delay) || 0;
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'none';
            
            // Add animated class
            element.classList.add('aos-animated');
            
            // Trigger custom callback if exists
            if (element.dataset.callback) {
                window[element.dataset.callback]?.(element);
            }
        }, delay);
    }
    
    resetElement(element) {
        element.style.opacity = '0';
        element.classList.remove('aos-animated');
        this.prepareElement(element);
    }
}

// === Counter Animation ===
class CounterAnimation {
    constructor(element) {
        this.element = element;
        this.target = parseInt(element.dataset.count);
        this.duration = parseInt(element.dataset.duration) || 2000;
        this.hasRun = false;
        this.init();
    }
    
    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasRun) {
                    this.animate();
                    this.hasRun = true;
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.element);
    }
    
    animate() {
        const increment = this.target / (this.duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < this.target) {
                this.element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                this.element.textContent = this.target;
                
                // Add completion class
                this.element.classList.add('counter-complete');
                
                // Optional: Add celebratory animation
                this.celebrate();
            }
        };
        
        updateCounter();
    }
    
    celebrate() {
        this.element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.element.style.transform = 'scale(1)';
        }, 300);
    }
}

// === Parallax Scroll Effect ===
class ParallaxEffect {
    constructor() {
        this.elements = document.querySelectorAll('[data-parallax]');
        this.init();
    }
    
    init() {
        if (this.elements.length === 0) return;
        
        window.addEventListener('scroll', () => {
            this.updateParallax();
        });
        
        this.updateParallax();
    }
    
    updateParallax() {
        const scrolled = window.pageYOffset;
        
        this.elements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
            const yPos = -(scrolled * speed);
            
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }
}

// === Staggered Animation ===
class StaggerAnimation {
    static animate(selector, delay = 100) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate-fade-in-up');
            }, index * delay);
        });
    }
}

// === Hover Tilt Effect ===
class TiltEffect {
    constructor(element) {
        this.element = element;
        this.maxTilt = parseInt(element.dataset.tiltMax) || 15;
        this.init();
    }
    
    init() {
        this.element.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.reset();
        });
    }
    
    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const tiltX = ((y - centerY) / centerY) * this.maxTilt;
        const tiltY = ((centerX - x) / centerX) * this.maxTilt;
        
        this.element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.05, 1.05, 1.05)`;
    }
    
    reset() {
        this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
}

// === Magnetic Button Effect ===
class MagneticButton {
    constructor(element) {
        this.element = element;
        this.strength = parseInt(element.dataset.magneticStrength) || 20;
        this.init();
    }
    
    init() {
        this.element.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.element.addEventListener('mouseleave', () => {
            this.reset();
        });
    }
    
    handleMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        const moveX = (x / rect.width) * this.strength;
        const moveY = (y / rect.height) * this.strength;
        
        this.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
    
    reset() {
        this.element.style.transform = 'translate(0, 0)';
    }
}

// === Text Reveal Animation ===
class TextReveal {
    constructor(element) {
        this.element = element;
        this.text = element.textContent;
        this.init();
    }
    
    init() {
        // Split text into spans
        this.element.innerHTML = this.text
            .split('')
            .map((char, index) => {
                return `<span style="opacity: 0; display: inline-block; transition: opacity 0.3s ${index * 0.03}s">${char === ' ' ? '&nbsp;' : char}</span>`;
            })
            .join('');
        
        // Observe and animate
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.reveal();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(this.element);
    }
    
    reveal() {
        const chars = this.element.querySelectorAll('span');
        chars.forEach(char => {
            char.style.opacity = '1';
        });
    }
}

// === Morphing Shapes Background ===
class MorphingShapes {
    constructor(container) {
        this.container = container;
        this.shapes = [];
        this.init();
    }
    
    init() {
        for (let i = 0; i < 5; i++) {
            this.createShape();
        }
        
        this.animate();
    }
    
    createShape() {
        const shape = document.createElement('div');
        shape.style.position = 'absolute';
        shape.style.width = Math.random() * 200 + 50 + 'px';
        shape.style.height = shape.style.width;
        shape.style.borderRadius = '50%';
        shape.style.background = `radial-gradient(circle, rgba(0, 212, 255, ${Math.random() * 0.3}) 0%, transparent 70%)`;
        shape.style.left = Math.random() * 100 + '%';
        shape.style.top = Math.random() * 100 + '%';
        shape.style.pointerEvents = 'none';
        shape.style.filter = 'blur(40px)';
        
        this.container.appendChild(shape);
        this.shapes.push({
            element: shape,
            x: parseFloat(shape.style.left),
            y: parseFloat(shape.style.top),
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }
    
    animate() {
        this.shapes.forEach(shape => {
            shape.x += shape.vx;
            shape.y += shape.vy;
            
            // Bounce off edges
            if (shape.x <= 0 || shape.x >= 100) shape.vx *= -1;
            if (shape.y <= 0 || shape.y >= 100) shape.vy *= -1;
            
            shape.element.style.left = shape.x + '%';
            shape.element.style.top = shape.y + '%';
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// === Ripple Effect on Click ===
class RippleEffect {
    static create(element) {
        element.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(0, 212, 255, 0.5)';
            ripple.style.pointerEvents = 'none';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    }
}

// === Smooth Scroll with Easing ===
class SmoothScroll {
    static scrollTo(target, duration = 1000) {
        const targetElement = document.querySelector(target);
        if (!targetElement) return;
        
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        const easeInOutQuad = (t) => {
            return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        };
        
        const animation = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };
        
        requestAnimationFrame(animation);
    }
}

// === Cursor Follow Effect ===
class CursorFollow {
    constructor() {
        this.cursor = this.createCursor();
        this.follower = this.createFollower();
        this.init();
    }
    
    createCursor() {
        const cursor = document.createElement('div');
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursor.style.borderRadius = '50%';
        cursor.style.background = '#00d4ff';
        cursor.style.position = 'fixed';
        cursor.style.pointerEvents = 'none';
        cursor.style.zIndex = '9999';
        cursor.style.transition = 'transform 0.1s';
        document.body.appendChild(cursor);
        return cursor;
    }
    
    createFollower() {
        const follower = document.createElement('div');
        follower.style.width = '40px';
        follower.style.height = '40px';
        follower.style.borderRadius = '50%';
        follower.style.border = '2px solid rgba(0, 212, 255, 0.5)';
        follower.style.position = 'fixed';
        follower.style.pointerEvents = 'none';
        follower.style.zIndex = '9998';
        follower.style.transition = 'transform 0.2s, width 0.2s, height 0.2s';
        document.body.appendChild(follower);
        return follower;
    }
    
    init() {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            this.cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
        });
        
        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            
            this.follower.style.transform = `translate(${followerX - 20}px, ${followerY - 20}px)`;
            requestAnimationFrame(animateFollower);
        };
        
        animateFollower();
        
        // Expand on hover over interactive elements
        const interactiveElements = document.querySelectorAll('a, button, [role="button"]');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.style.transform += ' scale(1.5)';
                this.follower.style.width = '60px';
                this.follower.style.height = '60px';
            });
            
            el.addEventListener('mouseleave', () => {
                this.cursor.style.transform = this.cursor.style.transform.replace(' scale(1.5)', '');
                this.follower.style.width = '40px';
                this.follower.style.height = '40px';
            });
        });
    }
}

// === Initialize All Animations ===
function initAnimations() {
    // Initialize scroll animations
    new AnimationObserver();
    
    // Initialize counters
    document.querySelectorAll('[data-count]').forEach(counter => {
        new CounterAnimation(counter);
    });
    
    // Initialize parallax
    new ParallaxEffect();
    
    // Initialize tilt effects
    document.querySelectorAll('[data-tilt]').forEach(element => {
        new TiltEffect(element);
    });
    
    // Initialize magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach(button => {
        new MagneticButton(button);
    });
    
    // Initialize text reveals
    document.querySelectorAll('[data-text-reveal]').forEach(text => {
        new TextReveal(text);
    });
    
    // Initialize ripple effect on buttons
    document.querySelectorAll('button, .btn-primary, .btn-secondary').forEach(button => {
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        RippleEffect.create(button);
    });
    
    // Optional: Custom cursor (uncomment if desired)
    // new CursorFollow();
    
    console.log('🎨 All animations initialized!');
}

// === Export for use in other files ===
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationObserver,
        CounterAnimation,
        ParallaxEffect,
        StaggerAnimation,
        TiltEffect,
        MagneticButton,
        TextReveal,
        MorphingShapes,
        RippleEffect,
        SmoothScroll,
        CursorFollow,
        initAnimations
    };
}

// === Auto-initialize on DOM ready ===
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimations);
} else {
    initAnimations();
}