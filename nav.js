// Shared navbar injector — FoodHub
function injectNav(activePage) {
  const pages = [
    { href: 'index.html', label: 'Home', id: 'home' },
    { href: 'menu.html', label: 'Menu', id: 'menu' },
    { href: 'about.html', label: 'About', id: 'about' },
    { href: 'gallery.html', label: 'Gallery', id: 'gallery' },
    { href: 'contact.html', label: 'Contact', id: 'contact' },
  ];

  const navHTML = `
  <nav class="nav" id="mainNav">
    <div class="nav-inner">
      <a href="index.html" class="nav-logo">
        <div class="nav-logo-icon">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7c0-4.5-6.72-5-8.03-5-1.28 0-8 .5-8 5h16.03zM1.02 17h15v2h-15z"/>
          </svg>
        </div>
        <span class="nav-logo-text">Food<span>Hub</span></span>
      </a>
      <ul class="nav-links">
        ${pages.map(p => `<li><a href="${p.href}" class="nav-link ${activePage === p.id ? 'active' : ''}">${p.label}</a></li>`).join('')}
        <li><a href="faq.html" class="nav-link ${activePage === 'faq' ? 'active' : ''}">FAQ</a></li>
      </ul>
      <button class="nav-cart-btn" onclick="toggleCart()" title="Your Cart">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Cart
        <span class="cart-count" style="display:none">0</span>
      </button>
      <a href="login.html" class="nav-cta">Sign In</a>
      <button class="nav-hamburger" onclick="toggleMobileMenu()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <div class="nav-mobile-menu" id="mobileMenu">
    ${pages.map(p => `<a href="${p.href}" ${activePage === p.id ? 'style="color:var(--brand)"' : ''}>${p.label}</a>`).join('')}
    <a href="faq.html" ${activePage === 'faq' ? 'style="color:var(--brand)"' : ''}>FAQ</a>
    <a href="login.html" class="btn btn-primary btn-sm" style="margin-top:0.75rem;text-align:center">Sign In →</a>
  </div>

  <!-- Cart Sidebar -->
  <div class="cart-overlay" id="cartOverlay"></div>
  <div class="cart-sidebar" id="cartSidebar">
    <div class="cart-header">
      <h3>🛒 Your Cart</h3>
      <button class="cart-close" onclick="closeCart()" title="Close">×</button>
    </div>
    <div class="cart-items" id="cartItems">
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <p>Your cart is empty</p>
        <a href="menu.html" class="btn btn-outline btn-sm" style="margin-top:1rem">Browse Menu</a>
      </div>
    </div>
    <div class="cart-footer">
      <div id="cartTotal"></div>
      <button class="btn btn-primary btn-full" style="margin-top:1rem;font-size:0.95rem" onclick="placeOrder()">Place Order →</button>
      <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;margin-top:0.75rem">🚚 Free delivery on orders above $20</p>
    </div>
  </div>

  <!-- Order Success Modal -->
  <div id="orderSuccess" style="display:none">
    <div class="order-success-box">
      <div class="order-success-icon">✅</div>
      <h2 style="margin-bottom:0.75rem">Order Placed!</h2>
      <p style="color:var(--text-muted);margin-bottom:2rem;font-size:0.95rem">Your order is being prepared and will arrive in approximately 28 minutes.</p>
      <button class="btn btn-primary btn-full" onclick="document.getElementById('orderSuccess').style.display='none'">Track My Order →</button>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>
  `;

  document.body.insertAdjacentHTML('afterbegin', navHTML);

  // Scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}
