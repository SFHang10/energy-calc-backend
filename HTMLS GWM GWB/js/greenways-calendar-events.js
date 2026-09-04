/**
 * Personal Greenways calendar events (Level B).
 * localStorage now; member API sync can mirror this shape later.
 */
(function (global) {
  var STORAGE_KEY = "gw_personal_calendar_events";
  var CALENDAR_PATH = "/greenways/calendar";

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function isoDate(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function parseIso(s) {
    var m = String(s || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }

  function normalizeEvent(raw) {
    if (!raw || typeof raw !== "object") return null;
    var date = String(raw.date || "").trim();
    if (!parseIso(date)) return null;
    var title = String(raw.title || "").trim();
    if (!title) return null;
    var id = String(raw.id || "").trim() || "personal-" + date + "-" + Date.now();
    return {
      id: id,
      date: date,
      title: title.slice(0, 160),
      type: raw.type === "grant" || raw.type === "ops" || raw.type === "plan" ? raw.type : "personal",
      source: String(raw.source || "You").slice(0, 80),
      summary: String(raw.summary || "").slice(0, 500),
      askAgent: raw.askAgent ? String(raw.askAgent) : "",
      askPrompt: raw.askPrompt ? String(raw.askPrompt) : "",
      personal: true,
      addedAt: raw.addedAt || new Date().toISOString()
    };
  }

  function readPersonalEvents() {
    try {
      var raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list.map(normalizeEvent).filter(Boolean);
    } catch (_) {
      return [];
    }
  }

  function writePersonalEvents(list) {
    try {
      if (!global.localStorage) return false;
      global.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify((list || []).map(normalizeEvent).filter(Boolean))
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  function upsertPersonalEvent(raw) {
    var ev = normalizeEvent(raw);
    if (!ev) return null;
    var list = readPersonalEvents();
    var idx = list.findIndex(function (x) {
      return x.id === ev.id;
    });
    if (idx >= 0) list[idx] = Object.assign({}, list[idx], ev);
    else list.push(ev);
    list.sort(function (a, b) {
      return String(a.date).localeCompare(String(b.date));
    });
    writePersonalEvents(list);
    return ev;
  }

  function removePersonalEvent(id) {
    var next = readPersonalEvents().filter(function (x) {
      return x.id !== id;
    });
    writePersonalEvents(next);
    return next;
  }

  function encodeAddParam(ev) {
    var n = normalizeEvent(ev);
    if (!n) return "";
    try {
      return encodeURIComponent(JSON.stringify(n));
    } catch (_) {
      return "";
    }
  }

  function decodeAddParam(value) {
    try {
      return normalizeEvent(JSON.parse(decodeURIComponent(String(value || ""))));
    } catch (_) {
      return null;
    }
  }

  function eventFromScheme(scheme) {
    if (!scheme) return null;
    var d = parseIso(scheme.deadline);
    if (!d) return null;
    var title = scheme.title || scheme.id || "Scheme deadline";
    return normalizeEvent({
      id: "scheme-" + (scheme.id || title).toString().replace(/\s+/g, "-").toLowerCase(),
      date: isoDate(d),
      title: title + " · deadline",
      type: "grant",
      source: "Andrieus · schemes",
      summary:
        String(scheme.description || "Scheme deadline from the Greenways grants catalogue.").slice(0, 400) +
        (scheme.region ? " Region: " + String(scheme.region).toUpperCase() + "." : ""),
      askAgent: "grants-agent",
      askPrompt: "Tell me about the " + title + " scheme and what to do before the deadline."
    });
  }

  /** Save to localStorage and open calendar focused on that day (new tab / top). */
  function addAndOpen(raw, options) {
    options = options || {};
    var ev = upsertPersonalEvent(raw);
    if (!ev) return null;
    try {
      if (global.parent && global.parent !== global) {
        global.parent.postMessage({ type: "gw-calendar-add", event: ev }, "*");
      }
    } catch (_) { /* ignore */ }
    var q =
      "?added=1&focus=" +
      encodeURIComponent(ev.id) +
      "&month=" +
      encodeURIComponent(String(ev.date).slice(0, 7));
    if (options.embed) q += "&embed=1";
    var href = CALENDAR_PATH + q;
    if (options.open !== false) {
      try {
        if (options.target === "_top" && global.top) global.top.location.href = href;
        else global.open(href, "_blank", "noopener,noreferrer");
      } catch (_) {
        global.location.href = href;
      }
    }
    return ev;
  }

  global.GreenwaysCalendarEvents = {
    STORAGE_KEY: STORAGE_KEY,
    CALENDAR_PATH: CALENDAR_PATH,
    isoDate: isoDate,
    parseIso: parseIso,
    normalizeEvent: normalizeEvent,
    readPersonalEvents: readPersonalEvents,
    writePersonalEvents: writePersonalEvents,
    upsertPersonalEvent: upsertPersonalEvent,
    removePersonalEvent: removePersonalEvent,
    encodeAddParam: encodeAddParam,
    decodeAddParam: decodeAddParam,
    eventFromScheme: eventFromScheme,
    addAndOpen: addAndOpen
  };
})(typeof window !== "undefined" ? window : globalThis);
