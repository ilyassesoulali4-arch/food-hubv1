// ── FOODHUB APP.JS — Complete Application Logic ──

const CART_KEY = 'fh_cart_v2';
const USER_KEY = 'fh_user';
const ORDERS_KEY = 'fh_orders';

// ── DATABASE SIMULATION ──
const DB = {
  users: JSON.parse(localStorage.getItem('fh_users') || '[]'),
  orders: JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'),

  addUser(user) {
    this.users.push(user);
    localStorage.setItem('fh_users', JSON.stringify(this.users));
  },
  findUser(email) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  addOrder(order) {
    order.id = 'FH-' + Date.now().toString(36).toUpperCase();
    order.date = new Date().toISOString();
    order.status = 'Confirmed';
    this.orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(this.orders));
    return order;
  },
  getUserOrders(email) {
    return this.orders.filter(o => o.email === email);
  }
};

// ── SESSION ──
// Checks sessionStorage first, then falls back to persistent localStorage
function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY))
        || JSON.parse(localStorage.getItem('fh_persist_user'))
        || null;
  } catch { return null; }
}
function setCurrentUser(user) {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  updateNavUser();
}
function logout() {
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem('fh_persist_user');
  updateNavUser();
  showToast('Signed out successfully');
}
function updateNavUser() {
  const user = getCurrentUser();
  const cta = document.querySelector('.nav-cta');
  if (!cta) return;
  if (user) {
    const name = user.firstName || user.email?.split('@')[0] || 'Account';
    if (user.avatar) {
      cta.innerHTML = `<img src="${user.avatar}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;margin-right:4px;vertical-align:middle" onerror="this.style.display='none'">${name}`;
    } else {
      cta.textContent = name;
    }
    cta.href = '#';
    cta.title = `Signed in as ${user.email} — click to sign out`;
    cta.onclick = (e) => { e.preventDefault(); logout(); };
  } else {
    cta.innerHTML = 'Sign In';
    cta.href = 'login.html';
    cta.title = '';
    cta.onclick = null;
  }
}

// ── CART ──
function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(name, price, img) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ name, price: parseFloat(price), img: img || '', qty: 1 });
  }
  saveCart(cart);
  showToast('✓ Added to cart — ' + name);
  renderCartItems();
  // Animate add button
  const btns = document.querySelectorAll('.add-btn');
  btns.forEach(b => {
    if (b.closest('.food-card')?.querySelector('h3')?.textContent === name) {
      b.style.transform = 'scale(1.25)';
      setTimeout(() => b.style.transform = '', 300);
    }
  });
}

function removeFromCart(name) {
  const cart = getCart().filter(i => i.name !== name);
  saveCart(cart);
  renderCartItems();
}

function changeQty(name, delta) {
  let cart = getCart();
  const item = cart.find(i => i.name === name);
  if (item) {
    item.qty += delta;
    if (item.qty < 1) cart = cart.filter(i => i.name !== name);
  }
  saveCart(cart);
  renderCartItems();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total ? 'flex' : 'none';
  });
}

function renderCartItems() {
  const cart = getCart();
  const el = document.getElementById('cartItems');
  if (!el) return;

  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty">
      <div class="cart-empty-icon">🛒</div>
      <p>Your cart is empty</p>
      <a href="menu.html" class="btn btn-outline btn-sm" style="margin-top:1rem">Browse Menu</a>
    </div>`;
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.innerHTML = '';
    return;
  }

  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${item.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=60'}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&q=60'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
          <span style="font-size:0.9rem;font-weight:700;min-width:22px;text-align:center">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.name.replace(/'/g, "\\'")}')">×</button>
    </div>
  `).join('');

  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = sub >= 20 ? 0 : 3.99;
  const total = sub + delivery;
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) {
    totalEl.innerHTML = `
      <div class="cart-total-row"><span>Subtotal</span><span>$${sub.toFixed(2)}</span></div>
      <div class="cart-total-row"><span>Delivery</span><span>${delivery === 0 ? '<span style="color:var(--success);font-weight:600">Free 🎉</span>' : '$' + delivery.toFixed(2)}</span></div>
      ${sub < 20 ? `<div style="font-size:0.75rem;color:var(--text-muted);text-align:right;margin-bottom:0.5rem">Add $${(20 - sub).toFixed(2)} more for free delivery</div>` : ''}
      <div class="cart-total-row grand"><span>Total</span><span>$${total.toFixed(2)}</span></div>
    `;
  }
}

function openCart() {
  document.getElementById('cartSidebar')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCartItems();
}
function closeCart() {
  document.getElementById('cartSidebar')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
function toggleCart() {
  const isOpen = document.getElementById('cartSidebar')?.classList.contains('open');
  isOpen ? closeCart() : openCart();
}

// ── TOAST ──
function showToast(msg, duration = 2800) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), duration);
}

// ── MOBILE MENU ──
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('open');
}

// ── ORDER ──
function placeOrder() {
  const cart = getCart();
  if (!cart.length) { showToast('🛒 Your cart is empty!'); return; }
  const user = getCurrentUser();
  const sub = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = sub >= 20 ? 0 : 3.99;
  DB.addOrder({
    email: user?.email || 'guest',
    items: cart,
    subtotal: sub,
    delivery,
    total: sub + delivery,
    address: user?.address || '—'
  });
  saveCart([]);
  closeCart();
  const successEl = document.getElementById('orderSuccess');
  if (successEl) successEl.style.display = 'flex';
  showToast('🎉 Order placed! Arriving in ~28 minutes', 4000);
}

// ── GOOGLE SIGN IN ──
// Handled entirely in login.html via Google Identity Services (GIS).
// This stub prevents errors if called from anywhere else.
function handleGoogleSignIn(type) {
  window.location.href = 'login.html';
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateNavUser();
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .food-card, .testi-card, .pricing-card, .team-card').forEach(el => {
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
});
