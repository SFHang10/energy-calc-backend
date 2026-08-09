/**
 * Shared in-agent video cinema — Wix MP4/HLS or YouTube embed.
 * Cinema briefing layout: player + context panel (Watch / Learn).
 * Used by Cheryce (media agent) and the media video desk showcase.
 */
(function (global) {
  "use strict";

  var hlsPlayer = null;
  var modalEl = null;
  var stageEl = null;
  var titleEl = null;
  var descEl = null;
  var impactEl = null;
  var chipsEl = null;
  var takeawaysEl = null;
  var learnDescEl = null;
  var footEl = null;
  var relatedEl = null;
  var relatedListEl = null;
  var relatedStoryEl = null;
  var watchPaneEl = null;
  var learnPaneEl = null;
  var currentVideo = null;
  var relatedCache = {};
  var mode = "watch";

  var config = {
    apiBase: function () {
      return "";
    },
    relatedTitle: "Next in this series",
    deskLabel: "Cheryce · Video desk",
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
    if (opts.deskLabel) config.deskLabel = opts.deskLabel;
    if (typeof opts.onAsk === "function") config.onAsk = opts.onAsk;
  }

  function impactLine(video) {
    if (video && video.impact) return String(video.impact);
    var cat = String((video && video.category) || "").toLowerCase();
    var channel = String((video && video.channelName) || "").trim();
    var byCat = {
      restaurant: "Hospitality kitchens & site ops",
      kitchen: "Commercial kitchen energy & water",
      home: "Home & small-site efficiency",
      building: "Building systems & retrofit context",
      policy: "Policy & funding storytelling",
      news: "Sustainability news briefing"
    };
    if (byCat[cat]) return byCat[cat];
    if (channel) return channel + " · curated pick";
    return "Sustainability briefing for operators";
  }

  function buildTakeaways(video) {
    if (video && Array.isArray(video.takeaways) && video.takeaways.length) {
      return video.takeaways.map(String).slice(0, 4);
    }
    var desc = String((video && video.description) || "").trim();
    var parts = desc
      .split(/(?<=[.!?])\s+/)
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length >= 28; })
      .slice(0, 3);
    if (parts.length) return parts;
    var cat = String((video && video.category) || "").toLowerCase();
    if (cat === "restaurant" || cat === "kitchen") {
      return [
        "See where kitchen energy and water usually hide in the monthly bill.",
        "Use the clip as a briefing before you ask about sensors, equipment, or grants.",
        "Ask Cheryce how this story maps to your site profile."
      ];
    }
    return [
      "Watch for the practical takeaway you can apply on site.",
      "Use Learn mode for a short written brief under the player.",
      "Ask Cheryce to connect this clip to news, map examples, or next steps."
    ];
  }

  function audienceLine(video) {
    var sectorHints = String((video && (video.audience || video.forWho)) || "").trim();
    if (sectorHints) return sectorHints;
    var cat = String((video && video.category) || "").toLowerCase();
    if (cat === "restaurant" || cat === "kitchen") return "Best for restaurants, cafés, and multi-site hospitality";
    if (cat === "home") return "Best for homes and small commercial sites";
    if (cat === "building") return "Best for building managers and retrofit planners";
    return "Best for operators exploring sustainability media";
  }

  function setMode(next) {
    mode = next === "learn" ? "learn" : "watch";
    if (!modalEl) return;
    modalEl.querySelectorAll("[data-gw-video-mode]").forEach(function (btn) {
      var on = btn.getAttribute("data-gw-video-mode") === mode;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (watchPaneEl) watchPaneEl.hidden = mode !== "watch";
    if (learnPaneEl) learnPaneEl.hidden = mode !== "learn";
    modalEl.classList.toggle("is-learn-mode", mode === "learn");
  }

  function ensureModal() {
    if (modalEl) return modalEl;
    modalEl = document.createElement("div");
    modalEl.className = "gw-video-modal";
    modalEl.id = "gw-video-modal";
    modalEl.setAttribute("role", "dialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-label", "Video briefing");
    modalEl.innerHTML =
      '<div class="gw-video-modal-panel gw-video-cinema" data-gw-video-panel="1">' +
      '<header class="gw-video-cinema-top">' +
      '<div class="gw-video-cinema-brand">' +
      '<span class="gw-video-cinema-eyebrow" id="gw-video-modal-eyebrow"></span>' +
      '<div class="gw-video-cinema-modes" role="tablist" aria-label="Video view mode">' +
      '<button type="button" class="gw-video-mode-btn is-active" role="tab" aria-selected="true" data-gw-video-mode="watch">Watch</button>' +
      '<button type="button" class="gw-video-mode-btn" role="tab" aria-selected="false" data-gw-video-mode="learn">Learn</button>' +
      "</div></div>" +
      '<button type="button" class="gw-video-modal-close" aria-label="Close video">×</button>' +
      "</header>" +
      '<div class="gw-video-cinema-body">' +
      '<div class="gw-video-cinema-player">' +
      '<div class="gw-video-modal-stage" id="gw-video-modal-stage"></div>' +
      "</div>" +
      '<aside class="gw-video-cinema-brief" aria-label="Video briefing">' +
      '<h3 class="gw-video-modal-title" id="gw-video-modal-title"></h3>' +
      '<div class="gw-video-cinema-chips" id="gw-video-modal-chips"></div>' +
      '<p class="gw-video-cinema-impact" id="gw-video-modal-impact"></p>' +
      '<div class="gw-video-cinema-pane" id="gw-video-modal-watch-pane" data-pane="watch">' +
      '<p class="gw-video-cinema-audience" id="gw-video-modal-audience"></p>' +
      '<p class="gw-video-modal-desc" id="gw-video-modal-desc"></p>' +
      "</div>" +
      '<div class="gw-video-cinema-pane" id="gw-video-modal-learn-pane" data-pane="learn" hidden>' +
      '<p class="gw-video-cinema-learn-label">Key takeaways</p>' +
      '<ul class="gw-video-cinema-takeaways" id="gw-video-modal-takeaways"></ul>' +
      '<p class="gw-video-cinema-learn-desc" id="gw-video-modal-learn-desc"></p>' +
      "</div>" +
      '<div class="gw-video-cinema-actions">' +
      '<button type="button" class="gw-video-modal-ask-btn" id="gw-video-modal-ask-btn" hidden>Ask Cheryce about this</button>' +
      "</div>" +
      "</aside></div>" +
      '<div class="gw-video-modal-related" id="gw-video-modal-related" hidden>' +
      '<div class="gw-video-modal-related-head">' +
      '<span class="gw-video-modal-related-title" id="gw-video-modal-related-title"></span>' +
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
    impactEl = modalEl.querySelector("#gw-video-modal-impact");
    chipsEl = modalEl.querySelector("#gw-video-modal-chips");
    takeawaysEl = modalEl.querySelector("#gw-video-modal-takeaways");
    learnDescEl = modalEl.querySelector("#gw-video-modal-learn-desc");
    footEl = modalEl.querySelector("#gw-video-modal-foot");
    relatedEl = modalEl.querySelector("#gw-video-modal-related");
    relatedListEl = modalEl.querySelector("#gw-video-modal-related-list");
    relatedStoryEl = modalEl.querySelector("#gw-video-modal-related-story");
    watchPaneEl = modalEl.querySelector("#gw-video-modal-watch-pane");
    learnPaneEl = modalEl.querySelector("#gw-video-modal-learn-pane");

    modalEl.querySelector(".gw-video-modal-close").addEventListener("click", close);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("is-open")) close();
    });

    modalEl.querySelectorAll("[data-gw-video-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.getAttribute("data-gw-video-mode"));
      });
    });

    var askBtn = modalEl.querySelector("#gw-video-modal-ask-btn");
    if (askBtn) {
      askBtn.addEventListener("click", function () {
        if (!currentVideo || typeof config.onAsk !== "function") return;
        config.onAsk(currentVideo);
        close();
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
        ? "Streaming from the Greenways media library"
        : src === "catalog"
          ? "Greenways video catalog (MP4)"
          : src === "wix-youtube"
            ? "Greenways video channel (YouTube feed)"
            : "Greenways sustainable video library";
  }

  function renderChips(video) {
    if (!chipsEl) return;
    var chips = [];
    if (video && video.duration) chips.push({ label: video.duration, kind: "duration" });
    if (video && video.category) chips.push({ label: String(video.category), kind: "topic" });
    if (video && video.channelName) chips.push({ label: String(video.channelName), kind: "channel" });
    if (video && (video.videoUrl || video.videoId)) chips.push({ label: "Playable", kind: "ready" });
    chipsEl.innerHTML = chips
      .map(function (c) {
        return (
          '<span class="gw-video-chip gw-video-chip--' +
          escapeHtml(c.kind) +
          '">' +
          escapeHtml(c.label) +
          "</span>"
        );
      })
      .join("");
  }

  function renderBrief(video) {
    var title = String((video && video.title) || "Greenways video");
    var desc = String((video && video.description) || "");
    var eyebrow = modalEl.querySelector("#gw-video-modal-eyebrow");
    var audienceEl = modalEl.querySelector("#gw-video-modal-audience");

    if (eyebrow) eyebrow.textContent = config.deskLabel;
    titleEl.textContent = title;
    if (impactEl) impactEl.textContent = impactLine(video);
    if (audienceEl) audienceEl.textContent = audienceLine(video);
    descEl.textContent = desc;
    descEl.hidden = !desc;
    if (learnDescEl) {
      learnDescEl.textContent = desc || "No extended notes for this clip yet — ask Cheryce for a tailored brief.";
    }
    if (takeawaysEl) {
      takeawaysEl.innerHTML = buildTakeaways(video)
        .map(function (t) {
          return "<li>" + escapeHtml(t) + "</li>";
        })
        .join("");
    }
    renderChips(video);
  }

  function renderPlayer(video) {
    stopHls();
    stageEl.innerHTML = "";
    var title = String((video && video.title) || "Greenways video");
    var url = String((video && video.videoUrl) || "");
    var videoId = String((video && video.videoId) || "");
    var poster = String((video && (video.thumbnail || video.imageUrl)) || "");

    if (url) {
      var player = document.createElement("video");
      player.controls = true;
      player.playsInline = true;
      player.preload = "metadata";
      if (poster) player.poster = poster;
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
      iframe.src = "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?rel=0";
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
          "<p>This clip lives on the Greenways Wix Video channel. Pick a related video below or open the full library.</p>" +
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
      : '<span aria-hidden="true">▶</span>';
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
      thumbnail: row.thumbnail || "",
      impact: row.impact || row.whyPick || "",
      playable: row.playable !== false
    }));
    return (
      '<button type="button" class="gw-video-related-card" data-related-video="' + payload + '">' +
      '<div class="gw-video-related-thumb">' + thumb + badge + duration + "</div>" +
      '<div class="gw-video-related-body">' +
      '<span class="gw-video-related-name">' + escapeHtml(row.title) + "</span>" +
      '<span class="gw-video-related-why">' + escapeHtml(row.whyPick || row.impact || "Related pick") + "</span>" +
      "</div></button>"
    );
  }

  function renderRelated(related, storyLine) {
    if (!relatedEl || !relatedListEl) return;
    var titleNode = modalEl.querySelector("#gw-video-modal-related-title");
    if (titleNode) titleNode.textContent = config.relatedTitle;
    if (!Array.isArray(related) || !related.length) {
      relatedEl.hidden = true;
      relatedListEl.innerHTML = "";
      if (relatedStoryEl) relatedStoryEl.textContent = "";
      return;
    }
    relatedEl.hidden = false;
    if (relatedStoryEl) {
      relatedStoryEl.innerHTML = String(storyLine || "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    }
    relatedListEl.innerHTML = related.map(relatedCardHtml).join("");
  }

  function relatedCacheKey(video) {
    return [video.id || "", video.category || "", video.channelId || "", video.title || ""].join("|");
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

    var askBtn = modalEl.querySelector("#gw-video-modal-ask-btn");
    if (askBtn) askBtn.hidden = typeof config.onAsk !== "function";

    setMode("watch");
    renderBrief(video);
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
      thumbnail: video.thumbnail || video.imageUrl || "",
      impact: video.impact || "",
      takeaways: video.takeaways || [],
      audience: video.audience || video.forWho || ""
    }));
  }

  function openSite(payload) {
    var href = String((payload && payload.pageHref) || "https://www.greenwaysbuildings.com/greenways");
    window.open(href, "_blank", "noopener,noreferrer");
  }

  function bindContainer(container) {
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
    openSite: openSite,
    impactLine: impactLine
  };
})(window);
