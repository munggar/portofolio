"use strict";

/* --- Preloader --- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    // small delay so animation visible
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.pointerEvents = 'none';
      setTimeout(() => preloader.remove(), 600);
    }, 450);
  });

/* ----------- Typing effect for role (hero) ----------- */
  const typingEl = document.getElementById('highlight');
  const roles = ["Munggar Fajar Muharram", "Problem Solver", "Web Developer", "UI/UX Enthusiast"];
  if (typingEl) {
    let wi = 0, ci = 0, deleting = false;
    (function typeLoop() {
      const word = roles[wi];
      if (!deleting) {
        typingEl.textContent = word.slice(0, ++ci);
      } else {
        typingEl.textContent = word.slice(0, --ci);
      }

      if (!deleting && ci === word.length) {
        deleting = true;
        setTimeout(typeLoop, 900);
      } else if (deleting && ci === 0) {
        deleting = false;
        wi = (wi + 1) % roles.length;
        setTimeout(typeLoop, 300);
      } else {
        setTimeout(typeLoop, deleting ? 45 : 90);
      }
    })();
  }


// Initialize AOS with safe defaults
document.addEventListener('DOMContentLoaded', function () {
    // randomize small delays for natural feel
    document.querySelectorAll('[data-aos]').forEach((el, i) => {
        if (!el.dataset.aosDelay) el.dataset.aosDelay = (i % 4) * 80; // small varied delay
    });
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true
    });
});

// Theme toggle (with guards)
const themeToggle = document.getElementById('theme-toggle');
const themeToggleMobile = document.getElementById('theme-toggle-mobile');
const root = document.documentElement;
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Mobile theme toggle
const isMobile = window.matchMedia("(max-width: 768px)");
if (isMobile.matches){
    themeToggle.style.display = 'none'; // hide desktop button on mobile
    themeToggleMobile.style.display = 'flex'; // show mobile button on mobile
    themeToggleMobile.style.position = 'relative'; // move button to relative position on mobile
} else {
    themeToggleMobile.style.display = 'none'; // hide mobile button on larger screens
    themeToggle.style.display = 'flex'; // show desktop button on larger screens
    themeToggle.style.position = 'fixed'; // keep button fixed on larger screens
}

// Apply initial theme
(function applyInitialTheme() {
    const theme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', theme);
})();



function setThemeIcon(isDark) {
    if (!themeToggle) return;
    themeToggle.innerHTML = isDark ? `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>` : `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
}

// set icon based on current theme
setThemeIcon(root.getAttribute('data-theme') === 'dark');

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setThemeIcon(next === 'dark');
    });
}

if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', () => {
        const current = root.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        setThemeIcon(next === 'dark');
    });
}

// Initialize Swiper with coverflow-style enhancement
const swiper = new Swiper('.swiper', {
    loop: true,
    spaceBetween: 24,
    centeredSlides: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
    },
    breakpoints: {
        640: {
            slidesPerView: 1
        },
        768: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    },
    // optional nice visual effect
    effect: 'coverflow',
    coverflowEffect: {
        rotate: 20,
        stretch: 0,
        depth: 120,
        modifier: 1,
        slideShadows: true
    }
});

// Mobile nav toggle with accessibility
const mobileBtn = document.getElementById("mobileBtn");
const navLinksMobile = document.getElementById("navLinksMobile");
const nav = document.getElementById("navLinksMobile");

mobileBtn.addEventListener("click", () => {
    mobileBtn.classList.toggle("active");
    navLinksMobile.classList.toggle("active");

    const isExpanded = mobileBtn.classList.contains("active");
    mobileBtn.setAttribute("aria-expanded", isExpanded);
    navLinksMobile.setAttribute("aria-hidden", !isExpanded);


// kondisi tag header
if (isExpanded) {
        nav.style.paddingTop = "70%";
        nav.style.paddingBottom = "100%";
    } else {
        nav.style.paddingTop = "";
        nav.style.paddingBottom = "";
    }
});
// Tutup menu setelah klik link
document.querySelectorAll(".nav-links-mobile .nav-link").forEach(link => {
    link.addEventListener("click", () => {
        mobileBtn.classList.remove("active");
        navLinksMobile.classList.remove("active");
    });
});


// Smooth scrolling and active link highlighting
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const headerOffset = 84;
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: elementPosition - headerOffset,
            behavior: 'smooth'
        });
        // close mobile nav if open
        if (navLinksMobile && navLinksMobile.classList.contains('active')) navLinksMobile.classList.remove('active');
    });
});

// Active nav link on scroll
const navLinksAll = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section');

function onScrollActive() {
    let current = '';
    sections.forEach(sec => {
        const top = sec.offsetTop - 120;
        if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinksAll.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
}
window.addEventListener('scroll', onScrollActive);
onScrollActive();

// Form handling: show toast instead of alert
const contactForm = document.getElementById('contactForm');

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        if (name && email && message) {
            // here you would post to your backend
            showToast('Thank you for your message — I\'ll get back to you soon.');
            contactForm.reset();
        } else {
            showToast('Please fill in all fields.');
        }
    });
}

// Intersection Observer for .fade-in elements
const fadeElements = document.querySelectorAll('.fade-in');
if (fadeElements.length) {
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('appear');
        });
    }, {
        threshold: 0.12
    });
    fadeElements.forEach(el => fadeObserver.observe(el));
}

// Header hide/show & scrolled class
const header = document.querySelector('.header');
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const st = window.pageYOffset || document.documentElement.scrollTop;
    if (st > lastScroll && st > 100) header.style.transform = 'translateY(-110%)';
    else header.style.transform = 'translateY(0)';
    if (st > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    lastScroll = st <= 0 ? 0 : st;
});

document.addEventListener("DOMContentLoaded", async () => {
    const wrapper = document.getElementById("project-slides");

    try {
        const res = await fetch("projects.json");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);

        const data = await res.json();
        if (!data.projects || data.projects.length === 0) {
            wrapper.innerHTML = `<p class="text-center">No projects found.</p>`;
            return;
        }

        data.projects.forEach(project => {
            const slide = document.createElement("div");
            slide.className = "swiper-slide";
            slide.innerHTML = `
        <div class="project-card">
          <div class="project-content">
            <h3 class="project-title">${project.name}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-tech">
              ${project.technologies.map(tech => `<span>${tech}</span>`).join("")}
            </div>
            <p class="project-role"><strong>Role:</strong> ${project.role}</p>
            <div class="project-links">
              <a href="${project.link}" target="_blank" class="project-link" rel="noopener">View on GitHub</a>
            </div>
          </div>
        </div>
      `;
            wrapper.appendChild(slide);
        });

        new Swiper(".mySwiper", {
            effect: "coverflow",
            grabCursor: true,
            centeredSlides: true,
            loop: true,
            slidesPerView: "auto",
            coverflowEffect: {
                rotate: 40,
                stretch: 0,
                depth: 120,
                modifier: 2,
                slideShadows: true,
            },
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                768: {
                    slidesPerView: 2
                },
                1024: {
                    slidesPerView: 3
                },
            },
        });
    } catch (error) {
        console.error("Error loading projects:", error);
        wrapper.innerHTML = `<p class="text-center text-danger">Failed to load projects. Please try again later.</p>`;
    }
});
