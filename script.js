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

const setFooterYear = () => {
    const footerText = document.querySelector("footer .container");
    if (!footerText) return;
    const year = new Date().getFullYear();
    footerText.innerHTML = `&copy; ${year} Abhimesh. Crafted with care.`;
};

const setTheme = (theme) => {
    const dark = theme === "dark";
    document.body.classList.toggle("dark-theme", dark);

    if (themeToggle) {
        themeToggle.textContent = dark ? "Light Mode" : "Dark Mode";
        themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    }
};

const setupThemeToggle = () => {
    const savedTheme = localStorage.getItem("site-theme") || "light";
    setTheme(savedTheme);

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
    setupThemeToggle();
    setNavState();
    setActiveLink();
    setFooterYear();
    setScrollProgress();
    setHeroParallax();
    setupReveal();
    setupEmailCopy();
});
