document.addEventListener('DOMContentLoaded', function () {

  // ── Nav scroll class ──────────────────────────────────
  var nav = document.querySelector('.nav');
  function onScroll() {
    nav && nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Mobile nav toggle ─────────────────────────────────
  var toggle = document.querySelector('.nav__toggle');
  var links  = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close on link click
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('is-open'); });
    });
  }

  // ── Scroll-reveal via IntersectionObserver ────────────
  var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    // fallback: show everything immediately
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  // ── Smooth counter animation for stat values ──────────
  function animateCount(el) {
    var text = el.textContent;
    var numMatch = text.match(/[\d.]+/);
    if (!numMatch) return;
    var target = parseFloat(numMatch[0]);
    var prefix = text.slice(0, numMatch.index);
    var suffix = text.slice(numMatch.index + numMatch[0].length);
    var isFloat = numMatch[0].includes('.');
    var duration = 900, start = null;
    function step(ts) {
      if (!start) start = ts;
      var prog = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - prog, 3);
      var val = target * eased;
      el.textContent = prefix + (isFloat ? val.toFixed(2) : Math.round(val)) + suffix;
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var statObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          statObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat__val, .bibcard__stat-val').forEach(function (el) {
      statObs.observe(el);
    });
  }

  // ── Progressive-enhancement form submit ──────────────
  document.querySelectorAll('form[data-ajax-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status    = form.querySelector('.form__status');
      var submitBtn = form.querySelector('[type="submit"]');
      var origLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (status) {
              status.textContent = "Got it — we'll reply within a day or two.";
              status.className = 'form__status is-visible is-ok';
            }
          } else { throw new Error(); }
        })
        .catch(function () {
          if (status) {
            status.textContent = 'Something went wrong. Email us directly at ' +
              (form.dataset.fallbackEmail || 'hello@example.com') + '.';
            status.className = 'form__status is-visible is-err';
          }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
        });
    });
  });

});