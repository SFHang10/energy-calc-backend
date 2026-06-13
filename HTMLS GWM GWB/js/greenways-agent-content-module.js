/**
 * Shared content module shell — independent HTML illustrations inside agent chat.
 * Cover frame + agent theme + isolated iframe scroll. Videos delegate to GreenwaysAgentVideo.
 */
(function (global) {
  "use strict";

  var modalEl = null;
  var panelEl = null;
  var stageEl = null;
  var titleEl = null;
  var descEl = null;
  var footEl = null;
  var coverHintEl = null;
  var coverAgentEl = null;
  var badgeAgentEl = null;
  var returnHintEl = null;
  var fullLinkEl = null;
  var expandBtnEl = null;
  var backBtnEl = null;
  var activeIframe = null;
  var loadingTimeoutId = null;
  var embedMessageHandler = null;
  var activeModuleId = "";

  var pageContext = {
    agentName: "Agent",
    agentSlug: "",
    theme: "default",
    returnLabel: "← Back to chat"
  };

  function init(ctx) {
    if (!ctx || typeof ctx !== "object") return pageContext;
    pageContext = {
      agentName: ctx.agentName != null ? String(ctx.agentName) : pageContext.agentName,
      agentSlug: ctx.agentSlug != null ? String(ctx.agentSlug) : pageContext.agentSlug,
      theme: ctx.theme != null ? String(ctx.theme) : pageContext.theme,
      returnLabel: ctx.returnLabel != null ? String(ctx.returnLabel) : pageContext.returnLabel
    };
    return pageContext;
  }

  function resolveContext(item) {
    item = item || {};
    return {
      agentName: String(item.agentName || pageContext.agentName || "Agent"),
      theme: String(item.theme || item.agentTheme || pageContext.theme || "default"),
      returnLabel: String(item.returnLabel || pageContext.returnLabel || "← Back to chat")
    };
  }

  function setExpanded(expanded) {
    if (!modalEl) return;
    modalEl.classList.toggle("is-expanded", !!expanded);
    if (expandBtnEl) {
      expandBtnEl.textContent = expanded ? "\u21F1" : "\u2922";
      expandBtnEl.setAttribute("aria-label", expanded ? "Restore module size" : "Expand module");
      expandBtnEl.setAttribute("title", expanded ? "Restore" : "Expand");
      expandBtnEl.classList.toggle("is-expanded", !!expanded);
    }
  }

  function applyOpenSize(item) {
    if (!modalEl) return;
    var size = String((item && item.openSize) || "").toLowerCase();
    if (item && item.moduleId === "sustainability-map" && !size) size = "near-full";
    modalEl.classList.remove("is-near-full");
    setExpanded(false);
    if (size === "near-full") modalEl.classList.add("is-near-full");
    else if (size === "expanded" || size === "full") setExpanded(true);
  }

  function applyTheme(item) {
    if (!modalEl) return;
    var ctx = resolveContext(item);
    var theme = ctx.theme.replace(/[^a-z0-9_-]/gi, "") || "default";
    modalEl.className = "gw-content-module-modal theme-" + theme;
    if (backBtnEl) backBtnEl.textContent = ctx.returnLabel;
    if (coverAgentEl) coverAgentEl.textContent = ctx.agentName;
    if (badgeAgentEl) badgeAgentEl.textContent = ctx.agentName;
    if (returnHintEl) {
      returnHintEl.textContent =
        "Scroll inside this panel · " + ctx.returnLabel.replace(/←\s*/, "") + " or × to return — " + ctx.agentName + " stays open behind";
    }
  }

  function setBodyLock(locked) {
    if (document.documentElement) {
      document.documentElement.classList.toggle("gw-module-body-lock", !!locked);
    }
  }

  function toggleExpanded() {
    if (!modalEl) return;
    setExpanded(!modalEl.classList.contains("is-expanded"));
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "gw-content-module-modal theme-default";
    modalEl.id = "gw-content-module-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-label", "Greenways independent module");
    modalEl.innerHTML =
      '<div class="gw-content-module-cover" id="gw-content-module-cover">' +
      '<p class="gw-content-module-cover-text">Independent module · <strong id="gw-content-module-cover-agent">Agent</strong> stays open behind</p>' +
      '<button type="button" class="gw-content-module-cover-back" id="gw-content-module-cover-back">← Back to chat</button>' +
      "</div>" +
      '<div class="gw-content-module-panel" data-gw-module-panel="1">' +
      '<div class="gw-content-module-badge-row">' +
      '<span class="gw-module-badge">Portal module</span>' +
      '<span class="gw-module-badge gw-module-badge--agent" id="gw-content-module-badge-agent">Agent</span>' +
      '<span class="gw-module-badge gw-module-badge--scroll">Scroll inside ↓</span>' +
      "</div>" +
      '<div class="gw-content-module-head">' +
      '<div class="gw-content-module-head-copy">' +
      '<h3 class="gw-content-module-title" id="gw-content-module-title"></h3>' +
      '<p class="gw-content-module-desc" id="gw-content-module-desc"></p>' +
      '<p class="gw-content-module-return-hint" id="gw-content-module-return-hint"></p>' +
      "</div>" +
      '<div class="gw-content-module-actions">' +
      '<button type="button" class="gw-content-module-back" id="gw-content-module-back">← Back to chat</button>' +
      '<a class="gw-content-module-full" id="gw-content-module-full" href="#" target="_blank" rel="noopener">New tab ↗</a>' +
      '<button type="button" class="gw-content-module-expand" id="gw-content-module-expand" aria-label="Expand module" title="Expand">⛶</button>' +
      '<button type="button" class="gw-content-module-close" aria-label="Close module">×</button>' +
      "</div></div>" +
      '<div class="gw-content-module-stage" id="gw-content-module-stage">' +
      '<div class="gw-content-module-loading" id="gw-content-module-loading" hidden>Loading illustration…</div>' +
      "</div>" +
      '<div class="gw-content-module-foot" id="gw-content-module-foot"></div>' +
      "</div>";
    document.body.appendChild(modalEl);

    panelEl = modalEl.querySelector("[data-gw-module-panel]");
    stageEl = modalEl.querySelector("#gw-content-module-stage");
    titleEl = modalEl.querySelector("#gw-content-module-title");
    descEl = modalEl.querySelector("#gw-content-module-desc");
    footEl = modalEl.querySelector("#gw-content-module-foot");
    coverHintEl = modalEl.querySelector("#gw-content-module-cover");
    coverAgentEl = modalEl.querySelector("#gw-content-module-cover-agent");
    badgeAgentEl = modalEl.querySelector("#gw-content-module-badge-agent");
    returnHintEl = modalEl.querySelector("#gw-content-module-return-hint");
    fullLinkEl = modalEl.querySelector("#gw-content-module-full");
    expandBtnEl = modalEl.querySelector("#gw-content-module-expand");
    backBtnEl = modalEl.querySelector("#gw-content-module-back");

    modalEl.querySelector(".gw-content-module-close").addEventListener("click", close);
    if (backBtnEl) backBtnEl.addEventListener("click", close);
    var coverBack = modalEl.querySelector("#gw-content-module-cover-back");
    if (coverBack) coverBack.addEventListener("click", close);
    if (expandBtnEl) expandBtnEl.addEventListener("click", toggleExpanded);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl || e.target === coverHintEl) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) close();
    });

    applyTheme({});
    return modalEl;
  }

  function ensureLoadingEl() {
    if (!stageEl) return null;
    var loadingEl = stageEl.querySelector("#gw-content-module-loading");
    if (loadingEl) return loadingEl;
    loadingEl = document.createElement("div");
    loadingEl.className = "gw-content-module-loading";
    loadingEl.id = "gw-content-module-loading";
    loadingEl.hidden = true;
    loadingEl.textContent = "Loading illustration…";
    return loadingEl;
  }

  function showLoading(show) {
    var loadingEl = ensureLoadingEl();
    if (!loadingEl || !stageEl) return;
    if (!loadingEl.parentNode) stageEl.appendChild(loadingEl);
    loadingEl.hidden = !show;
    stageEl.classList.toggle("is-loading", !!show);
  }

  function clearLoadingWatchers() {
    if (loadingTimeoutId) {
      clearTimeout(loadingTimeoutId);
      loadingTimeoutId = null;
    }
    if (embedMessageHandler) {
      window.removeEventListener("message", embedMessageHandler);
      embedMessageHandler = null;
    }
  }

  function finishLoadingStage() {
    showLoading(false);
    clearLoadingWatchers();
  }

  function watchIframeReady(item) {
    clearLoadingWatchers();
    var moduleId = item && item.moduleId ? String(item.moduleId) : "";
    loadingTimeoutId = setTimeout(finishLoadingStage, 4000);
    embedMessageHandler = function (event) {
      if (!activeIframe || !modalEl || !modalEl.classList.contains("is-open")) return;
      var data = event.data;
      if (!data || typeof data !== "object" || data.type !== "gw-module-embed-ready") return;
      if (moduleId && data.moduleId && data.moduleId !== moduleId) return;
      finishLoadingStage();
    };
    window.addEventListener("message", embedMessageHandler);
  }

  function clearStage() {
    clearLoadingWatchers();
    activeModuleId = "";
    if (activeIframe) {
      try {
        activeIframe.src = "about:blank";
      } catch (_) {}
      activeIframe = null;
    }
    if (stageEl) {
      var loading = ensureLoadingEl();
      stageEl.innerHTML = "";
      stageEl.appendChild(loading);
      loading.hidden = true;
      stageEl.classList.remove("is-loading");
    }
  }

  function openVideoModule(item) {
    if (!global.GreenwaysAgentVideo) {
      ensureModal();
      applyTheme(item);
      if (stageEl) {
        stageEl.innerHTML = '<div class="gw-video-modal-empty">Video player not loaded on this page.</div>';
      }
      modalEl.classList.add("is-open");
      setBodyLock(true);
      return;
    }
    close();
    global.GreenwaysAgentVideo.open({
      title: item.title,
      description: item.description,
      videoUrl: item.videoUrl || (item.video && item.video.videoUrl) || "",
      videoId: item.videoId || (item.video && item.video.videoId) || "",
      source: item.source || (item.video && item.video.source) || ""
    });
  }

  function open(item) {
    if (!item) return;
    var kind = String(item.kind || "").toLowerCase();
    if (kind === "video" || item.videoUrl || item.videoId || (item.video && (item.video.videoUrl || item.video.videoId))) {
      openVideoModule(item);
      return;
    }

    ensureModal();
    clearStage();
    applyTheme(item);

    var ctx = resolveContext(item);
    var title = String(item.title || "Greenways illustration");
    var desc = String(item.description || item.subtitle || "");
    var href = String(item.href || "");

    titleEl.textContent = title;
    descEl.textContent = desc;
    descEl.hidden = !desc;
    if (fullLinkEl) {
      fullLinkEl.href = item.fullPageHref || href || "#";
      fullLinkEl.hidden = !(item.fullPageHref || href);
    }
    if (footEl) {
      footEl.textContent =
        "Independent module — " +
        ctx.agentName +
        " and your chat stay open. Scroll inside the panel above. Use New tab ↗ only if you want this illustration in a separate browser tab.";
    }

    if (!href) {
      showLoading(false);
      stageEl.innerHTML = '<div class="gw-video-modal-empty">No module URL configured yet.</div>';
    } else {
      showLoading(true);
      activeModuleId = String(item.moduleId || "");
      watchIframeReady(item);
      activeIframe = document.createElement("iframe");
      activeIframe.title = title;
      activeIframe.referrerPolicy = "no-referrer-when-downgrade";
      activeIframe.setAttribute("scrolling", "yes");
      activeIframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
      );
      activeIframe.addEventListener("load", finishLoadingStage, { once: true });
      activeIframe.addEventListener("error", finishLoadingStage, { once: true });
      stageEl.appendChild(activeIframe);
      activeIframe.src = href;
    }

    modalEl.classList.add("is-open");
    setBodyLock(true);
    applyOpenSize(item);
  }

  function close() {
    if (!modalEl) return;
    clearStage();
    modalEl.classList.remove("is-open");
    modalEl.classList.remove("is-near-full");
    setExpanded(false);
    setBodyLock(false);
  }

  function encodePayload(item) {
    return encodeURIComponent(JSON.stringify(item || {}));
  }

  function parsePayload(raw) {
    try {
      return JSON.parse(decodeURIComponent(raw || "%7B%7D"));
    } catch (_) {
      return null;
    }
  }

  function bindContainer(container) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-module-payload]");
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      var item = parsePayload(trigger.getAttribute("data-module-payload"));
      if (item) open(item);
    });
  }

  global.GreenwaysAgentContentModule = {
    init: init,
    open: open,
    close: close,
    toggleExpanded: toggleExpanded,
    setExpanded: setExpanded,
    encodePayload: encodePayload,
    parsePayload: parsePayload,
    bindContainer: bindContainer,
    ensureModal: ensureModal,
    getContext: function () {
      return Object.assign({}, pageContext);
    }
  };
})(window);
