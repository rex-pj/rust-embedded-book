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

  /* ── Hamburger ── */
  const ham = document.getElementById('hamburger');
  const sb  = document.getElementById('sidebar');
  if (ham && sb) {
    ham.addEventListener('click', () => {
      sb.classList.toggle('open');
      ham.textContent = sb.classList.contains('open') ? '✕' : '☰';
    });
    document.addEventListener('click', (e) => {
      if (!sb.contains(e.target) && !ham.contains(e.target)) {
        sb.classList.remove('open');
        ham.textContent = '☰';
      }
    });
  }

  /* ── Active link + scroll into view ── */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  let activeLink = null;
  document.querySelectorAll('#sidebar a').forEach(a => {
    if (a.getAttribute('href') === current) { a.classList.add('active'); activeLink = a; }
  });
  if (activeLink) {
    activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
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
      // escape for safety
      c = c.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      // comments
      c = c.replace(/(\/\/[^\n]*)/g, '<span class="comment">$1</span>');
      c = c.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="comment">$1</span>');
      // strings
      c = c.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="str">$1</span>');
      c = c.replace(/('(?:[^'\\]|\\.)+')/g, '<span class="str">$1</span>');
      // lifetimes (before keywords)
      c = c.replace(/\b('(?:[a-z_]\w*))\b/g, '<span class="life">$1</span>');
      // attributes
      c = c.replace(/(#\[.*?\])/gs, '<span class="attr">$1</span>');
      // macros
      c = c.replace(/\b([a-z_]\w*)!/g, '<span class="macro">$1!</span>');
      // keywords
      const KW = 'fn|let|mut|const|static|struct|enum|impl|trait|type|use|mod|pub|crate|super|self|Self|return|if|else|match|loop|while|for|in|break|continue|where|async|await|move|ref|unsafe|extern|dyn|box|as';
      c = c.replace(new RegExp('\\b(' + KW + ')\\b', 'g'), '<span class="kw">$1</span>');
      // bool/special
      c = c.replace(/\b(true|false|None|Some|Ok|Err)\b/g, '<span class="kw2">$1</span>');
      // types (CamelCase)
      c = c.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span class="type">$1</span>');
      // numbers
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
