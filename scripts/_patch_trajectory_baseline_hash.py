from pathlib import Path

p = Path(__file__).resolve().parents[1] / "HTMLS GWM GWB" / "energy-savings-trajectory.html"
text = p.read_text(encoding="utf-8")
needle = "      renderAll();\n    })();"
snippet = """      function openBaselineSectionFromHash() {
        const hash = (location.hash || "").replace(/^#/, "");
        if (hash !== "trajectoryBaselineDetails") return;
        const details = document.getElementById("trajectoryBaselineDetails");
        if (!details) return;
        details.open = true;
        requestAnimationFrame(() => {
          details.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      openBaselineSectionFromHash();
      renderAll();
    })();"""
if "openBaselineSectionFromHash" in text:
    print("hash handler already present")
elif needle not in text:
    raise SystemExit("needle not found")
else:
    p.write_text(text.replace(needle, snippet, 1), encoding="utf-8")
    print("added baseline hash opener")
