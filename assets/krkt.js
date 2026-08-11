/* KRKT Co. — shared behavior: scroll reveal, mobile nav, contact composer. */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* ---------- Scroll reveal ----------
     threshold 0 with a bottom inset so blocks taller than the viewport
     (the house index, the thesis ledger) still reveal. */
  var revealables = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('nav.primary');
  if (toggle && nav) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', function () {
      setOpen(nav.classList.contains('open') === false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Contact page: topic radios ---------- */
  var pills = Array.prototype.slice.call(document.querySelectorAll('.topic-pill'));
  var select = function (pill) {
    pills.forEach(function (p) {
      var on = p === pill;
      p.classList.toggle('selected', on);
      p.setAttribute('aria-checked', String(on));
      p.tabIndex = on ? 0 : -1;
    });
  };
  if (pills.length) {
    select(document.querySelector('.topic-pill.selected') || pills[0]);
    pills.forEach(function (pill, i) {
      pill.addEventListener('click', function () { select(pill); });
      pill.addEventListener('keydown', function (e) {
        var step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1
          : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = pills[(i + step + pills.length) % pills.length];
        select(next);
        next.focus();
      });
    });
  }

  /* ---------- Contact page: mailto composer ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    /* mailto: URLs are length-limited in practice; keep the body well under it
       so a long message is never silently truncated by the mail client. */
    var MAX_MESSAGE = 1400;
    var routes = {
      General: 'hello@krkt.shop',
      Press: 'press@krkt.shop',
      Invest: 'invest@krkt.shop',
      Wholesale: 'wholesale@krkt.shop',
      Careers: 'join@krkt.shop'
    };
    var msgField = document.getElementById('c-msg');
    var status = document.getElementById('form-status');
    var showError = function (text) {
      status.textContent = text;
      status.classList.add('shown');
    };

    msgField.addEventListener('input', function () {
      if (msgField.value.length <= MAX_MESSAGE) status.classList.remove('shown');
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.classList.remove('shown');

      var selected = document.querySelector('.topic-pill.selected');
      var topic = (selected && selected.dataset.topic) || 'General';
      var to = routes[topic] || routes.General;
      var name = document.getElementById('c-name').value.trim();
      var email = document.getElementById('c-email').value.trim();
      var msg = msgField.value.trim();

      if (msg.length > MAX_MESSAGE) {
        showError('That message is longer than a mail link can carry. Trim it to '
          + MAX_MESSAGE + ' characters, or write to ' + to + ' directly.');
        msgField.focus();
        return;
      }

      var subject = '[' + topic.toUpperCase() + '] Message to KRKT Co.' + (name ? ' — ' + name : '');
      var body = msg + '\n\n—\n' + name + (email ? '\n' + email : '');
      window.location.href = 'mailto:' + to
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);
    });
  }
})();
