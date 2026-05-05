// =====================================================================
// THE DAILY SIGNAL — Reading view + Banners + Footer + Archive
// =====================================================================

function ReadingView({ item, onClose }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0,
      background: "var(--paper)", zIndex: 100, overflowY: "auto"
    }}>
      <div style={{
        position: "sticky", top: 0, zIndex: 3,
        background: "var(--paper)",
        borderBottom: "1px solid var(--ink)",
        boxShadow: "0 1px 0 var(--paper)"
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "var(--paper)",
          zIndex: -1
        }}/>
        <div className="page flex between center" style={{ padding: "14px var(--margin)" }}>
          <span className="mono">The Daily Signal · Reading View</span>
          <span className="mono" style={{ color: "var(--ink-faint)" }}>
            Press Esc to return
          </span>
          <button onClick={onClose} className="btn">← Back to Front Page</button>
        </div>
      </div>

      <article className="page" style={{ padding: "60px var(--margin) 100px", maxWidth: 980 }}>
        <div className="flex center gap-m" style={{ marginBottom: 22, flexWrap: "wrap" }}>
          <span className="eyebrow" style={{ color: "var(--persimmon)" }}>{item._tierLabel}</span>
          <span className="dot" style={{ background: "var(--ink)" }} />
          <TierMark tier={item.tier} />
          <span className="dot" style={{ background: "var(--ink)" }} />
          <RegionBadge region={item.region} />
          <span className="mono" style={{ color: "var(--ink-faint)" }}>
            № {String(item._ordinal + 1).padStart(2, "0")}
          </span>
        </div>

        <h1 className="display" style={{
          fontSize: "clamp(40px, 5.2vw, 80px)",
          margin: "0 0 22px", letterSpacing: "-0.02em", textWrap: "balance"
        }}>
          {item.title}
        </h1>

        <p style={{
          fontFamily: "var(--serif-text)", fontStyle: "italic",
          fontSize: 21, lineHeight: 1.45,
          color: "var(--ink-soft)", margin: "0 0 32px",
          textWrap: "pretty", maxWidth: 780
        }}>
          {item.summary}
        </p>

        <div className="flex between center" style={{
          padding: "12px 0",
          borderTop: "1px solid var(--ink)",
          borderBottom: "1px solid var(--ink)",
          marginBottom: 36, flexWrap: "wrap", gap: 12
        }}>
          <span className="mono">Source · {item.source.name}</span>
          <span className="mono">{item.source.type.toUpperCase()}</span>
          <span className="mono">Added {new Date(item.added_at).toLocaleDateString()}</span>
        </div>

        <HeroFigure item={item} aspect="16/9" style={{ marginBottom: 12 }} />
        <div className="mono" style={{ color: "var(--ink-faint)", marginBottom: 32 }}>
          {item.hero_image ?
            "Fig. — From source." :
            "Fig. — Editorial illustration. Drawn for this dispatch."}
        </div>

        <WhyItMatters text={item.why_it_matters} />

        <div style={{ marginTop: 26 }}><StatusPills item={item} /></div>

        {item.takes && item.takes.length > 0 &&
          <div style={{ marginTop: 40 }}>
            <div className="section-marker">
              <span className="num">§</span>
              <span className="label">Cross-Source Takes</span>
              <span className="spacer" />
              <span className="mono" style={{ color: "var(--ink-faint)" }}>{item.takes.length}</span>
            </div>
            {item.takes.map((t, i) =>
              <blockquote key={i} style={{
                margin: "0 0 24px",
                padding: "16px 22px",
                borderLeft: "4px solid var(--ink)",
                background: "var(--paper-light)",
                fontFamily: "var(--serif-text)", fontSize: 17, lineHeight: 1.55
              }}>
                <p style={{ margin: "0 0 10px", textWrap: "pretty" }}>{t.take}</p>
                <footer className="mono" style={{ color: "var(--ink-faint)" }}>
                  — {t.source}
                  {t.url && <> · <a href={t.url} target="_blank" rel="noopener" style={{ borderBottom: "1px solid currentColor" }}>read</a></>}
                </footer>
              </blockquote>
            )}
          </div>
        }

        {item.revisions && item.revisions.length > 1 &&
          <details style={{ marginTop: 32 }}>
            <summary className="mono" style={{ cursor: "pointer", color: "var(--ink-faint)" }}>
              Revision history ({item.revisions.length})
            </summary>
            <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
              {item.revisions.map((r, i) =>
                <li key={i} className="mono" style={{ padding: "4px 0", color: "var(--ink-soft)" }}>
                  {new Date(r.at).toLocaleString()} · {r.by} · {r.change}
                </li>
              )}
            </ul>
          </details>
        }

        <div style={{ textAlign: "center", padding: "40px 0 10px" }}>
          <span className="mono" style={{ letterSpacing: "0.4em" }}>◆ ◆ ◆</span>
        </div>

        <div className="flex center" style={{ justifyContent: "center", gap: 14 }}>
          <a href={item.link} target="_blank" rel="noopener" className="btn btn-primary">
            Read at {item.source.name} ↗
          </a>
        </div>
      </article>
    </div>
  );
}

// ---------- Banners (cycle, stale, paused) ----------
function CycleBanner({ text }) {
  if (!text) return null;
  return (
    <div className="mono" style={{
      borderTop: "1px solid var(--ink)", borderBottom: "1px solid var(--ink)",
      padding: "10px 0", textAlign: "center", color: "var(--ink-soft)"
    }}>
      ◇ {text} ◇
    </div>
  );
}

function StaleBanner({ hours }) {
  if (!hours || hours < 12) return null;
  return (
    <div style={{
      background: "var(--persimmon)", color: "var(--paper)",
      padding: "10px var(--margin)", fontFamily: "var(--mono)",
      fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase"
    }}>
      ⚠ Last successful refresh was {Math.round(hours)} hours ago — agent may be stuck.
    </div>
  );
}

function PausedBanner({ control }) {
  if (!control || !control.paused) return null;
  const until = control.paused_until
    ? new Date(control.paused_until).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
      })
    : null;
  return (
    <div style={{
      background: "var(--ink)", color: "var(--paper)",
      padding: "10px var(--margin)", fontFamily: "var(--mono)",
      fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase"
    }}>
      ◆ Agent paused{control.paused_reason ? ` — ${control.paused_reason}` : ""}.
      {until ? ` Resumes ${until}.` : ""}
    </div>
  );
}

// ---------- Archive panel ----------
function Archive({ manifest, snapshots, onOpen }) {
  const [open, setOpen] = useState(false);

  // Group snapshots by recency bucket.
  const now = new Date();
  const msPerDay = 86400000;
  const startOfWeek = new Date(now - now.getDay() * msPerDay);
  startOfWeek.setHours(0, 0, 0, 0);

  const buckets = { week: [], month: [], older: [] };
  manifest.snapshots.forEach(s => {
    const d = new Date(s.calendar_date);
    const diffDays = (now - d) / msPerDay;
    if (diffDays <= 7) buckets.week.push(s);
    else if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) buckets.month.push(s);
    else buckets.older.push(s);
  });

  return (
    <section style={{ padding: "40px 0", borderTop: "4px solid var(--ink)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="flex between center"
        style={{
          width: "100%", background: "transparent", border: 0,
          padding: 0, cursor: "pointer", color: "var(--ink)"
        }}>
        <h3 className="display" style={{ fontSize: 48, margin: 0, letterSpacing: "-0.01em" }}>
          The Archive
        </h3>
        <span className="mono">
          {manifest.snapshots.length} snapshot{manifest.snapshots.length === 1 ? "" : "s"} · {open ? "Close ▴" : "Open ▾"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 22 }}>
          {[
            { key: "week", label: "Earlier This Week" },
            { key: "month", label: "This Month" },
            { key: "older", label: "Older" }
          ].map(({ key, label }) => buckets[key].length > 0 && (
            <div key={key} style={{ marginBottom: 32 }}>
              <div className="eyebrow" style={{ marginBottom: 16, color: "var(--ink-faint)" }}>
                {label}
              </div>
              <div className="grid-12">
                {buckets[key].map((s) => {
                  const snap = snapshots[s.id];
                  return (
                    <div key={s.id} style={{
                      gridColumn: "span 6",
                      borderTop: "1px solid var(--ink)", padding: "16px 0"
                    }}>
                      <div className="flex between center" style={{ marginBottom: 10 }}>
                        <span className="display" style={{ fontSize: 24 }}>
                          {new Date(s.calendar_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                          <span className="mono" style={{ marginLeft: 10, color: "var(--persimmon)" }}>
                            {s.type.toUpperCase()}
                          </span>
                        </span>
                        <span className="mono" style={{ color: "var(--ink-faint)" }}>
                          {s.item_count} items
                        </span>
                      </div>
                      <div className="mono" style={{ color: "var(--ink-faint)", marginBottom: 10 }}>
                        Tier I · {s.tier_counts[1]}  ·  Tier II · {s.tier_counts[2]}  ·  Tier III · {s.tier_counts[3]}
                      </div>
                      {snap && snap.items.slice(0, 3).map((it) =>
                        <div key={it.id}
                          onClick={() => onOpen(it)}
                          style={{
                            padding: "6px 0", cursor: "pointer",
                            fontFamily: "var(--serif-text)", fontSize: 14,
                            color: "var(--ink-soft)", borderTop: "1px dotted var(--paper-deep)"
                          }}>
                          <span style={{ color: "var(--persimmon)", marginRight: 8 }}>T{it.tier}</span>
                          {it.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Colophon({ runs }) {
  const latest = runs && runs.runs && runs.runs[0];
  return (
    <footer style={{ padding: "60px 0 80px", borderTop: "4px solid var(--ink)" }}>
      <div className="grid-12">
        <div style={{ gridColumn: "span 5" }}>
          <h4 className="display" style={{ fontSize: 44, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            The&nbsp;Daily&nbsp;Signal
          </h4>
          <p style={{
            fontFamily: "var(--serif-text)",
            fontSize: 15, lineHeight: 1.55,
            color: "var(--ink-soft)", maxWidth: 380
          }}>
            A personal almanac of artificial intelligence. Curated three times a day by a scheduled Claude agent: enrichment at 2 a.m., refresh at 7 a.m., and a full digest at 1 p.m. Eastern.
          </p>
        </div>

        <div style={{ gridColumn: "span 3" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>The Cycle</div>
          {[
            ["02:00 EST", "Enrichment"],
            ["07:00 EST", "Refresh"],
            ["13:00 EST", "Digest"]
          ].map(([t, n]) =>
            <div key={n} className="flex between" style={{
              padding: "4px 0", fontFamily: "var(--serif-text)", fontSize: 14
            }}>
              <span className="mono" style={{ color: "var(--persimmon)" }}>{t}</span>
              <span>{n}</span>
            </div>
          )}
        </div>

        <div style={{ gridColumn: "span 4" }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Last Run</div>
          {latest ?
            <div className="mono" style={{ color: "var(--ink-faint)", lineHeight: 1.7 }}>
              {latest.phase.toUpperCase()} · {latest.status.toUpperCase()}<br />
              {new Date(latest.ended_at).toLocaleString()}<br />
              {latest.tokens_used.toLocaleString()} tokens · {latest.fetches_made} fetches<br />
              {latest.items_output} items written
            </div> :
            <div className="mono" style={{ color: "var(--ink-faint)" }}>No runs yet.</div>
          }
        </div>
      </div>

      <hr className="rule" style={{ margin: "30px 0 16px" }} />
      <div className="flex between mono" style={{ color: "var(--ink-faint)", flexWrap: "wrap", gap: 10 }}>
        <span>Set in DM Serif, Source Serif & Archivo</span>
        <span>Printed on recycled pixels</span>
        <span>© Two Thousand Twenty-Six · AgedToCommit</span>
      </div>
    </footer>
  );
}

Object.assign(window, { ReadingView, CycleBanner, StaleBanner, PausedBanner, Archive, Colophon });
