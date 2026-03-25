let introSequenceRunning = false;
const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function runWhenIdle(task, timeout = 1200) {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => task(), { timeout });
        return;
    }

    window.setTimeout(task, 280);
}

function shouldReduceMotion() {
    return motionMediaQuery.matches || navigator.connection?.saveData === true;
}

function shouldRunAmbientMotion() {
    return !introSequenceRunning && !document.hidden && !shouldReduceMotion();
}

function dispatchMotionStateChange() {
    window.dispatchEvent(new Event('azatosz:motion-state-change'));
}

function initBackgroundMedia() {
    const video = document.querySelector('.bg-video');
    const source = video?.querySelector('source[data-src]');
    if (!video || !source) return;

    let loaded = false;

    const loadVideo = () => {
        if (loaded) return;
        loaded = true;
        source.src = source.dataset.src;
        video.load();
    };

    const tryPlay = () => {
        loadVideo();
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    runWhenIdle(loadVideo, 1600);

    window.addEventListener('azatosz:motion-state-change', () => {
        if (shouldRunAmbientMotion()) {
            tryPlay();
        } else {
            video.pause();
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            video.pause();
        } else if (shouldRunAmbientMotion()) {
            tryPlay();
        }
    });
}

function initDocumentTitleRotation() {
    const titles = [
        'Azatosz | 手遊代肝服務',
        'Azatosz | 能躺就別硬撐'
    ];

    let currentIndex = 0;
    document.title = titles[currentIndex];

    window.setInterval(() => {
        if (document.hidden) return;
        currentIndex = (currentIndex + 1) % titles.length;
        document.title = titles[currentIndex];
    }, 2400);
}

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
    const particleCount = shouldReduceMotion()
        ? 0
        : window.innerWidth <= 720
            ? 10
            : 18;
    let frameId = null;
    let running = false;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    function resizeCanvas() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(viewportWidth * dpr);
        canvas.height = Math.floor(viewportHeight * dpr);
        canvas.style.width = `${viewportWidth}px`;
        canvas.style.height = `${viewportHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.size = Math.random() * 1.5 + 0.7;
            this.speedX = Math.random() * 0.12 - 0.06;
            this.speedY = Math.random() * 0.12 - 0.06;
            this.opacity = Math.random() * 0.14 + 0.05;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > viewportWidth + 20) this.x = -20;
            if (this.x < -20) this.x = viewportWidth + 20;
            if (this.y > viewportHeight + 20) this.y = -20;
            if (this.y < -20) this.y = viewportHeight + 20;
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
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
            particle.update();
            particle.draw();

            for (let j = index + 1; j < particles.length; j += 1) {
                const peer = particles[j];
                const dx = particle.x - peer.x;
                const dy = particle.y - peer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 92) {
                    ctx.strokeStyle = `rgba(142, 95, 64, ${0.035 * (1 - distance / 92)})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(peer.x, peer.y);
                    ctx.stroke();
                }
            }
        });

        frameId = window.requestAnimationFrame(animate);
    }

    function start() {
        if (running || particles.length === 0) return;
        running = true;
        frameId = window.requestAnimationFrame(animate);
    }

    function stop() {
        running = false;
        if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
            frameId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function syncAnimationState() {
        if (shouldRunAmbientMotion()) {
            start();
        } else {
            stop();
        }
    }

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', syncAnimationState);
    window.addEventListener('azatosz:motion-state-change', syncAnimationState);
    syncAnimationState();
}

function initSakura() {
    const canvas = document.getElementById('sakura');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const petals = [];
    const petalCount = shouldReduceMotion()
        ? 0
        : window.innerWidth <= 720
            ? 4
            : 8;
    const palette = [
        'rgba(255, 228, 236, 0.72)',
        'rgba(255, 214, 226, 0.68)',
        'rgba(255, 238, 244, 0.64)'
    ];
    let frameId = null;
    let running = false;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;

    function resizeCanvas() {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.floor(viewportWidth * dpr);
        canvas.height = Math.floor(viewportHeight * dpr);
        canvas.style.width = `${viewportWidth}px`;
        canvas.style.height = `${viewportHeight}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Petal {
        constructor(resetFromTop = false) {
            this.reset(resetFromTop);
        }

        reset(resetFromTop = false) {
            this.x = Math.random() * viewportWidth;
            this.y = resetFromTop
                ? -30 - Math.random() * viewportHeight * 0.3
                : Math.random() * viewportHeight;
            this.size = 7 + Math.random() * 8;
            this.speedY = 0.38 + Math.random() * 0.58;
            this.speedX = -0.22 + Math.random() * 0.44;
            this.swing = Math.random() * Math.PI * 2;
            this.swingSpeed = 0.005 + Math.random() * 0.01;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = -0.006 + Math.random() * 0.012;
            this.opacity = 0.18 + Math.random() * 0.24;
            this.color = palette[Math.floor(Math.random() * palette.length)];
        }

        update() {
            this.swing += this.swingSpeed;
            this.rotation += this.rotationSpeed;
            this.x += this.speedX + Math.sin(this.swing) * 0.28;
            this.y += this.speedY;

            if (this.y > viewportHeight + 30 || this.x < -40 || this.x > viewportWidth + 40) {
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
        if (!running) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach((petal) => {
            petal.update();
            petal.draw();
        });
        frameId = window.requestAnimationFrame(animate);
    }

    function start() {
        if (running || petals.length === 0) return;
        running = true;
        frameId = window.requestAnimationFrame(animate);
    }

    function stop() {
        running = false;
        if (frameId !== null) {
            window.cancelAnimationFrame(frameId);
            frameId = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function syncAnimationState() {
        if (shouldRunAmbientMotion()) {
            start();
        } else {
            stop();
        }
    }

    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('visibilitychange', syncAnimationState);
    window.addEventListener('azatosz:motion-state-change', syncAnimationState);
    syncAnimationState();
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

function triggerEdgeBounce(swiper, direction) {
    if (!swiper?.el) return;

    const bounceClass = direction === 'start' ? 'is-bouncing-start' : 'is-bouncing-end';
    swiper.el.classList.remove('is-bouncing-start', 'is-bouncing-end');

    window.requestAnimationFrame(() => {
        swiper.el.classList.add(bounceClass);
        window.setTimeout(() => {
            swiper.el?.classList.remove(bounceClass);
        }, 380);
    });
}

function initSwiper() {
    if (typeof Swiper === 'undefined') return null;

    const swiper = new Swiper('.site-swiper', {
        direction: 'horizontal',
        loop: false,
        speed: 920,
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove: true,
        resistanceRatio: 0.82,
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

        const movingForward = wheelBuffer > 0;
        if ((movingForward && swiper.isEnd) || (!movingForward && swiper.isBeginning)) {
            triggerEdgeBounce(swiper, movingForward ? 'end' : 'start');
            wheelBuffer = 0;
            wheelLocked = true;
            window.setTimeout(() => {
                wheelLocked = false;
            }, 360);
            return;
        }

        wheelLocked = true;

        if (movingForward) {
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

function initKeyboardEdgeBounce(swiper) {
    if (!swiper?.el) return;

    window.addEventListener('keydown', (event) => {
        if (introSequenceRunning) return;
        if (document.getElementById('partner-modal')?.hidden === false) return;

        if (event.code === 'ArrowRight' && swiper.isEnd) {
            triggerEdgeBounce(swiper, 'end');
        } else if (event.code === 'ArrowLeft' && swiper.isBeginning) {
            triggerEdgeBounce(swiper, 'start');
        }
    });
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
    const brandText = 'Azatosz';
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
    dispatchMotionStateChange();

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
    dispatchMotionStateChange();

    if (swiper) {
        swiper.allowTouchMove = true;
        syncActiveSlide(swiper, { animate: false });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initDocumentTitleRotation();
    initClientProtection();
    initUIActions();
    lockVerticalScroll();
    initBackgroundMedia();
    initReveal();
    const swiper = initSwiper();
    initWheelNavigation(swiper);
    initKeyboardEdgeBounce(swiper);
    runWhenIdle(() => {
        initParticles();
        initSakura();
    }, 1800);
    runIntroSequence(swiper);

    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (introSequenceRunning) return;
        togglePartnerModal(false);
    });
});
