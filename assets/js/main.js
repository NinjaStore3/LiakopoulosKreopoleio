/* Κρεοπωλείο Λιακόπουλος — small, dependency-free interactions */
(function () {
  'use strict';
  var d = document;

  /* ---------- header: shadow on scroll + mobile menu ---------- */
  var header = d.querySelector('.site-header');
  var toggle = d.querySelector('.nav-toggle');

  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    if (!header || !toggle) return;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    d.body.classList.toggle('no-scroll', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('nav-open'));
    });
    d.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = d.querySelectorAll('[data-reveal], .chart');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- opening hours (Europe/Athens) ---------- */
  // minutes from midnight, per weekday (0 = Sunday)
  var SCHEDULE = {
    0: [],
    1: [[450, 900]],
    2: [[450, 870], [1020, 1260]],
    3: [[450, 900]],
    4: [[450, 870], [1020, 1260]],
    5: [[450, 1260]],
    6: [[450, 960]]
  };
  var DAYS = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];

  function hhmm(m) {
    return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  }

  function athensNow() {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Athens', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var get = function (t) { return parts.filter(function (p) { return p.type === t; })[0].value; };
      return {
        day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
        min: (+get('hour')) * 60 + (+get('minute'))
      };
    } catch (e) {
      var n = new Date();
      return { day: n.getDay(), min: n.getHours() * 60 + n.getMinutes() };
    }
  }

  function currentStatus() {
    var now = athensNow();
    var today = SCHEDULE[now.day];
    for (var i = 0; i < today.length; i++) {
      var o = today[i][0], c = today[i][1];
      if (now.min >= o && now.min < c) {
        var soon = c - now.min <= 60;
        return {
          day: now.day,
          state: soon ? 'soon' : 'open',
          text: soon ? 'Κλείνει σύντομα · ' + hhmm(c) : 'Ανοιχτά τώρα · έως ' + hhmm(c)
        };
      }
    }
    for (var k = 0; k < 8; k++) {
      var dd = (now.day + k) % 7;
      var slots = SCHEDULE[dd];
      for (var j = 0; j < slots.length; j++) {
        if (k === 0 && slots[j][0] <= now.min) continue;
        var when = k === 0 ? 'σήμερα ' : k === 1 ? 'αύριο ' : DAYS[dd] + ' ';
        return { day: now.day, state: 'closed', text: 'Κλειστά · ανοίγει ' + when + hhmm(slots[j][0]) };
      }
    }
    return { day: now.day, state: 'closed', text: 'Κλειστά' };
  }

  function paintStatus() {
    var s = currentStatus();
    d.querySelectorAll('[data-status]').forEach(function (el) {
      el.classList.remove('is-open', 'is-soon', 'is-closed');
      el.classList.add('is-' + s.state);
      var t = el.querySelector('[data-status-text]');
      if (t) t.textContent = s.text;
    });
    d.querySelectorAll('[data-day]').forEach(function (row) {
      row.classList.toggle('is-today', Number(row.getAttribute('data-day')) === s.day);
    });
  }
  paintStatus();
  setInterval(paintStatus, 60 * 1000);

  /* ---------- premium cuts: list <-> chart ---------- */
  d.querySelectorAll('[data-cuts]').forEach(function (root) {
    var svg = root.querySelector('.chart svg');
    var chart = root.querySelector('.chart');
    var buttons = Array.prototype.slice.call(root.querySelectorAll('.cut'));
    var capZone = root.querySelector('[data-cap-zone]');
    var capName = root.querySelector('[data-cap-name]');
    if (!svg || !buttons.length) return;

    function activate(btn) {
      var zone = btn.getAttribute('data-zone');
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      svg.querySelectorAll('[data-zone]').forEach(function (el) {
        el.classList.toggle('is-active', el.getAttribute('data-zone') === zone);
      });
      if (capZone) capZone.textContent = btn.getAttribute('data-zone-label');
      if (capName) capName.textContent = btn.getAttribute('data-name');
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { activate(b); });
    });

    // hovering / tapping an area of the animal selects the matching cut
    svg.querySelectorAll('.z[data-hot]').forEach(function (z) {
      var zone = z.getAttribute('data-zone');
      var match = buttons.filter(function (b) { return b.getAttribute('data-zone') === zone; });
      if (!match.length) return;
      // hover: jump to the zone's first cut (unless one of its cuts is already shown)
      z.addEventListener('mouseenter', function () {
        if (match.indexOf(root.querySelector('.cut.is-active')) === -1) activate(match[0]);
      });
      // click / tap: cycle through the cuts of that zone (e.g. Ribeye -> Tomahawk)
      z.addEventListener('click', function () {
        var i = match.indexOf(root.querySelector('.cut.is-active'));
        activate(match[(i + 1) % match.length]);
      });
    });

    activate(root.querySelector('.cut.is-active') || buttons[0]);
    if (chart && !('IntersectionObserver' in window)) chart.classList.add('is-in');
  });

  /* ---------- footer year ---------- */
  d.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
