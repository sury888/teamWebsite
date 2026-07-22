document.addEventListener('DOMContentLoaded', function () {

  // ─────────────────────────────────────────────────────────────
  // NAV SCROLL CLASS
  // ─────────────────────────────────────────────────────────────
  const nav = document.querySelector('.nav');
  function onScroll() {
    nav && nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // ─────────────────────────────────────────────────────────────
  // MOBILE NAV TOGGLE
  // ─────────────────────────────────────────────────────────────
  const toggle = document.querySelector('.nav__toggle');
  const links  = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => links.classList.remove('is-open'));
    });
  }


  // ─────────────────────────────────────────────────────────────
  // SCROLL REVEAL
  // ─────────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }


  // ─────────────────────────────────────────────────────────────
  // STAT COUNTER ANIMATION
  // ─────────────────────────────────────────────────────────────
  function animateCount(el) {
    const text = el.textContent;
    const numMatch = text.match(/[\d.]+/);
    if (!numMatch) return;

    const target = parseFloat(numMatch[0]);
    const prefix = text.slice(0, numMatch.index);
    const suffix = text.slice(numMatch.index + numMatch[0].length);
    const isFloat = numMatch[0].includes('.');

    const duration = 900;
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const val = target * eased;

      el.textContent = prefix + (isFloat ? val.toFixed(2) : Math.round(val)) + suffix;

      if (prog < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    const statObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          statObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat__val, .bibcard__stat-val')
      .forEach(el => statObs.observe(el));
  }


  // ─────────────────────────────────────────────────────────────
  // AJAX FORM SUBMIT
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('form[data-ajax-form]').forEach(form => {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const status    = form.querySelector('.form__status');
      const submitBtn = form.querySelector('[type="submit"]');
      const origLabel = submitBtn ? submitBtn.textContent : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
      .then(res => {
        if (res.ok) {
          form.reset();
          if (status) {
            status.textContent = "Got it — we'll reply within a day or two.";
            status.className = 'form__status is-visible is-ok';
          }
        } else {
          throw new Error();
        }
      })
      .catch(() => {
        if (status) {
          status.textContent =
            'Something went wrong. Email us directly at ' +
            (form.dataset.fallbackEmail || 'hello@example.com') + '.';
          status.className = 'form__status is-visible is-err';
        }
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = origLabel;
        }
      });
    });
  });



  // ─────────────────────────────────────────────────────────────
  // CUSTOM CURSOR (dot + lerped ring)
  // ─────────────────────────────────────────────────────────────
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    const cursorDot  = document.createElement('div');
    const cursorRing = document.createElement('div');

    cursorDot.className  = 'cursor-dot';
    cursorRing.className = 'cursor-ring';

    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    const lerp = (a, b, n) => (1 - n) * a + n * b;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    function animateRing() {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover states
    document.querySelectorAll('a, button, .btn, input, textarea, select')
      .forEach(el => {
        el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
        el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
      });

    window.addEventListener('mousedown', () => cursorRing.classList.add('is-down'));
    window.addEventListener('mouseup',   () => cursorRing.classList.remove('is-down'));
  }


  // ─────────────────────────────────────────────────────────────
  // MAGNETIC BUTTONS (28% strength)
  // ─────────────────────────────────────────────────────────────
  const magneticEls = document.querySelectorAll('.btn, button, .magnetic');

  magneticEls.forEach(el => {
    const strength = 0.28;

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = (e.clientX - cx);
      const dy = (e.clientY - cy);

      el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0,0)';
    });
  });


  // ─────────────────────────────────────────────────────────────
  // SPRING EASING ON HOVER (cards + race rows)
  // ─────────────────────────────────────────────────────────────
  document.querySelectorAll('.bibcard, .race-row').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.45s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = 'translateY(-4px)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform 0.45s cubic-bezier(.34,1.56,.64,1)';
      el.style.transform = 'translateY(0)';
    });
  });


  // ─────────────────────────────────────────────────────────────
  // LETTER-BY-LETTER HERO TITLES
  // ─────────────────────────────────────────────────────────────
  /*document.querySelectorAll('.hero__title').forEach(title => {
    const text = title.innerHTML;
    const chars = [...text];

    let html = '';
    let delay = 0;

    chars.forEach(ch => {
      if (ch === '<') {
        // preserve <em> tags
        html += ch;
      } else if (ch === '>') {
        html += ch;
      } else {
        html += `<span class="char" style="transition-delay:${delay}ms">${ch}</span>`;
        delay += 32;
      }
    });

    title.innerHTML = html;
  });*/
  document.querySelectorAll('.hero__title').forEach(title => {
  const original = title.innerHTML;

  // Temporarily protect tags
  let safe = original
    .replace(/<br\s*\/?>/g, '[[BR]]')
    .replace(/<em>/g, '[[EM]]')
    .replace(/<\/em>/g, '[[EMEND]]');

  let html = '';
  let delay = 0;

  for (let i = 0; i < safe.length; i++) {
    const ch = safe[i];

    // Restore tags
    if (safe.startsWith('[[BR]]', i)) {
      html += '<br>';
      i += 5;
      continue;
    }
    if (safe.startsWith('[[EM]]', i)) {
      html += '<em>';
      i += 4;
      continue;
    }
    if (safe.startsWith('[[EMEND]]', i)) {
      html += '</em>';
      i += 7;
      continue;
    }

    // Normal characters
    html += `<span class="char" style="transition-delay:${delay}ms">${ch}</span>`;
    delay += 32;
  }

  title.innerHTML = html;
});


});
