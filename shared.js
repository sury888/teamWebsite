// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav__toggle');
  var links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Progressive-enhancement AJAX submit for any <form data-ajax-form>
  var forms = document.querySelectorAll('form[data-ajax-form]');
  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            if (status) {
              status.textContent = "Got it — we'll get back to you within a day or two.";
              status.classList.remove('is-err');
              status.classList.add('is-visible', 'is-ok');
            }
          } else {
            throw new Error('Form endpoint returned an error');
          }
        })
        .catch(function () {
          if (status) {
            status.textContent = "Something didn't go through. Email us directly at " +
              (form.dataset.fallbackEmail || 'hello@example.com') + " instead.";
            status.classList.remove('is-ok');
            status.classList.add('is-visible', 'is-err');
          }
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || 'Send'; }
        });
    });
  });
});
