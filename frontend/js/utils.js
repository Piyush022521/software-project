/* ============================================================
   Utility Functions
   ============================================================ */

// Show toast notification
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// Format date and time
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Get status badge HTML
function statusBadge(status) {
  const labels = {
    BOOKED: 'Booked',
    PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit',
    AT_HUB: 'At Hub',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    DELIVERY_FAILED: 'Failed',
    CANCELLED: 'Cancelled',
  };
  const cls = status.toLowerCase().replace(/_/g, '_');
  return `<span class="badge badge-${cls}">${labels[status] || status}</span>`;
}

// Get role badge
function roleBadge(role) {
  const colors = { admin: '#7c3aed', customer: '#1a56db', agent: '#0e9f6e' };
  return `<span style="background:${colors[role]}20;color:${colors[role]};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">${role.charAt(0).toUpperCase() + role.slice(1)}</span>`;
}

// Redirect based on role
function redirectToDashboard(role) {
  const paths = {
    admin: '../admin/dashboard.html',
    customer: '../customer/dashboard.html',
    agent: '../agent/dashboard.html',
  };
  window.location.href = paths[role] || '../public/index.html';
}

// Guard: redirect if not logged in
function requireAuth(requiredRole = null) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = '../public/login.html';
    return false;
  }

  if (requiredRole && user.role !== requiredRole) {
    window.location.href = '../public/login.html';
    return false;
  }

  return true;
}

// Guard: redirect if already logged in
function redirectIfLoggedIn() {
  const token = getToken();
  const user = getUser();
  if (token && user) {
    redirectToDashboard(user.role);
  }
}

// Logout
function logout() {
  clearAuth();
  window.location.href = '../public/login.html';
}

// Render user info in navbar
function renderNavUser() {
  const user = getUser();
  if (!user) return;

  const nameEl = document.getElementById('nav-user-name');
  const avatarEl = document.getElementById('nav-user-avatar');

  if (nameEl) nameEl.textContent = user.name;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
}

// Format currency
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toFixed(2);
}

// Capitalize first letter
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Active sidebar link
function setActiveSidebarLink() {
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar-item a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}
