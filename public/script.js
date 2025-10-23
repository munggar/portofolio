"use strict";

/* AI Assistant Frontend
   - Endpoint default: /api/chat
   - Expects POST JSON { message, history } => JSON { reply: "..." }
   - Change API_ENDPOINT if needed.
*/

(() => {
  const API_ENDPOINT = '/api/chat'; // <-- ubah kalau backend lo beda
  const STORAGE_KEY = 'ai_assistant_history_v1';

  const toggleBtn = document.getElementById('ai-toggle');
  const panel = document.getElementById('ai-panel');
  const closeBtn = document.getElementById('ai-close');
  const messagesEl = document.getElementById('ai-messages');
  const form = document.getElementById('ai-form');
  const input = document.getElementById('ai-input');
  const status = document.getElementById('ai-status');
  const clearBtn = document.getElementById('ai-clear');

  // Init
  let history = loadHistory();
  renderHistory();

  // Accessibility
  function openPanel() {
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    input.focus();
    scrollToBottom();
  }
  function closePanel() {
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', () => {
    const hidden = panel.getAttribute('aria-hidden') === 'true';
    if (hidden) openPanel(); else closePanel();
  });
  closeBtn.addEventListener('click', closePanel);

  // Submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendMessage('user', text);
    input.value = '';
    saveMessage('user', text);
    scrollToBottom();
    await sendToBackend(text);
  });

  // Enter to send, Shift+Enter for newline
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Clear chat history?')) {
      history = [];
      persistHistory();
      renderHistory();
    }
  });

  // Helpers
  function createMessageEl(from, text) {
    const el = document.createElement('div');
    el.className = `ai-message ${from}`;
    el.textContent = text;
    return el;
  }

  function appendMessage(from, text) {
    const el = createMessageEl(from, text);
    messagesEl.appendChild(el);
    // small animation
    el.style.opacity = 0;
    requestAnimationFrame(() => (el.style.opacity = 1));
  }

  function renderHistory() {
    messagesEl.innerHTML = '';
    history.forEach(item => {
      appendMessage(item.role === 'user' ? 'user' : 'ai', item.text);
    });
    scrollToBottom();
  }

  function saveMessage(role, text) {
    history.push({ role, text, time: Date.now() });
    persistHistory();
  }

  function persistHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-50))); // keep last 50
    } catch (err) { /* ignore */ }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function scrollToBottom() {
    requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  async function sendToBackend(userText) {
    setStatus('Thinking...');
    // disable input while waiting
    input.disabled = true;
    try {
      const payload = {
        message: userText,
        history: history.map(h => ({ role: h.role, text: h.text })) // send minimal history
      };

      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      // Try to handle streaming responses (if backend sends text/event-stream or chunked JSON)
      const contentType = res.headers.get('content-type') || '';
      if (res.body && contentType.includes('text/event-stream') || contentType.includes('text/plain')) {
        // Read streaming text
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let acc = '';
        appendMessage('ai', ''); // placeholder element for streaming
        const placeholder = messagesEl.lastElementChild;
        while (!done) {
          const { value, done: d } = await reader.read();
          done = d;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            acc += chunk;
            placeholder.textContent = acc;
            scrollToBottom();
          }
        }
        saveMessage('ai', acc);
      } else {
        // Assume JSON { reply }
        const data = await res.json();
        const reply = data.reply ?? data.output ?? data.message ?? '[no reply]';
        appendMessage('ai', reply);
        saveMessage('ai', reply);
      }

    } catch (err) {
      console.error('AI assistant error:', err);
      appendMessage('ai', 'Maaf, terjadi kesalahan saat menghubungi server. Coba lagi nanti.');
      saveMessage('ai', 'Maaf, terjadi kesalahan saat menghubungi server. Coba lagi nanti.');
    } finally {
      input.disabled = false;
      setStatus('');
      scrollToBottom();
    }
  }

  function setStatus(text) {
    status.textContent = text;
  }

  // Expose for dev debugging (optional)
  window.AIAssistant = {
    open: openPanel,
    close: closePanel,
    clear: () => {
      history = [];
      persistHistory();
      renderHistory();
    },
    send: (text) => {
      appendMessage('user', text);
      saveMessage('user', text);
      return sendToBackend(text);
    }
  };

})();


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
    let wi = 0,
        ci = 0,
        deleting = false;
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
if (isMobile.matches) {
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

(function () {
  // quick feature-detect: reduce motion or touch device -> disable interactive effects
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  // mouse-follow glow element
  const glow = document.createElement('div');
  glow.className = 'mouse-glow';
  document.body.appendChild(glow);

  if (prefersReduce || isTouch) {
    glow.style.display = 'none';
  }

  // update CSS variables for mouse pos
  function onMove(e) {
    const x = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || window.innerWidth/2;
    const y = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY) || window.innerHeight/2;
    glow.style.setProperty('--mx', x + 'px');
    glow.style.setProperty('--my', y + 'px');
    // move via transform to avoid layout thrash
    glow.style.transform = 'translate3d(' + (x - (glow.offsetWidth/2)) + 'px,' + (y - (glow.offsetHeight/2)) + 'px,0)';
  }

  // throttle using rAF
  let ticking = false;
  function onPointer(e) {
    if (prefersReduce || isTouch) return;
    if (!ticking) {
      window.requestAnimationFrame(() => {
        onMove(e);
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('mousemove', onPointer, {passive: true});
  window.addEventListener('touchmove', onPointer, {passive: true});

  /* -----------------------
     Parallax / tilt for .parallax-section and .project-card
     ----------------------- */
  // scroll-driven parallax: move pseudo-layers by small factor
  const parallaxSections = document.querySelectorAll('.parallax-section');

  function updateParallax() {
    parallaxSections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const centerY = rect.top + rect.height/2;
      const winCenter = window.innerHeight/2;
      const dist = (centerY - winCenter) / window.innerHeight; // -0.5 .. 0.5-ish
      // css transform values for pseudo elements via inline style on element
      // write small translateY values (disable on reduced motion)
      if (!prefersReduce) {
        section.style.setProperty('--parallax-1', `translateY(${dist * -18}px)`);
        section.style.setProperty('--parallax-2', `translateY(${dist * -36}px)`);
        // directly set transform on pseudo elements is not possible; instead set transform via CSS variable usage below
        // we'll add rule on the fly by toggling a data attribute used by CSS if needed
        section.style.transform = 'translateZ(0)'; // helps GPU
        // apply transform through style on before/after using CSS variables in CSS would be ideal; but simpler:
        // use CSS transform on the entire pseudo via assigning style to element dataset and letting CSS read it:
        // We'll use element.style.setProperty on a custom property and refer in CSS using var(--parallax-1) etc.
      }
    });
  }

  // initial and on scroll
  updateParallax();
  window.addEventListener('scroll', () => {
    if (prefersReduce) return;
    window.requestAnimationFrame(updateParallax);
  }, {passive: true});
  window.addEventListener('resize', updateParallax);

  /* -----------------------
     Card tilt (mousemove within card)
     ----------------------- */
  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    if (prefersReduce || isTouch) return;
    card.addEventListener('mousemove', function (e) {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0..1
      const py = (e.clientY - rect.top) / rect.height;
      const tiltY = (px - 0.5) * 12;  // rotateY degrees
      const tiltX = (0.5 - py) * 8;   // rotateX degrees
      const scale = 1.012;
      // write into inline css custom properties for smooth interpolation with CSS
      card.style.setProperty('--tiltX', tiltX + 'deg');
      card.style.setProperty('--tiltY', tiltY + 'deg');
      card.style.setProperty('--tiltScale', scale);
      card.classList.add('is-active');
      // also enlarge mouse glow when hovering card
      document.body.classList.add('target-active');
    }, {passive: true});

    card.addEventListener('mouseleave', function () {
      card.style.setProperty('--tiltX', '0deg');
      card.style.setProperty('--tiltY', '0deg');
      card.style.setProperty('--tiltScale', '1');
      card.classList.remove('is-active');
      document.body.classList.remove('target-active');
    }, {passive: true});
  });

})();