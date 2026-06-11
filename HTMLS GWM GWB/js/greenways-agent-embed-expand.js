(function (global) {
  "use strict";

  function isEmbedMode() {
    return (
      document.documentElement.classList.contains("embed-wix") ||
      new URLSearchParams(location.search).get("embed") === "1"
    );
  }

  function init(opts) {
    opts = opts || {};
    var agent = opts.agent || "agent";
    if (!isEmbedMode()) return;

    var expanded = new URLSearchParams(location.search).get("expanded") === "1";
    var btn = document.getElementById("embed-expand-btn");

    function setExpanded(on, fromParent) {
      expanded = !!on;
      document.documentElement.classList.toggle("embed-expanded", expanded);
      if (btn) {
        btn.textContent = expanded ? "← Back to page" : "⛶ Full chat";
        btn.setAttribute(
          "aria-label",
          expanded ? "Return to compact view on the character page" : "Expand chat to full view"
        );
      }
      if (!fromParent) {
        try {
          window.parent.postMessage(
            {
              type: "greenways-agent-expand",
              agent: agent,
              expanded: expanded
            },
            "*"
          );
        } catch (_) {}
      }
    }

    if (expanded) setExpanded(true, true);

    if (btn) {
      btn.hidden = false;
      btn.addEventListener("click", function () {
        setExpanded(!expanded, false);
      });
    }

    window.addEventListener("message", function (e) {
      var d = e && e.data;
      if (!d || d.type !== "greenways-agent-expand-ack") return;
      if (d.agent && d.agent !== agent) return;
      setExpanded(!!d.expanded, true);
    });

    global.GreenwaysAgentEmbedExpand = global.GreenwaysAgentEmbedExpand || {};
    global.GreenwaysAgentEmbedExpand.setExpanded = function (on) {
      setExpanded(!!on, false);
    };
  }

  global.GreenwaysAgentEmbedExpand = global.GreenwaysAgentEmbedExpand || {};
  global.GreenwaysAgentEmbedExpand.init = init;
})(window);
