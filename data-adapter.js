// =====================================================================
// THE DAILY SIGNAL — Data adapter
// Reads the real ai-news repo schema and exposes:
//   - loadDigest()  →  { manifest, snapshots, runs, control }
//   - cycle()       →  selects which snapshots to display per spec §4
// =====================================================================
window.DataAdapter = (function () {

  // Decorative palettes assigned by tier so cards stay editorial-looking
  // even though source images are mostly null.
  const TIER_PALETTE = {
    1: ["persimmon", "ink", "ochre"],
    2: ["teal", "ochre", "olive"],
    3: ["paper", "olive", "teal"]
  };

  // Editorial illustrations to fall back on when hero_image is null.
  const FALLBACK_IMAGES = [
    "assets/01-frontier.svg",
    "assets/02-benchmark.svg",
    "assets/03-policy.svg",
    "assets/04-hardware.svg",
    "assets/05-labor.svg",
    "assets/06-signal.svg",
    "assets/07-biology.svg",
    "assets/08-opensource.svg"
  ];

  function hashIndex(str, mod) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return Math.abs(h) % mod;
  }

  // Decorate raw items with display-only fields (palette, illustration)
  function decorate(item, ordinal) {
    const palettes = TIER_PALETTE[item.tier] || TIER_PALETTE[2];
    const palette = palettes[hashIndex(item.id, palettes.length)];
    const illustration = FALLBACK_IMAGES[hashIndex(item.id, FALLBACK_IMAGES.length)];
    return {
      ...item,
      _palette: palette,
      _illustration: illustration,
      _ordinal: ordinal,
      _tierLabel: { 1: "Frontier", 2: "Tools & Libraries", 3: "Products & Industry" }[item.tier] || "Dispatch"
    };
  }

  async function loadJSON(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error("Could not load " + path);
    return r.json();
  }

  async function loadDigest() {
    const manifest = await loadJSON("data/index.json");
    const runs = await loadJSON("data/runs.json").catch(() => ({ runs: [] }));
    const control = await loadJSON("agent/control.json").catch(() => null);

    // Load every snapshot listed in the manifest (small repo for now).
    const snapshots = {};
    await Promise.all(manifest.snapshots.map(async (s) => {
      try {
        const file = await loadJSON(s.file);
        file.items = file.items.map((it, i) => decorate(it, i));
        snapshots[s.id] = file;
      } catch (e) {
        console.warn("snapshot load failed", s.id, e);
      }
    }));

    return { manifest, snapshots, runs, control };
  }

  // Cycle: pick top + bottom snapshots based on EST hour. (§4 of spec)
  // For a fresh repo with only one snapshot, gracefully fall back.
  // Pass ?now=YYYY-MM-DDTHH:MM in the URL to override for testing.
  function cycle(manifest, snapshots, nowOverride) {
    const searchNow = new URLSearchParams(window.location.search).get("now");
    const now = nowOverride ? new Date(nowOverride)
      : searchNow ? new Date(searchNow)
      : new Date();
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York", hour: "numeric", hour12: false
    });
    const hour = parseInt(fmt.format(now), 10);

    const byType = (type) => manifest.snapshots.filter(s => s.type === type);
    const newestPm = byType("pm")[0];
    const newestAm = byType("am")[0];

    let top = null, bottom = null, topLabel = "", bottomLabel = "", banner = null;

    if (hour >= 13 || hour < 2) {
      top = newestPm; topLabel = "Today, Afternoon Edition";
      bottom = newestPm
        ? byType("am").find(s => s.calendar_date === newestPm.calendar_date)
        : null;
      bottomLabel = "Today, Morning Edition";
    } else if (hour >= 2 && hour < 7) {
      top = null;
      bottom = newestPm; bottomLabel = "Yesterday, Afternoon Edition";
      banner = "Today's morning refresh runs at 7 a.m. EST.";
    } else { // 7–12
      top = newestAm; topLabel = "Today, Morning Edition";
      bottom = newestPm; bottomLabel = "Yesterday, Afternoon Edition";
      banner = "Today's afternoon digest runs at 1 p.m. EST.";
    }

    // Bootstrap fallback: only one snapshot exists, or top wasn't set.
    if (!top && manifest.snapshots[0]) {
      top = manifest.snapshots[0];
      topLabel = top.type === "pm" ? "Latest Afternoon Edition" : "Latest Morning Edition";
      banner = banner || "Bootstrap mode — only one snapshot exists so far.";
    }

    // Don't render the same snapshot twice.
    if (top && bottom && top.id === bottom.id) {
      bottom = null;
    }

    return {
      top: top ? snapshots[top.id] : null,
      bottom: bottom ? snapshots[bottom.id] : null,
      topLabel, bottomLabel, banner,
      hour
    };
  }

  function staleHours(runs) {
    if (!runs || !runs.runs || !runs.runs.length) return Infinity;
    const lastSuccess = runs.runs.find(r => r.status === "success");
    if (!lastSuccess) return Infinity;
    const hrs = (Date.now() - new Date(lastSuccess.ended_at).getTime()) / 3.6e6;
    return hrs < 0 ? 0 : hrs;
  }

  function lastRefreshLabel(runs) {
    if (!runs || !runs.runs || !runs.runs.length) return "no runs yet";
    const latest = runs.runs[0];
    const hrs = (Date.now() - new Date(latest.ended_at).getTime()) / 3.6e6;
    if (hrs < 0) {
      // Snapshot timestamp is in the future relative to our clock — show it absolute.
      return new Date(latest.ended_at).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      });
    }
    if (hrs < 1) return `${Math.round(hrs * 60)} minutes ago`;
    if (hrs < 36) return `${Math.round(hrs)} hours ago`;
    return `${Math.round(hrs / 24)} days ago`;
  }

  return { loadDigest, cycle, staleHours, lastRefreshLabel };
})();
