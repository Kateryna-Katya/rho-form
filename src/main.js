/**
 * Rho-Form: Full Production Engine 2026
 * All fixes: Word wrapping, Isometric Stack, Captcha, Lenis Sync
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. РЕГИСТРАЦИЯ GSAP ПЛАГИНОВ ---
    gsap.registerPlugin(ScrollTrigger);

    // --- 2. ПЛАВНЫЙ СКРОЛЛ (LENIS) + GSAP SYNC ---
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);


    // --- 3. ГЛОБАЛЬНАЯ КАПЧА ---
    let sumCorrect;
    const generateCaptcha = () => {
        const captchaLabel = document.getElementById('captcha-question');
        if (!captchaLabel) return;
        const val1 = Math.floor(Math.random() * 9) + 1;
        const val2 = Math.floor(Math.random() * 9) + 1;
        sumCorrect = val1 + val2;
        captchaLabel.innerText = `${val1} + ${val2}`;
    };
    generateCaptcha();


    // --- 4. HEADER И МОБИЛЬНОЕ МЕНЮ ---
    const header = document.querySelector('.header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('header--scrolled');
        else header.classList.remove('header--scrolled');
    });

    const toggleMenu = () => {
        menuToggle.classList.toggle('menu-toggle--active');
        mobileMenu.classList.toggle('mobile-menu--active');
        document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--active') ? 'hidden' : '';
    };

    menuToggle?.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', toggleMenu));


    // --- 5. HERO: 3D И БЕЗОПАСНАЯ АНИМАЦИЯ ТЕКСТА ---
    const initHero = () => {
        const canvas = document.querySelector('#hero-canvas');
        if (!canvas) return;

        // Three.js Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.z = 5;

        const geo = new THREE.BufferGeometry();
        const pts = new Float32Array(1500 * 3);
        for(let i=0; i<4500; i++) pts[i] = (Math.random() - 0.5) * 15;
        geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
        const mat = new THREE.PointsMaterial({ size: 0.02, color: 0x00f5ff, transparent: true, opacity: 0.4 });
        const cloud = new THREE.Points(geo, mat);
        scene.add(cloud);

        const animate = () => {
            requestAnimationFrame(animate);
            cloud.rotation.y += 0.0008;
            renderer.render(scene, camera);
        };
        animate();

        // SplitType с фиксом разрыва слов
        const titleElement = document.querySelector('.hero__title');
        if (titleElement) {
            // Разбиваем сначала на слова, потом на символы для точности
            const text = new SplitType(titleElement, { types: 'words, chars' });
            
            const tl = gsap.timeline({ delay: 0.5 });
            tl.from(text.chars, { 
                y: 40, 
                opacity: 0, 
                rotateX: -90, 
                stagger: 0.02, 
                duration: 1, 
                ease: 'power4.out' 
            })
            .to('.hero__subtitle, .hero__actions, .scroll-down', { 
                opacity: 1, 
                y: 0, 
                stagger: 0.2, 
                duration: 0.8 
            }, "-=0.5");
        }
    };
    initHero();


    // --- 6. INFRASTRUCTURE: ISOMETRIC LAYERED STACK ---
    const layers = document.querySelectorAll('.stack__layer');
    const infraItems = document.querySelectorAll('.infra-item');

    if (layers.length > 0) {
        gsap.to(layers, {
            scrollTrigger: {
                trigger: ".infra",
                start: "top 70%",
                end: "bottom 20%",
                scrub: 1
            },
            z: (i) => (i * 80),
            y: (i) => (i * -35),
            duration: 1
        });

        infraItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                const depth = item.getAttribute('data-layer');
                infraItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                layers.forEach(l => {
                    l.style.borderColor = 'rgba(255,255,255,0.1)';
                    if(l.dataset.depth == depth) {
                        l.style.borderColor = 'var(--accent)';
                        l.style.boxShadow = '0 0 40px var(--accent-glow)';
                        gsap.to(l, { scale: 1.05, duration: 0.3 });
                    } else {
                        l.style.boxShadow = 'none';
                        gsap.to(l, { scale: 1, duration: 0.3 });
                    }
                });
            });
        });
    }


    // --- 7. ACADEMY: FLOATING CURSOR PREVIEW ---
    const cursorImg = document.querySelector('.academy-cursor-img');
    const academyItems = document.querySelectorAll('.academy-item');

    academyItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const src = item.getAttribute('data-img');
            if (cursorImg) {
                cursorImg.querySelector('img').src = src;
                gsap.to(cursorImg, { opacity: 1, scale: 1, duration: 0.3 });
            }
        });
        item.addEventListener('mouseleave', () => {
            if (cursorImg) gsap.to(cursorImg, { opacity: 0, scale: 0.8, duration: 0.3 });
        });
        item.addEventListener('mousemove', (e) => {
            if (cursorImg) {
                gsap.to(cursorImg, { 
                    x: e.clientX + 25, 
                    y: e.clientY - 120, 
                    duration: 0.6, 
                    ease: "power2.out" 
                });
            }
        });
    });


    // --- 8. CONTACT FORM: VALIDATION & SUCCESS ---
    const contactForm = document.getElementById('contact-form');
    const successBox = document.getElementById('form-success');

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const answer = parseInt(document.getElementById('captcha-answer').value);
        
        if (answer !== sumCorrect) {
            alert('Wrong captcha answer!');
            generateCaptcha();
            return;
        }

        const btn = contactForm.querySelector('button');
        btn.innerText = 'Integrating Data...';
        btn.disabled = true;

        setTimeout(() => {
            gsap.to(contactForm, { 
                opacity: 0, 
                y: -20, 
                duration: 0.5, 
                onComplete: () => {
                    contactForm.style.display = 'none';
                    if (successBox) {
                        successBox.style.display = 'flex';
                        gsap.fromTo(successBox, 
                            { opacity: 0, scale: 0.9, y: 20 },
                            { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
                        );
                    }
                }
            });
        }, 1500);
    });


    // --- 9. COOKIE POPUP ---
    const cookiePopup = document.getElementById('cookie-popup');
    if (!localStorage.getItem('rho_accepted')) {
        setTimeout(() => cookiePopup?.classList.add('cookie-popup--active'), 3000);
    }
    document.getElementById('accept-cookies')?.addEventListener('click', () => {
        localStorage.setItem('rho_accepted', 'true');
        cookiePopup?.classList.remove('cookie-popup--active');
    });

    console.log('Rho-Form Fit: All Systems Green');
});