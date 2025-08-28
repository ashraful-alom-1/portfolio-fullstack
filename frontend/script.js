/* =========================
   script.js — Fixed for Backend Integration
   ========================= */
/* Short note: Ensure GSAP + ScrollTrigger are loaded in HTML before this script.
   Example:
   
   
*/
(function () {
  'use strict';
  /* -------------------------
     GSAP registration (if present)
     ------------------------- */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try { gsap.registerPlugin(ScrollTrigger); } catch (e) { /* ignore */ }
  }
  /* -------------------------
     Utility: Toast helper
     ------------------------- */
  const toastEl = document.getElementById('toast');
  const toastMessageEl = document.getElementById('toast-message');
  function showToast(message = '', duration = 3000, type = '') {
    if (!toastEl || !toastMessageEl) return;
    toastMessageEl.textContent = message;
    
    // Remove previous type classes
    toastEl.classList.remove('success', 'error', 'info');
    
    // Add type class if specified
    if (type) {
      toastEl.classList.add(type);
    }
    
    toastEl.classList.add('show');
    clearTimeout(toastEl._timer);
    toastEl._timer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, duration);
  }
  /* -------------------------
     DOMContentLoaded: init features that need DOM
     ------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------
       Mobile nav toggle
       ------------------------- */
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
    }
    /* Close mobile menu on nav link click */
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          if (navToggle) navToggle.classList.remove('active');
        }
      });
    });
    /* -------------------------
       Active nav based on scroll + navbar scrolled class
       ------------------------- */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      // active nav highlight
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.clientHeight;
        if (window.pageYOffset >= top - 200) {
          current = section.getAttribute('id');
        }
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = (link.getAttribute('href') || '').replace('#', '');
        if (href === current) link.classList.add('active');
      });
      // navbar scrolled effect
      if (navbar) {
        if (window.scrollY > 100) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
      }
    });
    /* -------------------------
       Hero background parallax (mouse)
       ------------------------- */
    const heroBg = document.getElementById('hero-bg');
    if (heroBg) {
      document.addEventListener('mousemove', (e) => {
        const mx = (e.clientX / window.innerWidth - 0.5) * 40;
        const my = (e.clientY / window.innerHeight - 0.5) * 40;
        // smooth transform (no heavy calculations)
        heroBg.style.transform = `translate(${mx}px, ${my}px)`;
      });
    }
    /* -------------------------
       Accessible Copy-to-Clipboard (email)
       ------------------------- */
    const copyEl = document.getElementById('copy-email');
    if (copyEl) {
      // ensure keyboard access
      copyEl.setAttribute('tabindex', '0');
      copyEl.setAttribute('role', 'button');
      copyEl.setAttribute('aria-label', 'Copy email to clipboard');
      // find tooltip node inside
      const tooltip = copyEl.querySelector('.copy-tooltip');
      const defaultTooltipText = tooltip ? tooltip.textContent.trim() : 'Copy to clipboard';
      function showCopyTooltip(text = 'Copied!') {
        if (!tooltip) return;
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
        tooltip.style.bottom = 'calc(100% + 12px)';
        clearTimeout(copyEl._tipTimer);
        copyEl._tipTimer = setTimeout(() => {
          tooltip.textContent = defaultTooltipText;
          tooltip.style.opacity = '';
          tooltip.style.visibility = '';
          tooltip.style.bottom = '';
        }, 1600);
      }
      async function doCopyEmail() {
        // prefer data-email attribute if provided, else parse visible text
        let email = copyEl.getAttribute('data-email') || '';
        if (!email) {
          // get first text-node token
          const txt = Array.from(copyEl.childNodes)
            .filter(n => n.nodeType === Node.TEXT_NODE)
            .map(n => n.nodeValue.trim())
            .join(' ')
            .trim();
          email = (txt.split(/\s+/)[0] || '').trim();
        }
        if (!email) {
          showCopyTooltip('No email found');
          return;
        }
        try {
          await navigator.clipboard.writeText(email);
          showCopyTooltip('Copied!');
          showToast('Email copied to clipboard!', 2000, 'success');
        } catch (err) {
          // fallback for older browsers
          const ta = document.createElement('textarea');
          ta.value = email;
          ta.setAttribute('readonly', '');
          ta.style.position = 'absolute';
          ta.style.left = '-9999px';
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand('copy');
            showCopyTooltip('Copied!');
            showToast('Email copied to clipboard!', 2000, 'success');
          } catch (err2) {
            showCopyTooltip('Copy failed');
            showToast('Copy failed', 2000, 'error');
          }
          document.body.removeChild(ta);
        }
      }
      copyEl.addEventListener('click', doCopyEmail);
      copyEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          doCopyEmail();
        }
      });
    }
    /* -------------------------
       Contact form handling (UPDATED for Render backend)
       ------------------------- */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      // Set your Render backend URL
      const apiUrl = 'https://ashraful-alom-portfolio.onrender.com/api/messages';
      
      contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        
        // Store original button text
        const originalBtnText = submitBtn.textContent;

        if (!name || !email || !message) {
          showToast('⚠️ Please fill all fields!', 2200, 'error');
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          showToast('⚠️ Please enter a valid email address!', 2200, 'error');
          return;
        }

        try {
          // Show loading state
          submitBtn.disabled = true;
          submitBtn.textContent = 'Sending...';

          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message })
          });

          const data = await res.json();
          
          if (res.ok && data.success) {
            showToast('✅ Message sent successfully!', 2200, 'success');
            contactForm.reset();
          } else {
            showToast('❌ Failed to send message: ' + (data.message || 'Unknown error'), 2200, 'error');
          }
        } catch (err) {
          console.error("Error:", err);
          showToast('⚠️ Server error. Try again later.', 2500, 'error');
        } finally {
          // Restore button state
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
    /* -------------------------
       Hero typed effect (top hero) — independent of about typing
       ------------------------- */
    (function initHeroTyped() {
      const typedText = document.getElementById('typed-text');
      if (!typedText) return;
      typedText.textContent = ''; // Clear any hardcoded text immediately on load
      // Changed "B.Tech CSE Student" to "Quick Learner"
      const texts = ['Aspiring Full Stack Developer', 'Quick Learner', 'Web Developer'];
      let tIndex = 0, cIndex = 0, deleting = false;
      let typingSpeed = 100;
      function tick() {
        const current = texts[tIndex];
        if (deleting) {
          typedText.textContent = current.substring(0, cIndex - 1);
          cIndex--;
          typingSpeed = 50;
        } else {
          typedText.textContent = current.substring(0, cIndex + 1);
          cIndex++;
          typingSpeed = 100;
        }
        if (!deleting && cIndex === current.length) {
          deleting = true;
          typingSpeed = 1500;
        } else if (deleting && cIndex === 0) {
          deleting = false;
          tIndex = (tIndex + 1) % texts.length;
          typingSpeed = 500;
        }
        setTimeout(tick, typingSpeed);
      }
      setTimeout(tick, 1000);
    })();
    /* -------------------------
       End of DOMContentLoaded
       ------------------------- */
  }); // DOMContentLoaded end
  /* =========================
     GSAP / ScrollTrigger Animations (if available)
     ========================= */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    try {
      /* ---------- generic section reveal ---------- */
      gsap.utils.toArray('.section').forEach(section => {
        gsap.fromTo(section, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 1,
          scrollTrigger: { trigger: section, start: 'top 85%', toggleActions: 'play none none none' }
        });
      });
      /* ---------- project cards ---------- */
      gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.fromTo(card, { opacity: 0, y: 50 }, {
          opacity: 1, y: 0, duration: 0.8, delay: i * 0.08,
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
        });
      });
      /* ---------- timeline items ---------- */
      gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        gsap.fromTo(item, { opacity: 0, x: i % 2 === 0 ? -100 : 100 }, {
          opacity: 1, x: 0, duration: 1, delay: i * 0.12,
          scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none none' }
        });
      });
      /* ---------- skill chips ---------- */
      gsap.utils.toArray('.skill-chip').forEach((chip, i) => {
        gsap.fromTo(chip, { scale: 0, opacity: 0 }, {
          scale: 1, opacity: 1, duration: 0.45, delay: i * 0.06,
          scrollTrigger: { trigger: chip, start: 'top 92%', toggleActions: 'play none none none' }
        });
      });
      /* ---------- buttons ---------- */
      gsap.utils.toArray('.btn').forEach(btn => {
        gsap.fromTo(btn, { scale: 0 }, {
          scale: 1, duration: 0.45, ease: 'back.out(1.3)',
          scrollTrigger: { trigger: btn, start: 'top 95%', toggleActions: 'play none none none' }
        });
      });
      /* ---------- floating social links ---------- */
      gsap.to('.social-link', {
        y: -8, duration: 1.5, yoyo: true, repeat: -1, ease: 'power1.inOut', stagger: 0.18
      });
    } catch (err) {
      console.warn('GSAP animations error:', err);
    }
  } // end GSAP check
  /* =========================
     About section specific sequence (slide in + typing + image + button)
     Requires GSAP + ScrollTrigger. If absent, skip gracefully.
     ========================= */
  (function aboutSequence() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      // nothing to do (animations skipped)
      return;
    }
    // typing helper returns Promise
    function typeText(el, text, speed = 24) {
      return new Promise((resolve) => {
        if (!el) { resolve(); return; }
        el.textContent = '';
        let i = 0;
        const timer = setInterval(() => {
          el.textContent += text.charAt(i);
          i++;
          if (i >= text.length) {
            clearInterval(timer);
            resolve();
          }
        }, speed);
      });
    }
    let played = false;
    ScrollTrigger.create({
      trigger: '#about',
      start: 'top 78%',
      onEnter: () => {
        if (played) return;
        played = true;
        const aboutTextWrap = document.querySelector('#about .about-text');
        const aboutPara = document.querySelector('#about .about-text p');
        const aboutImage = document.querySelector('#about .about-image');
        const downloadBtn = document.querySelector('#about .btn-outline');
        if (!aboutTextWrap || !aboutPara || !aboutImage) return;
        
        // Get the text content from the paragraph and then clear it
        const fullText = aboutPara.textContent.trim();
        aboutPara.textContent = ''; // Clear text to prevent flash
        
        // Make the paragraph visible and set height to auto for typing animation
        aboutPara.style.opacity = '1';
        aboutPara.style.height = 'auto';
        aboutPara.style.overflow = 'visible';
        
        // Slide-in text (left) and image (right)
        gsap.fromTo(aboutTextWrap, { x: -90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.72, ease: 'power3.out' });
        gsap.fromTo(aboutImage, { x: 90, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.06 });
        
        // insert caret for effect
        const caret = document.createElement('span');
        caret.className = 'about-typing-caret';
        aboutPara.parentNode.insertBefore(caret, aboutPara.nextSibling);
        
        // start typing after short delay
        setTimeout(() => {
          typeText(aboutPara, fullText, 22).then(() => {
            // remove caret
            setTimeout(() => {
              if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
            }, 300);
            // animate download btn
            if (downloadBtn) {
              gsap.to(downloadBtn, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(1.7)' });
            }
          });
        }, 420);
      }
    });
  })();
})(); // IIFE end