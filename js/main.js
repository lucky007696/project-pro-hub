// ===============================================
// ProjectPro Hub - Main JavaScript
// All interactive functionality and animations
// ===============================================

// === Global Variables ===
let currentTestimonial = 0;
let isFormSubmitted = false;

// === Notification Function ===
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageEl = document.getElementById('notification-message');
    const iconEl = document.getElementById('notification-icon');

    messageEl.textContent = message;
    notification.className = `notification ${type} show`;
    iconEl.textContent = type === 'success' ? '✓' : '✕';

    // Auto-hide after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// === DOM Content Loaded ===
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// === Initialize Application ===
function initializeApp() {
    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);

    // Initialize all features
    initNavigation();
    initHeroTyping();
    initParticles();
    initScrollAnimations();
    initProjectFilters();
    initTrainingTabs();
    initTestimonialSlider();
    initFAQ();
    initContactForm();
    initBulkQuoteModal();
    initHireModal();
    initSessionModal();
    initPolicyModal();
    initCounters();
    initProgressBar();
    initTiltEffect();
    initAuthModal();
    loadProjects();
    loadCourses();
}

// === Helper: Get API URL ===
function getApiUrl(endpoint) {
    // Determine if running locally or in production
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Use localhost:3000 for local dev, otherwise use relative path (which uses current origin)
    return isLocal ? `http://localhost:3000${endpoint}` : endpoint;
}

// === Dynamic Content Loading ===

async function loadProjects() {
    try {
        const url = getApiUrl('/api/projects');
        const response = await fetch(url);
        const data = await response.json();

        if (!data.projects || data.projects.length === 0) return; // Keep static if no data

        const container = document.querySelector('.projects-grid');
        // Filter out static items that are NOT part of the structure (optional: clear all)
        // For now, let's clear all static items to avoid duplicates
        container.innerHTML = '';

        data.projects.forEach((project, index) => {
            const delay = index * 100;
            const card = document.createElement('div');
            card.className = `project-card ${project.featured ? 'featured-highlight' : ''}`;
            card.dataset.category = project.category;
            card.dataset.aos = 'zoom-in';
            card.dataset.delay = delay;

            card.innerHTML = `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}">
                    <div class="project-overlay">
                        ${project.link && project.link !== '#' ? `<a href="${project.link}" target="_blank" class="quick-view-btn">Visit Site</a>` : ''}
                    </div>
                    ${project.badge ? `<div class="project-badge">${project.badge}</div>` : ''}
                </div>
                <div class="project-info">
                    <div class="project-header-row">
                        <h3 class="project-title">${project.title}</h3>
                        ${project.featured ? '<span class="status-tag">Featured</span>' : ''}
                    </div>
                    <div class="tech-stack">
                        ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                    </div>
                    <p class="project-desc">${project.description}</p>
                    <div class="project-actions">
                        <a href="${project.link || '#contact'}" class="btn-primary">${project.link && project.link !== '#' ? 'Visit Site' : 'Buy Project'}</a>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Re-init filters for new elements
        initProjectFilters();

    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

async function loadCourses() {
    try {
        const url = getApiUrl('/api/courses');
        const response = await fetch(url);
        const data = await response.json();

        if (!data.courses || data.courses.length === 0) return;

        // Group by level (case-insensitive)
        const beginnerCourses = data.courses.filter(c => (c.level || '').toLowerCase() === 'beginner');
        const intermediateCourses = data.courses.filter(c => (c.level || '').toLowerCase() === 'intermediate');
        const advancedCourses = data.courses.filter(c => (c.level || '').toLowerCase() === 'advanced');

        // Helper to render grid
        const renderGrid = (courses, containerClass) => {
            const container = document.querySelector(containerClass);
            // The container structure is a bit complex in HTML (tabs -> tracks -> grid).
            // We need to find the .courses-grid inside the correct track.

            // Wait, simple approach: Find the specific track content by data attribute
            // Beginner: data-track-content="beginner" -> .courses-grid
        };

        const updateTrack = (level, courses) => {
            const track = document.querySelector(`.training-track[data-track-content="${level}"] .courses-grid`);
            if (!track) return;
            track.innerHTML = ''; // Clear static

            courses.forEach((course, index) => {
                const card = document.createElement('div');
                card.className = 'course-card';
                card.dataset.aos = 'slide-right';
                card.dataset.delay = index * 100;

                card.innerHTML = `
                    <div class="course-level ${course.level === 'intermediate' ? 'intermediate-level' : course.level === 'advanced' ? 'advanced-level' : ''}">
                        ${course.badge || (course.level.charAt(0).toUpperCase() + course.level.slice(1))}
                    </div>
                    <h3 class="course-title">${course.title}</h3>
                    <p class="course-description">${course.description}</p>
                    <div class="course-meta">
                        <span class="course-duration">⏱️ ${course.duration}</span>
                    </div>
                    ${course.features && course.features.length > 0 ? `
                    <div class="course-outcomes">
                        <strong>You'll Build:</strong>
                        <ul>
                            ${course.features.map(f => `<li>${f}</li>`).join('')}
                        </ul>
                    </div>` : ''}
                    <button class="course-enroll-btn open-session-modal" data-session-type="${course.sessionType}">Start Learning</button>
                    <div class="cta-note">No payments here — book a free demo</div>
                `;
                track.appendChild(card);
            });
        };

        if (beginnerCourses.length > 0) updateTrack('beginner', beginnerCourses);
        if (intermediateCourses.length > 0) updateTrack('intermediate', intermediateCourses);
        if (advancedCourses.length > 0) updateTrack('advanced', advancedCourses);

        // Populate All Tab
        if (data.courses.length > 0) updateTrack('all', data.courses);

    } catch (error) {
        console.error('Failed to load courses:', error);
    }
}

// === Auth Modal Logic ===
function initAuthModal() {
    const modal = document.getElementById('auth-modal');
    const loginBtns = document.querySelectorAll('.login-btn');
    const registerBtns = document.querySelectorAll('.register-btn'); // Handles navigation and hero buttons if any
    const closeBtn = modal.querySelector('.modal-close');
    const backdrop = document.querySelector('.modal-backdrop');
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    if (!modal) return;

    // Open Modal Function
    function openModal(mode = 'login') {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Switch to correct tab
        const targetTab = document.querySelector(`.auth-tab[data-target="${mode}-form"]`);
        if (targetTab) targetTab.click();
    }

    // Close Modal Function
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Event Listeners for Open
    loginBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('login');
        });
    });

    registerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal('register');
        });
    });

    // Event Listeners for Close
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // Tab Switching Logic
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => {
                f.classList.remove('active');
                f.style.display = 'none'; // Ensure display is toggled off
            });

            // Activate clicked
            tab.classList.add('active');
            const targetId = tab.dataset.target;
            const targetForm = document.getElementById(targetId);

            if (targetForm) {
                targetForm.style.display = 'block';
                // Trigger reflow for animation
                void targetForm.offsetWidth;
                targetForm.classList.add('active');
            }
        });
    });

    // === Backend API Logic ===

    // Form Handling
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = form.querySelector('.auth-submit');
            const originalText = btn.textContent;
            const isLogin = form.id === 'login-form';

            btn.textContent = 'Processing...';
            btn.disabled = true;

            try {
                let response;
                let data;

                if (isLogin) {
                    const identifierInput = form.querySelector('input[type="text"]');
                    const passwordInput = form.querySelector('input[type="password"]');
                    const url = getApiUrl('/api/login');

                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            identifier: identifierInput.value,
                            password: passwordInput.value
                        })
                    });
                } else {
                    const nameInput = form.querySelector('input[type="text"]');
                    const mobileInput = form.querySelectorAll('input[type="tel"]')[0];
                    const emailInput = form.querySelector('input[type="email"]');
                    const passwordInput = form.querySelector('input[type="password"]');
                    const url = getApiUrl('/api/register');

                    response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: nameInput.value,
                            mobile: mobileInput.value,
                            email: emailInput.value,
                            password: passwordInput.value
                        })
                    });
                }

                data = await response.json();

                if (response.ok) {
                    const message = isLogin ? 'Login successfully!' : 'Register successfully!';
                    showNotification(message, 'success');
                    localStorage.setItem('pph_currentUser', JSON.stringify(data.user));

                    setTimeout(() => {
                        closeModal();
                        updateAuthUI(data.user);
                        form.reset();
                    }, 1500);
                } else {
                    showNotification(data.error || 'An error occurred', 'error');
                }

            } catch (error) {
                console.error('Auth error:', error);
                // Detailed error
                showNotification(`Connection error: ${error.message}`, 'error');
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    });

    // Update UI based on auth state
    function updateAuthUI(user) {
        if (!user) return;

        // Hide Login/Register buttons
        loginBtns.forEach(btn => btn.style.display = 'none');
        registerBtns.forEach(btn => btn.style.display = 'none');

        const navLinks = document.getElementById('navLinks');

        // Check if profile link already exists
        if (!document.getElementById('profile-link')) {
            const profileLink = document.createElement('a');
            profileLink.href = 'profile.html';
            profileLink.className = 'nav-link nav-btn register-btn'; // Re-use style
            profileLink.id = 'profile-link';
            profileLink.innerHTML = `👤 ${user.name.split(' ')[0]}`;
            profileLink.style.background = 'linear-gradient(135deg, #00d4ff 0%, #0056b3 100%)'; // Distinct style

            // Insert before blog link
            const blogLink = document.querySelector('.blog-link');
            if (navLinks && blogLink) navLinks.insertBefore(profileLink, blogLink);
        }
    }

    // Check auth on load
    const savedUser = localStorage.getItem('pph_currentUser');
    if (savedUser) {
        try {
            updateAuthUI(JSON.parse(savedUser));
        } catch (e) {
            localStorage.removeItem('pph_currentUser');
        }
    }
}

// === Navigation ===
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking link
    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active link on scroll
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// === Hire Modal ===
function initHireModal() {
    const modal = document.getElementById('hire-modal');
    if (!modal) return;

    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtns = modal.querySelectorAll('.hire-modal-close');
    const openBtns = document.querySelectorAll('.open-hire-modal');
    const form = document.getElementById('hire-form');

    function openModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    openBtns.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
    closeBtns.forEach(b => b.addEventListener('click', closeModal));
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

    // Submit form to backend
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const data = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            message: form.message.value
        };

        try {
            const res = await fetch('/api/hires', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();
            if (res.ok) {
                showNotification('Request sent — I will reach out soon', 'success');
                form.reset();
                setTimeout(() => closeModal(), 1000);
            } else {
                showNotification(json.error || 'Failed to send request', 'error');
            }
        } catch (err) {
            console.error('Hire submit error', err);
            showNotification('Server error. Is the server running?', 'error');
        } finally {
            btn.textContent = original;
            btn.disabled = false;
        }
    });
}

// === Hero Typing Effect ===
function initHeroTyping() {
    const words = ['BTech Journey', 'Career Path', 'Project Skills', 'Future'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedElement = document.querySelector('.typed-text');

    function type() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            typedElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentWord.length) {
            setTimeout(() => {
                isDeleting = true;
            }, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
        }

        const typingSpeed = isDeleting ? 50 : 100;
        setTimeout(type, typingSpeed);
    }

    type();
}

// === Particles Background ===
// === Particles Background ===
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (particlesContainer && typeof StarField !== 'undefined') {
        // Initialize StarField with shooting stars
        // We use a lower density because we have a background image now
        new StarField(particlesContainer, 60);
    } else {
        // Fallback for simple particles if StarField class is missing
        const particleCount = 50;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = Math.random() * 3 + 1 + 'px';
            particle.style.height = particle.style.width;
            particle.style.background = 'rgba(255, 255, 255, 0.5)';
            particle.style.borderRadius = '50%';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.pointerEvents = 'none';
            particle.style.animation = `particleFloat ${Math.random() * 20 + 10}s ${Math.random() * 5}s infinite`;
            particlesContainer.appendChild(particle);
        }
    }
}

// === Scroll Animations ===
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';

                // Add delay for staggered animations
                const delay = entry.target.dataset.delay || 0;
                entry.target.style.transitionDelay = delay + 'ms';
            }
        });
    }, observerOptions);

    // Observe all elements with data-aos attribute
    document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// === Project Filters ===
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            projectCards.forEach(card => {
                const category = card.dataset.category;

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Quick view buttons - Links work normally via href attribute
}

// === Training Tabs ===
function initTrainingTabs() {
    const tabs = document.querySelectorAll('.training-tab');
    const tracks = document.querySelectorAll('.training-track');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and tracks
            tabs.forEach(t => t.classList.remove('active'));
            tracks.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Show corresponding track
            const trackName = tab.dataset.track;
            const track = document.querySelector(`[data-track-content="${trackName}"]`);
            if (track) {
                track.classList.add('active');
            }
        });
    });
}

// === Testimonial Slider ===
function initTestimonialSlider() {
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const dots = document.querySelectorAll('.dot');
    const testimonials = document.querySelectorAll('.testimonial-card');

    if (!prevBtn || !nextBtn) return;

    function showTestimonial(index) {
        // This is simplified - in production, you'd implement actual sliding
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    prevBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial - 1 + testimonials.length) % testimonials.length;
        showTestimonial(currentTestimonial);
    });

    nextBtn.addEventListener('click', () => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentTestimonial = index;
            showTestimonial(currentTestimonial);
        });
    });

    // Auto-slide every 5 seconds
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

// === FAQ Accordion ===
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

// === Contact Form ===
function initContactForm() {
    const form = document.getElementById('contactForm');
    const formContainer = document.querySelector('.contact-form-container');
    const successMessage = document.getElementById('formSuccess');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isFormSubmitted) return;

        // Get form data
        const formData = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            sessionType: form.sessionType.value,
            sessionMessage: form.sessionMessage.value,
            bookedAt: new Date().toISOString()
        };

        // Simulate form submission
        const submitBtn = form.querySelector('.form-submit-btn');
        submitBtn.textContent = 'Booking...';
        submitBtn.disabled = true;

        try {
            // Save to sessions database
            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                isFormSubmitted = true;
                form.style.display = 'none';
                successMessage.classList.add('show');

                // Log form data
                console.log('Session booked successfully:', data);
                showNotification('Session booked successfully!', 'success');

                // Reset after 5 seconds
                setTimeout(() => {
                    form.reset();
                    form.style.display = 'block';
                    successMessage.classList.remove('show');
                    submitBtn.textContent = 'Book Session';
                    submitBtn.disabled = false;
                    isFormSubmitted = false;
                }, 5000);
            } else {
                throw new Error(data.error || 'Failed to book session');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showNotification('Error: ' + error.message, 'error');

            // Fallback: Save to local storage if server is unavailable
            let existingSessions = JSON.parse(localStorage.getItem('sessions') || '[]');
            existingSessions.push(formData);
            localStorage.setItem('sessions', JSON.stringify(existingSessions));

            isFormSubmitted = true;
            form.style.display = 'none';
            successMessage.classList.add('show');

            console.log('Session saved to localStorage (server unavailable):', formData);

            // Reset after 5 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                successMessage.classList.remove('show');
                submitBtn.textContent = 'Book Session';
                submitBtn.disabled = false;
                isFormSubmitted = false;
            }, 5000);
        }
    });
}

// === Session Modal (re-uses the contact form DOM) ===
function initSessionModal() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Build modal DOM
    const modal = document.createElement('div');
    modal.id = 'session-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close session-modal-close" aria-label="Close">✕</button>
            <div class="modal-header">
                <h3>Book Your Free Live Session</h3>
                <p>Schedule a personalized consultation with our experts</p>
            </div>
            <div id="session-modal-body"></div>
        </div>
    `;

    document.body.appendChild(modal);

    const modalBody = modal.querySelector('#session-modal-body');
    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.session-modal-close');

    // Keep references for moving form back
    let originalParent = contactForm.parentElement;
    let originalNext = contactForm.nextSibling;

    function openModal(prefillType) {
        // move contact form into modal body
        modalBody.appendChild(contactForm);
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';

        // prefill sessionType if provided
        if (prefillType) {
            const sel = contactForm.querySelector('[name="sessionType"]');
            if (sel) sel.value = prefillType;
        }

        // focus first input
        setTimeout(() => {
            const nameInput = contactForm.querySelector('[name="name"]');
            if (nameInput) nameInput.focus();
        }, 50);
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';

        // move the form back to original location
        if (originalNext) originalParent.insertBefore(contactForm, originalNext);
        else originalParent.appendChild(contactForm);
    }

    // Open handlers for hero CTA and course buttons
    document.querySelectorAll('.open-session-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const type = btn.dataset.sessionType || '';
            openModal(type);
        });
    });

    // Also handle course-enroll buttons via delegation (in case of dynamically added items)
    document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('course-enroll-btn')) {
            e.preventDefault();
            const type = e.target.dataset.sessionType || 'training-demo';
            openModal(type);
        }
    });

    // Close modal listeners
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
}

// === Bulk Quote Modal ===
function initBulkQuoteModal() {
    const modal = document.getElementById('bulk-quote-modal');
    if (!modal) return;

    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtns = modal.querySelectorAll('.bulk-modal-close');
    const openBtns = document.querySelectorAll('.get-bulk-quote-btn');
    const form = document.getElementById('bulk-quote-form');

    function openModal() {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    openBtns.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
    closeBtns.forEach(b => b.addEventListener('click', closeModal));
    backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const original = btn.textContent;
        btn.textContent = 'Sending...';
        btn.disabled = true;

        const payload = {
            name: form.name.value,
            email: form.email.value,
            phone: form.phone.value,
            organization: form.organization.value || '',
            count: parseInt(form.count.value, 10) || 1,
            requirements: form.requirements.value,
            requestedAt: new Date().toISOString()
        };

        try {
            const res = await fetch('http://localhost:3000/api/bulk-quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (res.ok) {
                showNotification('Bulk quote request submitted!', 'success');
                form.reset();
                setTimeout(() => closeModal(), 1000);
            } else {
                showNotification(json.error || 'Failed to submit', 'error');
            }
        } catch (err) {
            console.error('Bulk quote submit error', err);
            showNotification('Server error. Is the server running?', 'error');
        } finally {
            btn.textContent = original;
            btn.disabled = false;
        }
    });
}

// === Policy Modal ===
function initPolicyModal() {
    const policyLinks = document.querySelectorAll('.policy-link');
    if (!policyLinks.length) return;

    // Policy contents map
    const policies = {
        privacy: {
            title: 'Privacy Policy',
            body: `We respect your privacy. ProjectPro Hub collects only the information you provide when booking sessions or registering (name, email, phone). We use this data to respond to requests, schedule sessions, and improve services. We do not sell personal data. Stored session and user data are kept in local JSON files for this demo; in production we'd use a secure database and follow best practices including encryption and access control.`
        },
        terms: {
            title: 'Terms of Service',
            body: `By using ProjectPro Hub you agree to engage in honest and lawful interactions. Our services include selling projects, training, and mentorship; specific terms (deliverables, timelines, and payments) are agreed during direct communication or booking sessions. We reserve the right to refuse service for misuse or policy violations.`
        },
        refund: {
            title: 'Refund Policy',
            body: `We offer a 7-day money-back guarantee on eligible courses and projects where applicable. Custom work and support services may be non-refundable — refund eligibility is assessed case-by-case. To request a refund, contact support with your order details and reason.`
        },
        academic: {
            title: 'Academic Integrity',
            body: `Projects and course materials are provided for learning and guidance. Students must follow their institutions' academic integrity policies. Our projects are for reference and learning — submitting work that violates your institution's rules is your responsibility. We encourage original work and provide mentoring to help you learn.`
        },
        cookie: {
            title: 'Cookie Policy',
            body: `This site uses minimal cookies for session and preference handling in the demo. No tracking cookies or third-party analytics are enabled by default. In production, cookies would be disclosed and consent obtained as required by applicable law.`
        }
    };

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'policy-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-backdrop"></div>
        <div class="modal-content">
            <button class="modal-close policy-modal-close" aria-label="Close">✕</button>
            <div class="modal-header"><h3 id="policy-title"></h3></div>
            <div class="policy-body" id="policy-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const backdrop = modal.querySelector('.modal-backdrop');
    const closeBtn = modal.querySelector('.policy-modal-close');
    const titleEl = modal.querySelector('#policy-title');
    const bodyEl = modal.querySelector('#policy-body');

    function openPolicy(key) {
        const p = policies[key];
        if (!p) return;
        titleEl.textContent = p.title;
        bodyEl.textContent = p.body;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closePolicy() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    policyLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.dataset.policy;
            openPolicy(key);
        });
    });

    backdrop.addEventListener('click', closePolicy);
    closeBtn.addEventListener('click', closePolicy);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closePolicy(); });
}

// === Animated Counters ===
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let started = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.count);
                    const duration = 2000;
                    const increment = target / (duration / 16);
                    let current = 0;

                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counter.textContent = Math.floor(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };

                    updateCounter();
                });
            }
        });
    }, { threshold: 0.1 });

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        observer.observe(statsSection);
    }
}

// === Progress Bar ===
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// === Smooth Scroll ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// === Button Click Handlers ===
document.addEventListener('click', (e) => {
    // View Details buttons (only BUTTON elements; anchors navigate to detail pages)
    if (e.target.tagName === 'BUTTON' && e.target.classList.contains('btn-secondary') && e.target.textContent.trim() === 'View Details') {
        e.preventDefault();
        alert('Project details page would open here. This is a demo.');
    }

    // Buy Now buttons
    if (e.target.classList.contains('btn-primary') && e.target.textContent === 'Buy Now') {
        e.preventDefault();
        alert('Checkout page would open here. This is a demo.');
    }

    // Enroll buttons - redirect to contact/booking section
    if (e.target.classList.contains('course-enroll-btn')) {
        e.preventDefault();
        document.location = '#contact';
    }

    // Bundle buttons (show demo alert) — skip if this is the bulk-quote CTA
    if ((e.target.classList.contains('bundle-cta') || e.target.classList.contains('cta-outline-btn')) && !e.target.classList.contains('get-bulk-quote-btn')) {
        e.preventDefault();
        alert('This would navigate to the relevant page. This is a demo.');
    }
});

// === Newsletter Form ===
document.querySelector('.newsletter-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value;
    alert(`Thank you for subscribing with ${email}! This is a demo.`);
    e.target.reset();
});

// === 3D Tilt Effect ===
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .service-card');

    cards.forEach(card => {
        card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease'; // Fast transform for smoothness

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation
            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
            card.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            card.style.zIndex = '1';
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease'; // Reset transition
            }, 100);
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease, box-shadow 0.3s ease';
        });
    });
}

// === Utility Functions ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === Performance Optimization ===
// Lazy load images when they come into view
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
});

// === Console Message ===
console.log('%cProjectPro Hub', 'font-size: 24px; font-weight: bold; color: #00d4ff;');
console.log('%cBuilt with ❤️ for BTech Students', 'font-size: 14px; color: #94a3b8;');
console.log('%cWebsite by ProjectPro Hub Team', 'font-size: 12px; color: #64748b;');