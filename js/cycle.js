// Time-window aware snapshot picker.
// Inputs:
//   now: Date (any timezone — we convert to EST hours/date internally)
//   manifest: { snapshots: [{ id, type, calendar_date }] }
// Output: { topId, bottomId, banner }
// Where banner is null or a string to display.

const EST_TZ = 'America/New_York';

// Get hour (0-23) and YYYY-MM-DD calendar date in EST for a given Date.
function estParts(d) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: EST_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
    hour12: false
  });
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]));
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: parseInt(parts.hour, 10)
  };
}

// "Cycle date" = the date label the page treats as "today". Between midnight and 2am EST,
// the cycle date is still the previous calendar day (the previous afternoon's content is
// still labeled "Today" until the 2am enrichment runs).
function cycleDate(estDate, estHour) {
  if (estHour < 2) {
    const d = new Date(`${estDate}T12:00:00`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  return estDate;
}

function findSnapshot(manifest, type, date) {
  return manifest.snapshots.find(s => s.type === type && s.calendar_date === date) || null;
}

function findMostRecentPmBefore(manifest, date) {
  return manifest.snapshots
    .filter(s => s.type === 'pm' && s.calendar_date < date)
    .sort((a, b) => b.calendar_date.localeCompare(a.calendar_date))[0] || null;
}

export function pickSnapshots(now, manifest) {
  if (!manifest || !Array.isArray(manifest.snapshots) || manifest.snapshots.length === 0) {
    return { topId: null, bottomId: null, banner: null };
  }

  const { date: estDate, hour } = estParts(now);
  const today = cycleDate(estDate, hour);

  // Window 1: 13:00–01:59 — show today's pm + today's am
  if (hour >= 13 || hour < 2) {
    const pm = findSnapshot(manifest, 'pm', today);
    const am = findSnapshot(manifest, 'am', today);
    return {
      topId: pm ? pm.id : null,
      bottomId: am ? am.id : null,
      banner: null
    };
  }

  // Window 2: 02:00–06:59 — top hidden, bottom = newest pm (yesterday's), banner about 7am
  if (hour >= 2 && hour < 7) {
    const pmYesterday = findMostRecentPmBefore(manifest, estDate);
    return {
      topId: null,
      bottomId: pmYesterday ? pmYesterday.id : null,
      banner: "Today's morning refresh runs at 7am EST."
    };
  }

  // Window 3: 07:00–12:59 — top = today's am if exists, else fall through to window 2 behavior
  if (hour >= 7 && hour < 13) {
    // After 7am, "today" is the calendar date. The am file we want is for today's calendar date.
    const todayCal = estDate;
    const am = findSnapshot(manifest, 'am', todayCal);
    if (am) {
      const pmPrev = findMostRecentPmBefore(manifest, todayCal);
      return {
        topId: am.id,
        bottomId: pmPrev ? pmPrev.id : null,
        banner: "Today's afternoon digest runs at 1pm EST."
      };
    } else {
      // 2am or 7am run failed — no am file. Treat like 2am-7am window.
      const pmYesterday = findMostRecentPmBefore(manifest, todayCal);
      return {
        topId: null,
        bottomId: pmYesterday ? pmYesterday.id : null,
        banner: "Today's morning refresh runs at 7am EST."
      };
    }
  }

  return { topId: null, bottomId: null, banner: null };
}
