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
  var usageEl = null;
  var agentNoteEl = null;
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
  var activeReturnToJourney = false;
  var moduleRegistryById = {};

  var MODULE_ID_ALIASES = { "energy-ticker": "energy-prices-ticker" };

  /** Sync fallback when /data/greenways-content-modules.json has not loaded yet */
  var STATIC_HREF_NEEDLES = [
    ["low%20energy%20new", "low-energy-equipment"],
    ["energy-ticker-green-wire", "energy-ticker"],
    ["energy-ticker-colour-swap", "energy-ticker"],
    ["utility-detail", "utility-detail"],
    ["european_energy_deals_portal", "european-energy"],
    ["finance-finder-restaurant", "finance-finder"],
    ["full%20schemes%20portal%20restaurant", "schemes-portal-restaurant"],
    ["full%20schemes%20portal%20html", "schemes-portal-eu"],
    ["equipment-savings-projection", "savings-projection"],
    ["energy-savings-trajectory", "savings-trajectory"],
    ["energy-cost-guide%20(1)", "energy-cost-guide"],
    ["energy-cost-guide", "energy-cost-guide"],
    ["equipment_intelligence_tool", "etl-finder"],
    ["etl-official-site", "etl-official-site"],
    ["etl.energysecurity.gov.uk", "etl-official-site"],
    ["energy-calculator-enhanced", "etl-calculator"],
    ["energy-audit-widget", "energy-audit"],
    ["savings.html", "savings-tour"],
    ["deals-ticker-hub", "deals-ticker"],
    ["deals.html", "deals-full-page"],
    ["restaurant-equipment-deep-dive", "equipment-deep-dive"],
    ["sustainable%20renovations", "sustainable-renovations"],
    ["insulation%20.html", "insulation-guide"],
    ["importance%20of%20insulation", "insulation-guide"],
    ["renovation%20project%20plans", "renovation-plans"],
    ["retrofit-tabbed", "retrofit-roi-guide"],
    ["restauarant%20design", "restaurant-design-sustainability"],
    ["restuarant%20appliance%20comparison", "appliance-comparison"],
    ["marketplace%20variant", "appliance-comparison"],
    ["sensor-dashboard", "sensor-dashboard"],
    ["greenways%20interface", "greenways-dashboard"],
    ["utility-detail", "utility-detail"],
    ["importance%20of%20energy%20monitoring", "energy-monitoring"],
    ["january%20sustainable%20news", "sustainability-news-page"],
    ["sustainability-news", "sustainability-news-edition"],
    ["new-in-tech", "tech-news-edition"],
    ["content-ops/review/sustainability-news", "sustainability-news-edition"],
    ["content-ops/review/new-in-tech", "tech-news-edition"],
    ["sustainable%20references", "sustainable-references"],
    ["european%20company%20-%20case%20study", "sustainability-map"],
    ["discover%20energy%20savings", "discover-savings"],
    ["europes%20energy%20saving", "europe-savings"],
    ["sustaniability%20quick%20benefits", "sustainability-quick-benefits"],
    ["prices%20and%20deals", "prices-and-deals"],
    ["eco_project_planning_guide", "eco-project-planner"],
    ["members-section", "members-section"],
    ["declining_cost_renewable_energy", "declining-cost-renewables"],
    ["greenways%20data%20capture", "equipment-data-capture"],
    ["water-saving-finder", "water-saving-finder"],
    ["water-saving-guide", "water-saving-guide"],
    ["water-saving-guide%20(1)", "water-saving-guide"],
    ["sustainable_product_deal_finder_portal", "sustainable-product-finder"]
  ];

  var STATIC_MODULE_BY_ID = {
    "low-energy-equipment": {
      id: "low-energy-equipment",
      title: "Low energy equipment guide",
      description: "How efficient equipment lowers demand — stack savings on top of tariff deals.",
      usageHint: "Browse savings examples by appliance type, then compare tariffs or open deal spotlights.",
      href: "./Low%20Energy%20New%20.HTML",
      defaultOpenSize: "near-full"
    },
    "energy-ticker": {
      id: "energy-ticker",
      title: "Energy prices ticker",
      href: "../content-ops/drafts/energy-ticker/energy-ticker-green-wire.html",
      defaultOpenSize: "expanded"
    },
    "savings-trajectory": {
      id: "savings-trajectory",
      title: "Energy savings trajectory",
      href: "./energy-savings-trajectory.html",
      defaultOpenSize: "near-full"
    },
    "energy-cost-guide": {
      id: "energy-cost-guide",
      title: "Energy cost guide",
      href: "./energy-cost-guide%20(1).html",
      defaultOpenSize: "near-full"
    },
    "savings-projection": {
      id: "savings-projection",
      title: "Equipment savings projection",
      href: "./equipment-savings-projection.html",
      defaultOpenSize: "near-full"
    },
    "savings-tour": {
      id: "savings-tour",
      title: "Savings tour hub",
      href: "./savings.html",
      defaultOpenSize: "near-full"
    },
    "etl-calculator": {
      id: "etl-calculator",
      title: "Product Calculator",
      description: "Greenways product calculator — compare energy use of efficient products vs standard models.",
      usageHint: "Enter current equipment and usage, compare product options (including ETL-listed rows), then use savings figures in finance or grants conversations.",
      href: "/energy-calculator/energy-calculator-enhanced-2.html",
      defaultOpenSize: "near-full"
    },
    "etl-official-site": {
      id: "etl-official-site",
      title: "Energy Technology List (ETL) — official list",
      description: "UK government-backed Energy Technology List — browse the scheme in their own words.",
      usageHint: "Read how ETL verifies products, then open the official site for categories and product search.",
      href: "./etl-official-site.html",
      fullPageHref: "https://etl.energysecurity.gov.uk/",
      defaultOpenSize: "near-full"
    },
    "schemes-portal-restaurant": {
      id: "schemes-portal-restaurant",
      title: "Restaurant schemes portal",
      description: "Browse hospitality and restaurant grants and subsidies in one catalogue.",
      usageHint: "Filter by region or topic, open scheme rows for deadlines, then compare two schemes in chat.",
      href: "./Full%20Schemes%20Portal%20Restaurant.html",
      defaultOpenSize: "near-full"
    },
    "schemes-portal-eu": {
      id: "schemes-portal-eu",
      title: "EU schemes portal",
      description: "EU-wide programmes and cross-border funding in one browse view.",
      usageHint: "Scan EU-wide rows, then pair with the restaurant portal or finance finder when you need stacked funding paths.",
      href: "./Full%20Schemes%20Portal%20html.html",
      defaultOpenSize: "near-full"
    },
    "equipment-deep-dive": {
      id: "equipment-deep-dive",
      title: "Restaurant equipment deep dive",
      description: "Side-by-side alternatives with grants and savings projection entry points.",
      usageHint: "Pick an asset class, compare standard vs efficient options, then open savings projection from an alternative card.",
      href: "./restaurant-equipment-deep-dive.html",
      defaultOpenSize: "near-full"
    },
    "sustainable-renovations": {
      id: "sustainable-renovations",
      title: "Sustainable renovations",
      description: "Building retrofit pathways paired with efficient equipment.",
      usageHint: "Follow renovation sections for your building type, then open deep dive or grants chat before you commit capex.",
      href: "./Sustainable%20Renovations%20New%20.html",
      defaultOpenSize: "near-full"
    },
    "retrofit-roi-guide": {
      id: "retrofit-roi-guide",
      title: "Retrofit ROI guide",
      description: "ETL retrofit measures with payback, savings, and carbon context.",
      usageHint: "Compare the five retrofit tabs, then open deep dive or grants chat.",
      href: "../HTMLs/Retrofit-Tabbed.html",
      defaultOpenSize: "near-full"
    },
    "restaurant-design-sustainability": {
      id: "restaurant-design-sustainability",
      title: "Restaurant design & sustainability",
      description: "Kitchen layout and ventilation design for energy and workflow savings.",
      usageHint: "Review zone layout cards, then pair with equipment deep dive.",
      href: "../HTMLs/Restauarant%20Design%20.html",
      defaultOpenSize: "near-full"
    },
    "insulation-guide": {
      id: "insulation-guide",
      title: "Insulation guide",
      description: "Why fabric improvements come before heavy equipment or HVAC overspend.",
      usageHint: "Read insulation sections for your premises, then model payback in savings projection.",
      href: "./Insulation%20.html",
      defaultOpenSize: "near-full"
    },
    "sensor-dashboard": {
      id: "sensor-dashboard",
      title: "Sensor intelligence dashboard",
      description: "Demo power, gas, water, and equipment signals for a multi-site restaurant portfolio.",
      usageHint: "Scan live-style lanes per site, then open utility detail or the buildings dashboard for KPI context.",
      href: "./sensor-dashboard.html",
      defaultOpenSize: "near-full"
    },
    "greenways-dashboard": {
      id: "greenways-dashboard",
      title: "Greenways buildings dashboard",
      description: "Portfolio electricity, gas, and water KPIs with site overview and drill-down entry points.",
      usageHint: "Review KPI tiles and trends, open utility detail per type, then pair with sensor dashboard or equipment deep dive.",
      href: "./Greenways%20Interface%20.html",
      defaultOpenSize: "near-full"
    },
    "sustainability-news-page": {
      id: "sustainability-news-page",
      title: "Sustainability news",
      description: "Monthly sustainability news editions on Greenways.",
      usageHint: "Browse the latest edition headlines, then ask Cheryce how a story affects your bills or upgrade timing.",
      href: "../content-ops/review/sustainability-news/2026-04-sustainability-news.html",
      defaultOpenSize: "near-full"
    },
    "sustainability-news-edition": {
      id: "sustainability-news-edition",
      title: "Sustainability news edition",
      description: "Latest monthly newsletter — how-this-helps framing for your sector.",
      usageHint: "Browse stories by theme, read the impact line on each item, and follow links when a headline matches your upgrade plans.",
      href: "../content-ops/review/sustainability-news/2026-04-sustainability-news.html",
      defaultOpenSize: "near-full"
    },
    "tech-news-edition": {
      id: "tech-news-edition",
      title: "New in Tech edition",
      description: "Latest green-tech monthly newsletter.",
      usageHint: "Scan innovation headlines, then ask how equipment or monitoring upgrades fit your site.",
      href: "../content-ops/review/new-in-tech/2026-04-new-in-tech.html",
      defaultOpenSize: "near-full"
    },
    "sustainable-references": {
      id: "sustainable-references",
      title: "Sustainable references",
      href: "./Sustainable%20References%20.HTML",
      defaultOpenSize: "near-full"
    },
    "deals-full-page": {
      id: "deals-full-page",
      title: "Full Deals page",
      description: "Greenways Buildings deals shell — ticker hub plus sidebar portals.",
      usageHint: "Start with the three marquee lanes or search, then open sidebar links for tariff compare or the water finder.",
      href: "./Deals.html",
      defaultOpenSize: "near-full"
    },
    "european-energy": {
      id: "european-energy",
      title: "European energy deals",
      description: "Compare business and site tariffs across European markets in one portal.",
      usageHint: "Set your market or building type, compare headline rates, then open a deal lane that matches your contract renewal timing.",
      href: "./european_energy_deals_portal.html",
      defaultOpenSize: "near-full"
    },
    "deals-ticker": {
      id: "deals-ticker",
      title: "Deals ticker hub",
      description: "Marquee lanes for energy, water, and sustainability deals plus manual search.",
      usageHint: "Watch the scrolling lanes for timely offers, filter by category pill, or search when you know the product or supplier name.",
      href: "./deals-ticker-hub.html",
      defaultOpenSize: "near-full"
    },
    "water-saving-finder": {
      id: "water-saving-finder",
      title: "Water Saving Finder",
      description: "Full water-lane search, tips, and interactive product compare.",
      usageHint: "Pick a water-saving category or tip, compare product rows, and open details when a match fits your site.",
      href: "./water-saving-finder.html",
      defaultOpenSize: "near-full"
    },
    "water-saving-guide": {
      id: "water-saving-guide",
      title: "Water Saving Guide",
      description: "Why water efficiency matters — fixtures, leaks, dishwashers, and restaurant quick wins.",
      usageHint: "Browse guide sections for your site type, note priorities, then open Water Saving Finder to compare products.",
      href: "./Water-Saving-Guide%20(1).html",
      defaultOpenSize: "near-full"
    },
    "declining-cost-renewables": {
      id: "declining-cost-renewables",
      title: "Declining cost of renewable energy",
      description: "IRENA-style LCOE chart 2014–2026 — solar, wind, and why green supply keeps getting cheaper.",
      usageHint: "Review cost curves, then model solar or green-tariff payback in savings projection or finance finder.",
      href: "./declining_cost_renewable_energy.html",
      defaultOpenSize: "near-full"
    },
    "equipment-data-capture": {
      id: "equipment-data-capture",
      title: "Equipment data intelligence guide",
      description: "Live monitoring signals by equipment type — bills, breakdown prevention, upgrade timing.",
      usageHint: "Review monitoring sections for your equipment, then open deep dive or Edwardo for sensors.",
      href: "../HTMLs/Greenways%20Data%20Capture.Html",
      defaultOpenSize: "near-full"
    }
  };

  var registryLoadPromise = null;

  var SLUG_TO_THEME = {
    "finance-agent": "finance",
    "media-agent": "media",
    "grants-agent": "grants",
    "equipment-agent": "equipment",
    "deals-agent": "deals",
    "sustainable-products-agent": "products",
    "systems-agent": "systems"
  };

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
    loadModuleRegistry().then(function () {
      setTimeout(consumeOpenModuleFromQuery, 350);
    });
    return pageContext;
  }

  function consumeOpenModuleFromQuery() {
    try {
      var params = new URLSearchParams(global.location.search);
      var moduleId = String(params.get("openModule") || "").trim();
      if (!moduleId) return;
      var fromJourney = params.get("fromJourney") === "1";
      var overrides = {};
      if (fromJourney) {
        overrides.returnLabel = "\u2190 Back to journey summary";
        overrides.returnToJourney = true;
      }
      if (
        moduleId === "sustainability-map" &&
        typeof global.openSustainabilityMapModule === "function" &&
        !fromJourney
      ) {
        global.openSustainabilityMapModule();
      } else {
        openById(moduleId, overrides);
      }
      params.delete("openModule");
      params.delete("fromJourney");
      var q = params.toString();
      var cleanUrl = global.location.pathname + (q ? "?" + q : "");
      global.history.replaceState({}, "", cleanUrl);
    } catch (_) {}
  }

  function applyRegistryData(data) {
    if (!data || !Array.isArray(data.modules)) return;
    data.modules.forEach(function (m) {
      if (m && m.id) moduleRegistryById[m.id] = m;
    });
    Object.keys(MODULE_ID_ALIASES).forEach(function (alias) {
      var canonical = MODULE_ID_ALIASES[alias];
      if (moduleRegistryById[canonical]) moduleRegistryById[alias] = moduleRegistryById[canonical];
    });
  }

  function loadModuleRegistry() {
    if (registryLoadPromise) return registryLoadPromise;
    if (moduleRegistryById.__loaded) {
      registryLoadPromise = Promise.resolve();
      return registryLoadPromise;
    }
    moduleRegistryById.__loaded = true;
    var url = "/data/greenways-content-modules.json";
    registryLoadPromise = fetch(url)
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        applyRegistryData(data);
      })
      .catch(function () {});
    return registryLoadPromise;
  }

  function contentBase() {
    var h = (global.location && global.location.hostname) || "";
    if (h === "localhost" || h === "127.0.0.1" || h.indexOf("energy-calc-backend") !== -1) {
      return (global.location && global.location.origin) || "";
    }
    return "https://energy-calc-backend.onrender.com";
  }

  function resolveModuleId(moduleId) {
    var id = String(moduleId || "").trim();
    return MODULE_ID_ALIASES[id] || id;
  }

  function resolveModuleWebHref(href) {
    var rel = String(href || "").trim();
    if (!rel || /^https?:\/\//i.test(rel)) return rel;
    var qIndex = rel.indexOf("?");
    var pathPart = qIndex >= 0 ? rel.slice(0, qIndex) : rel;
    var query = qIndex >= 0 ? rel.slice(qIndex) : "";
    if (pathPart.charAt(0) === "/") return contentBase() + rel;
    if (pathPart.indexOf("./") === 0) {
      return contentBase() + "/HTMLS%20GWM%20GWB/" + pathPart.slice(2) + query;
    }
    if (pathPart.indexOf("../content-ops/") === 0) {
      return contentBase() + "/content-ops/" + pathPart.slice("../content-ops/".length) + query;
    }
    if (pathPart.indexOf("../HTMLs/") === 0) {
      return contentBase() + "/HTMLs/" + pathPart.slice("../HTMLs/".length) + query;
    }
    if (/^[^/]+\.html?$/i.test(pathPart)) {
      return contentBase() + "/HTMLS%20GWM%20GWB/" + pathPart + query;
    }
    return rel;
  }

  function stripEmbedParams(href) {
    var rel = String(href || "").trim();
    if (!rel || rel.indexOf("?") === -1) return resolveModuleWebHref(rel);
    var parts = rel.split("?");
    var params = new URLSearchParams(parts[1]);
    params.delete("embed");
    params.delete("popup");
    params.delete("return");
    var q = params.toString();
    return resolveModuleWebHref(q ? parts[0] + "?" + q : parts[0]);
  }

  function agentReturnUrl() {
    if (!global.location) return contentBase();
    var path = String(global.location.pathname || "");
    if (path.indexOf("/greenways/") === 0) {
      return global.location.origin + path.split("?")[0];
    }
    if (pageContext.agentSlug) {
      return contentBase() + "/greenways/" + pageContext.agentSlug;
    }
    return global.location.origin + path.split("?")[0];
  }

  function appendEmbedParams(href, item) {
    var url = resolveModuleWebHref(String(href || "").trim());
    if (!url) return url;
    var qIndex = url.indexOf("?");
    var pathPart = qIndex >= 0 ? url.slice(0, qIndex) : url;
    var params = new URLSearchParams(qIndex >= 0 ? url.slice(qIndex + 1) : "");
    if (!params.has("embed")) params.set("embed", "1");
    if (!params.has("popup")) params.set("popup", "1");
    if (!params.has("return")) params.set("return", agentReturnUrl());
    var q = params.toString();
    return q ? pathPart + "?" + q : pathPart;
  }

  function prepareModuleItem(item) {
    if (!item || typeof item !== "object") return item;
    item = enrichFromRegistry(Object.assign({}, item));
    var ctx = resolveContext(item);
    item.agentName = ctx.agentName;
    item.theme = ctx.theme;
    applyFinanceEnergyTickerHref(item);
    if (item.href) {
      item.href = appendEmbedParams(item.href, item);
      if (!item.fullPageHref) item.fullPageHref = stripEmbedParams(item.href);
    } else if (item.fullPageHref) {
      item.fullPageHref = stripEmbedParams(item.fullPageHref);
    }
    return item;
  }

  function staticModuleForId(moduleId) {
    var id = resolveModuleId(String(moduleId || "").trim());
    return STATIC_MODULE_BY_ID[id] || null;
  }

  function findStaticModuleIdForHref(href) {
    var keys = [hrefPathKey(href), hrefPathKey(resolveModuleWebHref(href))];
    for (var i = 0; i < STATIC_HREF_NEEDLES.length; i++) {
      var needle = STATIC_HREF_NEEDLES[i][0];
      var moduleId = STATIC_HREF_NEEDLES[i][1];
      for (var k = 0; k < keys.length; k++) {
        var keyPath = keys[k].split("?")[0];
        if (keys[k].indexOf(needle) >= 0 || keyPath.indexOf(needle) >= 0) {
          return resolveModuleId(moduleId);
        }
      }
    }
    return "";
  }

  function buildItemFromModuleId(moduleId, overrides) {
    overrides = overrides || {};
    var id = resolveModuleId(moduleId);
    var reg = moduleRegistryById[id] || staticModuleForId(id);
    var href = overrides.href || (reg && reg.href) || "";
    if (!href && !reg) return null;
    if (overrides.query) {
      var q = String(overrides.query).replace(/^\?/, "");
      if (q) href += (href.indexOf("?") >= 0 ? "&" : "?") + q;
    }
    return prepareModuleItem({
      moduleId: String(moduleId || id || "portal"),
      title: overrides.title || (reg && reg.title) || "Greenways tool",
      description: overrides.description || (reg && reg.description) || "",
      usageHint: overrides.usageHint || (reg && reg.usageHint) || "",
      href: href,
      fullPageHref: overrides.fullPageHref || (reg && reg.fullPageHref) || "",
      openSize: overrides.openSize || (reg && reg.defaultOpenSize) || "",
      kind: (reg && reg.kind) || "html",
      returnLabel: overrides.returnLabel,
      returnToJourney: !!overrides.returnToJourney
    });
  }

  function openFromTrigger(el) {
    if (!el) return false;
    var raw = el.getAttribute("data-module-payload");
    if (raw) {
      var item = parsePayload(raw);
      if (item) {
        open(prepareModuleItem(item));
        return true;
      }
    }
    var moduleId = el.getAttribute("data-module-open");
    if (moduleId) {
      openById(moduleId, {
        query: el.getAttribute("data-module-query") || "",
        href: el.getAttribute("data-module-href") || ""
      });
      return true;
    }
    return false;
  }

  function openById(moduleId, overrides) {
    var item = buildItemFromModuleId(moduleId, overrides);
    if (item && item.href) {
      open(item);
      return true;
    }
    loadModuleRegistry().then(function () {
      var retry = buildItemFromModuleId(moduleId, overrides);
      if (retry && retry.href) {
        open(retry);
        return;
      }
      if (global.alert) global.alert("Module shell is still loading — try again in a moment.");
    });
    return true;
  }

  function buildModuleItemFromLink(href, overrides) {
    overrides = overrides || {};
    var moduleId = overrides.moduleId || findModuleIdForHref(href);
    if (!moduleId) return null;
    return buildItemFromModuleId(moduleId, Object.assign({}, overrides, { href: href }));
  }

  function interceptPortalModuleNav(e) {
    if (e.target.closest(".module-tablet-full")) return;
    if (e.target.closest(".helper-list .helper-card")) return;
    if (e.target.closest("#top-product-samples .product-sample-card[data-banner-open]")) return;

    var trigger = e.target.closest(
      ".module-tablet-open, [data-module-payload], [data-module-open], .product-module-trigger"
    );
    if (trigger) {
      e.preventDefault();
      e.stopPropagation();
      openFromTrigger(trigger);
      return;
    }

    var mapOpen = e.target.closest("[data-map-open]");
    if (mapOpen && typeof global.openSustainabilityMapModule === "function") {
      e.preventDefault();
      e.stopPropagation();
      if (!openFromTrigger(mapOpen)) global.openSustainabilityMapModule();
      return;
    }

    var linkOpen = e.target.closest(".link-tablet-open");
    if (linkOpen) {
      var linkHref = String(linkOpen.getAttribute("href") || linkOpen.href || "").trim();
      if (!linkHref || linkHref.indexOf("/greenways/") >= 0 || /^https?:\/\//i.test(linkHref)) return;
      var linkModuleId = findModuleIdForHref(linkHref);
      if (linkModuleId) {
        e.preventDefault();
        e.stopPropagation();
        openById(linkModuleId, { href: linkHref });
      }
    }
  }

  function hrefPathKey(href) {
    var raw = String(href || "").trim();
    if (!raw) return "";
    try {
      if (raw.indexOf("://") >= 0) {
        var u = new URL(raw);
        return (u.pathname + u.search).toLowerCase();
      }
    } catch (_) {}
    return raw.toLowerCase();
  }

  function findModuleIdForHref(href) {
    var key = hrefPathKey(href);
    if (!key) return "";
    var staticId = findStaticModuleIdForHref(href);
    if (staticId) return staticId;
    var found = "";
    Object.keys(moduleRegistryById).forEach(function (id) {
      if (id === "__loaded" || found) return;
      var reg = moduleRegistryById[id];
      if (!reg || !reg.href) return;
      var regKey = hrefPathKey(resolveModuleWebHref(reg.href));
      var regPath = regKey.split("?")[0];
      var keyPath = key.split("?")[0];
      var resolvedKey = hrefPathKey(resolveModuleWebHref(href)).split("?")[0];
      if (
        key === regKey ||
        keyPath === regPath ||
        keyPath.indexOf(regPath) >= 0 ||
        resolvedKey === regPath ||
        resolvedKey.indexOf(regPath) >= 0
      ) {
        found = id;
      }
    });
    if (found === "energy-prices-ticker") return "energy-ticker";
    return found;
  }

  var documentInterceptBound = false;

  function bindDocumentIntercept() {
    if (documentInterceptBound) return;
    documentInterceptBound = true;
    global.document.addEventListener("click", interceptPortalModuleNav, true);
  }

  function agentThemeKey(item) {
    item = item || {};
    var theme = String(item.theme || pageContext.theme || "")
      .replace(/[^a-z0-9_-]/gi, "")
      .toLowerCase();
    if (theme && theme !== "default") return theme;
    var slug = String(item.agentSlug || pageContext.agentSlug || "");
    return SLUG_TO_THEME[slug] || theme || "default";
  }

  var FINANCE_ENERGY_TICKER_HREF =
    "../content-ops/drafts/energy-ticker/energy-ticker-colour-swap.html";

  function isFinanceAgentContext(item) {
    item = item || {};
    var slug = String(item.agentSlug || pageContext.agentSlug || "").toLowerCase();
    if (slug === "finance-agent") return true;
    return agentThemeKey(item) === "finance";
  }

  function isEnergyTickerModule(item) {
    var id = resolveModuleId(String((item && item.moduleId) || ""));
    return id === "energy-prices-ticker";
  }

  function applyFinanceEnergyTickerHref(item) {
    if (!item || !isFinanceAgentContext(item) || !isEnergyTickerModule(item)) return item;
    item.href = FINANCE_ENERGY_TICKER_HREF;
    return item;
  }

  function resolveAgentNote(item) {
    if (!item) return null;
    if (item.agentNote && typeof item.agentNote === "object") return item.agentNote;
    if (item.agentNote && typeof item.agentNote === "string") {
      return { label: "From " + String(item.agentName || pageContext.agentName || "Agent"), body: item.agentNote };
    }
    if (!isEnergyTickerModule(item)) return null;
    var reg = moduleRegistryById["energy-ticker"] || moduleRegistryById["energy-prices-ticker"];
    var notes = reg && reg.agentNotes;
    if (!notes || typeof notes !== "object") return null;
    var key = agentThemeKey(item);
    return notes[key] || notes.default || null;
  }

  function escapeNoteHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function ensureAgentNoteEl() {
    if (agentNoteEl) return agentNoteEl;
    if (!panelEl) return null;
    agentNoteEl = modalEl && modalEl.querySelector("#gw-content-module-agent-note");
    if (!agentNoteEl && stageEl) {
      agentNoteEl = document.createElement("div");
      agentNoteEl.id = "gw-content-module-agent-note";
      agentNoteEl.className = "gw-content-module-agent-note";
      agentNoteEl.hidden = true;
      stageEl.insertAdjacentElement("afterend", agentNoteEl);
      agentNoteEl.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-agent-note-module]");
        if (!btn) return;
        e.preventDefault();
        e.stopPropagation();
        openById(btn.getAttribute("data-agent-note-module"));
      });
    }
    return agentNoteEl;
  }

  function renderAgentNote(item) {
    ensureAgentNoteEl();
    if (!agentNoteEl || !modalEl) return;
    var note = resolveAgentNote(item || {});
    if (!note || !note.body) {
      agentNoteEl.hidden = true;
      agentNoteEl.innerHTML = "";
      modalEl.classList.remove("has-agent-note");
      modalEl.classList.remove("is-ticker-module");
      return;
    }
    modalEl.classList.add("has-agent-note");
    modalEl.classList.toggle("is-ticker-module", isEnergyTickerModule(item));
    agentNoteEl.hidden = false;
    var label = note.label || "From " + String((item && item.agentName) || pageContext.agentName || "Agent");
    var ctaHtml = "";
    if (note.ctaModuleId && note.ctaLabel) {
      ctaHtml =
        '<div class="gw-agent-note-actions">' +
        '<button type="button" class="gw-agent-note-cta" data-agent-note-module="' +
        escapeNoteHtml(note.ctaModuleId) +
        '">' +
        escapeNoteHtml(note.ctaLabel) +
        "</button></div>";
    }
    agentNoteEl.innerHTML =
      '<p class="gw-agent-note-label">' +
      escapeNoteHtml(label) +
      "</p>" +
      '<p class="gw-agent-note-body">' +
      escapeNoteHtml(note.body) +
      "</p>" +
      ctaHtml;
  }

  function enrichFromRegistry(item) {
    if (!item) return item;
    var id = String(item.moduleId || "");
    var reg = moduleRegistryById[id] || staticModuleForId(id);
    if (!reg) return item;
    return Object.assign({}, item, {
      description: item.description || reg.description || "",
      usageHint: item.usageHint || reg.usageHint || "",
      fullPageHref: item.fullPageHref || reg.fullPageHref || ""
    });
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

  function applyMapIframeHeight(height) {
    if (!activeIframe || !stageEl) return;
    var max = Math.round(window.innerHeight * 0.82);
    var h = Math.max(560, Math.min(Number(height) || 0, max));
    if (!h || !isFinite(h)) h = 640;
    activeIframe.style.position = "relative";
    activeIframe.style.inset = "auto";
    activeIframe.style.display = "block";
    activeIframe.style.width = "100%";
    activeIframe.style.height = h + "px";
    activeIframe.style.minHeight = "560px";
  }

  function applyMapModuleChrome(item) {
    if (!modalEl) return;
    var isMap = item && String(item.moduleId || "") === "sustainability-map";
    modalEl.classList.toggle("is-map-module", isMap);
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
      returnHintEl.hidden = true;
      returnHintEl.textContent = "";
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
      '<p class="gw-content-module-usage" id="gw-content-module-usage"></p>' +
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
      '<div class="gw-content-module-agent-note" id="gw-content-module-agent-note" hidden></div>' +
      '<div class="gw-content-module-foot" id="gw-content-module-foot"></div>' +
      "</div>";
    document.body.appendChild(modalEl);

    panelEl = modalEl.querySelector("[data-gw-module-panel]");
    stageEl = modalEl.querySelector("#gw-content-module-stage");
    titleEl = modalEl.querySelector("#gw-content-module-title");
    descEl = modalEl.querySelector("#gw-content-module-desc");
    usageEl = modalEl.querySelector("#gw-content-module-usage");
    agentNoteEl = modalEl.querySelector("#gw-content-module-agent-note");
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
      if (moduleId === "sustainability-map" && data.height) applyMapIframeHeight(data.height);
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
    item = prepareModuleItem(item);
    activeReturnToJourney = !!item.returnToJourney;
    var kind = String(item.kind || "").toLowerCase();
    if (kind === "video" || item.videoUrl || item.videoId || (item.video && (item.video.videoUrl || item.video.videoId))) {
      openVideoModule(item);
      return;
    }

    ensureModal();
    clearStage();
    applyTheme(item);

    item = enrichFromRegistry(item);
    var ctx = resolveContext(item);
    var title = String(item.title || "Greenways illustration");
    var desc = String(item.description || item.subtitle || "");
    var usage = String(item.usageHint || "");
    var href = String(item.href || "");

    titleEl.textContent = title;
    descEl.textContent = desc;
    descEl.hidden = !desc;
    if (usageEl) {
      usageEl.textContent = usage ? "How to use: " + usage : "";
      usageEl.hidden = !usage;
    }
    if (fullLinkEl) {
      fullLinkEl.href = item.fullPageHref || href || "#";
      fullLinkEl.hidden = !(item.fullPageHref || href);
    }
    if (footEl) {
      footEl.hidden = true;
      footEl.textContent = "";
    }
    renderAgentNote(item);

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
      var iframeSrc = href;
      if (!/^https?:\/\//i.test(iframeSrc)) {
        iframeSrc = iframeSrc.charAt(0) === "/" ? contentBase() + iframeSrc : resolveModuleWebHref(iframeSrc);
      }
      activeIframe.src = iframeSrc;
    }

    modalEl.classList.add("is-open");
    setBodyLock(true);
    applyMapModuleChrome(item);
    applyOpenSize(item);
    if (String(item.moduleId || "") === "sustainability-map") applyMapIframeHeight(680);
  }

  function close() {
    if (!modalEl) return;
    var reopenJourney = activeReturnToJourney;
    renderAgentNote(null);
    clearStage();
    modalEl.classList.remove("is-open");
    modalEl.classList.remove("is-near-full");
    modalEl.classList.remove("is-map-module");
    setExpanded(false);
    setBodyLock(false);
    activeReturnToJourney = false;
    if (
      reopenJourney &&
      global.GreenwaysAgentTeam &&
      typeof global.GreenwaysAgentTeam.openJourneySummary === "function"
    ) {
      setTimeout(function () {
        global.GreenwaysAgentTeam.openJourneySummary();
      }, 0);
    }
  }

  function hrefForModuleId(moduleId, overrides) {
    var item = buildItemFromModuleId(moduleId, overrides || {});
    if (!item) return "";
    return item.fullPageHref || stripEmbedParams(item.href || "");
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
      var trigger = e.target.closest("[data-module-payload], [data-module-open]");
      if (!trigger) return;
      e.preventDefault();
      e.stopPropagation();
      openFromTrigger(trigger);
    });
  }

  global.GreenwaysAgentContentModule = {
    init: init,
    open: open,
    openById: openById,
    openFromTrigger: openFromTrigger,
    prepareModuleItem: prepareModuleItem,
    close: close,
    toggleExpanded: toggleExpanded,
    setExpanded: setExpanded,
    encodePayload: encodePayload,
    parsePayload: parsePayload,
    bindContainer: bindContainer,
    bindDocumentIntercept: bindDocumentIntercept,
    ensureModal: ensureModal,
    consumeOpenModuleFromQuery: consumeOpenModuleFromQuery,
    findModuleIdForHref: findModuleIdForHref,
    buildModuleItemFromLink: buildModuleItemFromLink,
    hrefForModuleId: hrefForModuleId,
    resolveModuleWebHref: resolveModuleWebHref,
    stripEmbedParams: stripEmbedParams,
    getContext: function () {
      return Object.assign({}, pageContext);
    }
  };
})(window);
