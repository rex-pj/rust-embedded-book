/* ===== DISCOVERY NAV.JS ===== */
(function () {
  /* --- Theme toggle (initialize before render) --- */
  var savedTheme = localStorage.getItem('theme');
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
  /* --- Reading progress bar --- */
  var bar = document.getElementById('reading-progress');
  if (bar) {
    function updateProgress() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (docHeight > 0 ? scrollTop / docHeight : 0) + ')';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* --- Hamburger sidebar toggle --- */
  var btn = document.getElementById('hamburger');
  var sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', function () {
      sidebar.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!sidebar.contains(e.target) && e.target !== btn) {
        sidebar.classList.remove('open');
      }
    });
  }

  /* --- Active sidebar item + center scroll --- */
  var nav = document.getElementById('sidebar-nav');
  if (nav) {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    var links = nav.querySelectorAll('a');
    var activeLink = null;

    links.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var hrefFile = href.split('/').pop() || 'index.html';
      if (hrefFile === current) {
        a.classList.add('active');
        activeLink = a;
      }
    });

    /* Scroll active item to center of sidebar nav viewport */
    if (activeLink && nav) {
      /* requestAnimationFrame ensures layout is complete */
      requestAnimationFrame(function () {
        var navRect = nav.getBoundingClientRect();
        var linkRect = activeLink.getBoundingClientRect();
        var offset = linkRect.top - navRect.top + nav.scrollTop;
        var center = offset - (nav.clientHeight / 2) + (linkRect.height / 2);
        nav.scrollTop = Math.max(0, center);
      });
    }
  }

  /* --- Sidebar search filter --- */
  var searchInput = document.getElementById('sidebar-search-input');
  if (searchInput && nav) {
    searchInput.addEventListener('input', function () {
      var q = this.value.trim().toLowerCase();
      var links = nav.querySelectorAll('a');
      links.forEach(function (a) {
        var text = a.textContent.toLowerCase();
        a.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
      /* Show/hide group titles */
      nav.querySelectorAll('.nav-group-title').forEach(function (title) {
        if (!q) { title.style.display = ''; return; }
        var next = title.nextElementSibling;
        var visible = false;
        while (next && !next.classList.contains('nav-group-title')) {
          if (next.style.display !== 'none') visible = true;
          next = next.nextElementSibling;
        }
        title.style.display = visible ? '' : 'none';
      });
    });
  }

  /* --- Copy code button --- */
  document.querySelectorAll('pre').forEach(function (pre) {
    var header = pre.previousElementSibling;
    var btn;
    if (header && header.classList.contains('code-header')) {
      btn = header.querySelector('.copy-btn');
    }
    if (!btn) return;
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      navigator.clipboard.writeText(text).then(function () {
        btn.classList.add('copied');
        btn.innerHTML = '✓ Đã copy';
        setTimeout(function () {
          btn.classList.remove('copied');
          btn.innerHTML = '⎘ Copy';
        }, 2000);
      });
    });
  });

  /* --- Keyboard navigation --- */
  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    var prevBtn = document.querySelector('.nav-btn:not(.next)');
    var nextBtn = document.querySelector('.nav-btn.next');
    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
  });

  /* --- Theme toggle button (inject into topbar) --- */
  var topbar = document.getElementById('topbar');
  if (topbar) {
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'theme-toggle';
    toggleBtn.title = 'Chuyển đổi giao diện';
    function updateToggleIcon() {
      var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      toggleBtn.textContent = isDark ? '☀️' : '🌙';
    }
    updateToggleIcon();
    toggleBtn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleIcon();
    });
    topbar.appendChild(toggleBtn);
  }
})();
