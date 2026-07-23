/**
 * Demo staff gate for Agents Admin (table + network map).
 * Session unlock only — replace with real staff auth later.
 */
(function (global) {
  var UNLOCK_KEY = 'gw_agents_admin_unlocked_v1';
  var PASS_KEY = 'gw_agents_admin_key_v1';
  // Demo password — override later via server-backed auth.
  var DEMO_PASSWORD = 'Greenwaysadmin';

  function isUnlocked() {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function getKey() {
    try {
      return sessionStorage.getItem(PASS_KEY) || '';
    } catch (_) {
      return '';
    }
  }

  function unlock(password) {
    if (String(password || '') !== DEMO_PASSWORD) return false;
    try {
      sessionStorage.setItem(UNLOCK_KEY, '1');
      sessionStorage.setItem(PASS_KEY, DEMO_PASSWORD);
    } catch (_) {}
    return true;
  }

  function lock() {
    try {
      sessionStorage.removeItem(UNLOCK_KEY);
      sessionStorage.removeItem(PASS_KEY);
    } catch (_) {}
  }

  function adminHeaders(extra) {
    var headers = Object.assign({ 'Content-Type': 'application/json' }, extra || {});
    var key = getKey();
    if (key) headers['X-Agents-Admin-Key'] = key;
    return headers;
  }

  function ensureStyles() {
    if (document.getElementById('gw-agents-admin-gate-css')) return;
    var style = document.createElement('style');
    style.id = 'gw-agents-admin-gate-css';
    style.textContent =
      '.gw-admin-gate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;' +
      'padding:24px;background:rgba(6,10,16,0.92);backdrop-filter:blur(10px);font-family:IBM Plex Sans,Segoe UI,system-ui,sans-serif;}' +
      '.gw-admin-gate-card{width:100%;max-width:380px;padding:28px 24px;border-radius:14px;background:#141b2d;' +
      'border:1px solid rgba(255,255,255,0.12);box-shadow:0 20px 50px rgba(0,0,0,0.45);color:#f1f5f9;}' +
      '.gw-admin-gate-card h1{font-size:1.15rem;margin:0 0 8px;font-weight:700;}' +
      '.gw-admin-gate-card p{font-size:0.88rem;line-height:1.5;color:#b8c5d6;margin:0 0 18px;}' +
      '.gw-admin-gate-card label{display:block;font-size:0.75rem;letter-spacing:0.06em;text-transform:uppercase;' +
      'color:#8b9cb3;margin-bottom:6px;}' +
      '.gw-admin-gate-card input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;' +
      'border:1px solid #2d3748;background:#0a0f1c;color:#f1f5f9;font-size:0.95rem;}' +
      '.gw-admin-gate-card input:focus{outline:2px solid rgba(0,210,106,0.45);outline-offset:1px;}' +
      '.gw-admin-gate-actions{display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;}' +
      '.gw-admin-gate-actions button{flex:1;min-width:120px;padding:11px 14px;border:none;border-radius:10px;' +
      'font-weight:600;cursor:pointer;font-size:0.9rem;}' +
      '.gw-admin-gate-go{background:#00d26a;color:#0a0f1c;}' +
      '.gw-admin-gate-back{background:transparent;color:#b8c5d6;border:1px solid #2d3748;}' +
      '.gw-admin-gate-err{color:#ff8a8a;font-size:0.85rem;margin-top:10px;min-height:1.2em;}' +
      '.gw-admin-lock-btn{margin-left:4px;}';
    document.head.appendChild(style);
  }

  function requireUnlock(onReady) {
    if (isUnlocked()) {
      if (typeof onReady === 'function') onReady();
      return;
    }
    ensureStyles();
    var overlay = document.createElement('div');
    overlay.className = 'gw-admin-gate';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Agents admin password');
    overlay.innerHTML =
      '<div class="gw-admin-gate-card">' +
      '<h1>Staff · Agents admin</h1>' +
      '<p>Master control for Transition Agents. Enter the staff password to continue. Demo gate only — replace with full staff auth later.</p>' +
      '<label for="gw-admin-gate-pass">Password</label>' +
      '<input id="gw-admin-gate-pass" type="password" autocomplete="current-password" placeholder="Staff password">' +
      '<div class="gw-admin-gate-actions">' +
      '<button type="button" class="gw-admin-gate-go" id="gw-admin-gate-go">Unlock</button>' +
      '<a class="gw-admin-gate-back" id="gw-admin-gate-back" href="/greenways/orchestra-hub-wix-frame" ' +
      'style="display:inline-flex;align-items:center;justify-content:center;text-decoration:none;box-sizing:border-box;">Back to Orchestra</a>' +
      '</div>' +
      '<div class="gw-admin-gate-err" id="gw-admin-gate-err" aria-live="polite"></div>' +
      '</div>';
    document.body.appendChild(overlay);

    var input = document.getElementById('gw-admin-gate-pass');
    var err = document.getElementById('gw-admin-gate-err');
    var go = document.getElementById('gw-admin-gate-go');

    function tryUnlock() {
      if (unlock(input.value)) {
        overlay.remove();
        if (typeof onReady === 'function') onReady();
        return;
      }
      err.textContent = 'Incorrect password.';
      input.focus();
      input.select();
    }

    go.addEventListener('click', tryUnlock);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') tryUnlock();
    });
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function mountLockButton(parent) {
    if (!parent || parent.querySelector('.gw-admin-lock-btn')) return;
    ensureStyles();
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn gw-admin-lock-btn';
    btn.innerHTML = '<i class="fas fa-lock"></i> Lock';
    btn.title = 'Clear staff session for this browser tab';
    btn.style.border = '1px solid rgba(148,163,184,0.4)';
    btn.style.background = 'transparent';
    btn.style.color = '#b8c5d6';
    btn.addEventListener('click', function () {
      lock();
      location.reload();
    });
    parent.appendChild(btn);
  }

  global.GreenwaysAgentsAdminGate = {
    isUnlocked: isUnlocked,
    unlock: unlock,
    lock: lock,
    getKey: getKey,
    adminHeaders: adminHeaders,
    require: requireUnlock,
    mountLockButton: mountLockButton,
    DEMO_PASSWORD_HINT: 'Staff password (demo)'
  };
})(typeof window !== 'undefined' ? window : globalThis);
