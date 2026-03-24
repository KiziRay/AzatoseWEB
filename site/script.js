let introSequenceRunning = false;

function initClientProtection() {
    const blockedHotkeys = new Set(['KeyU', 'KeyS', 'KeyP', 'KeyC', 'KeyX', 'KeyA']);

    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    document.addEventListener('copy', (event) => {
        event.preventDefault();
    });

    document.addEventListener('cut', (event) => {
        event.preventDefault();
    });

    document.addEventListener('paste', (event) => {
        event.preventDefault();
    });

    document.addEventListener('selectstart', (event) => {
        event.preventDefault();
    });

    document.addEventListener('dragstart', (event) => {
        event.preventDefault();
    });

    window.addEventListener('keydown', (event) => {
        const isCtrlCombo = event.ctrlKey && blockedHotkeys.has(event.code);
        const isDevtoolsCombo =
            event.key === 'F12' ||
            (event.ctrlKey && event.shiftKey && ['KeyI', 'KeyJ', 'KeyC'].includes(event.code));

        if (!isCtrlCombo && !isDevtoolsCombo) return;
        event.preventDefault();
        event.stopPropagation();
    }, true);
}

function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    const particleCount = 42;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.size = Math.random() * 2 + 0.8;
            this.speedX = Math.random() * 0.24 - 0.12;
            this.speedY = Math.random() * 0.24 - 0.12;
            this.opacity = Math.random() * 0.22 + 0.08;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width + 20) this.x = -20;
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.y > canvas.height + 20) this.y = -20;
            if (this.y < -20) this.y = canvas.height + 20;
        }

        draw() {
            ctx.fillStyle = `rgba(142, 95, 64, ${this.opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    resizeCanvas();

    for (let i = 0; i < particleCount; i += 1) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
            particle.update();
            particle.draw();

            for (let j = index + 1; j < particles.length; j += 1) {
                const peer = particles[j];
                const dx = particle.x - peer.x;
                const dy = particle.y - peer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    ctx.strokeStyle = `rgba(142, 95, 64, ${0.06 * (1 - distance / 120)})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(peer.x, peer.y);
                    ctx.stroke();
                }
            }
        });

        window.requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', resizeCanvas);
}

function initSakura() {
    const canvas = document.getElementById('sakura');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const petals = [];
    const petalCount = 22;
    const palette = [
        'rgba(255, 228, 236, 0.72)',
        'rgba(255, 214, 226, 0.68)',
        'rgba(255, 238, 244, 0.64)'
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Petal {
        constructor(resetFromTop = false) {
            this.reset(resetFromTop);
        }

        reset(resetFromTop = false) {
            this.x = Math.random() * window.innerWidth;
            this.y = resetFromTop
                ? -30 - Math.random() * window.innerHeight * 0.3
                : Math.random() * window.innerHeight;
            this.size = 8 + Math.random() * 12;
            this.speedY = 0.55 + Math.random() * 1.1;
            this.speedX = -0.4 + Math.random() * 0.8;
            this.swing = Math.random() * Math.PI * 2;
            this.swingSpeed = 0.01 + Math.random() * 0.02;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = -0.01 + Math.random() * 0.02;
            this.opacity = 0.3 + Math.random() * 0.4;
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update() {
            this.swing += this.swingSpeed;
            this.rotation += this.rotationSpeed;
            this.x += this.speedX + Math.sin(this.swing) * 0.55;
            this.y += this.speedY;

            if (this.y > canvas.height + 30 || this.x < -40 || this.x > canvas.width + 40) {
                this.reset(true);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.scale(this.size / 18, this.size / 18);
            ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.opacity})`);
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.bezierCurveTo(7, -10, 10, -2, 0, 10);
            ctx.bezierCurveTo(-10, -2, -7, -10, 0, -8);
            ctx.fill();
            ctx.restore();
        }
    }

    resizeCanvas();

    for (let i = 0; i < petalCount; i += 1) {
        petals.push(new Petal());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach((petal) => {
            petal.update();
            petal.draw();
        });
        window.requestAnimationFrame(animate);
    }

    animate();
    window.addEventListener('resize', resizeCanvas);
}

function initReveal() {
    const revealTargets = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.16 });

    revealTargets.forEach((element) => observer.observe(element));
}

function syncActiveSlide(swiper, options = {}) {
    const { animate = true } = options;
    const slides = document.querySelectorAll('.page-slide');
    slides.forEach((slide) => slide.classList.remove('is-current', 'is-entering'));

    const activeSlide = swiper?.slides?.[swiper.activeIndex];
    if (activeSlide) {
        activeSlide.classList.add('is-current');
        if (animate) {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    activeSlide.classList.add('is-entering');
                });
            });
        }
    } else if (slides[0]) {
        slides[0].classList.add('is-current');
        if (animate) {
            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => {
                    slides[0].classList.add('is-entering');
                });
            });
        }
    }
}

function initSwiper() {
    if (typeof Swiper === 'undefined') return null;

    const swiper = new Swiper('.site-swiper', {
        direction: 'horizontal',
        loop: true,
        speed: 920,
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: true,
        resistanceRatio: 0.4,
        keyboard: {
            enabled: true
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        }
    });

    syncActiveSlide(swiper);
    swiper.on('slideChangeTransitionStart', () => {
        syncActiveSlide(swiper);
    });

    return swiper;
}

function initWheelNavigation(swiper) {
    if (!swiper || !swiper.el) return;

    let wheelLocked = false;
    let wheelBuffer = 0;
    let bufferTimer = null;

    swiper.el.addEventListener('wheel', (event) => {
        if (introSequenceRunning) {
            event.preventDefault();
            return;
        }

        if (document.getElementById('partner-modal')?.hidden === false) {
            event.preventDefault();
            return;
        }

        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

        event.preventDefault();

        if (wheelLocked) return;

        wheelBuffer += event.deltaY;
        window.clearTimeout(bufferTimer);
        bufferTimer = window.setTimeout(() => {
            wheelBuffer = 0;
        }, 140);

        if (Math.abs(wheelBuffer) < 42) return;

        wheelLocked = true;

        if (wheelBuffer > 0) {
            swiper.slideNext();
        } else {
            swiper.slidePrev();
        }

        wheelBuffer = 0;
        window.setTimeout(() => {
            wheelLocked = false;
        }, 900);
    }, { passive: false });
}

function lockVerticalScroll() {
    const blockedKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'];

    window.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.preventDefault();
        }
    }, { passive: false });

    window.addEventListener('keydown', (event) => {
        if (!blockedKeys.includes(event.code)) return;
        event.preventDefault();
    });
}

function copyDiscord() {
    const discordId = 'SakuLaLoIn';
    const onSuccess = () => {};

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(discordId).then(onSuccess).catch((error) => {
            console.error('Failed to copy Discord ID:', error);
        });
        return;
    }

    const helper = document.createElement('textarea');
    helper.value = discordId;
    helper.setAttribute('readonly', '');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();

    try {
        document.execCommand('copy');
        onSuccess();
    } catch (error) {
        console.error('Fallback copy failed:', error);
    } finally {
        document.body.removeChild(helper);
    }
}

function initUIActions() {
    const discordCopyTrigger = document.getElementById('discord-copy-trigger');
    const partnerTrigger = document.getElementById('partner-trigger');
    const partnerBackdrop = document.getElementById('partner-backdrop');
    const partnerClose = document.getElementById('partner-close');

    discordCopyTrigger?.addEventListener('click', copyDiscord);
    partnerTrigger?.addEventListener('click', () => togglePartnerModal(true));
    partnerBackdrop?.addEventListener('click', () => togglePartnerModal(false));
    partnerClose?.addEventListener('click', () => togglePartnerModal(false));
}

window.copyDiscord = copyDiscord;

function togglePartnerModal(shouldOpen) {
    const modal = document.getElementById('partner-modal');
    const trigger = document.getElementById('partner-trigger');
    if (!modal || !trigger) return;

    trigger.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');

    if (shouldOpen) {
        modal.hidden = false;
        window.requestAnimationFrame(() => {
            modal.classList.add('is-open');
        });
        return;
    }

    modal.classList.remove('is-open');
    window.setTimeout(() => {
        if (!modal.classList.contains('is-open')) {
            modal.hidden = true;
        }
    }, 240);
}

window.togglePartnerModal = togglePartnerModal;

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function typeText(target, text, speed = 84) {
    if (!target) return;
    target.textContent = '';

    for (const char of text) {
        target.textContent += char;
        await wait(speed);
    }
}

async function runIntroSequence(swiper) {
    const line1Text = '\u5728\u751f\u6d3b\u8ddf\u61f6\u60f0\u4e4b\u9593\u9078\u64c7\u4e86\u5168\u90fd\u8981\u3002';
    const brandText = 'Azatose';
    const line2Text = '\u628a\u82e6\u5dee\u4e8b\u90fd\u4e1f\u7d66\u6211\u505a\u5427\uff0c\u627f\u63a5\u624b\u904a\u4ee3\u809d\u670d\u52d9\u3002';
    const totalDuration = 4000;
    const line1End = 1500;
    const revealStart = 1500;
    const brandingStart = 2200;
    const line2Start = 2300;
    const siteVisibleStart = 3450;
    const introLine1 = document.getElementById('intro-line-1');
    const introLine1Caret = document.getElementById('intro-line-1-caret');
    const introBrand = document.getElementById('intro-brand');
    const introLine2 = document.getElementById('intro-line-2');
    const introLine2Caret = document.getElementById('intro-line-2-caret');
    const startedAt = performance.now();

    if (!introLine1 || !introBrand || !introLine2) return;

    introSequenceRunning = true;
    document.body.classList.add('intro-active');

    if (swiper) {
        swiper.allowTouchMove = false;
    }

    introBrand.textContent = '';
    introLine1.textContent = '';
    introLine2.textContent = '';

    if (introLine1Caret) introLine1Caret.style.opacity = '1';
    if (introLine2Caret) introLine2Caret.style.opacity = '0';

    await typeText(introLine1, line1Text, Math.max(28, Math.floor(line1End / line1Text.length)));
    if (introLine1Caret) introLine1Caret.style.opacity = '0';

    const afterLine1 = performance.now() - startedAt;
    await wait(Math.max(0, revealStart - afterLine1));
    document.body.classList.add('intro-revealed');

    const beforeBranding = performance.now() - startedAt;
    await wait(Math.max(0, brandingStart - beforeBranding));
    introBrand.textContent = brandText;
    document.body.classList.add('intro-branding');

    const beforeLine2 = performance.now() - startedAt;
    await wait(Math.max(0, line2Start - beforeLine2));
    document.body.classList.add('intro-line2-visible');
    if (introLine2Caret) introLine2Caret.style.opacity = '1';

    await typeText(introLine2, line2Text, Math.max(18, Math.floor((totalDuration - line2Start) / line2Text.length)));
    if (introLine2Caret) introLine2Caret.style.opacity = '0';

    const beforeSiteVisible = performance.now() - startedAt;
    await wait(Math.max(0, siteVisibleStart - beforeSiteVisible));
    document.body.classList.add('intro-site-visible');

    const beforeComplete = performance.now() - startedAt;
    await wait(Math.max(0, totalDuration - beforeComplete));
    document.body.classList.add('intro-complete');

    await wait(520);
    document.body.classList.remove(
        'intro-active',
        'intro-branding',
        'intro-revealed',
        'intro-line2-visible',
        'intro-site-visible',
        'intro-complete'
    );

    introSequenceRunning = false;

    if (swiper) {
        swiper.allowTouchMove = true;
        syncActiveSlide(swiper, { animate: false });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initClientProtection();
    initUIActions();
    lockVerticalScroll();
    initParticles();
    initSakura();
    initReveal();
    const swiper = initSwiper();
    initWheelNavigation(swiper);
    runIntroSequence(swiper);

    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (introSequenceRunning) return;
        togglePartnerModal(false);
    });
});
