const nav = document.getElementById("topNav");
const links = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("section[id], header[id]")];
const scrollTopBtn = document.getElementById("scrollTop");
const themeToggle = document.getElementById("themeToggle");
const scrollProgress = document.getElementById("scrollProgress");
const heroParallax = document.querySelector(".hero-parallax");

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
    if (!window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".project-card").forEach((card) => {
        gsap.fromTo(
            card,
            { y: 50, autoAlpha: 0, scale: 0.95 },
            {
                y: 0,
                autoAlpha: 1,
                scale: 1,
                duration: 1.2,
                ease: "expo.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            }
        );
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
    if (!window.gsap) return;
    const scene = document.querySelector(".hero-image-wrap");
    if (!scene) return;

    gsap.fromTo(scene, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power2.out" });
};

const setupVantaHero = () => {
    const hero = document.getElementById("home");
    if (!hero || !window.VANTA || !window.VANTA.NET) return;

    const effect = window.VANTA.NET({
        el: hero,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0x59b6ff,
        backgroundColor: 0x070b12,
        points: 11,
        maxDistance: 21,
        spacing: 19,
        showDots: false
    });

    window.addEventListener(
        "beforeunload",
        () => {
            if (effect && typeof effect.destroy === "function") {
                effect.destroy();
            }
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
    const footerText = document.querySelector("footer .container");
    if (!footerText) return;
    const year = new Date().getFullYear();
    footerText.innerHTML = `&copy; ${year} Abhimesh. Crafted with care.`;
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
});

window.addEventListener("resize", () => {
    setScrollProgress();
    setHeroParallax();
});

window.addEventListener("load", () => {
    setupVantaHero();
    setupScrollParallax();
    setupThemeToggle();
    setNavState();
    setActiveLink();
    setFooterYear();
    setScrollProgress();
    setHeroParallax();
    setupReveal();
    setupThreeIntro();
    setupProjectFiltering();
    setupProjectCardScroll();
    setupEmailCopy();
    setupGitHubRepos();
});
