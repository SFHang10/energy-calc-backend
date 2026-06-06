const path = require('path');
const fs = require('fs/promises');

const intentsPath = path.join(__dirname, '..', 'data', 'music-guide-intents.json');

const WEEKDAYS = [
  { key: 'monday', aliases: ['monday', 'mon ', 'mon·', 'mon,', 'mon.'] },
  { key: 'tuesday', aliases: ['tuesday', 'tue ', 'tues', 'tuesday'] },
  { key: 'wednesday', aliases: ['wednesday', 'wed '] },
  { key: 'thursday', aliases: ['thursday', 'thu ', 'thur'] },
  { key: 'friday', aliases: ['friday', 'fri '] },
  { key: 'saturday', aliases: ['saturday', 'sat '] },
  { key: 'sunday', aliases: ['sunday', 'sun '] }
];

let intentsCache = null;

async function loadIntents() {
  if (intentsCache) return intentsCache;
  try {
    const raw = await fs.readFile(intentsPath, 'utf8');
    intentsCache = JSON.parse(raw);
  } catch (_) {
    intentsCache = { intents: [], staticTips: [] };
  }
  return intentsCache;
}

function venueHaystack(venue) {
  return [
    venue.name,
    venue.schedule,
    venue.recurrence,
    venue.nextSession,
    venue.format,
    venue.desc,
    venue.jamDetails,
    venue.skillLevel
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function venueMatchesWeekday(venue, weekdayKey) {
  const def = WEEKDAYS.find((d) => d.key === weekdayKey);
  if (!def) return false;
  const hay = venueHaystack(venue);
  return def.aliases.some((a) => hay.includes(a));
}

function extractTimeHints(venue) {
  const bits = [venue.sessionTime, venue.schedule, venue.recurrence, venue.nextSession]
    .filter(Boolean)
    .join(' · ');
  const range = bits.match(/\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}/);
  if (range) return range[0];
  const from = bits.match(/from\s+\d{1,2}:\d{2}/i);
  if (from) return from[0];
  const at = bits.match(/at\s+\d{1,2}:\d{2}/i);
  if (at) return at[0];
  const plain = bits.match(/\d{1,2}:\d{2}/);
  return plain ? plain[0] : '';
}

function collectVideos(venue) {
  const out = [];
  const seen = new Set();
  (venue.youtubeVideos || []).forEach((v) => {
    const id = typeof v === 'string' ? v : v?.id;
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push({
      id,
      title: typeof v === 'object' ? v.title || '' : '',
      source: 'youtubeVideos'
    });
  });
  (venue.mediaGallery || []).forEach((m) => {
    if (m?.type !== 'youtube' || !m.id || seen.has(m.id)) return;
    seen.add(m.id);
    out.push({ id: m.id, title: m.title || '', source: 'mediaGallery' });
  });
  return out;
}

function contactLine(venue) {
  const parts = [];
  if (venue.contactEmail) parts.push(venue.contactEmail);
  if (venue.phone) parts.push(venue.phone);
  if (!parts.length && venue.url) parts.push('via venue website');
  return parts.join(' · ') || 'No email/phone on file — use map inquiry form';
}

function skillHint(venue) {
  if (venue.skillLevel) return venue.skillLevel;
  const hay = venueHaystack(venue);
  if (venue.genre === 'open-mic' || hay.includes('open mic')) {
    return 'Open mic — mixed levels, beginner-friendly sign-up nights';
  }
  if (hay.includes('jazz jam') || venue.genre === 'jazz') {
    return 'Jazz session — improv-friendly; listen first if you are new';
  }
  if (venue.genre === 'open-jam') return 'Open jam — check vibe on the night';
  return '';
}

function detectWeekdayInQuestion(q) {
  const lower = ` ${q.toLowerCase()} `;
  for (const day of WEEKDAYS) {
    if (day.aliases.some((a) => lower.includes(a))) return day.key;
  }
  return '';
}

function matchIntent(question, intents) {
  const q = question.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const intent of intents.intents || []) {
    let score = 0;
    for (const pattern of intent.patterns || []) {
      const p = pattern.toLowerCase().trim();
      if (!p) continue;
      if (q.includes(p)) score += p.length >= 8 ? 3 : 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return bestScore > 0 ? best : null;
}

function buildWeeklyIndex(venues) {
  const lines = [];
  for (const day of WEEKDAYS) {
    const matches = venues.filter((v) => venueMatchesWeekday(v, day.key));
    const label = day.key.charAt(0).toUpperCase() + day.key.slice(1);
    if (!matches.length) {
      lines.push(`- **${label}:** no fixed weekly jam in our database (check monthly/open-mic listings)`);
      continue;
    }
    const items = matches
      .map((v) => {
        const time = extractTimeHints(v);
        return `**${v.name}**${time ? ` (${time})` : ''} — ${v.schedule || v.format || 'live music'}`;
      })
      .join('; ');
    lines.push(`- **${label}:** ${items}`);
  }
  return lines.join('\n');
}

function buildWeekdayAnswer(venues, weekdayKey) {
  const label = weekdayKey.charAt(0).toUpperCase() + weekdayKey.slice(1);
  const matches = venues.filter((v) => venueMatchesWeekday(v, weekdayKey));
  if (!matches.length) {
    return {
      answer:
        `I don't have a fixed weekly jam logged for **${label}** in Amsterdam yet. ` +
        'Try open-mic / monthly venues (Zoku, de Sering, Ruby Emma) or ask for the full week overview.',
      suggestions: []
    };
  }
  const bullets = matches
    .map((v) => {
      const time = extractTimeHints(v);
      const contact = contactLine(v);
      return (
        `- **${v.name}** — ${v.schedule || v.format}` +
        (time ? `\n  - Usual time: ${time}` : '') +
        (v.skillLevel ? `\n  - Level/vibe: ${v.skillLevel}` : '') +
        `\n  - Contact: ${contact}`
      );
    })
    .join('\n');
  return {
    answer: `**${label} jams & sessions** (from our venue database):\n\n${bullets}`,
    suggestions: matches.slice(0, 5).map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

function buildStartTimesAnswer(venues, profile) {
  const ranked = venues
    .map((v) => ({ v, time: extractTimeHints(v), hay: venueHaystack(v) }))
    .filter((row) => row.time || row.v.schedule);
  const bullets = ranked
    .slice(0, 12)
    .map((row) => `- **${row.v.name}** — ${row.time || 'see schedule'} (${row.v.schedule || row.v.format})`)
    .join('\n');
  return {
    answer:
      `**Usual start / sign-up times** (parsed from stored schedules — confirm on the night):\n\n${bullets}` +
      (profile.level ? `\n\nYour level (${profile.level}): open-mic sign-up slots are often 30–60 min before the first act.` : ''),
    suggestions: ranked.slice(0, 5).map((row) => row.v).map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

function buildContactsAnswer(venues) {
  const withContact = venues.filter((v) => v.contactEmail || v.phone || v.url);
  const bullets = withContact
    .map((v) => {
      const bits = [];
      if (v.contactEmail) bits.push(`email: ${v.contactEmail}`);
      if (v.phone) bits.push(`phone: ${v.phone}`);
      if (v.agendaUrl) bits.push(`agenda: ${v.agendaUrl}`);
      else if (v.url) bits.push(`site: ${v.url}`);
      return `- **${v.name}** — ${bits.join(' · ')}`;
    })
    .join('\n');
  const missing = venues.filter((v) => !v.contactEmail && !v.phone);
  return {
    answer:
      `**Venue contacts on file** (we do not store named contacts — only venue email/phone/agenda):\n\n${bullets}` +
      (missing.length
        ? `\n\n**No direct email/phone stored:** ${missing.map((v) => v.name).join(', ')} — use the map inquiry form or venue website.`
        : ''),
    suggestions: withContact.slice(0, 5).map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

function buildSkillLevelAnswer(venues, profile) {
  const level = String(profile.level || '').toLowerCase();
  const rows = venues
    .map((v) => ({ v, hint: skillHint(v) }))
    .filter((row) => row.hint);
  let intro = '**Player level & vibe** (stored notes + genre defaults):\n\n';
  if (level.includes('beginner')) {
    intro =
      '**Beginner-friendly picks** — open mics and relaxed jams first; jazz clubs reward listening before sitting in:\n\n';
  }
  const bullets = rows
    .map((row) => `- **${row.v.name}** — ${row.hint}`)
    .join('\n');
  const beginnerPicks = venues.filter((v) => {
    const h = venueHaystack(v);
    return v.genre === 'open-mic' || h.includes('welcoming') || h.includes('relaxed') || v.skillLevel;
  });
  return {
    answer: intro + bullets,
    suggestions: (level.includes('beginner') ? beginnerPicks : venues)
      .slice(0, 5)
      .map((v) => ({
        id: v.id,
        name: v.name,
        genre: v.genre,
        schedule: v.schedule || '',
        address: v.address || '',
        url: v.url || ''
      }))
  };
}

function buildVideosAnswer(venues) {
  const withMedia = venues
    .map((v) => ({ v, videos: collectVideos(v) }))
    .filter((row) => row.videos.length);
  if (!withMedia.length) {
    return {
      answer:
        'No YouTube clips in our database yet for most venues. Check the map **Photos & videos** button after we merge media candidates (`npm run merge:music-media`). Bimhuis has one sample clip on file.',
      suggestions: venues.filter((v) => collectVideos(v).length).slice(0, 5).map((v) => ({
        id: v.id,
        name: v.name,
        genre: v.genre,
        schedule: v.schedule || '',
        address: v.address || '',
        url: v.url || ''
      }))
    };
  }
  const bullets = withMedia
    .map((row) => {
      const clips = row.videos.map((c) => `https://youtube.com/watch?v=${c.id}${c.title ? ` (${c.title})` : ''}`).join('; ');
      return `- **${row.v.name}** — ${clips}`;
    })
    .join('\n');
  return {
    answer: `**Videos on file** (open from map popup → Photos & videos):\n\n${bullets}`,
    suggestions: withMedia.slice(0, 5).map((row) => row.v).map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

function buildVibeSessionAnswer(venues) {
  const rich = venues.filter(
    (v) => v.skillLevel || v.jamDetails || v.sessionTime || v.entryCost || v.signUpNotes
  );
  const bullets = (rich.length ? rich : venues.slice(0, 8))
    .map((v) => {
      const lines = [`- **${v.name}**`];
      if (v.sessionTime) lines.push(`  - Session: ${v.sessionTime}`);
      else if (extractTimeHints(v)) lines.push(`  - Time hint: ${extractTimeHints(v)}`);
      if (v.skillLevel) lines.push(`  - Vibe/level: ${v.skillLevel}`);
      if (v.jamDetails) lines.push(`  - Details: ${v.jamDetails}`);
      if (v.entryCost) lines.push(`  - Cost: ${v.entryCost}`);
      if (v.signUpNotes) lines.push(`  - Sign-up: ${v.signUpNotes}`);
      if (lines.length === 1) lines.push(`  - ${v.schedule || v.desc || 'See venue listing'}`);
      return lines.join('\n');
    })
    .join('\n');
  return {
    answer: `**Session vibe, times & practical notes** (richest rows first):\n\n${bullets}`,
    suggestions: (rich.length ? rich : venues).slice(0, 5).map((v) => ({
      id: v.id,
      name: v.name,
      genre: v.genre,
      schedule: v.schedule || '',
      address: v.address || '',
      url: v.url || ''
    }))
  };
}

async function answerFromKnowledge(question, venues, profile = {}) {
  const intents = await loadIntents();
  const intent = matchIntent(question, intents);
  if (!intent) return null;

  const weekday = detectWeekdayInQuestion(question);
  const tip = (intents.staticTips || [])[0] || '';

  let result;
  switch (intent.answerType) {
    case 'weekly_index':
      result = {
        answer: `**Amsterdam jams by weekday** (from \`music-venues.json\`):\n\n${buildWeeklyIndex(venues)}\n\n_${tip}_`,
        suggestions: venues.slice(0, 5).map((v) => ({
          id: v.id,
          name: v.name,
          genre: v.genre,
          schedule: v.schedule || '',
          address: v.address || '',
          url: v.url || ''
        }))
      };
      break;
    case 'weekday_jams':
      if (weekday) {
        result = buildWeekdayAnswer(venues, weekday);
      } else {
        result = {
          answer: `**Pick a day** — e.g. "Tuesday jams" or "what's on Sunday".\n\n${buildWeeklyIndex(venues)}`,
          suggestions: []
        };
      }
      break;
    case 'start_times':
      result = buildStartTimesAnswer(venues, profile);
      break;
    case 'contacts':
      result = buildContactsAnswer(venues);
      break;
    case 'skill_level':
      result = buildSkillLevelAnswer(venues, profile);
      break;
    case 'videos':
      result = buildVideosAnswer(venues);
      break;
    case 'vibe_session':
      result = buildVibeSessionAnswer(venues);
      break;
    default:
      return null;
  }

  if (result?.answer) {
    result.source = 'knowledge';
    result.intentId = intent.id;
  }
  return result;
}

module.exports = {
  answerFromKnowledge,
  buildWeeklyIndex,
  venueMatchesWeekday,
  loadIntents
};
