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
  var relatedEl = null;
  var relatedListEl = null;
  var relatedStoryEl = null;
  var currentVideo = null;
  var relatedCache = {};

  var config = {
    apiBase: function () {
      return "";
    },
    relatedTitle: "More in the sustainability story",
    onAsk: null
  };

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function configure(opts) {
    if (!opts) return;
    if (typeof opts.apiBase === "function") config.apiBase = opts.apiBase;
    if (opts.relatedTitle) config.relatedTitle = opts.relatedTitle;
    if (typeof opts.onAsk === "function") config.onAsk = opts.onAsk;
  }

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
      '<div class="gw-video-modal-related" id="gw-video-modal-related" hidden>' +
      '<div class="gw-video-modal-related-head">' +
      '<span class="gw-video-modal-related-title" id="gw-video-modal-related-title"></span>' +
      '<button type="button" class="gw-video-modal-ask-btn" id="gw-video-modal-ask-btn" hidden>Ask Cheryce</button>' +
      "</div>" +
      '<p class="gw-video-modal-related-story" id="gw-video-modal-related-story"></p>' +
      '<div class="gw-video-modal-related-list" id="gw-video-modal-related-list"></div>' +
      "</div>" +
      '<div class="gw-video-modal-foot" id="gw-video-modal-foot">Greenways Wix video library</div>' +
      "</div>";
    document.body.appendChild(modalEl);

    stageEl = modalEl.querySelector("#gw-video-modal-stage");
    titleEl = modalEl.querySelector("#gw-video-modal-title");
    descEl = modalEl.querySelector("#gw-video-modal-desc");
    footEl = modalEl.querySelector("#gw-video-modal-foot");
    relatedEl = modalEl.querySelector("#gw-video-modal-related");
    relatedListEl = modalEl.querySelector("#gw-video-modal-related-list");
    relatedStoryEl = modalEl.querySelector("#gw-video-modal-related-story");

    modalEl.querySelector(".gw-video-modal-close").addEventListener("click", close);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) close();
    });

    var askBtn = modalEl.querySelector("#gw-video-modal-ask-btn");
    if (askBtn) {
      askBtn.addEventListener("click", function () {
        if (!currentVideo || typeof config.onAsk !== "function") return;
        config.onAsk(currentVideo);
      });
    }

    if (relatedListEl) {
      relatedListEl.addEventListener("click", function (e) {
        var card = e.target.closest("[data-related-video]");
        if (!card) return;
        e.preventDefault();
        e.stopPropagation();
        try {
          var payload = JSON.parse(decodeURIComponent(card.getAttribute("data-related-video") || "%7B%7D"));
          open(payload);
        } catch (_) {}
      });
    }

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

  function setFootSource(video) {
    if (!footEl) return;
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

  function renderPlayer(video) {
    stopHls();
    stageEl.innerHTML = "";
    var title = String((video && video.title) || "Greenways video");
    var url = String((video && video.videoUrl) || "");
    var videoId = String((video && video.videoId) || "");

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
      var thumb = String((video && video.thumbnail) || "");
      if (thumb) {
        stageEl.innerHTML =
          '<div class="gw-video-modal-site-preview">' +
          '<img src="' + escapeHtml(thumb) + '" alt="">' +
          '<p>This clip lives on the Greenways Wix Video channel. Pick a related video below or open the full library.</p>' +
          "</div>";
      } else {
        showEmpty("This clip plays on the Greenways site — pick a related video below or open the library.");
      }
      if (footEl) {
        footEl.innerHTML =
          '<a href="' +
          escapeHtml(String((video && video.pageHref) || "https://www.greenwaysbuildings.com/greenways")) +
          '" target="_blank" rel="noopener noreferrer">Open on Greenways ↗</a>';
      }
    }
  }

  function relatedCardHtml(row) {
    var thumb = row.thumbnail
      ? '<img src="' + escapeHtml(row.thumbnail) + '" alt="" loading="lazy">'
      : '<span aria-hidden="true">🎬</span>';
    var badge = row.playable
      ? '<span class="gw-video-related-play" aria-hidden="true">▶</span>'
      : '<span class="gw-video-related-site" aria-hidden="true">↗</span>';
    var duration = row.duration
      ? '<span class="gw-video-related-duration">' + escapeHtml(row.duration) + "</span>"
      : "";
    var payload = encodeURIComponent(JSON.stringify({
      id: row.id || "",
      title: row.title || "",
      description: row.description || "",
      videoUrl: row.videoUrl || "",
      videoId: row.videoId || "",
      source: row.source || "",
      duration: row.duration || "",
      category: row.category || "",
      channelId: row.channelId || "",
      channelName: row.channelName || "",
      pageHref: row.pageHref || "https://www.greenwaysbuildings.com/greenways",
      playable: row.playable !== false
    }));
    return (
      '<button type="button" class="gw-video-related-card" data-related-video="' + payload + '">' +
      '<div class="gw-video-related-thumb">' + thumb + badge + duration + "</div>" +
      '<div class="gw-video-related-body">' +
      '<span class="gw-video-related-name">' + escapeHtml(row.title) + "</span>" +
      '<span class="gw-video-related-why">' + escapeHtml(row.whyPick || "Related pick") + "</span>" +
      "</div></button>"
    );
  }

  function renderRelated(related, storyLine) {
    if (!relatedEl || !relatedListEl) return;
    var titleNode = modalEl.querySelector("#gw-video-modal-related-title");
    var askBtn = modalEl.querySelector("#gw-video-modal-ask-btn");
    if (titleNode) titleNode.textContent = config.relatedTitle;
    if (askBtn) askBtn.hidden = typeof config.onAsk !== "function";
    if (!Array.isArray(related) || !related.length) {
      relatedEl.hidden = true;
      relatedListEl.innerHTML = "";
      if (relatedStoryEl) relatedStoryEl.textContent = "";
      return;
    }
    relatedEl.hidden = false;
    if (relatedStoryEl) {
      relatedStoryEl.innerHTML = String(storyLine || "")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }
    relatedListEl.innerHTML = related.map(relatedCardHtml).join("");
  }

  function relatedCacheKey(video) {
    return [
      video.id || "",
      video.category || "",
      video.channelId || "",
      video.title || ""
    ].join("|");
  }

  function loadRelatedVideos(video) {
    if (!relatedEl) return;
    var key = relatedCacheKey(video);
    if (relatedCache[key]) {
      renderRelated(relatedCache[key].related, relatedCache[key].storyLine);
      return;
    }
    renderRelated([], "Finding related sustainability videos…");
    relatedEl.hidden = false;

    var base = String(typeof config.apiBase === "function" ? config.apiBase() : config.apiBase || "").replace(/\/$/, "");
    var qs = new URLSearchParams();
    if (video.id) qs.set("id", video.id);
    if (video.title) qs.set("title", video.title);
    if (video.description) qs.set("description", String(video.description).slice(0, 180));
    if (video.category) qs.set("category", video.category);
    if (video.channelId) qs.set("channelId", video.channelId);
    if (video.channelName) qs.set("channelName", video.channelName);
    qs.set("limit", "4");

    var url = (base || "") + "/api/media-agent/videos/related?" + qs.toString();
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data || !data.ok) {
          renderRelated([], "");
          relatedEl.hidden = true;
          return;
        }
        relatedCache[key] = { related: data.related || [], storyLine: data.storyLine || "" };
        renderRelated(data.related, data.storyLine);
      })
      .catch(function () {
        relatedEl.hidden = true;
      });
  }

  function open(video) {
    ensureModal();
    currentVideo = video || null;

    var title = String((video && video.title) || "Greenways video");
    var desc = String((video && video.description) || "");

    titleEl.textContent = title;
    descEl.textContent = desc;
    descEl.hidden = !desc;
    setFootSource(video);
    renderPlayer(video);
    loadRelatedVideos(video || {});

    modalEl.classList.add("is-open");
  }

  function close() {
    if (!modalEl) return;
    stopHls();
    if (stageEl) stageEl.innerHTML = "";
    currentVideo = null;
    modalEl.classList.remove("is-open");
  }

  function encodePayload(video) {
    return encodeURIComponent(JSON.stringify({
      id: video.id || "",
      title: video.title || video.name || "",
      videoUrl: video.videoUrl || "",
      videoId: video.videoId || "",
      description: video.description || video.label || "",
      source: video.source || "",
      duration: video.duration || "",
      category: video.category || "",
      channelId: video.channelId || "",
      channelName: video.channelName || "",
      pageHref: video.pageHref || video.marketplaceHref || "https://www.greenwaysbuildings.com/greenways",
      thumbnail: video.thumbnail || video.imageUrl || ""
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
        open(payload);
      } catch (_) {}
    });
  }

  global.GreenwaysAgentVideo = {
    open: open,
    close: close,
    configure: configure,
    encodePayload: encodePayload,
    bindContainer: bindContainer,
    ensureModal: ensureModal,
    openSite: openSite
  };
})(window);
