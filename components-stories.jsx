// =====================================================================
// THE DAILY SIGNAL — Sections, Hero, Cards
// =====================================================================

// ---------- Lead (tier-1 hero) ----------
function Lead({ item, onOpen }) {
  return (
    <section style={{ padding: "44px 0 36px" }}>
      <div className="flex center gap-m" style={{ marginBottom: 18, flexWrap: "wrap" }}>
        <span className="mono" style={{ color: "var(--persimmon)" }}>● Lead Story</span>
        <span className="eyebrow">{item._tierLabel}</span>
        <TierMark tier={item.tier}/>
        <RegionBadge region={item.region}/>
      </div>

      <h2 className="display"
          onClick={() => onOpen(item)}
          style={{
            fontSize: "clamp(44px, 5.2vw, 78px)",
            margin: "0 0 24px",
            cursor: "pointer",
            letterSpacing: "-0.02em",
            textWrap: "balance"
          }}>
        {item.title}
      </h2>

      <div className="lead-float-wrap">
        <div className="lead-hero-float">
          <HeroFigure item={item} height={340}/>
          <div style={{
            position: "absolute", top: -10, right: -10,
            background: "var(--ink)", color: "var(--paper)",
            padding: "10px 14px",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.12em"
          }}>
            № {String(item._ordinal + 1).padStart(2, "0")}
          </div>
          <div className="mono" style={{ marginTop: 10, color: "var(--ink-faint)" }}>
            Fig. — {item.hero_image ? "From source." : "Editorial illustration."}
          </div>
        </div>

        <p style={{
          fontFamily: "var(--serif-text)",
          fontSize: 19, lineHeight: 1.5,
          color: "var(--ink-soft)",
          margin: "0 0 18px",
          maxWidth: 640,
          textWrap: "pretty"
        }}>
          {item.summary}
        </p>

        <WhyItMatters text={item.why_it_matters}/>

        <div className="flex center gap-l" style={{ marginTop: 22, flexWrap: "wrap", rowGap: 12 }}>
          <button className="btn btn-primary" onClick={() => onOpen(item)}>Read the Story →</button>
          <span className="mono">
            {item.source.name} · {item.source.type.toUpperCase()}
          </span>
          <StatusPills item={item}/>
        </div>
      </div>
    </section>
  );
}

// ---------- Story card (tier-2/3 grid) ----------
function StoryCard({ item, onOpen, span = 4 }) {
  return (
    <article
      onClick={() => onOpen(item)}
      style={{
        gridColumn: `span ${span}`,
        cursor: "pointer",
        borderTop: "1px solid var(--ink)",
        paddingTop: 16
      }}
    >
      <div className="flex between" style={{ marginBottom: 10 }}>
        <div className="flex center gap-s">
          <span className="eyebrow">{item._tierLabel}</span>
          <RegionBadge region={item.region}/>
        </div>
        <span className="mono" style={{ color: "var(--ink-faint)" }}>
          № {String(item._ordinal + 1).padStart(2, "0")}
        </span>
      </div>

      <HeroFigure item={item} height={span >= 6 ? 240 : 170} style={{ marginBottom: 16 }}/>

      <h3 className="display" style={{
        fontSize: span >= 6 ? 36 : 26,
        margin: "0 0 10px",
        letterSpacing: "-0.01em",
        textWrap: "balance"
      }}>
        {item.title}
      </h3>

      {item.why_it_matters && (
        <p style={{
          fontFamily: "var(--serif-text)",
          fontStyle: "italic",
          fontSize: 13,
          lineHeight: 1.5,
          color: "var(--ink-soft)",
          margin: "0 0 8px",
          paddingLeft: 10,
          borderLeft: "2px solid var(--persimmon)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {item.why_it_matters}
        </p>
      )}

      <p style={{
        fontFamily: "var(--serif-text)",
        fontSize: 14, lineHeight: 1.5,
        color: "var(--ink-soft)",
        margin: "0 0 12px",
        textWrap: "pretty",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical"
      }}>
        {item.summary}
      </p>

      <div className="flex between center" style={{ flexWrap: "wrap", gap: 8 }}>
        <span className="mono" style={{ color: "var(--ink-faint)" }}>
          {item.source.name}
        </span>
        <TierMark tier={item.tier}/>
      </div>

      {item.takes && item.takes.length >= 2 && (
        <div className="mono" style={{
          marginTop: 10, color: "var(--persimmon)", textTransform: "uppercase"
        }}>
          {item.takes.length} takes — Details →
        </div>
      )}

      <div style={{ marginTop: 10 }}><StatusPills item={item}/></div>
    </article>
  );
}

// ---------- A snapshot section: one full edition (top or bottom of cycle) ----------
function EditionSection({ snapshot, label, onOpen, ordinal, accent }) {
  if (!snapshot) return null;
  const items = snapshot.items;
  const lead = items[0];
  const rest = items.slice(1);

  const tier2 = rest.filter(i => i.tier === 2);
  const tier3 = rest.filter(i => i.tier === 3);
  const otherTier1 = rest.filter(i => i.tier === 1);

  const pmDateFmt = new Date(snapshot.generated_at).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  });

  return (
    <section style={{ padding: "30px 0 16px" }}>
      <div className="section-marker">
        <span className="num">№ {String(ordinal).padStart(2, "0")}</span>
        <span className="label" style={{ color: accent }}>{label}</span>
        <span className="title" style={{ whiteSpace: "nowrap" }}>{pmDateFmt}</span>
        <span className="spacer"/>
        <span className="mono" style={{ color: "var(--ink-faint)" }}>
          {snapshot.tier_counts[1]} frontier · {snapshot.tier_counts[2]} tools · {snapshot.tier_counts[3]} industry
        </span>
      </div>

      {lead && <Lead item={lead} onOpen={onOpen}/>}

      {otherTier1.length > 0 && (
        <div className="grid-12" style={{ paddingBottom: 30 }}>
          {otherTier1.map((item, i, arr) => {
            const span = arr.length === 1 ? 12
              : arr.length === 2 ? 6
              : arr.length === 3 ? 4
              : (i < 2 ? 6 : 4);
            return <StoryCard key={item.id} item={item} onOpen={onOpen} span={span}/>;
          })}
        </div>
      )}

      {tier2.length > 0 && (
        <>
          <div className="section-marker" style={{ marginTop: 20 }}>
            <span className="num">§</span>
            <span className="label">Tools & Libraries</span>
            <span className="spacer"/>
            <span className="mono" style={{ color: "var(--ink-faint)" }}>{tier2.length} items</span>
          </div>
          <div className="grid-12" style={{ paddingBottom: 30 }}>
            {tier2.map(item => {
              const span = tier2.length === 1 ? 12
                : tier2.length === 2 ? 6
                : tier2.length === 4 ? 3
                : 4;
              return <StoryCard key={item.id} item={item} onOpen={onOpen} span={span}/>;
            })}
          </div>
        </>
      )}

      {tier3.length > 0 && (
        <>
          <div className="section-marker">
            <span className="num">§</span>
            <span className="label">Products & Industry</span>
            <span className="spacer"/>
            <span className="mono" style={{ color: "var(--ink-faint)" }}>{tier3.length} items</span>
          </div>
          <div className="grid-12">
            {tier3.map(item => (
              <StoryCard key={item.id} item={item} onOpen={onOpen}
                         span={tier3.length === 1 ? 12 : 6}/>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

Object.assign(window, { Lead, StoryCard, EditionSection });
