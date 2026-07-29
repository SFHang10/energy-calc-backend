/**
 * Smooth agent topic bridge — preseed a product/topic without forcing an /ask.
 * Pattern: register topic → soft welcome + suggestion pills → user chooses.
 *
 * Storage: sessionStorage gw-topic-bridge-v1
 * URL: ?topic=&product=&from=&bridge=1  (no auto-send; use ?q= only when you want auto-ask)
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'gw-topic-bridge-v1';
  var HANDOFF_KEY = 'gw-team-handoff-v1';

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function readBridge() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function writeBridge(payload) {
    if (!payload || !payload.toSlug) return;
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          toSlug: String(payload.toSlug || '').trim(),
          fromLabel: String(payload.fromLabel || 'Greenways').trim(),
          topic: String(payload.topic || payload.productName || '').trim(),
          productId: String(payload.productId || '').trim(),
          productName: String(payload.productName || payload.topic || '').trim(),
          marketplaceHref: String(payload.marketplaceHref || '').trim(),
          suggestions: Array.isArray(payload.suggestions) ? payload.suggestions.slice(0, 8) : [],
          createdAt: new Date().toISOString()
        })
      );
    } catch (_) {
      /* ignore */
    }
  }

  function clearBridge() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (_) {
      /* ignore */
    }
  }

  function consumeForSlug(toSlug) {
    var params = new URLSearchParams(global.location.search);
    var urlTopic = String(params.get('topic') || '').trim();
    var urlProduct = String(params.get('product') || '').trim();
    var urlFrom = String(params.get('from') || '').trim();
    var bridgeFlag = params.get('bridge') === '1' || !!urlTopic;

    var stored = readBridge();
    if (stored && stored.toSlug === toSlug) {
      clearBridge();
      if (!stored.topic && urlTopic) stored.topic = urlTopic;
      if (!stored.productId && urlProduct) stored.productId = urlProduct;
      if (!stored.fromLabel && urlFrom) stored.fromLabel = urlFrom;
      if (!stored.suggestions || !stored.suggestions.length) {
        stored.suggestions = defaultSuggestionsForSlug(toSlug, stored);
      }
      return stored;
    }

    if (bridgeFlag && urlTopic) {
      return {
        toSlug: toSlug,
        fromLabel: urlFrom || 'Greenways',
        topic: urlTopic,
        productId: urlProduct,
        productName: urlTopic,
        marketplaceHref: '',
        suggestions: defaultSuggestionsForSlug(toSlug, {
          topic: urlTopic,
          productId: urlProduct,
          productName: urlTopic
        })
      };
    }
    return null;
  }

  function defaultSuggestionsForSlug(slug, ctx) {
    var name = (ctx && (ctx.productName || ctx.topic)) || 'this option';
    var idBit = ctx && ctx.productId ? ' (product id ' + ctx.productId + ')' : '';
    if (slug === 'finance-agent') {
      return [
        {
          label: 'Payback & running cost',
          prompt: 'Help me model payback and running cost for ' + name + idBit
        },
        {
          label: 'Finance options',
          prompt: 'What finance or BNPL paths could fit an upgrade to ' + name + '?'
        },
        {
          label: 'Energy price context',
          prompt: 'How do current energy prices affect the case for ' + name + '?'
        }
      ];
    }
    if (slug === 'grants-agent') {
      return [
        {
          label: 'Matching schemes',
          prompt: 'Which grants or schemes might apply to ' + name + idBit + '?'
        },
        {
          label: 'Eligibility checklist',
          prompt: 'What eligibility points should I check for funding related to ' + name + '?'
        },
        {
          label: 'Compare two schemes',
          prompt: 'Help me compare the strongest scheme options for ' + name
        }
      ];
    }
    // equipment-agent and default
    return [
      {
        label: 'About this product',
        prompt: 'Tell me about ' + name + idBit + ' — who it fits and why it is efficient'
      },
      {
        label: 'Grants that may apply',
        prompt: 'Which grants might apply to ' + name + idBit + '?'
      },
      {
        label: 'Savings & payback',
        prompt: 'How would I model savings and payback for ' + name + '?'
      },
      {
        label: 'Compare alternatives',
        prompt: 'What should I compare ' + name + ' with on Greenways?'
      }
    ];
  }

  /**
   * Write bridge + return href. Does not use ?q= (avoids auto-ask).
   */
  function buildHref(opts) {
    opts = opts || {};
    var path = opts.path || '/greenways/equipment-agent';
    var toSlug = opts.toSlug || '';
    var topic = String(opts.topic || opts.productName || '').trim();
    var productId = String(opts.productId || '').trim();
    var fromLabel = String(opts.fromLabel || 'Greenways').trim();
    var suggestions =
      Array.isArray(opts.suggestions) && opts.suggestions.length
        ? opts.suggestions
        : defaultSuggestionsForSlug(toSlug, opts);

    writeBridge({
      toSlug: toSlug,
      fromLabel: fromLabel,
      topic: topic,
      productId: productId,
      productName: String(opts.productName || topic).trim(),
      marketplaceHref: opts.marketplaceHref || '',
      suggestions: suggestions
    });

    // Soft handoff for first /ask (works even when source page does not load greenways-agent-team.js)
    var handoffBrief = {
      fromSlug: opts.fromSlug || 'agent-market',
      fromName: fromLabel,
      toSlug: toSlug,
      question: '',
      summary: topic ? 'Visitor exploring: ' + topic : '',
      topicSummary: topic ? 'you wanted to know more about ' + topic : '',
      fromIntentId: opts.fromIntentId || 'topic_bridge',
      handoffKey: opts.handoffKey || 'topic_bridge',
      apiConsumed: false,
      createdAt: new Date().toISOString()
    };
    if (global.GreenwaysAgentTeam && typeof global.GreenwaysAgentTeam.writeHandoff === 'function') {
      global.GreenwaysAgentTeam.writeHandoff(handoffBrief);
    } else {
      try {
        sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(handoffBrief));
      } catch (_) {
        /* ignore */
      }
    }

    var qs = new URLSearchParams();
    qs.set('bridge', '1');
    if (topic) qs.set('topic', topic);
    if (productId) qs.set('product', productId);
    if (fromLabel) qs.set('from', fromLabel);
    return path + '?' + qs.toString();
  }

  function ensureStyles() {
    if (document.getElementById('gw-topic-bridge-css')) return;
    var style = document.createElement('style');
    style.id = 'gw-topic-bridge-css';
    style.textContent =
      '.gw-topic-welcome{margin-bottom:4px}' +
      '.gw-topic-welcome .gw-topic-kicker{font-size:0.68rem;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:var(--gold,#c9a961);margin-bottom:6px}' +
      '.gw-topic-welcome h2{margin-bottom:8px}' +
      '.gw-topic-welcome .gw-topic-line{font-size:0.9rem;line-height:1.45;color:inherit;margin-bottom:12px}' +
      '.gw-topic-welcome .gw-topic-line strong{color:#fff}' +
      '.gw-topic-welcome .gw-topic-hint{font-size:0.75rem;color:var(--muted,#8eabb4);margin:0 0 10px}';
    document.head.appendChild(style);
  }

  /**
   * Replace default welcome card with topic-focused copy + pills.
   * @returns {boolean} true if welcome was applied
   */
  function applyWelcome(opts) {
    opts = opts || {};
    var bridge = opts.bridge || null;
    if (!bridge || !bridge.topic) return false;

    ensureStyles();
    var card = document.getElementById('welcome-card');
    if (!card) return false;

    var agentName = opts.agentName || 'your specialist';
    var fromLabel = bridge.fromLabel || 'Greenways';
    var suggestions = Array.isArray(bridge.suggestions) ? bridge.suggestions : [];
    var onPrompt = typeof opts.onPrompt === 'function' ? opts.onPrompt : null;

    var tags = suggestions
      .map(function (s) {
        var label = s.label || s.prompt || 'Ask';
        var prompt = s.prompt || s.label || '';
        return (
          '<button type="button" class="welcome-tag" data-prompt="' +
          escapeHtml(prompt) +
          '">' +
          escapeHtml(label) +
          '</button>'
        );
      })
      .join('');

    card.classList.add('gw-topic-welcome');
    card.innerHTML =
      '<div class="gw-topic-kicker">Continuing from ' +
      escapeHtml(fromLabel) +
      '</div>' +
      '<h2>Ask ' +
      escapeHtml(agentName) +
      '</h2>' +
      '<p class="gw-topic-line">You\'d like to know more about <strong>' +
      escapeHtml(bridge.topic) +
      '</strong>.</p>' +
      '<p class="gw-topic-hint">Pick a starting point below, or type your own question — ' +
      escapeHtml(agentName) +
      ' already has this topic in context.</p>' +
      (tags ? '<div class="welcome-tags">' + tags + '</div>' : '');

    card.querySelectorAll('.welcome-tag').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var prompt = btn.getAttribute('data-prompt') || '';
        if (prompt && onPrompt) onPrompt(prompt);
      });
    });

    try {
      if (bridge.productId) {
        sessionStorage.setItem(
          'gw-topic-active-v1',
          JSON.stringify({
            productId: bridge.productId,
            productName: bridge.productName || bridge.topic,
            topic: bridge.topic,
            fromLabel: fromLabel,
            at: new Date().toISOString()
          })
        );
      }
    } catch (_) {
      /* ignore */
    }

    return true;
  }

  /**
   * Call from gw-team-ready handlers. Returns true if topic welcome handled boot (skip auto-ask).
   */
  function handleTeamReady(ev, opts) {
    opts = opts || {};
    var slug = opts.currentSlug || (ev && ev.detail && ev.detail.currentSlug) || '';
    var bridge = consumeForSlug(slug);
    if (!bridge) return false;

    var applied = applyWelcome({
      bridge: bridge,
      agentName: opts.agentName || 'Agent',
      onPrompt: opts.onPrompt
    });

    // Prefill input lightly so typing continues the topic (user still sends)
    if (opts.inputEl && bridge.topic) {
      var input = opts.inputEl;
      if (input && !String(input.value || '').trim()) {
        input.placeholder = 'Ask about ' + bridge.topic + '…';
      }
    }
    return applied;
  }

  global.GreenwaysAgentTopicBridge = {
    STORAGE_KEY: STORAGE_KEY,
    writeBridge: writeBridge,
    readBridge: readBridge,
    clearBridge: clearBridge,
    consumeForSlug: consumeForSlug,
    buildHref: buildHref,
    defaultSuggestionsForSlug: defaultSuggestionsForSlug,
    applyWelcome: applyWelcome,
    handleTeamReady: handleTeamReady
  };
})(typeof window !== 'undefined' ? window : global);
