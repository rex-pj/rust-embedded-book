(function () {

  /* ── 1. Reading progress bar ── */
  var bar = document.createElement('div');
  bar.id = 'reading-progress';
  document.body.appendChild(bar);

  function updateProgress() {
    var main = document.getElementById('main');
    if (!main) return;
    var scrollTop  = window.scrollY;
    var docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    var progress   = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    bar.style.transform = 'scaleX(' + progress + ')';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ── 2. Hamburger / sidebar toggle ── */
  var btn     = document.getElementById('hamburger');
  var sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', function () { sidebar.classList.toggle('open'); });
    document.addEventListener('click', function (e) {
      if (!sidebar.contains(e.target) && e.target !== btn) {
        sidebar.classList.remove('open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') sidebar.classList.remove('open');
    });
  }

  /* ── 3. Mark active sidebar link & center it ── */
  var path = window.location.pathname;
  var activeLink = null;
  document.querySelectorAll('#sidebar a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    var normalized = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
    if (path.endsWith(normalized) || a.href === window.location.href) {
      a.classList.add('active');
      activeLink = a;
    }
  });
  if (sidebar && activeLink) {
    requestAnimationFrame(function () {
      activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
    });
  }

  /* ── 4. Inject clickable § anchors on headings ── */
  document.querySelectorAll('#main h2, #main h3').forEach(function (h) {
    if (!h.id) {
      // Tạo id từ text content
      h.id = h.textContent.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60);
    }
    var anchor = document.createElement('a');
    anchor.className = 'anchor';
    anchor.href = '#' + h.id;
    anchor.setAttribute('aria-hidden', 'true');
    anchor.textContent = '§';
    h.appendChild(anchor);
  });

  /* ── 5. Version switcher: Adult → Kids ── */
  (function () {
    var path = window.location.pathname;
    // Tìm segment '/docs/' (không phải '/docs-kids/')
    var docsIdx = path.indexOf('/docs/');
    if (docsIdx === -1) return;
    var kidsURL = path.slice(0, docsIdx) + '/docs-kids/' + path.slice(docsIdx + '/docs/'.length);

    var btn = document.createElement('a');
    btn.id = 'version-switch';
    btn.href = kidsURL;
    btn.title = 'Chuyển sang phiên bản dành cho trẻ em';
    btn.innerHTML = '🎮 Phiên bản trẻ em';
    document.body.appendChild(btn);
  })();

})();
