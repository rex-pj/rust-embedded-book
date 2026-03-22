(function () {
  /* ─────────────────────────────────────────
     1. Tính prefix đường dẫn tương đối
     Tất cả trang đều ở depth 0 (index.html)
     hoặc depth 1 (intro/page.html, v.v.)
  ───────────────────────────────────────── */
  function getPrefix() {
    var path = window.location.pathname;
    var idx  = path.indexOf('docs-kids');
    if (idx === -1) {
      // Chạy từ file:// hoặc không qua thư mục docs-kids
      // Dùng số lượng "/" sau tên trang để đoán depth
      var clean = path.replace(/\/$/, '');
      var parts = clean.split('/').filter(Boolean);
      // Nếu phần tử cuối có extension html và cách gốc 2+ segment → depth 1
      return (parts.length >= 2 && parts[parts.length - 1].endsWith('.html') &&
              parts[parts.length - 2] !== 'docs-kids') ? '../' : '';
    }
    var rel = path.slice(idx + 'docs-kids'.length).replace(/^\//, '');
    return rel.indexOf('/') !== -1 ? '../' : '';
  }
  var P = getPrefix(); // '' hoặc '../'

  /* ─────────────────────────────────────────
     2. Cấu trúc điều hướng đầy đủ
  ───────────────────────────────────────── */
  var NAV = [
    { label: '🏠 Trang chủ', href: 'index.html' },
    {
      section: '🔰 Giới thiệu', children: [
        { label: '📖 Tổng quan', href: 'intro/index.html' },
        { label: '⚙️ Phần cứng robot', href: 'intro/hardware.html' },
        { label: '🏕️ no_std — Tự lập', href: 'intro/no-std.html' },
        { label: '🧰 Công cụ lập trình', href: 'intro/tooling.html' }
      ]
    },
    {
      section: '🚀 Bắt đầu viết code', children: [
        { label: '📋 Tổng quan', href: 'start/index.html' },
        { label: '🖥️ QEMU — Robot ảo', href: 'start/qemu.html' },
        { label: '🔌 Robot thật', href: 'start/hardware.html' },
        { label: '📦 Registers', href: 'start/registers.html' },
        { label: '💬 Semihosting', href: 'start/semihosting.html' },
        { label: '💥 Panicking', href: 'start/panicking.html' },
        { label: '⚡ Interrupts', href: 'start/exceptions.html' }
      ]
    },
    {
      section: '🛡️ Bảo đảm tĩnh', children: [
        { label: '📋 Tổng quan', href: 'static-guarantees/index.html' },
        { label: '🔒 Typestate', href: 'static-guarantees/typestate-programming.html' },
        { label: '⚡ Zero-cost abstractions', href: 'static-guarantees/zero-cost-abstractions.html' }
      ]
    },
    { label: '📦 Collections', href: 'collections/index.html' },
    { label: '🤹 Concurrency', href: 'concurrency/index.html' },
    { label: '🌍 Portability', href: 'portability/index.html' },
    { label: '🎨 Design Patterns', href: 'design-patterns/index.html' },
    {
      section: '🤝 Interoperability', children: [
        { label: '🔗 Tổng quan', href: 'interoperability/index.html' },
        { label: '🦀 C dùng Rust', href: 'interoperability/c-with-rust.html' },
        { label: '⚙️ Rust dùng C', href: 'interoperability/rust-with-c.html' }
      ]
    },
    { label: '⚖️ Tốc độ vs Kích thước', href: 'unsorted/speed-vs-size.html' }
  ];

  /* ─────────────────────────────────────────
     3. Tạo HTML cho sidebar
  ───────────────────────────────────────── */
  function buildSidebarHTML() {
    var html = '<div class="sidebar-brand">'
      + '<button id="sidebar-close" aria-label="Đóng menu">✕</button>'
      + '<a href="' + P + 'index.html">🤖 Rust Embedded<br>'
      + '<small>cho các bạn nhỏ 🦀</small></a>'
      + '</div>';

    NAV.forEach(function (item) {
      if (item.section) {
        html += '<div class="nav-section">'
          + '<span class="nav-section-title">' + item.section + '</span>';
        item.children.forEach(function (child) {
          html += '<a href="' + P + child.href + '" class="nav-child">'
            + child.label + '</a>';
        });
        html += '</div>';
      } else {
        html += '<a href="' + P + item.href + '">' + item.label + '</a>';
      }
    });

    return html;
  }

  /* ─────────────────────────────────────────
     4. Inject vào DOM
  ───────────────────────────────────────── */
  // Overlay
  var overlay = document.createElement('div');
  overlay.id = 'sidebar-overlay';
  document.body.prepend(overlay);

  // Sidebar
  var sidebar = document.createElement('nav');
  sidebar.id = 'sidebar';
  sidebar.innerHTML = buildSidebarHTML();
  document.body.prepend(sidebar);

  // Hamburger button
  var hamBtn = document.createElement('button');
  hamBtn.id = 'hamburger';
  hamBtn.setAttribute('aria-label', 'Mở menu điều hướng');
  hamBtn.innerHTML = '☰';
  document.body.prepend(hamBtn);

  /* ─────────────────────────────────────────
     5. Toggle logic
  ───────────────────────────────────────── */
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    document.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  }

  hamBtn.addEventListener('click', openSidebar);
  overlay.addEventListener('click', closeSidebar);
  document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ─────────────────────────────────────────
     6. Đánh dấu link hiện tại
  ───────────────────────────────────────── */
  var currentPath = window.location.pathname;
  sidebar.querySelectorAll('a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (!href) return;
    // So sánh phần cuối URL
    var normalized = href.replace(/^\.\.\//, '').replace(/^\.\//, '');
    if (currentPath.endsWith(normalized) || a.href === window.location.href) {
      a.classList.add('active');
    }
  });

  /* ─────────────────────────────────────────
     7. Version switcher: Kids → Adult
  ───────────────────────────────────────── */
  (function () {
    var path = window.location.pathname;
    var kidsIdx = path.indexOf('/docs-kids/');
    if (kidsIdx === -1) return;
    var adultURL = path.slice(0, kidsIdx) + '/docs/' + path.slice(kidsIdx + '/docs-kids/'.length);

    var btn = document.createElement('a');
    btn.id = 'version-switch';
    btn.href = adultURL;
    btn.title = 'Chuyển sang phiên bản người lớn';
    btn.innerHTML = '📚 Người lớn';
    document.body.appendChild(btn);
  })();

  /* ─────────────────────────────────────────
     8. Quiz toggle (mobile-friendly)
  ───────────────────────────────────────── */
  document.querySelectorAll('.quiz-q').forEach(function (q) {
    q.addEventListener('click', function () { q.classList.toggle('open'); });
  });

})();
