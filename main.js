import * as THREE from "https://unpkg.com/three@0.164.1/build/three.module.js";

const nav = document.getElementById("topNav");
const links = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("section[id], header[id]")];
const scrollTopBtn = document.getElementById("scrollTop");
const themeToggle = document.getElementById("themeToggle");
const scrollProgress = document.getElementById("scrollProgress");
const heroParallax = document.querySelector(".hero-parallax");
const heroCopy = document.querySelector("[data-hero-copy]");

const setNavState = () => {
    const isScrolled = window.scrollY > 20;
    nav.classList.toggle("scrolled", isScrolled);
    scrollTopBtn.classList.toggle("show", window.scrollY > 420);
};

const setScrollProgress = () => {
    if (!scrollProgress) return;

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = `${Math.min(progress, 100)}%`;
};

const setHeroParallax = () => {
    if (!heroParallax || window.innerWidth < 992) return;
    const y = Math.min(window.scrollY * 0.06, 24);
    heroParallax.style.transform = `translateY(${y}px)`;
};

const setHeroCopyParallax = () => {
    if (!heroCopy) return;
    const y = Math.min(window.scrollY * 0.04, 18);
    heroCopy.style.transform = `translate3d(0, ${y}px, 0)`;
    heroCopy.style.opacity = `${Math.max(1 - window.scrollY / 900, 0.72)}`;
};

const setActiveLink = () => {
    const scrollPos = window.scrollY + 140;

    sections.forEach((section) => {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;

        if (scrollPos >= top && scrollPos < bottom) {
            links.forEach((link) => link.classList.remove("active"));
            const active = links.find((link) => link.getAttribute("href") === `#${section.id}`);
            if (active) active.classList.add("active");
        }
    });
};

const setupReveal = () => {
    const revealEls = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.18 }
    );

    revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i * 70, 350)}ms`;
        observer.observe(el);
    });
};

const setupScrollParallax = () => {
    const layers = [...document.querySelectorAll(".parallax-layer[data-parallax-speed]")];
    if (!layers.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobileFactor = window.matchMedia("(max-width: 767px)").matches ? 0.55 : 1;
    let rafPending = false;

    const updateLayers = () => {
        const viewportCenter = window.innerHeight * 0.5;

        layers.forEach((layer) => {
            const speed = Number(layer.dataset.parallaxSpeed || 0) * mobileFactor;
            const host = layer.closest(".parallax-host");
            if (!host) return;

            const rect = host.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height * 0.5;
            const offset = (viewportCenter - sectionCenter) * speed;
            layer.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
        });

        rafPending = false;
    };

    const requestUpdate = () => {
        if (rafPending) return;
        rafPending = true;
        window.requestAnimationFrame(updateLayers);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    requestUpdate();
};

const setupProjectCardScroll = () => {
    const cards = [...document.querySelectorAll(".project-card")];
    if (!cards.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.18 });

    cards.forEach((card, idx) => {
        card.classList.add("js-card-animate");
        card.style.transitionDelay = `${Math.min(idx * 90, 260)}ms`;
        observer.observe(card);
    });
};

const setupProjectFiltering = () => {
    const filterWrap = document.querySelector("[data-project-filters]");
    const items = [...document.querySelectorAll("[data-project-item]")];
    if (!filterWrap || !items.length) return;

    const buttons = [...filterWrap.querySelectorAll("[data-filter]")];

    const applyFilter = (filter) => {
        items.forEach((item) => {
            const category = item.dataset.category;
            const shouldShow = filter === "all" || category === filter;

            if (shouldShow) {
                item.classList.remove("is-hidden", "is-leaving");
                item.classList.add("is-entering");
                requestAnimationFrame(() => item.classList.remove("is-entering"));
            } else if (!item.classList.contains("is-hidden")) {
                item.classList.remove("is-entering");
                item.classList.add("is-leaving");
                window.setTimeout(() => {
                    item.classList.add("is-hidden");
                    item.classList.remove("is-leaving");
                }, 260);
            }
        });
    };

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter || "all";

            buttons.forEach((btn) => {
                const active = btn === button;
                btn.classList.toggle("active", active);
                btn.setAttribute("aria-pressed", active ? "true" : "false");
            });

            applyFilter(filter);
        });
    });
};

const setupThreeIntro = () => {
    const scene = document.querySelector(".hero-image-wrap");
    if (!scene) return;

    scene.classList.add("hero-media-intro");
    requestAnimationFrame(() => scene.classList.add("hero-media-visible"));
};

const setupHeroTyping = () => {
    const typed = document.getElementById("typedIntro");
    if (!typed) return;

    const words = ["Web Apps", "AI Tools", "Creative Interfaces"];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const currentWord = words[wordIndex];
        typed.textContent = deleting
            ? currentWord.slice(0, charIndex - 1)
            : currentWord.slice(0, charIndex + 1);

        charIndex = deleting ? charIndex - 1 : charIndex + 1;

        if (!deleting && charIndex === currentWord.length) {
            deleting = true;
            window.setTimeout(tick, 1200);
            return;
        }

        if (deleting && charIndex === 0) {
            deleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            window.setTimeout(tick, 220);
            return;
        }

        window.setTimeout(tick, deleting ? 45 : 75);
    };

    tick();
};

const setupHeroParticles = () => {
    const mount = document.getElementById("heroParticles");
    if (!mount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const particleCount = window.innerWidth < 768 ? 150 : 280;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 14;
        positions[i3 + 1] = (Math.random() - 0.5) * 8;
        positions[i3 + 2] = (Math.random() - 0.5) * 8;
        velocities[i] = 0.002 + Math.random() * 0.004;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

    const material = new THREE.PointsMaterial({
        color: 0x9fcfff,
        size: window.innerWidth < 768 ? 0.025 : 0.035,
        transparent: true,
        opacity: 0.58,
        depthWrite: false
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event) => {
        const rect = mount.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    let rafId = 0;
    let running = true;

    const animate = () => {
        if (!running) return;
        const pos = geometry.attributes.position.array;

        for (let i = 0; i < particleCount; i += 1) {
            const i3 = i * 3;
            pos[i3 + 1] += velocities[i];
            if (pos[i3 + 1] > 4.5) pos[i3 + 1] = -4.5;
        }

        geometry.attributes.position.needsUpdate = true;
        points.rotation.y += 0.0009;
        points.rotation.x = pointer.y * 0.05;
        points.rotation.z = pointer.x * 0.05;

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(animate);
    };

    const onResize = () => {
        const w = mount.clientWidth;
        const h = mount.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(w, h);
    };

    const onVisibility = () => {
        running = !document.hidden;
        if (running) animate();
        else cancelAnimationFrame(rafId);
    };

    mount.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    animate();

    window.addEventListener(
        "beforeunload",
        () => {
            running = false;
            cancelAnimationFrame(rafId);
            mount.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("resize", onResize);
            document.removeEventListener("visibilitychange", onVisibility);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        },
        { once: true }
    );
};

const setupEmailCopy = () => {
    const emailLink = document.querySelector('.social-row a[href^="mailto:"]');
    if (!emailLink) return;

    emailLink.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = "bhuliram194@gmail.com";

        try {
            await navigator.clipboard.writeText(email);
            emailLink.textContent = "Email copied";
            setTimeout(() => {
                emailLink.textContent = email;
                window.location.href = `mailto:${email}`;
            }, 700);
        } catch {
            window.location.href = `mailto:${email}`;
        }
    });
};

const setupGitHubRepos = async () => {
    const repoGrid = document.getElementById("githubRepos");
    if (!repoGrid) return;

    const username = "abhi12-G";
    const endpoint = `https://api.github.com/users/${username}/repos?sort=updated&per_page=12`;

    try {
        const response = await fetch(endpoint, {
            headers: { Accept: "application/vnd.github+json" }
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const repos = await response.json();
        const latestRepos = repos
            .filter((repo) => !repo.fork)
            .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
            .slice(0, 6);

        if (!latestRepos.length) {
            repoGrid.innerHTML = `
                <div class="col-12">
                    <div class="github-error">No repositories found.</div>
                </div>
            `;
            return;
        }

        repoGrid.innerHTML = latestRepos
            .map(
                (repo) => `
                    <div class="col-sm-6 col-xl-4 reveal">
                        <article class="repo-card">
                            <h3>
                                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
                            </h3>
                            <p>${repo.description || "No description provided."}</p>
                            <div class="repo-meta">
                                <span class="repo-pill">Stars: ${repo.stargazers_count}</span>
                                <span class="repo-pill">Language: ${repo.language || "N/A"}</span>
                            </div>
                        </article>
                    </div>
                `
            )
            .join("");

        setupReveal();
    } catch (error) {
        repoGrid.innerHTML = `
            <div class="col-12">
                <div class="github-error">Unable to load repositories right now.</div>
            </div>
        `;
        console.error("GitHub repos fetch failed:", error);
    }
};

const setFooterYear = () => {
    const yearEl = document.getElementById("currentYear");
    if (!yearEl) return;
    yearEl.textContent = String(new Date().getFullYear());
};

const setupVisitorCounter = async () => {
    const visitorCountEl = document.getElementById("visitorCount");
    const visitorBadgeEl = document.getElementById("visitorBadge");

    if (visitorBadgeEl) {
        const pageKey = encodeURIComponent(`${window.location.origin}${window.location.pathname}`);
        visitorBadgeEl.src = `https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=${pageKey}&count_bg=%23111827&title_bg=%23343a40&icon=&icon_color=%23E7E7E7&title=Visitors&edge_flat=true`;
    }

    if (!visitorCountEl) return;

    try {
        const response = await fetch("https://api.countapi.xyz/hit/abhimesh-portfolio-clone/visits");
        if (!response.ok) {
            throw new Error(`Counter API returned ${response.status}`);
        }

        const data = await response.json();
        const count = Number(data?.value);
        visitorCountEl.textContent = Number.isFinite(count) ? count.toLocaleString("en-IN") : "N/A";
    } catch (error) {
        visitorCountEl.textContent = "See badge below";
        console.error("Visitor counter failed:", error);
    }
};

const setTheme = (theme) => {
    const dark = theme === "dark";
    document.body.classList.toggle("dark-theme", dark);
    document.body.classList.toggle("light-theme", !dark);

    if (themeToggle) {
        themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
        themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    }
};

const setupThemeToggle = () => {
    const savedTheme = localStorage.getItem("site-theme");
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const initialTheme = savedTheme || systemTheme;
    setTheme(initialTheme);

    if (!themeToggle) return;

    themeToggle.addEventListener("click", () => {
        const isDark = document.body.classList.contains("dark-theme");
        const nextTheme = isDark ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("site-theme", nextTheme);
    });
};

links.forEach((link) => {
    link.addEventListener("click", () => {
        const navCollapse = document.querySelector(".navbar-collapse.show");
        if (navCollapse) {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(navCollapse);
            bsCollapse.hide();
        }
    });
});

scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
    setNavState();
    setActiveLink();
    setScrollProgress();
    setHeroParallax();
    setHeroCopyParallax();
});

window.addEventListener("resize", () => {
    setScrollProgress();
    setHeroParallax();
    setHeroCopyParallax();
});

window.addEventListener("load", () => {
    setupHeroTyping();
    setupHeroParticles();
    setupScrollParallax();
    setupThemeToggle();
    setNavState();
    setActiveLink();
    setFooterYear();
    setScrollProgress();
    setHeroParallax();
    setHeroCopyParallax();
    setupReveal();
    setupThreeIntro();
    setupProjectFiltering();
    setupProjectCardScroll();
    setupEmailCopy();
    setupGitHubRepos();
    setupVisitorCounter();
});
