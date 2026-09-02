document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Theme Toggle Logic
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    if (themeToggle) {
        // Check saved theme or system preference
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
        
        function setTheme(theme) {
            if (theme === 'dark') {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }
            localStorage.setItem('theme', theme);
        }
    }

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuToggle && mainNav) {
        const navLinks = mainNav.querySelectorAll('a');
        
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('active');
                mainNav.classList.remove('active');
            });
        });
    }

    // ==========================================
    // 3. Live Energy Flow Simulator
    // ==========================================
    const solarVal = document.getElementById('solar-value');
    const autarkyRing = document.getElementById('autarky-ring');
    
    if (solarVal && autarkyRing) {
        const timeButtons = document.querySelectorAll('.time-btn');
        const batteryVal = document.getElementById('battery-value');
        const batteryLbl = document.getElementById('battery-label');
        const houseVal = document.getElementById('house-value');
        const wallboxVal = document.getElementById('wallbox-value');
        const autarkyVal = document.getElementById('autarky-value');
        
        const pathSolar = document.getElementById('path-solar');
        const pathBattery = document.getElementById('path-battery');
        const pathHouse = document.getElementById('path-house');
        const pathWallbox = document.getElementById('path-wallbox');
        
        const simulatorStates = {
            mittag: {
                solar: '6.8 kW',
                battery: '2.4 kW',
                batteryLabel: 'Speicherladung',
                house: '2.6 kW',
                wallbox: '3.2 kW',
                autarky: 100,
                paths: {
                    solar: { active: true, reverse: false },
                    battery: { active: true, reverse: false }, // charging (towards battery)
                    house: { active: true, reverse: false },
                    wallbox: { active: true, reverse: false }
                }
            },
            abend: {
                solar: '0.2 kW',
                battery: '4.3 kW',
                batteryLabel: 'Speicherentladung',
                house: '4.5 kW',
                wallbox: '0.0 kW',
                autarky: 95,
                paths: {
                    solar: { active: true, reverse: false },
                    battery: { active: true, reverse: true }, // discharging (towards hub)
                    house: { active: true, reverse: false },
                    wallbox: { active: false, reverse: false }
                }
            },
            nacht: {
                solar: '0.0 kW',
                battery: '0.8 kW',
                batteryLabel: 'Speicherentladung',
                house: '0.8 kW',
                wallbox: '0.0 kW',
                autarky: 100,
                paths: {
                    solar: { active: false, reverse: false },
                    battery: { active: true, reverse: true }, // discharging (towards hub)
                    house: { active: true, reverse: false },
                    wallbox: { active: false, reverse: false }
                }
            },
            bewoelkt: {
                solar: '2.4 kW',
                battery: '0.2 kW',
                batteryLabel: 'Speicherladung',
                house: '2.2 kW',
                wallbox: '0.0 kW',
                autarky: 100,
                paths: {
                    solar: { active: true, reverse: false },
                    battery: { active: true, reverse: false }, // charging (towards battery)
                    house: { active: true, reverse: false },
                    wallbox: { active: false, reverse: false }
                }
            }
        };
        
        function updateSimulator(stateName) {
            const state = simulatorStates[stateName];
            if (!state) return;
            
            // Update Values text
            solarVal.textContent = state.solar;
            batteryVal.textContent = state.battery;
            batteryLbl.textContent = state.batteryLabel;
            houseVal.textContent = state.house;
            wallboxVal.textContent = state.wallbox;
            autarkyVal.textContent = `${state.autarky}%`;
            
            // Update Autarky Progress Ring
            const radius = 50;
            const circumference = 2 * Math.PI * radius; // ~314
            const offset = circumference * (1 - state.autarky / 100);
            autarkyRing.style.strokeDashoffset = offset;
            
            // Update SVG Paths animations and states
            updatePath(pathSolar, state.paths.solar);
            updatePath(pathBattery, state.paths.battery);
            updatePath(pathHouse, state.paths.house);
            updatePath(pathWallbox, state.paths.wallbox);
        }
        
        function updatePath(pathElement, pathState) {
            if (pathState.active) {
                pathElement.classList.add('path-active');
                if (pathState.reverse) {
                    pathElement.classList.add('path-reverse');
                } else {
                    pathElement.classList.remove('path-reverse');
                }
            } else {
                pathElement.classList.remove('path-active');
                pathElement.classList.remove('path-reverse');
            }
        }
        
        // Add Click Listeners to Time buttons
        timeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                timeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const timeState = btn.getAttribute('data-time');
                updateSimulator(timeState);
            });
        });
        
        // Initialize Simulator at Mittag if present on page
        updateSimulator('mittag');
    }

    // ==========================================
    // 4. Accordion Controller Helper (DUP-01)
    // ==========================================
    function setupAccordion({ triggerSelector, itemSelector, panelSelector, isExclusive = true, onToggle = null }) {
        const triggers = document.querySelectorAll(triggerSelector);
        if (!triggers.length) return;

        triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const currentItem = trigger.closest(itemSelector);
                if (!currentItem) return;
                const panel = currentItem.querySelector(panelSelector);
                const isActive = currentItem.classList.contains('active');

                if (isExclusive) {
                    document.querySelectorAll(itemSelector).forEach(item => {
                        item.classList.remove('active');
                        const p = item.querySelector(panelSelector);
                        if (p) p.style.maxHeight = null;
                        const t = item.querySelector(triggerSelector);
                        if (t && onToggle) onToggle(t, false);
                    });
                }

                if (isActive) {
                    currentItem.classList.remove('active');
                    if (panel) panel.style.maxHeight = null;
                    if (onToggle) onToggle(trigger, false);
                } else {
                    currentItem.classList.add('active');
                    if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
                    if (onToggle) onToggle(trigger, true);
                }
            });
        });
    }

    // FAQ Accordion (Exclusive single open)
    setupAccordion({
        triggerSelector: '.faq-trigger',
        itemSelector: '.faq-item',
        panelSelector: '.faq-panel',
        isExclusive: true
    });

    // Privacy (Datenschutz) Interactive Cards Accordion (Independent toggle)
    setupAccordion({
        triggerSelector: '.privacy-trigger',
        itemSelector: '.privacy-card-item',
        panelSelector: '.privacy-panel',
        isExclusive: false,
        onToggle: (trigger, isOpening) => {
            trigger.setAttribute('aria-expanded', isOpening ? 'true' : 'false');
        }
    });

    // Initialize open height for already active privacy cards on page load
    document.querySelectorAll('.privacy-card-item.active .privacy-panel').forEach(panel => {
        panel.style.maxHeight = panel.scrollHeight + "px";
    });

    // ==========================================
    // 5. Scroll Reveal Animations (Intersection Observer)
    // ==========================================
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animateElements.length > 0) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px',
            threshold: 0.15 // trigger when 15% of element is visible
        };
        
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Unobserve once animated
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animateElements.forEach(el => observer.observe(el));
    }

    // ==========================================
    // 6. Global Success Confirmation Modal Logic
    // ==========================================
    const successModal = document.getElementById('success-modal');
    const modalCloseBtn = document.getElementById('success-modal-close');
    const modalXClose = document.getElementById('modal-x-close');

    function openSuccessModal() {
        if (successModal) {
            successModal.classList.add('active');
            successModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSuccessModal() {
        if (successModal) {
            successModal.classList.remove('active');
            successModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeSuccessModal);
    if (modalXClose) modalXClose.addEventListener('click', closeSuccessModal);
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) closeSuccessModal();
        });
    }

    // ==========================================
    // 7. Form Submission Loading State Helper (DUP-02)
    // ==========================================
    function handleFormSubmitState(form, onComplete) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.innerHTML : '';
            
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Wird gesendet...';
            }
            
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                }
                form.reset();
                if (typeof onComplete === 'function') {
                    onComplete();
                }
                openSuccessModal();
            }, 800);
        });
    }

    // ==========================================
    // 8. Online Check Multi-step Questionnaire Logic
    // ==========================================
    const wizardForm = document.getElementById('online-check-form');
    if (wizardForm) {
        let currentStep = 1;
        const totalSteps = 5;
        const steps = wizardForm.querySelectorAll('.wizard-step');
        const stepLabel = document.getElementById('wizard-step-label');
        const percentageLabel = document.getElementById('wizard-percentage');
        const progressFill = document.getElementById('wizard-progress-fill');

        // Option cards selection toggle
        wizardForm.querySelectorAll('.option-card').forEach(card => {
            card.addEventListener('click', () => {
                const parentList = card.closest('.option-cards-list');
                if (!parentList) return;
                parentList.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                const radio = card.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });

        function updateWizardUI() {
            // Update steps visibility
            steps.forEach(step => {
                const stepNum = parseInt(step.getAttribute('data-step'), 10);
                if (stepNum === currentStep) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });

            // Update header progress
            const pct = (currentStep / totalSteps) * 100;
            if (stepLabel) stepLabel.textContent = `Frage ${currentStep} von ${totalSteps}`;
            if (percentageLabel) percentageLabel.textContent = `${pct}%`;
            if (progressFill) progressFill.style.width = `${pct}%`;
        }

        // Next buttons
        wizardForm.querySelectorAll('.wizard-next-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep < totalSteps) {
                    currentStep++;
                    updateWizardUI();
                }
            });
        });

        // Prev buttons
        wizardForm.querySelectorAll('.wizard-prev-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentStep > 1) {
                    currentStep--;
                    updateWizardUI();
                }
            });
        });

        // Submit form at Step 5 using shared helper
        handleFormSubmitState(wizardForm, () => {
            currentStep = 1;
            updateWizardUI();
        });
    }

    // ==========================================
    // 9. Lead & Contact Forms Handlers
    // ==========================================
    const allLeadForms = document.querySelectorAll('#lead-form, .about-lead-form');
    allLeadForms.forEach(form => {
        // Skip wizardForm if it shares an ID
        if (form !== wizardForm) {
            handleFormSubmitState(form);
        }
    });
});
