/* script.js
   - preloader
   - mobile nav toggle
   - theme toggle (localStorage)
   - typing effect for name
   - intersection observers for fade-in and skills
   - active nav link on scroll
   - scroll-to-top
*/

(() => {
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

  /* --- Mobile Nav Toggle --- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
  });
  // close nav on click link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });

  /* --- Theme Toggle with localStorage --- */
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  const THEME_KEY = 'mf_theme'; // mf = munggar fajar
  // init
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light') body.classList.add('light-mode');
  updateThemeIcon();

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const mode = body.classList.contains('light-mode') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, mode);
    updateThemeIcon();
  });

  function updateThemeIcon(){
    themeToggle.innerHTML = body.classList.contains('light-mode')
      ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  /* --- Typing effect (name) --- */
  const typingEl = document.getElementById('typingName');
  if (typingEl) {
    const fullText = typingEl.textContent.trim();
    typingEl.textContent = '';
    let i = 0;
    const speed = 45;
    (function type() {
      if (i <= fullText.length) {
        typingEl.textContent = fullText.slice(0, i++);
        setTimeout(type, speed);
      } else {
        // caret blink - keep final text
        typingEl.classList.add('done');
      }
    })();
  }

  /* --- Fade sections on scroll & skill bars --- */
  const faders = document.querySelectorAll('.fade-up');
  const skillBars = document.querySelectorAll('.skill-bar');

  const observerOptions = { threshold: 0.12 };
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // animate skill bars when skills section visible
        if (entry.target.id === 'skills') {
          skillBars.forEach(bar => {
            const fill = bar.querySelector('.skill-fill');
            const pct = parseInt(bar.dataset.percent, 10) || 0;
            fill.style.width = pct + '%';
          });
        }
      }
    });
  }, observerOptions);

  faders.forEach(el => sectionObserver.observe(el));

  /* --- Active nav link while scrolling --- */
  const sections = document.querySelectorAll('main section[id], footer');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    sections.forEach(sec => {
      const top = sec.offsetTop - 90;
      const bottom = top + sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < bottom && id) {
        navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
      }
    });
  }, { passive: true });

  /* --- Scroll to top button --- */
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 420) scrollTopBtn.style.display = 'block';
    else scrollTopBtn.style.display = 'none';
  });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

})();
