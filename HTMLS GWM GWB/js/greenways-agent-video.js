/**
 * Shared in-agent video modal — Wix MP4/HLS or YouTube embed.
 * Used by Cheryce (media agent); safe to enable on other agents later.
 */
(function (global) {
  "use strict";

  var hlsPlayer = null;
  var modalEl = null;
  var stageEl = null;
  var titleEl = null;
  var descEl = null;
  var footEl = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "gw-video-modal";
    modalEl.id = "gw-video-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-label", "Video player");
    modalEl.innerHTML =
      '<div class="gw-video-modal-panel" data-gw-video-panel="1">' +
      '<div class="gw-video-modal-head">' +
      '<div><h3 class="gw-video-modal-title" id="gw-video-modal-title"></h3>' +
      '<p class="gw-video-modal-desc" id="gw-video-modal-desc"></p></div>' +
      '<button type="button" class="gw-video-modal-close" aria-label="Close video">×</button>' +
      "</div>" +
      '<div class="gw-video-modal-stage" id="gw-video-modal-stage"></div>' +
      '<div class="gw-video-modal-foot" id="gw-video-modal-foot">Greenways Wix video library</div>' +
      "</div>";
    document.body.appendChild(modalEl);

    stageEl = modalEl.querySelector("#gw-video-modal-stage");
    titleEl = modalEl.querySelector("#gw-video-modal-title");
    descEl = modalEl.querySelector("#gw-video-modal-desc");
    footEl = modalEl.querySelector("#gw-video-modal-foot");

    modalEl.querySelector(".gw-video-modal-close").addEventListener("click", close);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) close();
    });

    return modalEl;
  }

  function stopHls() {
    if (!hlsPlayer) return;
    try {
      hlsPlayer.destroy();
    } catch (_) {}
    hlsPlayer = null;
  }

  function ensureHlsLibrary() {
    if (global.Hls) return Promise.resolve(true);
    return new Promise(function (resolve) {
      var existing = document.querySelector('script[data-gw-hls="1"]');
      if (existing) {
        existing.addEventListener("load", function () { resolve(!!global.Hls); }, { once: true });
        existing.addEventListener("error", function () { resolve(false); }, { once: true });
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.15/dist/hls.min.js";
      script.async = true;
      script.dataset.gwHls = "1";
      script.onload = function () { resolve(!!global.Hls); };
      script.onerror = function () { resolve(false); };
      document.head.appendChild(script);
    });
  }

  function showEmpty(message) {
    stageEl.innerHTML = '<div class="gw-video-modal-empty">' + message + "</div>";
  }

  function open(video) {
    ensureModal();
    stopHls();
    stageEl.innerHTML = "";

    var title = String((video && video.title) || "Greenways video");
    var desc = String((video && video.description) || "");
    var url = String((video && video.videoUrl) || "");
    var videoId = String((video && video.videoId) || "");

    titleEl.textContent = title;
    descEl.textContent = desc;
    descEl.hidden = !desc;
    if (footEl) {
      var src = video && video.source;
      footEl.textContent =
        src === "wix"
          ? "Streaming from Greenways Wix Media"
          : src === "catalog"
            ? "Greenways video catalog (Wix MP4)"
            : src === "wix-youtube"
              ? "Greenways Wix Video channel (YouTube feed)"
              : "Greenways sustainable video library";
    }

    if (url) {
      var player = document.createElement("video");
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      player.setAttribute("aria-label", title);
      stageEl.appendChild(player);

      if (url.indexOf(".m3u8") !== -1) {
        ensureHlsLibrary().then(function (hasHls) {
          if (hasHls && global.Hls && global.Hls.isSupported()) {
            hlsPlayer = new global.Hls();
            hlsPlayer.loadSource(url);
            hlsPlayer.attachMedia(player);
          } else if (player.canPlayType("application/vnd.apple.mpegurl")) {
            player.src = url;
          } else {
            showEmpty("This browser cannot play this stream format.");
          }
        });
      } else {
        player.src = url;
        player.onerror = function () {
          showEmpty("Video unavailable right now. Try again after Wix credentials sync on Render.");
        };
      }
    } else if (videoId) {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      iframe.title = title;
      stageEl.appendChild(iframe);
    } else {
      showEmpty("This clip plays on the Greenways site — use Open on site on the card.");
      if (footEl) {
        footEl.innerHTML =
          'Not embedded here yet. <a href="' +
          String((video && video.pageHref) || "https://www.greenwaysbuildings.com/greenways") +
          '" target="_blank" rel="noopener noreferrer">Open on Greenways ↗</a>';
      }
    }

    modalEl.classList.add("is-open");
  }

  function close() {
    if (!modalEl) return;
    stopHls();
    if (stageEl) stageEl.innerHTML = "";
    modalEl.classList.remove("is-open");
  }

  function encodePayload(video) {
    return encodeURIComponent(JSON.stringify({
      title: video.title || video.name || "",
      videoUrl: video.videoUrl || "",
      videoId: video.videoId || "",
      description: video.description || video.label || "",
      source: video.source || "",
      duration: video.duration || "",
      pageHref: video.pageHref || video.marketplaceHref || "https://www.greenwaysbuildings.com/greenways"
    }));
  }

  function openSite(payload) {
    var href = String((payload && payload.pageHref) || "https://www.greenwaysbuildings.com/greenways");
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function bindContainer(container, onMissing) {
    if (!container) return;
    container.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-video-payload]");
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      try {
        var payload = JSON.parse(decodeURIComponent(trigger.getAttribute("data-video-payload") || "%7B%7D"));
        if (!payload.videoUrl && !payload.videoId) {
          if (typeof onMissing === "function") onMissing(payload);
          else openSite(payload);
          return;
        }
        open(payload);
      } catch (_) {}
    });
  }

  global.GreenwaysAgentVideo = {
    open: open,
    close: close,
    encodePayload: encodePayload,
    bindContainer: bindContainer,
    ensureModal: ensureModal,
    openSite: openSite
  };
})(window);
