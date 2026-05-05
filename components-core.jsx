// =====================================================================
// THE DAILY SIGNAL — Components (Real-Data Edition)
// =====================================================================
const { useState, useEffect, useMemo, useRef } = React;

// ---------- Editorial illustration (uses generated SVG asset, halftoned) ----------
function Plate({ src, palette = "paper", height, aspect, label, style = {} }) {
  const tones = {
    paper: "var(--paper-deep)",
    persimmon: "var(--persimmon)",
    teal: "var(--teal)",
    ochre: "var(--ochre)",
    olive: "var(--olive)",
    ink: "var(--ink)"
  };
  return (
    <figure className="halftone" style={{
      margin: 0,
      height: aspect ? "auto" : height,
      aspectRatio: aspect,
      background: tones[palette] || tones.paper,
      ...style
    }}>
      <img src={src} alt={label || ""} style={{
        width: "100%", height: "100%", objectFit: "cover", display: "block",
        mixBlendMode: palette === "ink" ? "screen" : "multiply",
        opacity: 0.92
      }}/>
      {label && <figcaption className="htlabel">{label}</figcaption>}
    </figure>
  );
}

// ---------- Hero image (real og:image when present, illustration otherwise) ----------
function HeroFigure({ item, height, aspect, style = {} }) {
  const [broken, setBroken] = useState(false);
  if (item.hero_image && item.hero_image.url && !broken) {
    return (
      <figure style={{
        margin: 0,
        height: aspect ? "auto" : height,
        aspectRatio: aspect,
        background: "var(--paper-deep)",
        position: "relative",
        ...style
      }}>
        <img src={item.hero_image.url}
             alt={item.hero_image.alt || item.title}
             onError={() => setBroken(true)}
             style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
      </figure>
    );
  }
  return <Plate src={item._illustration} palette={item._palette} height={height} aspect={aspect}
                label={item._tierLabel} style={style}/>;
}

// ---------- Masthead ----------
function Masthead({ onNav, current, onSearch, query, dateLabel, refreshLabel }) {
  return (
    <header style={{ paddingTop: 28 }}>
      <div className="flex between center mono masthead-meta" style={{ paddingBottom: 8 }}>
        <span>Vol. I · No. 001 · A Personal Edition</span>
        <span>{dateLabel}</span>
        <span>Last Refresh · {refreshLabel}</span>
      </div>

      <hr className="rule"/>

      <div style={{ padding: "20px 0 14px", textAlign: "center" }}>
        <div className="eyebrow" style={{ color: "var(--persimmon)", marginBottom: 10 }}>
          ◆ &nbsp;Curated By A Scheduled Agent · Read By A Human&nbsp; ◆
        </div>
        <h1 className="display" style={{
          margin: 0,
          fontSize: "clamp(56px, 8.5vw, 128px)",
          letterSpacing: "-0.02em",
          fontWeight: 400
        }}>
          The&nbsp;Daily&nbsp;Signal
        </h1>
        <div className="eyebrow" style={{ marginTop: 12, letterSpacing: "0.32em" }}>
          A Personal Almanac of Machine Intelligence
        </div>
      </div>

      <hr className="rule-double"/>

      <nav className="flex between center" style={{ padding: "12px 0", flexWrap: "wrap", gap: 12 }}>
        <div className="flex gap-l" style={{ flexWrap: "wrap" }}>
          {["Front Page", "Frontier", "Tools & Libraries", "Products & Industry", "Archive"].map(n => (
            <a key={n}
               onClick={() => onNav(n)}
               className="eyebrow"
               style={{
                 cursor: "pointer",
                 paddingBottom: 4,
                 borderBottom: current === n ? "2px solid var(--persimmon)" : "2px solid transparent",
                 color: current === n ? "var(--ink)" : "var(--ink-soft)"
               }}>
              {n}
            </a>
          ))}
        </div>

        <div className="flex center gap-s">
          <span className="mono">Find:</span>
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="a topic, a name, a model"
            style={{
              background: "transparent", border: 0,
              borderBottom: "1px solid var(--ink)",
              padding: "4px 2px", fontFamily: "var(--mono)",
              fontSize: 11, letterSpacing: "0.04em",
              color: "var(--ink)", width: 220, outline: "none"
            }}/>
        </div>
      </nav>
      <hr className="rule"/>
    </header>
  );
}

// ---------- Tier mark, region badge, status pills ----------
function TierMark({ tier, size = 14 }) {
  const colors = { 1: "var(--persimmon)", 2: "var(--teal)", 3: "var(--ochre)" };
  const dots = "●".repeat(tier) + "○".repeat(3 - tier);
  return (
    <span className="mono" style={{ color: colors[tier], letterSpacing: "0.1em", fontSize: size - 2 }}>
      {dots}<span style={{ marginLeft: 6, color: "var(--ink-faint)" }}>T{tier}</span>
    </span>
  );
}

function RegionBadge({ region }) {
  if (!region || region === "US" || region === "Global") return null;
  return (
    <span className="mono" style={{
      border: "1px solid var(--ink)",
      padding: "2px 7px", letterSpacing: "0.14em"
    }}>
      {region}
    </span>
  );
}

function StatusPills({ item }) {
  const pills = [];
  if (item.enriched_overnight && (item.last_revision_by === "enrichment" || item.last_revision_by === "refresh")) {
    pills.push({ key: "ov", label: "Updated overnight", color: "var(--teal)" });
  }
  if (item.promoted_from_am) {
    pills.push({ key: "pm", label: "↑ Promoted from morning", color: "var(--persimmon)" });
  }
  if (!pills.length) return null;
  return (
    <div className="flex gap-s" style={{ flexWrap: "wrap" }}>
      {pills.map(p => (
        <span key={p.key} className="mono" style={{
          color: p.color, borderTop: `1px solid ${p.color}`,
          borderBottom: `1px solid ${p.color}`, padding: "2px 8px"
        }}>{p.label}</span>
      ))}
    </div>
  );
}

// ---------- Why-it-matters callout ----------
function WhyItMatters({ text }) {
  if (!text) return null;
  return (
    <aside style={{
      borderLeft: "3px solid var(--persimmon)",
      paddingLeft: 14,
      margin: "14px 0",
      fontFamily: "var(--serif-text)",
      fontStyle: "italic",
      fontSize: 14,
      lineHeight: 1.55,
      color: "var(--ink-soft)",
      textWrap: "pretty"
    }}>
      <span className="mono" style={{
        display: "block", fontStyle: "normal",
        color: "var(--persimmon)", marginBottom: 4
      }}>
        Why it matters
      </span>
      {text}
    </aside>
  );
}

Object.assign(window, { Plate, HeroFigure, Masthead, TierMark, RegionBadge, StatusPills, WhyItMatters });
