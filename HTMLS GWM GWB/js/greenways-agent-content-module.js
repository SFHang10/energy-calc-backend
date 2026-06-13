/**
 * Shared content module shell — opens informative HTML pages in a modal iframe.
 * Videos delegate to GreenwaysAgentVideo when kind=video or video payload present.
 */
(function (global) {
  "use strict";

  var modalEl = null;
  var stageEl = null;
  var titleEl = null;
  var descEl = null;
  var footEl = null;
  var fullLinkEl = null;
  var activeIframe = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "gw-content-module-modal";
    modalEl.id = "gw-content-module-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-label", "Greenways illustration");
    modalEl.innerHTML =
      '<div class="gw-content-module-panel" data-gw-module-panel="1">' +
      '<div class="gw-content-module-head">' +
      '<div><h3 class="gw-content-module-title" id="gw-content-module-title"></h3>' +
      '<p class="gw-content-module-desc" id="gw-content-module-desc"></p></div>' +
      '<div class="gw-content-module-actions">' +
      '<a class="gw-content-module-full" id="gw-content-module-full" href="#" target="_blank" rel="noopener">Full page ↗</a>' +
      '<button type="button" class="gw-content-module-close" aria-label="Close illustration">×</button>' +
      "</div></div>" +
      '<div class="gw-content-module-stage" id="gw-content-module-stage"></div>' +
      '<div class="gw-content-module-foot" id="gw-content-module-foot">Independent module — chat stays open behind this view</div>' +
      "</div>";
    document.body.appendChild(modalEl);

    stageEl = modalEl.querySelector("#gw-content-module-stage");
    titleEl = modalEl.querySelector("#gw-content-module-title");
    descEl = modalEl.querySelector("#gw-content-module-desc");
    footEl = modalEl.querySelector("#gw-content-module-foot");
    fullLinkEl = modalEl.querySelector("#gw-content-module-full");

    modalEl.querySelector(".gw-content-module-close").addEventListener("click", close);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) close();
    });

    return modalEl;
  }

  function clearStage() {
    if (activeIframe) {
      try {
        activeIframe.src = "about:blank";
      } catch (_) {}
      activeIframe = null;
    }
    if (stageEl) stageEl.innerHTML = "";
  }

  function openVideoModule(item) {
    if (!global.GreenwaysAgentVideo) {
      ensureModal();
      if (stageEl) {
        stageEl.innerHTML = '<div class="gw-video-modal-empty">Video player not loaded on this page.</div>';
      }
      modalEl.classList.add("is-open");
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

    var title = String(item.title || "Greenways illustration");
    var desc = String(item.description || "");
    var href = String(item.href || "");

    titleEl.textContent = title;
    descEl.textContent = desc;
    descEl.hidden = !desc;
    if (fullLinkEl) {
      fullLinkEl.href = item.fullPageHref || href || "#";
      fullLinkEl.hidden = !(item.fullPageHref || href);
    }
    if (footEl) {
      footEl.textContent = item.moduleId
        ? "Module: " + item.moduleId + " — use controls inside the illustration"
        : "Independent module — chat stays open behind this view";
    }

    if (!href) {
      stageEl.innerHTML = '<div class="gw-video-modal-empty">No module URL configured yet.</div>';
    } else {
      activeIframe = document.createElement("iframe");
      activeIframe.title = title;
      activeIframe.loading = "lazy";
      activeIframe.referrerPolicy = "no-referrer-when-downgrade";
      activeIframe.src = href;
      stageEl.appendChild(activeIframe);
    }

    modalEl.classList.add("is-open");
  }

  function close() {
    if (!modalEl) return;
    clearStage();
    modalEl.classList.remove("is-open");
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
    open: open,
    close: close,
    encodePayload: encodePayload,
    parsePayload: parsePayload,
    bindContainer: bindContainer,
    ensureModal: ensureModal
  };
})(window);
