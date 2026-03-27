/* nav.js — navigation & UI for The Rust Book (VI) */
(function () {
  'use strict';

  /* ── Progress bar ── */
  const bar = document.getElementById('progress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
    }, { passive: true });
  }

  /* ── Hamburger + sidebar overlay ── */
  const ham = document.getElementById('hamburger');
  const sb  = document.getElementById('sidebar');

  // Create overlay element for mobile sidebar backdrop
  const overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  document.body.appendChild(overlay);

  function openSidebar() {
    sb.classList.add('open');
    overlay.classList.add('visible');
    ham.textContent = '✕';
  }
  function closeSidebar() {
    sb.classList.remove('open');
    overlay.classList.remove('visible');
    ham.textContent = '☰';
  }

  if (ham && sb) {
    ham.addEventListener('click', (e) => {
      e.stopPropagation();
      sb.classList.contains('open') ? closeSidebar() : openSidebar();
    });
    overlay.addEventListener('click', closeSidebar);
  }

  /* ── Active link ── */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  let activeLink = null;
  let activeGroup = null;
  document.querySelectorAll('#sidebar a').forEach(a => {
    if (a.getAttribute('href') === current) {
      a.classList.add('active');
      activeLink = a;
      activeGroup = a.closest('.nav-group');
    }
  });

  /* ── Collapsible sidebar groups ── */
  // We wrap links in a body div for clean height animation.
  // On page load: collapse instantly (no transition).
  // After load: enable transition for user clicks only.
  document.querySelectorAll('#sidebar .nav-group').forEach(group => {
    const title = group.querySelector('.nav-group-title');
    if (!title) return; // intro group — always visible

    // Wrap all direct-child <a> links in a collapsible body div
    const links = Array.from(group.children).filter(el => el.tagName === 'A');
    const body = document.createElement('div');
    body.className = 'nav-group-body';
    links.forEach(a => body.appendChild(a));
    group.appendChild(body);

    if (group !== activeGroup) {
      // Collapse instantly — set height:0 with no transition
      body.style.height = '0';
      body.style.overflow = 'hidden';
      group.classList.add('collapsed');
    } else {
      // Active group: let it be its natural height
      body.style.height = 'auto';
    }

    title.addEventListener('click', () => {
      const isCollapsed = group.classList.contains('collapsed');
      if (isCollapsed) {
        // Expand: measure natural height, animate from 0 to it
        group.classList.remove('collapsed');
        body.style.transition = 'height .2s ease';
        body.style.height = '0';
        // Force reflow so transition fires
        body.offsetHeight; // eslint-disable-line no-unused-expressions
        body.style.height = body.scrollHeight + 'px';
        body.addEventListener('transitionend', () => {
          body.style.height = 'auto'; // let it grow if content changes
          body.style.transition = '';
        }, { once: true });
      } else {
        // Collapse: animate from current height to 0
        body.style.height = body.offsetHeight + 'px';
        body.style.overflow = 'hidden';
        body.offsetHeight; // force reflow
        body.style.transition = 'height .2s ease';
        body.style.height = '0';
        group.classList.add('collapsed');
        body.addEventListener('transitionend', () => {
          body.style.transition = '';
        }, { once: true });
      }
    });
  });

  /* ── Sidebar scroll: restore saved position, fallback to center active link ── */
  const SB_SCROLL_KEY = 'sb-scroll';
  const savedScroll = sessionStorage.getItem(SB_SCROLL_KEY);

  if (sb) {
    if (savedScroll !== null) {
      // Restore immediately after groups have collapsed (no layout jitter)
      sb.scrollTop = parseInt(savedScroll, 10);
      sessionStorage.removeItem(SB_SCROLL_KEY);

      // Safety check: if active link ended up off-screen (e.g. crossed chapters), scroll to it
      requestAnimationFrame(() => {
        if (!activeLink) return;
        const sbRect = sb.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        if (linkRect.top < sbRect.top + 4 || linkRect.bottom > sbRect.bottom - 4) {
          activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
      });
    } else if (activeLink) {
      // First visit or no saved position: center the active link
      requestAnimationFrame(() => {
        activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    }

    // Save scroll position the moment user clicks any sidebar link
    sb.addEventListener('click', (e) => {
      if (e.target.closest('a[href]')) {
        try { sessionStorage.setItem(SB_SCROLL_KEY, sb.scrollTop); } catch (_) {}
      }
    }, { capture: true });
  }

  /* ── Heading anchors ── */
  document.querySelectorAll('h2[id], h3[id]').forEach(h => {
    const a = document.createElement('a');
    a.className = 'anchor'; a.href = '#' + h.id; a.textContent = '§';
    h.appendChild(a);
  });

  /* ── Syntax highlight (minimal Rust) ── */
  document.querySelectorAll('pre code').forEach(block => {
    if (block.dataset.highlighted) return;
    block.dataset.highlighted = '1';
    const lang = block.className.match(/language-(\w+)/)?.[1] || '';
    if (lang === 'rust' || lang === '') {
      let c = block.textContent;
      c = c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      c = c.replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>');
      c = c.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
      c = c.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="str">$1</span>');
      c = c.replace(/('(?:[^'\\]|\\.)+')/g, '<span class="str">$1</span>');
      c = c.replace(/\b('(?:[a-z_]\w*))\b/g, '<span class="life">$1</span>');
      c = c.replace(/(#\[.*?\])/gs, '<span class="attr">$1</span>');
      c = c.replace(/\b([a-z_]\w*)!/g, '<span class="macro">$1!</span>');
      const KW = 'fn|let|mut|const|static|struct|enum|impl|trait|type|use|mod|pub|crate|super|self|Self|return|if|else|match|loop|while|for|in|break|continue|where|async|await|move|ref|unsafe|extern|dyn|box|as';
      c = c.replace(new RegExp('\\b(' + KW + ')\\b', 'g'), '<span class="kw">$1</span>');
      c = c.replace(/\b(true|false|None|Some|Ok|Err)\b/g, '<span class="kw2">$1</span>');
      c = c.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="type">$1</span>');
      c = c.replace(/\b(\d[\d_]*(?:\.\d[\d_]*)?(?:[a-z]+)?)\b/g, '<span class="num">$1</span>');
      block.innerHTML = c;
    }
  });

  /* ── Copy button for code blocks ── */
  document.querySelectorAll('pre').forEach(pre => {
    const btn = document.createElement('button');
    btn.textContent = 'Copy';
    btn.style.cssText = 'position:absolute;top:10px;right:' + (pre.dataset.lang ? '64px' : '10px') + ';background:#374151;color:#9ca3af;border:none;padding:3px 10px;border-radius:5px;font-size:11px;cursor:pointer;font-family:sans-serif;';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code').textContent).then(() => {
        btn.textContent = 'Copied!';
        btn.style.color = '#86efac';
        setTimeout(() => { btn.textContent = 'Copy'; btn.style.color = '#9ca3af'; }, 1500);
      });
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });

})();
