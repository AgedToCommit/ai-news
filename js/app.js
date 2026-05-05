import { pickSnapshots } from './cycle.js';

// Allow `?now=2026-05-04T15:00` query override for testing the time-based cycle picker
function getNow() {
  const params = new URLSearchParams(window.location.search);
  const override = params.get('now');
  if (override) return new Date(override + (override.includes('Z') || override.includes('+') || override.includes('-') ? '' : '-04:00'));
  return new Date();
}

// Allow `?data=tests/fixtures/data` query override for testing with fixture data
function getDataDir() {
  const params = new URLSearchParams(window.location.search);
  return params.get('data') || 'data';
}

async function fetchJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
  return r.json();
}

function relativeTime(isoString) {
  if (!isoString) return 'never';
  const then = new Date(isoString).getTime();
  const now = Date.now();
  const minutes = Math.round((now - then) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function escape(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function renderItem(item) {
  const tags = [];
  tags.push(`<span class="tag tier${item.tier}">Tier ${item.tier}</span>`);
  if (item.region && item.region !== 'US' && item.region !== 'Global') {
    tags.push(`<span class="tag region">${escape(item.region)}</span>`);
  }
  if (item.enriched_overnight && item.last_revision_by !== 'digest') {
    tags.push(`<span class="tag updated">Updated overnight</span>`);
  }
  if (item.promoted_from_am) {
    tags.push(`<span class="tag promoted">↑ Promoted from morning</span>`);
  }

  const hero = item.hero_image
    ? `<img class="hero" src="${escape(item.hero_image.url)}" alt="${escape(item.hero_image.alt)}" onerror="this.remove()">`
    : '';

  const detailsLink = (item.takes && item.takes.length >= 2)
    ? ` · <a href="#item-${escape(item.id)}">Details →</a>`
    : '';

  return `
    <article class="item" id="item-${escape(item.id)}">
      <div class="meta">${tags.join('')}</div>
      ${hero}
      <h3>${escape(item.title)}</h3>
      <p class="summary">${escape(item.summary)}</p>
      <p class="why">Why this matters: ${escape(item.why_it_matters)}</p>
      <p class="source-row">
        <a href="${escape(item.link)}" target="_blank" rel="noopener">${escape(item.source && item.source.name || 'source')}</a>${detailsLink}
      </p>
    </article>
  `;
}

function renderItemDetail(item) {
  const takesHtml = (item.takes || []).map(t => `
    <blockquote>
      ${escape(t.take)}
      <cite>— <a href="${escape(t.url)}" target="_blank" rel="noopener">${escape(t.source)}</a></cite>
    </blockquote>
  `).join('');

  return `
    ${renderItem(item)}
    <div class="takes">
      <h2>Takes (${(item.takes || []).length})</h2>
      ${takesHtml}
    </div>
  `;
}

function renderSection(title, snapshot) {
  if (!snapshot) return '';
  if (!snapshot.items || snapshot.items.length === 0) {
    return `<h2>${escape(title)}</h2><p class="empty">No items.</p>`;
  }
  return `<h2>${escape(title)}</h2>${snapshot.items.map(renderItem).join('')}`;
}

function renderBanner(text, level) {
  if (!text) return '';
  const cls = level === 'danger' ? 'banner danger' : level === 'warn' ? 'banner warn' : 'banner';
  return `<div class="${cls}">${escape(text)}</div>`;
}

function renderFooter(runs) {
  const lastSuccess = runs.find(r => r.status === 'success');
  if (!lastSuccess) return 'No successful runs yet.';
  return `Last refresh: ${relativeTime(lastSuccess.ended_at)} (${escape(lastSuccess.phase)}, ${escape(lastSuccess.tokens_used.toLocaleString())} tokens)`;
}

function renderArchive(manifest, currentTopId, currentBottomId) {
  const others = manifest.snapshots.filter(s => s.id !== currentTopId && s.id !== currentBottomId);
  if (others.length === 0) return '<p class="empty">No archived snapshots yet.</p>';
  return '<ul>' + others.map(s => `
    <li>${escape(s.calendar_date)} ${escape(s.type)} — ${s.item_count || 0} items
      (T1: ${(s.tier_counts && s.tier_counts['1']) || 0},
       T2: ${(s.tier_counts && s.tier_counts['2']) || 0},
       T3: ${(s.tier_counts && s.tier_counts['3']) || 0})
    </li>
  `).join('') + '</ul>';
}

function getStaleBanner(runs) {
  const lastSuccess = runs.find(r => r.status === 'success');
  if (!lastSuccess) return null;
  const hoursStale = (Date.now() - new Date(lastSuccess.ended_at).getTime()) / 3600000;
  if (hoursStale > 12) {
    return { text: `⚠ Last successful refresh was ${Math.round(hoursStale)} hours ago — agent may be stuck.`, level: 'warn' };
  }
  return null;
}

function getPausedBanner(control) {
  if (!control || !control.paused) return null;
  const until = control.paused_until ? new Date(control.paused_until) : null;
  if (until && until.getTime() < Date.now()) return null;
  const reason = control.paused_reason || 'No reason given';
  const resumeText = until ? `Resumes ${until.toISOString().slice(0, 16).replace('T', ' ')} UTC` : 'Indefinite';
  return { text: `Agent paused — ${resumeText}. Reason: ${reason}`, level: 'danger' };
}

function findSnapshotMeta(manifest, id) {
  return manifest.snapshots.find(s => s.id === id) || null;
}

async function renderItemDetailPage(itemId, manifest, dataDir) {
  // Find the most recent snapshot containing this item
  for (const s of manifest.snapshots) {
    const snap = await fetchJson(s.file.startsWith(dataDir) ? s.file : `${dataDir}/${s.id}.json`);
    const item = (snap.items || []).find(i => i.id === itemId);
    if (item) return renderItemDetail(item);
  }
  return `<p class="empty">Item not found.</p>`;
}

async function render() {
  const dataDir = getDataDir();
  const banner = document.getElementById('banner-area');
  const top = document.getElementById('top-section');
  const bottom = document.getElementById('bottom-section');
  const archive = document.getElementById('archive-content');
  const footer = document.getElementById('footer');
  const backLink = document.getElementById('back-link');

  let manifest, runsLog, control;
  try {
    [manifest, runsLog, control] = await Promise.all([
      fetchJson(`${dataDir}/index.json`),
      fetchJson(`${dataDir}/runs.json`),
      fetchJson('agent/control.json').catch(() => ({ paused: false, phases: {} }))
    ]);
  } catch (e) {
    banner.innerHTML = renderBanner(`Failed to load page data: ${e.message}`, 'danger');
    return;
  }

  const runs = (runsLog && runsLog.runs) || [];

  // Banner stack: paused > stale > cycle
  const banners = [];
  const paused = getPausedBanner(control);
  if (paused) banners.push(renderBanner(paused.text, paused.level));
  const stale = getStaleBanner(runs);
  if (stale) banners.push(renderBanner(stale.text, stale.level));

  // Sub-page deep-link?
  const hash = window.location.hash;
  if (hash.startsWith('#item-')) {
    const itemId = hash.slice('#item-'.length);
    const detailHtml = await renderItemDetailPage(itemId, manifest, dataDir);
    banner.innerHTML = banners.join('');
    top.innerHTML = detailHtml;
    bottom.innerHTML = '';
    backLink.hidden = false;
    backLink.onclick = (e) => { e.preventDefault(); window.location.hash = ''; };
    archive.innerHTML = '';
    footer.textContent = renderFooter(runs);
    return;
  }

  // Standard cycle-based view
  backLink.hidden = true;
  const { topId, bottomId, banner: cycleBanner } = pickSnapshots(getNow(), manifest);
  if (cycleBanner && !paused) banners.push(renderBanner(cycleBanner));
  banner.innerHTML = banners.join('');

  // Determine labels based on time window
  const { hour } = (() => {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', hour: '2-digit', hour12: false });
    return { hour: parseInt(fmt.formatToParts(getNow()).find(p => p.type === 'hour').value, 10) };
  })();

  let topLabel, bottomLabel;
  if (hour >= 13 || hour < 2) {
    topLabel = 'Today (afternoon)';
    bottomLabel = 'Today (morning)';
  } else if (hour < 7) {
    topLabel = null;
    bottomLabel = "Yesterday's afternoon";
  } else {
    topLabel = 'Today (morning)';
    bottomLabel = "Yesterday's afternoon";
  }

  const topMeta = topId ? findSnapshotMeta(manifest, topId) : null;
  const topFile = topMeta ? (topMeta.file.startsWith(dataDir) ? topMeta.file : `${dataDir}/${topId}.json`) : null;
  const topSnap = topFile ? await fetchJson(topFile) : null;

  const bottomMeta = bottomId ? findSnapshotMeta(manifest, bottomId) : null;
  const bottomFile = bottomMeta ? (bottomMeta.file.startsWith(dataDir) ? bottomMeta.file : `${dataDir}/${bottomId}.json`) : null;
  const bottomSnap = bottomFile ? await fetchJson(bottomFile) : null;

  top.innerHTML = topLabel ? renderSection(topLabel, topSnap) : '';
  bottom.innerHTML = bottomLabel ? renderSection(bottomLabel, bottomSnap) : '';
  archive.innerHTML = renderArchive(manifest, topId, bottomId);
  footer.textContent = renderFooter(runs);
}

window.addEventListener('hashchange', render);
render();
