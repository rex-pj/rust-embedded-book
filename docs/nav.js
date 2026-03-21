// Navigation sidebar toggle and active link
(function() {
  // Hamburger menu
  const btn = document.getElementById('hamburger');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && e.target !== btn) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Mark active link
  const links = document.querySelectorAll('#sidebar a');
  const path = window.location.pathname;
  links.forEach(a => {
    if (a.href && path.endsWith(a.getAttribute('href').replace(/^\.\.\//, '').replace(/^\.\//, ''))) {
      a.classList.add('active');
    }
    // Fallback: compare full href
    if (a.href === window.location.href) {
      a.classList.add('active');
    }
  });
})();
