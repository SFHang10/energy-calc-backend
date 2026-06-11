/**
 * Paste on the Wix agent page (HTML embed) — expands the Greenways agent iframe
 * to full viewport and restores it when the user taps "Back to page" in the chat.
 *
 * Optional: data-greenways-agent="deals" on the Embed-a-site iframe (via Velo/custom HTML).
 */
(function () {
  "use strict";

  var state = { iframe: null, saved: null };

  function findIframe(data) {
    if (state.iframe && state.iframe.isConnected) return state.iframe;
    var agent = data && data.agent;
    if (agent) {
      var byData = document.querySelector('iframe[data-greenways-agent="' + agent + '"]');
      if (byData) return byData;
    }
    var frames = document.querySelectorAll("iframe");
    for (var i = 0; i < frames.length; i++) {
      var src = frames[i].getAttribute("src") || frames[i].src || "";
      if (/greenways|deals-agent|grants-agent|finance-agent/i.test(src)) return frames[i];
    }
    return null;
  }

  function expandOuter(iframe, on) {
    if (!iframe) return;
    if (on) {
      if (!state.saved) {
        state.saved = {
          cssText: iframe.style.cssText || "",
          rectW: iframe.getBoundingClientRect().width,
          rectH: iframe.getBoundingClientRect().height
        };
      }
      iframe.style.cssText =
        "position:fixed!important;top:0!important;left:0!important;" +
        "width:100vw!important;height:100vh!important;max-width:none!important;" +
        "z-index:2147483646!important;border:none!important;margin:0!important;";
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      if (state.saved) {
        iframe.style.cssText = state.saved.cssText || "";
        if (!state.saved.cssText) {
          iframe.style.width = "100%";
          iframe.style.height = state.saved.rectH ? Math.round(state.saved.rectH) + "px" : "520px";
        }
      }
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }
  }

  window.addEventListener("message", function (e) {
    var d = e && e.data;
    if (!d) return;
    if (d.type !== "greenways-agent-expand" && d.type !== "greenways-wix-frame-expand") return;

    var iframe = null;
    try {
      if (e.source && e.source.frameElement && e.source.frameElement.tagName === "IFRAME") {
        iframe = e.source.frameElement;
      }
    } catch (_) {}

    if (!iframe) iframe = findIframe(d);
    if (!iframe) return;

    state.iframe = iframe;
    expandOuter(iframe, !!d.expanded);

    try {
      if (e.source && e.source.postMessage) {
        e.source.postMessage(
          {
            type: "greenways-agent-expand-ack",
            agent: d.agent || "",
            expanded: !!d.expanded
          },
          "*"
        );
      }
    } catch (_) {}
  });
})();
