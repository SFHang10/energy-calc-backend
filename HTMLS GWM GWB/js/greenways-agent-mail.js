/**
 * Greenways agent email — Wave 9 branded preview ("Email me this").
 * Letter layout with agent portrait + theme; does not send mail yet.
 */
(function (global) {
  'use strict';

  var MAILBOXES_URL = '/data/greenways-agent-mailboxes.json';
  var ROSTER_URL = '/data/greenways-agent-roster.json';
  var mailboxesCache = null;
  var rosterCache = null;
  var lastTurn = null;
  var lastContentTurn = null;
  var overlayEl = null;

  var THEME_BY_SLUG = {
    'grants-agent': 'grants',
    'finance-agent': 'finance',
    'equipment-agent': 'equipment',
    'deals-agent': 'deals',
    'media-agent': 'media',
    'sustainable-products-agent': 'products',
    'systems-agent': 'systems'
  };

  var ROLE_BY_SLUG = {
    'grants-agent': 'Grants & schemes',
    'finance-agent': 'Finance & energy prices',
    'equipment-agent': 'Equipment & renovation',
    'deals-agent': 'Deals & spotlights',
    'media-agent': 'News & media',
    'sustainable-products-agent': 'Sustainable products',
    'systems-agent': 'Systems & monitoring'
  };

  function agentSlugFromPath() {
    var m = (global.location.pathname || '').match(/\/greenways\/([^/?#]+)/);
    return m ? m[1] : '';
  }

  function readJsonLocal(key) {
    try {
      var raw = global.localStorage && global.localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stripMd(text) {
    return String(text || '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function truncate(text, max) {
    var t = String(text || '').trim();
    if (t.length <= max) return t;
    return t.slice(0, max - 1).trim() + '…';
  }

  function looksLikeEmailRequest(text) {
    var q = String(text || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    if (!q) return false;
    return (
      /\bemail me\b/.test(q) ||
      /\be-?mail me\b/.test(q) ||
      /\bsend me (an? )?(email|e-?mail|this|that|a (copy|summary|note))\b/.test(q) ||
      /\b(email|e-?mail) (me )?(this|that|the answer|a copy|a summary)\b/.test(q) ||
      /\bcan you (email|e-?mail)\b/.test(q) ||
      /\bcould you (email|e-?mail)\b/.test(q) ||
      /\bmail (me|this)\b/.test(q) ||
      /\bemail (it|this) to me\b/.test(q) ||
      /\bsend (this|that) (to my )?(email|inbox)\b/.test(q)
    );
  }

  function isEmailMetaTurn(turn) {
    if (!turn) return false;
    if (String(turn.intentId || '') === 'email_me_this') return true;
    if (looksLikeEmailRequest(turn.question)) return true;
    var a = String(turn.answer || turn.spokenSummary || '');
    return /Email me this \(the|use \*\*Email me this\*\*|✉️ button next to Listen/i.test(a);
  }

  async function loadJson(url) {
    try {
      var res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  }

  async function loadMailboxes() {
    if (mailboxesCache) return mailboxesCache;
    mailboxesCache = (await loadJson(MAILBOXES_URL)) || {
      meta: { previewOnly: true, sendEnabled: false },
      agents: {}
    };
    return mailboxesCache;
  }

  async function loadRoster() {
    if (rosterCache) return rosterCache;
    rosterCache = (await loadJson(ROSTER_URL)) || { agents: [] };
    return rosterCache;
  }

  function resolveProfile(getProfile) {
    var base = {};
    if (typeof getProfile === 'function') {
      try {
        base = getProfile() || {};
      } catch (_) {
        base = {};
      }
    }
    var member = readJsonLocal('greenways_member_context_v1') || {};
    var shared =
      global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.readSharedProfile === 'function'
        ? global.GreenwaysAgentTeam.readSharedProfile() || {}
        : readJsonLocal('gw-team-profile-v1') || {};
    var out = {};
    Object.keys(base || {}).forEach(function (k) {
      out[k] = base[k];
    });
    Object.keys(shared || {}).forEach(function (k) {
      if (out[k] == null || out[k] === '') out[k] = shared[k];
    });
    Object.keys(member || {}).forEach(function (k) {
      if (out[k] == null || out[k] === '') out[k] = member[k];
    });
    return out;
  }

  function rosterRow(slug, roster) {
    var agents = (roster && roster.agents) || [];
    for (var i = 0; i < agents.length; i++) {
      if (agents[i] && agents[i].slug === slug) return agents[i];
    }
    return null;
  }

  function resolveMailbox(slug, registry, roster) {
    var agents = (registry && registry.agents) || {};
    var row = agents[slug] || {};
    var face = rosterRow(slug, roster) || {};
    return {
      slug: slug,
      name: row.name || face.name || 'Greenways Agent',
      fromName: row.fromName || row.name || face.name || 'Greenways',
      fromAddress: row.fromAddress || 'hello@greenwaysbuildings.com',
      replyTo: row.replyTo || 'hello@greenwaysbuildings.com',
      subjectPrefix: row.subjectPrefix || '',
      signOff: row.signOff || (row.name || face.name || 'Greenways'),
      imageUrl: face.imageUrl || '',
      shortLabel: face.shortLabel || ROLE_BY_SLUG[slug] || 'Greenways',
      role: ROLE_BY_SLUG[slug] || face.shortLabel || 'Greenways Transition Agent',
      theme: THEME_BY_SLUG[slug] || 'finance'
    };
  }

  function deepLink(slug) {
    var origin = global.location && global.location.origin ? global.location.origin : '';
    if (!origin || origin.indexOf('file:') === 0) {
      origin = 'https://energy-calc-backend.onrender.com';
    }
    return origin + '/greenways/' + encodeURIComponent(slug || agentSlugFromPath());
  }

  function setLastTurn(payload) {
    payload = payload || {};
    lastTurn = {
      question: String(payload.question || '').trim(),
      answer: String(payload.answer || '').trim(),
      spokenSummary: String(payload.spokenSummary || '').trim(),
      intentId: String(payload.intentId || '').trim(),
      agentSlug: String(payload.agentSlug || agentSlugFromPath()).trim()
    };
    if (!isEmailMetaTurn(lastTurn) && (lastTurn.spokenSummary || lastTurn.answer)) {
      lastContentTurn = lastTurn;
    }
  }

  function getLastTurn() {
    return lastTurn;
  }

  function contentTurnForPreview(turn) {
    if (turn && !isEmailMetaTurn(turn) && (turn.spokenSummary || turn.answer)) return turn;
    if (lastContentTurn && (lastContentTurn.spokenSummary || lastContentTurn.answer)) {
      return lastContentTurn;
    }
    if (turn && !isEmailMetaTurn(turn)) return turn;
    return lastContentTurn || turn || {};
  }

  function buildPreview(mailbox, profile, turn) {
    var content = contentTurnForPreview(turn);
    var summary = stripMd((content && (content.spokenSummary || content.answer)) || '');
    if (!summary) {
      summary =
        'Ask me a question first — I’ll put a short summary of my answer here, plus a link back to our chat.';
    }

    var subjectBit = 'Your Greenways answer';
    if (content && content.question && !looksLikeEmailRequest(content.question)) {
      subjectBit = truncate(stripMd(content.question), 56);
    } else if (summary && summary.indexOf('Ask me a question') !== 0) {
      subjectBit = truncate(summary, 56);
    }
    var subject = (mailbox.subjectPrefix || '') + subjectBit;

    var toEmail = String((profile && (profile.email || profile.memberEmail)) || '').trim();
    var toDisplay = toEmail || '';
    var toMuted = !toEmail;
    if (!toEmail) {
      var name = String((profile && (profile.displayName || profile.name)) || '').trim();
      toDisplay = name
        ? name + ' · member email when signed in'
        : 'Your member email (when signed in)';
    }

    var firstName =
      profile && profile.displayName
        ? String(profile.displayName).split(/\s+/)[0]
        : '';
    var greeting = 'Hi' + (firstName ? ' ' + firstName : '') + ',';
    var link = deepLink(mailbox.slug || (content && content.agentSlug));
    var signLines = String(mailbox.signOff || mailbox.name || 'Greenways').split(/\n+/);
    var signName = signLines[0] || mailbox.name;
    var signRole = signLines.slice(1).join(' · ') || mailbox.role;

    var bodyPlain =
      greeting +
      '\n\n' +
      summary +
      '\n\nContinue in chat:\n' +
      link +
      '\n\n—\n' +
      String(mailbox.signOff || mailbox.name || 'Greenways') +
      '\n\n(Preview only — this message has not been sent.)';

    return {
      fromName: mailbox.fromName,
      fromAddress: mailbox.fromAddress,
      to: toDisplay,
      toMuted: toMuted,
      subject: subject,
      greeting: greeting,
      summary: summary,
      link: link,
      signName: signName,
      signRole: signRole,
      imageUrl: mailbox.imageUrl,
      agentName: mailbox.name,
      role: mailbox.role,
      theme: mailbox.theme,
      plainCopy: 'Subject: ' + subject + '\nFrom: ' + mailbox.fromName + '\n\n' + bodyPlain
    };
  }

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.className = 'gw-mail-overlay theme-finance';
    overlayEl.id = 'gw-mail-overlay';
    overlayEl.hidden = true;
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'gw-mail-title');
    overlayEl.innerHTML =
      '<div class="gw-mail-panel">' +
      '<div class="gw-mail-brand">' +
      '<img class="gw-mail-avatar" id="gw-mail-avatar" alt="" width="56" height="56" hidden>' +
      '<div class="gw-mail-brand-text">' +
      '<p class="gw-mail-eyebrow" id="gw-mail-eyebrow">Personal note</p>' +
      '<h2 id="gw-mail-title">Email me this</h2>' +
      '<p id="gw-mail-sub">A confident note from your Greenways agent.</p>' +
      '</div>' +
      '<div class="gw-mail-head-actions">' +
      '<span class="gw-mail-badge">Preview only</span>' +
      '<button type="button" class="gw-mail-close" id="gw-mail-close" aria-label="Close">×</button>' +
      '</div>' +
      '</div>' +
      '<dl class="gw-mail-meta">' +
      '<div class="gw-mail-meta-row"><dt>From</dt><dd id="gw-mail-from"></dd></div>' +
      '<div class="gw-mail-meta-row"><dt>To</dt><dd id="gw-mail-to"></dd></div>' +
      '<div class="gw-mail-meta-row"><dt>Subject</dt><dd id="gw-mail-subject"></dd></div>' +
      '</dl>' +
      '<div class="gw-mail-letter-wrap">' +
      '<p class="gw-mail-letter-label">Message preview</p>' +
      '<article class="gw-mail-letter">' +
      '<div class="gw-mail-letter-mark">' +
      '<strong id="gw-mail-letter-brand">Greenways</strong>' +
      '<span>Agent note</span>' +
      '</div>' +
      '<p class="gw-mail-greeting" id="gw-mail-greeting">Hi,</p>' +
      '<p class="gw-mail-prose" id="gw-mail-prose"></p>' +
      '<div class="gw-mail-cta">' +
      '<p class="gw-mail-cta-label">Continue in chat</p>' +
      '<a id="gw-mail-link" href="#" target="_top" rel="noopener"></a>' +
      '</div>' +
      '<div class="gw-mail-sign">' +
      '<img class="gw-mail-sign-avatar" id="gw-mail-sign-avatar" alt="" width="40" height="40" hidden>' +
      '<div class="gw-mail-sign-text">' +
      '<p class="gw-mail-sign-name" id="gw-mail-sign-name"></p>' +
      '<p class="gw-mail-sign-role" id="gw-mail-sign-role"></p>' +
      '</div>' +
      '</div>' +
      '<p class="gw-mail-disclaimer">(Preview only — this message has not been sent.)</p>' +
      '</article>' +
      '</div>' +
      '<div class="gw-mail-foot">' +
      '<p class="gw-mail-note" id="gw-mail-note">Sending is not enabled yet — this is a look-and-feel preview. Copy works anytime.</p>' +
      '<button type="button" id="gw-mail-copy">Copy text</button>' +
      '<button type="button" class="gw-mail-send" id="gw-mail-send" disabled title="Sending not enabled yet">Send</button>' +
      '<button type="button" class="gw-mail-primary" id="gw-mail-done">Close</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlayEl);

    function close() {
      overlayEl.hidden = true;
    }

    overlayEl.addEventListener('click', function (ev) {
      if (ev.target === overlayEl) close();
    });
    overlayEl.querySelector('#gw-mail-close').addEventListener('click', close);
    overlayEl.querySelector('#gw-mail-done').addEventListener('click', close);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && overlayEl && !overlayEl.hidden) close();
    });

    overlayEl.querySelector('#gw-mail-copy').addEventListener('click', function () {
      var text = overlayEl._copyText || '';
      var note = overlayEl.querySelector('#gw-mail-note');
      function ok() {
        if (note) note.textContent = 'Copied — paste into your mail client anytime.';
      }
      if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok).catch(function () {
          if (note) note.textContent = 'Could not copy — select the message text manually.';
        });
      } else {
        if (note) note.textContent = 'Copy not available in this browser — select the message text.';
      }
    });

    return overlayEl;
  }

  function setAvatar(imgEl, url, name) {
    if (!imgEl) return;
    if (url) {
      imgEl.src = url;
      imgEl.alt = name || '';
      imgEl.hidden = false;
    } else {
      imgEl.removeAttribute('src');
      imgEl.hidden = true;
    }
  }

  async function openPreview(opts) {
    opts = opts || {};
    var registry = await loadMailboxes();
    var roster = await loadRoster();
    var slug = opts.agentSlug || (lastTurn && lastTurn.agentSlug) || agentSlugFromPath();
    var mailbox = resolveMailbox(slug, registry, roster);
    var profile = resolveProfile(opts.getProfile);
    var turn = opts.turn || lastTurn || {};
    var preview = buildPreview(mailbox, profile, turn);
    var el = ensureOverlay();

    el.className = 'gw-mail-overlay theme-' + (preview.theme || 'finance');
    el.querySelector('#gw-mail-eyebrow').textContent = mailbox.shortLabel + ' · personal note';
    el.querySelector('#gw-mail-title').textContent = 'From ' + mailbox.name;
    el.querySelector('#gw-mail-sub').textContent =
      'How a note from ' + mailbox.name + ' would look — grounded on your last answer.';
    el.querySelector('#gw-mail-letter-brand').textContent = 'Greenways · ' + mailbox.name;

    setAvatar(el.querySelector('#gw-mail-avatar'), preview.imageUrl, mailbox.name);
    setAvatar(el.querySelector('#gw-mail-sign-avatar'), preview.imageUrl, mailbox.name);

    el.querySelector('#gw-mail-from').innerHTML =
      '<div class="gw-mail-from-line">' +
      '<span class="gw-mail-from-name">' +
      esc(preview.fromName) +
      '</span>' +
      '<span class="gw-mail-from-addr">' +
      esc(preview.fromAddress) +
      '</span>' +
      '</div>';

    var toEl = el.querySelector('#gw-mail-to');
    toEl.textContent = preview.to;
    toEl.classList.toggle('muted', !!preview.toMuted);
    el.querySelector('#gw-mail-subject').textContent = preview.subject;
    el.querySelector('#gw-mail-greeting').textContent = preview.greeting;
    el.querySelector('#gw-mail-prose').textContent = preview.summary;
    var linkEl = el.querySelector('#gw-mail-link');
    linkEl.href = preview.link;
    linkEl.textContent = preview.link;
    el.querySelector('#gw-mail-sign-name').textContent = preview.signName;
    el.querySelector('#gw-mail-sign-role').textContent = preview.signRole;
    el.querySelector('#gw-mail-note').textContent =
      'Sending is not enabled yet — stylish preview for now. Copy works anytime.';
    el._copyText = preview.plainCopy;
    el.hidden = false;
    try {
      el.querySelector('#gw-mail-done').focus();
    } catch (_) {}
  }

  /**
   * @param {object} opts
   * @param {string} [opts.agentSlug]
   * @param {HTMLButtonElement} opts.mailBtn
   * @param {function} [opts.getProfile]
   */
  function init(opts) {
    opts = opts || {};
    var mailBtn = opts.mailBtn;
    var getProfile = opts.getProfile;
    var agentSlug = opts.agentSlug || agentSlugFromPath();

    if (!mailBtn) {
      return { openPreview: openPreview, setLastTurn: setLastTurn };
    }

    mailBtn.removeAttribute('hidden');
    mailBtn.addEventListener('click', function () {
      openPreview({ agentSlug: agentSlug, getProfile: getProfile });
    });

    loadMailboxes();
    loadRoster();

    return {
      openPreview: function () {
        return openPreview({ agentSlug: agentSlug, getProfile: getProfile });
      },
      setLastTurn: setLastTurn,
      getLastTurn: getLastTurn
    };
  }

  global.GreenwaysAgentMail = {
    init: init,
    openPreview: openPreview,
    setLastTurn: setLastTurn,
    getLastTurn: getLastTurn,
    looksLikeEmailRequest: looksLikeEmailRequest
  };
})(typeof window !== 'undefined' ? window : globalThis);
