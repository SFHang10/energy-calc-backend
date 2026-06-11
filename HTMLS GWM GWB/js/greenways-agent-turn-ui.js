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
    if (Array.isArray(blocks) && blocks.length) return answer;
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

  function awarenessPanelHtml(tips, escapeHtml) {
    if (!Array.isArray(tips) || !tips.length) return "";
    const items = tips.map(function (tip) {
      return "<li>" + escapeHtml(tip) + "</li>";
    }).join("");
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

  function linkTabletsHtml(items, escapeHtml) {
    if (!Array.isArray(items) || !items.length) return "";
    const tablets = items.map(function (item) {
      const title = escapeHtml(item.title || "Link");
      const url = escapeHtml(String(item.url || "#"));
      const desc = escapeHtml(String(item.description || "").slice(0, 180));
      return (
        '<article class="link-tablet">' +
        '<h4 class="link-tablet-title">' + title + "</h4>" +
        (desc ? '<p class="link-tablet-desc">' + desc + "</p>" : "") +
        '<a class="link-tablet-open" href="' + url + '" target="_blank" rel="noopener">Open ↗</a>' +
        "</article>"
      );
    }).join("");
    return '<div class="link-tablets">' + tablets + "</div>";
  }

  function blocksHtml(blocks, escapeHtml) {
    if (!Array.isArray(blocks) || !blocks.length) return "";
    const parts = blocks.map(function (block) {
      if (!block || !block.type) return "";
      if (block.type === "stat") return statBlockHtml(block.items, escapeHtml);
      if (block.type === "link") return linkTabletsHtml(block.items, escapeHtml);
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
        ? '<a class="scheme-tablet-link" href="' + url + '" target="_blank" rel="noopener">Official site ↗</a>'
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

  window.GreenwaysAgentTurnUi = {
    avatarMarkup: avatarMarkup,
    buildParts: buildParts,
    layoutHtml: layoutHtml,
    applySplitClasses: applySplitClasses,
    revealTyped: revealTyped,
    schemeTabletsHtml: schemeTabletsHtml,
    linkTabletsHtml: linkTabletsHtml,
    statBlockHtml: statBlockHtml,
    contentBlocksHtml: contentBlocksHtml,
    extractAwarenessFromAnswer: extractAwarenessFromAnswer,
    introFromAnswer: introFromAnswer,
    agentDisplayAnswer: agentDisplayAnswer
  };
})();
