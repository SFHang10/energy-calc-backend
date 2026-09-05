/**
 * Greenways agent email — Wave 9 preview UI ("Email me this").
 * Builds a grounded preview from the last answer; does not send mail yet.
 */
(function (global) {
  'use strict';

  var MAILBOXES_URL = '/data/greenways-agent-mailboxes.json';
  var mailboxesCache = null;
  var lastTurn = null;
  var overlayEl = null;

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

  async function loadMailboxes() {
    if (mailboxesCache) return mailboxesCache;
    try {
      var res = await fetch(MAILBOXES_URL);
      if (res.ok) mailboxesCache = await res.json();
    } catch (_) {}
    if (!mailboxesCache) {
      mailboxesCache = { meta: { previewOnly: true, sendEnabled: false }, agents: {} };
    }
    return mailboxesCache;
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

  function resolveMailbox(slug, registry) {
    var agents = (registry && registry.agents) || {};
    var row = agents[slug] || {};
    return {
      slug: slug,
      name: row.name || 'Greenways Agent',
      fromName: row.fromName || row.name || 'Greenways',
      fromAddress: row.fromAddress || 'hello@greenwaysbuildings.com',
      replyTo: row.replyTo || 'hello@greenwaysbuildings.com',
      subjectPrefix: row.subjectPrefix || '',
      signOff: row.signOff || (row.name || 'Greenways')
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
  }

  function getLastTurn() {
    return lastTurn;
  }

  function buildPreview(mailbox, profile, turn) {
    var summary =
      (turn && (turn.spokenSummary || turn.answer)) ||
      '';
    summary = stripMd(summary);
    if (!summary) {
      summary =
        'Ask me a question first — I’ll put a short summary of my answer here, plus a link back to our chat.';
    }

    var subjectBit =
      (turn && turn.question && truncate(stripMd(turn.question), 56)) ||
      'Your Greenways answer';
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

    var link = deepLink(mailbox.slug || (turn && turn.agentSlug));
    var body =
      'Hi' +
      (profile && profile.displayName ? ' ' + String(profile.displayName).split(' ')[0] : '') +
      ',\n\n' +
      summary +
      '\n\nContinue in chat:\n' +
      link +
      '\n\n—' +
      '\n' +
      String(mailbox.signOff || mailbox.name || 'Greenways') +
      '\n\n' +
      '(Preview only — this message has not been sent.)';

    return {
      from: mailbox.fromName + ' <' + mailbox.fromAddress + '>',
      to: toDisplay,
      toMuted: toMuted,
      subject: subject,
      body: body,
      plainCopy: 'Subject: ' + subject + '\nFrom: ' + mailbox.fromName + '\n\n' + body
    };
  }

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement('div');
    overlayEl.className = 'gw-mail-overlay';
    overlayEl.id = 'gw-mail-overlay';
    overlayEl.hidden = true;
    overlayEl.setAttribute('role', 'dialog');
    overlayEl.setAttribute('aria-modal', 'true');
    overlayEl.setAttribute('aria-labelledby', 'gw-mail-title');
    overlayEl.innerHTML =
      '<div class="gw-mail-panel">' +
      '<div class="gw-mail-head">' +
      '<div>' +
      '<h2 id="gw-mail-title">Email me this</h2>' +
      '<p id="gw-mail-sub">Preview of a message you could send yourself later.</p>' +
      '</div>' +
      '<span class="gw-mail-badge">Preview only</span>' +
      '<button type="button" class="gw-mail-close" id="gw-mail-close" aria-label="Close">×</button>' +
      '</div>' +
      '<dl class="gw-mail-fields">' +
      '<div class="gw-mail-row"><dt>From</dt><dd id="gw-mail-from"></dd></div>' +
      '<div class="gw-mail-row"><dt>To</dt><dd id="gw-mail-to"></dd></div>' +
      '<div class="gw-mail-row"><dt>Subject</dt><dd id="gw-mail-subject"></dd></div>' +
      '</dl>' +
      '<div class="gw-mail-body-wrap">' +
      '<p class="gw-mail-body-label">Message</p>' +
      '<pre class="gw-mail-body" id="gw-mail-body"></pre>' +
      '</div>' +
      '<div class="gw-mail-foot">' +
      '<p class="gw-mail-note" id="gw-mail-note">Sending is not enabled yet — this is a look-and-feel preview.</p>' +
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
        if (note) note.textContent = 'Copied to clipboard — paste into your mail client if you like.';
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

  async function openPreview(opts) {
    opts = opts || {};
    var registry = await loadMailboxes();
    var slug = opts.agentSlug || (lastTurn && lastTurn.agentSlug) || agentSlugFromPath();
    var mailbox = resolveMailbox(slug, registry);
    var profile = resolveProfile(opts.getProfile);
    var turn = opts.turn || lastTurn || {};
    var preview = buildPreview(mailbox, profile, turn);
    var el = ensureOverlay();

    el.querySelector('#gw-mail-from').textContent = preview.from;
    var toEl = el.querySelector('#gw-mail-to');
    toEl.textContent = preview.to;
    toEl.classList.toggle('muted', !!preview.toMuted);
    el.querySelector('#gw-mail-subject').textContent = preview.subject;
    el.querySelector('#gw-mail-body').textContent = preview.body;
    el.querySelector('#gw-mail-note').textContent =
      'Sending is not enabled yet — this is a look-and-feel preview. Copy works anytime.';
    el.querySelector('#gw-mail-sub').textContent =
      'How a note from ' + mailbox.name + ' would look — grounded on your last answer.';
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
    getLastTurn: getLastTurn
  };
})(typeof window !== 'undefined' ? window : globalThis);
