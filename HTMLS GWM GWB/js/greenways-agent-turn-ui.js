(function () {
  "use strict";

  function encodeSchemePayload(scheme) {
    return encodeURIComponent(JSON.stringify(scheme || {}));
  }

  function introFromAnswer(answer) {
    const text = String(answer || "").trim();
    if (!text) return "";
    const bulletStart = text.search(/\n\s*-\s+\*\*/);
    if (bulletStart === -1) return text;
    let intro = text.slice(0, bulletStart).trim();
    const tipMatch = text.slice(bulletStart).match(/\n\n_([^_\n][\s\S]*?)_\s*$/);
    if (tipMatch) intro += (intro ? "\n\n" : "") + "_" + tipMatch[1] + "_";
    if (!intro) return text.split("\n")[0] || text;
    return intro;
  }

  function agentDisplayAnswer(answer, suggestions, blocks) {
    if (Array.isArray(suggestions) && suggestions.length) return introFromAnswer(answer);
    if (Array.isArray(blocks) && blocks.length) return introFromAnswer(answer);
    return answer;
  }

  function extractAwarenessFromAnswer(answer) {
    const tips = [];
    let body = String(answer || "").trim();
    const tipRe = /\n\n_([^_\n][\s\S]*?)_\s*$/;
    let match = body.match(tipRe);
    while (match) {
      tips.push(match[1].trim());
      body = body.slice(0, match.index).trim();
      match = body.match(tipRe);
    }
    return { body: body, tips: tips };
  }

  function normalizeAwarenessTip(tip) {
    let t = String(tip || "").trim();
    if (!t) return "";
    if (/^_(.+)_$/s.test(t)) t = t.replace(/^_(.+)_$/s, "$1").trim();
    t = t.replace(/\s*_+\s*/g, " ").trim();
    return t;
  }

  function formatAwarenessTip(tip, escapeHtml) {
    const clean = normalizeAwarenessTip(tip);
    if (!clean) return "";
    let t = escapeHtml(clean);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return t;
  }

  function awarenessPanelHtml(tips, escapeHtml) {
    if (!Array.isArray(tips) || !tips.length) return "";
    const normalized = tips.map(normalizeAwarenessTip).filter(Boolean);
    const deduped = [];
    normalized.forEach(function (tip) {
      if (!deduped.some(function (row) { return row.toLowerCase() === tip.toLowerCase(); })) {
        deduped.push(tip);
      }
    });
    const items = deduped.slice(0, 3).map(function (tip) {
      const isProfile =
        /^in \*\*/i.test(tip) ||
        /^for your /i.test(tip) ||
        /usually affects/i.test(tip);
      const cls = isProfile ? " awareness-panel-item--profile" : "";
      return (
        '<li class="awareness-panel-item' + cls + '">' + formatAwarenessTip(tip, escapeHtml) + "</li>"
      );
    }).join("");
    if (!items) return "";
    return (
      '<section class="awareness-panel" aria-label="Things to be aware of">' +
      '<div class="awareness-panel-label">Things to be aware of</div>' +
      '<ul class="awareness-panel-list">' + items + "</ul></section>"
    );
  }

  function statBlockHtml(items, escapeHtml) {
    if (!Array.isArray(items) || !items.length) return "";
    const chips = items.map(function (item) {
      const label = escapeHtml(item.label || "Region");
      const value = escapeHtml(String(item.value != null ? item.value : ""));
      return '<span class="agent-stat-chip"><strong>' + value + "</strong>" + label + "</span>";
    }).join("");
    return '<div class="agent-stat-row">' + chips + "</div>";
  }

  function encodeModulePayload(item) {
    if (window.GreenwaysAgentContentModule && typeof window.GreenwaysAgentContentModule.encodePayload === "function") {
      return window.GreenwaysAgentContentModule.encodePayload(item);
    }
    return encodeURIComponent(JSON.stringify(item || {}));
  }

  function moduleTabletsHtml(items, escapeHtml) {
    if (!Array.isArray(items) || !items.length) return "";
    const tablets = items.map(function (item) {
      const title = escapeHtml(item.title || "Illustration");
      const desc = escapeHtml(String(item.description || "").slice(0, 180));
      const usage = escapeHtml(String(item.usageHint || "").slice(0, 180));
      const payload = encodeModulePayload(item);
      const fullHref = escapeHtml(String(item.fullPageHref || item.href || "#"));
      const moduleId = String(item.moduleId || "");
      const openLabel =
        moduleId === "sustainability-map"
          ? "Open map"
          : moduleId === "energy-ticker"
            ? "Open ticker"
            : moduleId === "utility-detail"
              ? "Open utility view"
              : moduleId === "european-energy"
                ? "Open tariff portal"
                : moduleId === "savings-projection"
                  ? "Open projection"
                  : moduleId === "finance-finder"
                    ? "Open finance finder"
                    : moduleId === "etl-finder"
                      ? "Open ETL finder"
                      : moduleId === "eco-project-planner"
                        ? "Open eco planner"
                        : moduleId === "deals-ticker"
                        ? "Open deals hub"
                        : moduleId === "deals-full-page"
                          ? "Open deals page"
                          : moduleId === "water-saving-finder"
                            ? "Open water finder"
                            : moduleId === "water-saving-guide"
                              ? "Open water guide"
                              : moduleId === "sustainable-product-finder"
                              ? "Open product finder"
                              : moduleId === "sustainability-news-edition" || moduleId === "tech-news-edition"
                                ? "Open newsletter"
                                : moduleId === "sustainability-news-page"
                                  ? "Open news"
                                  : moduleId === "sustainability-map"
                                    ? "Open on map"
                        : moduleId === "savings-trajectory"
                          ? "Open trajectory"
                          : moduleId === "energy-cost-guide"
                            ? "Open cost guide"
                            : moduleId === "energy-audit"
                              ? "Open audit"
                              : moduleId === "etl-calculator"
                                ? "Open product calculator"
                                : moduleId === "savings-tour"
                                  ? "Open savings tour"
                                  : moduleId === "low-energy-equipment"
                                    ? "Open guide"
                                    : moduleId === "declining-cost-renewables"
                                      ? "Open renewable chart"
                                      : "Open illustration";
      const tabletClass =
        moduleId === "sustainability-map" ? "module-tablet module-tablet--map" : "module-tablet";
      return (
        '<article class="' + tabletClass + '">' +
        '<h4 class="module-tablet-title">' + title + "</h4>" +
        (desc ? '<p class="module-tablet-desc">' + desc + "</p>" : "") +
        (usage ? '<p class="module-tablet-usage">' + usage + "</p>" : "") +
        '<div class="module-tablet-actions">' +
        '<button type="button" class="module-tablet-open module-tablet-open--primary" data-module-payload="' + payload + '">' + openLabel + "</button>" +
        '<a class="module-tablet-full" href="' + fullHref + '" target="_blank" rel="noopener noreferrer">New tab ↗</a>' +
        "</div></article>"
      );
    }).join("");
    return '<div class="module-tablets">' + tablets + "</div>";
  }

  function tryUpgradeLinkItem(item) {
    if (!item) return null;
    var url = String(item.url || item.href || "").trim();
    if (!url || /^https?:\/\//i.test(url) || url.indexOf("/greenways/") >= 0) return null;
    var CM = window.GreenwaysAgentContentModule;
    if (!CM || typeof CM.buildModuleItemFromLink !== "function") return null;
    return CM.buildModuleItemFromLink(url, {
      title: item.title,
      description: item.description,
      openSize: "near-full"
    });
  }

  function externalLinkTarget(url) {
    return /^https?:\/\//i.test(String(url || "")) ? '_top' : '_blank';
  }

  function linkTabletsHtml(items, escapeHtml) {
    if (!Array.isArray(items) || !items.length) return "";
    const tablets = items.map(function (item) {
      const title = escapeHtml(item.title || "Link");
      const rawUrl = String(item.url || item.href || "").trim();
      const url = escapeHtml(rawUrl || "#");
      const desc = escapeHtml(String(item.description || "").slice(0, 180));
      const target = externalLinkTarget(rawUrl);
      return (
        '<article class="link-tablet">' +
        '<h4 class="link-tablet-title">' + title + "</h4>" +
        (desc ? '<p class="link-tablet-desc">' + desc + "</p>" : "") +
        '<a class="link-tablet-open" href="' + url + '" target="' + target + '" rel="noopener noreferrer">Open ↗</a>' +
        "</article>"
      );
    }).join("");
    return '<div class="link-tablets">' + tablets + "</div>";
  }

  function encodeVideoPayload(item) {
    if (window.GreenwaysAgentVideo && typeof window.GreenwaysAgentVideo.encodePayload === "function") {
      return window.GreenwaysAgentVideo.encodePayload(item);
    }
    return encodeURIComponent(JSON.stringify(item || {}));
  }

  function videoTabletsHtml(block, escapeHtml) {
    const items = block && Array.isArray(block.items) ? block.items : [];
    if (!items.length) return "";
    const heading = block.title
      ? '<div class="video-tablets-head">' + escapeHtml(block.title) + "</div>"
      : "";
    const tablets = items.map(function (item) {
      const title = escapeHtml(item.title || "Video");
      const desc = escapeHtml(String(item.description || "").slice(0, 180));
      const payload = encodeVideoPayload(item);
      const playable = Boolean(item.videoId || item.videoUrl);
      const thumbSrc = String(item.thumbnail || "").trim();
      const thumbInner = thumbSrc
        ? '<img src="' + escapeHtml(thumbSrc) + '" alt="" loading="lazy">'
        : '<span class="video-tablet-fallback" aria-hidden="true">🎬</span>';
      const badgeClass = playable ? "gw-video-play-badge" : "gw-video-site-badge";
      const badgeLabel = playable ? "▶" : "Site";
      const duration = item.duration ? '<span class="gw-video-duration">' + escapeHtml(item.duration) + "</span>" : "";
      return (
        '<article class="video-tablet">' +
        '<button type="button" class="video-tablet-open" data-video-payload="' + payload + '">' +
        '<div class="video-tablet-thumb">' +
        thumbInner +
        '<span class="' + badgeClass + '">' + badgeLabel + "</span>" +
        duration +
        "</div>" +
        '<div class="video-tablet-body">' +
        '<h4 class="video-tablet-title">' + title + "</h4>" +
        (desc ? '<p class="video-tablet-desc">' + desc + "</p>" : "") +
        "</div></button></article>"
      );
    }).join("");
    return '<div class="video-tablets">' + heading + '<div class="video-tablets-grid">' + tablets + "</div></div>";
  }

  function blocksHtml(blocks, escapeHtml) {
    if (!Array.isArray(blocks) || !blocks.length) return "";
    const parts = blocks.map(function (block) {
      if (!block || !block.type) return "";
      if (block.type === "stat") return statBlockHtml(block.items, escapeHtml);
      if (block.type === "link") {
        const items = Array.isArray(block.items) ? block.items : [];
        const modules = [];
        const links = [];
        items.forEach(function (item) {
          const upgraded = tryUpgradeLinkItem(item);
          if (upgraded) modules.push(upgraded);
          else links.push(item);
        });
        const chunks = [];
        if (modules.length) chunks.push(moduleTabletsHtml(modules, escapeHtml));
        if (links.length) chunks.push(linkTabletsHtml(links, escapeHtml));
        return chunks.join("");
      }
      if (block.type === "module") return moduleTabletsHtml(block.items, escapeHtml);
      if (block.type === "video") return videoTabletsHtml(block, escapeHtml);
      return "";
    }).filter(Boolean);
    if (!parts.length) return "";
    return '<div class="agent-blocks">' + parts.join("") + "</div>";
  }

  function schemeTabletsHtml(suggestions, escapeHtml) {
    if (!Array.isArray(suggestions) || !suggestions.length) return "";
    const tablets = suggestions.slice(0, 6).map(function (s) {
      const title = escapeHtml(s.title || "Scheme");
      const payload = encodeSchemePayload(s);
      const url = s.url ? escapeHtml(String(s.url)) : "";
      const askPrompt = "Explain " + String(s.title || "this scheme") + " for my business profile";
      const region = escapeHtml((s.region || "eu").toUpperCase());
      const type = escapeHtml(s.type || "scheme");
      const desc = escapeHtml(String(s.description || "No description in catalogue.").slice(0, 180));
      const deadline = s.deadline ? escapeHtml(String(s.deadline)) : "";
      const deadlineHtml = deadline
        ? '<span class="scheme-tablet-deadline">Deadline ' + deadline + "</span>"
        : "";
      const linkHtml = url
        ? '<a class="scheme-tablet-link" href="' + url + '" target="_top" rel="noopener noreferrer">Official site ↗</a>'
        : "";
      return (
        '<article class="scheme-tablet">' +
        '<div class="scheme-tablet-head">' +
        '<button type="button" class="scheme-chip-btn scheme-tablet-title" data-scheme="' + payload + '" title="Tap to select for compare">' + title + "</button>" +
        '<div class="scheme-tablet-badges">' +
        '<span class="scheme-tablet-badge region">' + region + "</span>" +
        '<span class="scheme-tablet-badge type">' + type + "</span>" +
        deadlineHtml +
        "</div></div>" +
        '<p class="scheme-tablet-desc">' + desc + "</p>" +
        '<div class="scheme-tablet-actions">' +
        '<button type="button" class="scheme-tablet-ask scheme-chip-ask" data-prompt="' + escapeHtml(askPrompt) + '">Ask about this</button>' +
        linkHtml +
        "</div></article>"
      );
    }).join("");
    return (
      '<div class="scheme-tablets">' + tablets + "</div>" +
      '<div class="scheme-chips-hint">Tap scheme title to select · Ask about this · pick 2 then Compare below</div>'
    );
  }

  function contentBlocksHtml(suggestions, blocks, escapeHtml) {
    const ordered = [];
    const blockList = Array.isArray(blocks) ? blocks : [];
    blockList.forEach(function (block) {
      if (block && block.type === "stat") ordered.push(blocksHtml([block], escapeHtml));
    });
    if (Array.isArray(suggestions) && suggestions.length) {
      ordered.push(schemeTabletsHtml(suggestions, escapeHtml));
    }
    blockList.forEach(function (block) {
      if (block && block.type === "link") ordered.push(blocksHtml([block], escapeHtml));
    });
    blockList.forEach(function (block) {
      if (block && block.type === "module") ordered.push(blocksHtml([block], escapeHtml));
    });
    blockList.forEach(function (block) {
      if (block && block.type === "video") ordered.push(blocksHtml([block], escapeHtml));
    });
    return ordered.join("");
  }

  function rightPanelInnerHtml(suggestions, blocks, tips, escapeHtml) {
    const parts = [];
    const awareness = awarenessPanelHtml(tips, escapeHtml);
    if (awareness) parts.push(awareness);
    const structured = contentBlocksHtml(suggestions, blocks, escapeHtml);
    if (structured) parts.push(structured);
    return parts.join("");
  }

  function rightPanelHtml(suggestions, blocks, tips, escapeHtml) {
    const inner = rightPanelInnerHtml(suggestions, blocks, tips, escapeHtml);
    if (!inner) return "";
    return '<div class="agent-turn-right">' + inner + "</div>";
  }

  function buildParts(rawAnswer, suggestions, blocks, meta, helpers) {
    if (!meta || meta.footHtml == null) {
      throw new Error("GreenwaysAgentTurnUi.buildParts requires meta.footHtml");
    }
    if (!helpers || typeof helpers.escapeHtml !== "function" || typeof helpers.formatAnswer !== "function") {
      throw new Error("GreenwaysAgentTurnUi.buildParts requires helpers.escapeHtml and helpers.formatAnswer");
    }
    const escapeHtml = helpers.escapeHtml;
    const formatAnswer = helpers.formatAnswer;
    const display = agentDisplayAnswer(rawAnswer, suggestions, blocks);
    const extracted = extractAwarenessFromAnswer(display);
    const tips = extracted.tips;
    const rightHtml = rightPanelHtml(suggestions, blocks, tips, escapeHtml);
    const useSplit = !!rightHtml;
    return {
      leftText: extracted.body,
      leftHtml: formatAnswer(extracted.body),
      rightHtml: rightHtml,
      footHtml: meta.footHtml,
      useSplit: useSplit
    };
  }

  function avatarMarkup(avatar) {
    if (avatar && typeof avatar === "object" && avatar.imageUrl) {
      const alt = avatar.name || avatar.alt || "Agent";
      return (
        '<img class="msg-avatar agent-avatar-img" src="' + String(avatar.imageUrl) + '" alt="' + alt + '" width="28" height="28" decoding="async">'
      );
    }
    const emoji = avatar != null ? avatar : "🤖";
    return '<span class="msg-avatar" aria-hidden="true">' + emoji + "</span>";
  }

  function layoutHtml(parts, avatar) {
    let html = avatarMarkup(avatar);
    if (parts.useSplit) {
      html +=
        '<div class="agent-turn-split">' +
        '<div class="agent-turn-left">' + parts.leftHtml + "</div>" +
        parts.rightHtml +
        "</div>" +
        '<div class="agent-turn-foot">' + parts.footHtml + "</div>";
    } else {
      html += parts.leftHtml + parts.footHtml;
    }
    return html;
  }

  function applySplitClasses(row, bubble, useSplit) {
    if (row) row.classList.toggle("has-split", useSplit);
    if (bubble) bubble.classList.toggle("has-split-layout", useSplit);
  }

  function revealTyped(el, parts, ctx, done) {
    if (!el) return;
    const thread = ctx && ctx.thread;
    const formatAnswer = ctx && ctx.formatAnswer;
    if (!thread || typeof formatAnswer !== "function") {
      throw new Error("GreenwaysAgentTurnUi.revealTyped requires ctx.thread and ctx.formatAnswer");
    }

    const row = el.closest(".msg-row");
    if (row) row.classList.remove("is-thinking");
    const bubble = el.querySelector(".msg-bubble");
    if (!bubble) return;

    const useSplit = parts.useSplit;
    const avatar = ctx.avatar != null ? ctx.avatar : ctx.avatarEmoji != null ? ctx.avatarEmoji : "🤖";
    const avatarHtml = avatarMarkup(avatar);
    applySplitClasses(row, bubble, useSplit);

    const words = String(parts.leftText || "").split(/(\s+)/);
    let i = 0;
    let built = "";

    if (useSplit) {
      bubble.innerHTML =
        avatarHtml +
        '<div class="agent-turn-split">' +
        '<div class="agent-turn-left"><span class="typed-body"></span></div>' +
        "</div>" +
        '<div class="agent-turn-foot agent-turn-foot-pending" hidden></div>';
    } else {
      bubble.innerHTML = avatarHtml + '<span class="typed-body"></span>';
    }

    const body = bubble.querySelector(".typed-body");
    const footPending = bubble.querySelector(".agent-turn-foot-pending");

    function finishLayout() {
      if (useSplit) {
        body.innerHTML = formatAnswer(parts.leftText || "");
        const split = bubble.querySelector(".agent-turn-split");
        if (split && parts.rightHtml) split.insertAdjacentHTML("beforeend", parts.rightHtml);
        if (footPending) {
          footPending.innerHTML = parts.footHtml || "";
          footPending.hidden = false;
          footPending.classList.remove("agent-turn-foot-pending");
        }
      } else {
        body.innerHTML = (parts.leftHtml || "") + (parts.footHtml || "");
      }
      if (typeof done === "function") done();
      thread.scrollTop = thread.scrollHeight;
    }

    function tick() {
      if (i >= words.length) {
        finishLayout();
        return;
      }
      built += words[i++];
      body.innerHTML = formatAnswer(built);
      thread.scrollTop = thread.scrollHeight;
      setTimeout(tick, words[i - 1] && words[i - 1].trim() ? 18 : 0);
    }
    tick();
  }

  function formatAnswer(text, escapeHtmlFn) {
    if (typeof escapeHtmlFn !== "function") {
      throw new Error("GreenwaysAgentTurnUi.formatAnswer requires escapeHtml");
    }
    let raw = String(text || "");
    const profiles = [];
    raw = raw.replace(/:::agent-profile\s*\n([\s\S]*?)\n:::/g, function (_, content) {
      profiles.push(String(content || "").trim());
      return "[[AGENT_PROFILE_" + (profiles.length - 1) + "]]";
    });

    let html = escapeHtmlFn(raw)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");

    profiles.forEach(function (content, idx) {
      const placeholder = escapeHtmlFn("[[AGENT_PROFILE_" + idx + "]]");
      const inner = escapeHtmlFn(content)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
      html = html.replace(
        placeholder,
        '<aside class="agent-system-profile" aria-label="About this specialist">' +
          '<div class="agent-system-profile-label">About this specialist</div>' +
          '<div class="agent-system-profile-body">' +
          inner +
          "</div></aside>"
      );
    });
    return html;
  }

  function wrapMixedParagraphs(html) {
    if (html.indexOf("agent-system-profile") === -1) {
      var flat = String(html || "").replace(/^<br>|<br>$/g, "");
      if (!flat) return "";
      return "<p>" + flat + "</p>";
    }
    return String(html || "")
      .split(/(<aside class="agent-system-profile"[\s\S]*?<\/aside>)/g)
      .map(function (seg) {
        if (!seg) return "";
        if (seg.indexOf("<aside") === 0) return seg;
        var t = seg.replace(/^<br>|<br>$/g, "").trim();
        return t ? "<p>" + t + "</p>" : "";
      })
      .join("");
  }

  function formatAgentAnswerBody(text, escapeHtmlFn, options) {
    options = options || {};
    var html = formatAnswer(text, escapeHtmlFn);
    if (options.linkify) {
      html = html.replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#93c5fd">$1</a>'
      );
    }
    if (options.wrapParagraphs) {
      html = wrapMixedParagraphs(html);
    }
    return html;
  }

  function resolveHandoffHref(h) {
    if (h && h.href) return h.href;
    const base = (h && h.path) || "/greenways/grants-agent";
    const q = (h && (h.prompt || h.question)) || "";
    return base + (q ? "?q=" + encodeURIComponent(q) : "");
  }

  function agentHandoffChipsHtml(handoffs, escapeHtmlFn) {
    if (typeof escapeHtmlFn !== "function") {
      throw new Error("GreenwaysAgentTurnUi.agentHandoffChipsHtml requires escapeHtml");
    }
    if (!Array.isArray(handoffs) || !handoffs.length) return "";
    const escapeHtml = escapeHtmlFn;
    const chips = handoffs
      .map(function (h) {
        const prompt = h.prompt || h.question || "";
        return (
          '<a class="agent-handoff-chip" href="' +
          escapeHtml(resolveHandoffHref(h)) +
          '" target="_top" rel="noopener" data-prompt="' +
          escapeHtml(prompt) +
          '">' +
          escapeHtml(h.name || h.id) +
          "</a>"
        );
      })
      .join("");
    return (
      '<div class="agent-handoff-block" aria-label="Other specialists">' +
      '<div class="agent-handoff-label">Other agents that can also assist you</div>' +
      '<div class="agent-handoff-chips">' +
      chips +
      "</div>" +
      '<p class="agent-handoff-hint">Tap a name to open that specialist with your question. Use ' +
      '<button type="button" class="agent-handoff-journey-link" data-open-journey="1">Journey</button> ' +
      "at the top for a summary of your conversation across all our agents.</p>" +
      "</div>"
    );
  }

  if (typeof document !== "undefined") {
    document.addEventListener("click", function (ev) {
      const journeyBtn = ev.target.closest("[data-open-journey]");
      if (!journeyBtn) return;
      ev.preventDefault();
      if (window.GreenwaysAgentTeam && typeof window.GreenwaysAgentTeam.openJourneySummary === "function") {
        window.GreenwaysAgentTeam.openJourneySummary();
      }
    });
  }

  /** Root-relative marketplace URL — agents live under /greenways/* so bare filenames 404. */
  function normalizeMarketplaceHref(href, productId) {
    var u = String(href || "").trim();
    if (!u && productId) {
      u =
        "/product-page-v2-marketplace.html?product=" +
        encodeURIComponent(productId) +
        "&fromPopup=true";
    }
    if (!u) return u;
    if (/^https?:\/\//i.test(u)) return u;
    if (u.charAt(0) === "/") return u;
    return "/" + u.replace(/^\.\//, "");
  }

  window.GreenwaysAgentTurnUi = {
    agentHandoffChipsHtml: agentHandoffChipsHtml,
    formatAnswer: formatAnswer,
    formatAgentAnswerBody: formatAgentAnswerBody,
    wrapMixedParagraphs: wrapMixedParagraphs,
    normalizeMarketplaceHref: normalizeMarketplaceHref,
    avatarMarkup: avatarMarkup,
    buildParts: buildParts,
    layoutHtml: layoutHtml,
    applySplitClasses: applySplitClasses,
    revealTyped: revealTyped,
    schemeTabletsHtml: schemeTabletsHtml,
    linkTabletsHtml: linkTabletsHtml,
    moduleTabletsHtml: moduleTabletsHtml,
    statBlockHtml: statBlockHtml,
    contentBlocksHtml: contentBlocksHtml,
    extractAwarenessFromAnswer: extractAwarenessFromAnswer,
    introFromAnswer: introFromAnswer,
    agentDisplayAnswer: agentDisplayAnswer
  };
})();
