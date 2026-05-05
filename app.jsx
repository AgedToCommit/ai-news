// =====================================================================
// THE DAILY SIGNAL — App
// =====================================================================

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState("Front Page");
  const [query, setQuery] = useState("");
  const [openItem, setOpenItem] = useState(null);

  useEffect(() => {
    DataAdapter.loadDigest()
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  // Hash routing for #item-<id> deep links
  useEffect(() => {
    const handler = () => {
      const m = window.location.hash.match(/^#item-(.+)$/);
      if (m && data) {
        for (const id in data.snapshots) {
          const it = data.snapshots[id].items.find(x => x.id === m[1]);
          if (it) { setOpenItem(it); return; }
        }
      }
    };
    handler();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [data]);

  if (error) {
    return <div className="page" style={{ padding: 80 }}>
      <h2 className="display">Could not load digest.</h2>
      <p className="mono">{error}</p>
    </div>;
  }
  if (!data) {
    return <div className="page" style={{ padding: 120, textAlign: "center" }}>
      <div className="display" style={{ fontSize: 56, marginBottom: 12 }}>The Daily Signal</div>
      <div className="mono">Setting type…</div>
    </div>;
  }

  const cycle = DataAdapter.cycle(data.manifest, data.snapshots);
  const stale = DataAdapter.staleHours(data.runs);
  const refreshLabel = DataAdapter.lastRefreshLabel(data.runs);

  // Filter items by active nav route and search query
  const filterItems = (snap) => {
    if (!snap) return null;
    let items = snap.items;
    if (route === "Frontier") items = items.filter(i => i.tier === 1);
    if (route === "Tools & Libraries") items = items.filter(i => i.tier === 2);
    if (route === "Products & Industry") items = items.filter(i => i.tier === 3);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.summary.toLowerCase().includes(q) ||
        (i.why_it_matters || "").toLowerCase().includes(q) ||
        (i.region || "").toLowerCase().includes(q) ||
        i.source.name.toLowerCase().includes(q)
      );
    }
    if (items === snap.items) return snap;
    return { ...snap, items, tier_counts: {
      1: items.filter(i => i.tier === 1).length,
      2: items.filter(i => i.tier === 2).length,
      3: items.filter(i => i.tier === 3).length
    }};
  };

  const top = filterItems(cycle.top);
  const bottom = filterItems(cycle.bottom);

  const dateLabel = new Date().toLocaleDateString("en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const handleOpen = (item) => {
    window.history.replaceState(null, "", `#item-${item.id}`);
    setOpenItem(item);
  };
  const handleClose = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setOpenItem(null);
  };

  return (
    <>
      <StaleBanner hours={stale}/>
      <PausedBanner control={data.control}/>

      <div className="page">
        <Masthead
          onNav={setRoute}
          current={route}
          query={query}
          onSearch={setQuery}
          dateLabel={dateLabel}
          refreshLabel={refreshLabel}/>

        <CycleBanner text={cycle.banner}/>

        {!top && !bottom && (
          <div style={{ padding: "120px 0", textAlign: "center" }}>
            <h2 className="display" style={{ fontSize: 56, margin: 0 }}>No dispatches found.</h2>
            <p className="mono" style={{ marginTop: 14 }}>
              {query ? `The wire is quiet on "${query}".` : "Awaiting the next agent run."}
            </p>
          </div>
        )}

        {top && (
          <EditionSection snapshot={top} label={cycle.topLabel}
                          onOpen={handleOpen} ordinal={1}
                          accent="var(--persimmon)"/>
        )}

        {bottom && (
          <>
            <hr className="rule-thick" style={{ margin: "20px 0 0" }}/>
            <EditionSection snapshot={bottom} label={cycle.bottomLabel}
                            onOpen={handleOpen} ordinal={2}
                            accent="var(--ink-soft)"/>
          </>
        )}

        <Archive manifest={data.manifest} snapshots={data.snapshots} onOpen={handleOpen}/>
        <Colophon runs={data.runs}/>
      </div>

      {openItem && (
        <ReadingView item={openItem} onClose={handleClose}/>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
