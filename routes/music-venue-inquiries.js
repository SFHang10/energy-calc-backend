const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const nodemailer = require('nodemailer');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'music-venue-inquiries.json');
const venuesPath = path.join(__dirname, '..', 'data', 'music-venues.json');
const ipSubmissionLog = new Map();
const RATE_LIMIT_WINDOW_MS = Number(process.env.MUSIC_INQUIRY_RATE_WINDOW_MS || 10 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.MUSIC_INQUIRY_RATE_MAX || 5);

async function readStore() {
  try {
    const raw = await fs.readFile(dataPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) return parsed;
  } catch (error) {
    if (error.code === 'ENOENT') return { items: [] };
    throw error;
  }
  return { items: [] };
}

async function writeStore(store) {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  const payload = {
    updatedAt: new Date().toISOString(),
    items: store.items || []
  };
  await fs.writeFile(dataPath, JSON.stringify(payload, null, 2), 'utf8');
  return payload;
}

async function loadVenuesMap() {
  try {
    const raw = await fs.readFile(venuesPath, 'utf8');
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed?.items) ? parsed.items : [];
    const map = new Map();
    for (const item of items) map.set(Number(item.id), item);
    return map;
  } catch (error) {
    return new Map();
  }
}

function toText(value, maxLen) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

function sanitizeInquiry(body, venueId) {
  return {
    id: Date.now(),
    venueId: Number(venueId),
    name: toText(body?.name, 120),
    email: toText(body?.email, 160),
    instrument: toText(body?.instrument, 120),
    preferredDate: toText(body?.preferredDate, 80),
    message: toText(body?.message, 1000),
    pageUrl: toText(body?.pageUrl, 500),
    status: 'new',
    createdAt: new Date().toISOString()
  };
}

function extractIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || req.ip || 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const hits = (ipSubmissionLog.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    ipSubmissionLog.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipSubmissionLog.set(ip, hits);
  return false;
}

function getMailerTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function notifyInquiryByEmail(inquiry, venue) {
  const transport = getMailerTransport();
  if (!transport) return { sent: false, reason: 'smtp_not_configured' };

  const venueEmail = toText(venue?.contactEmail, 200);
  const fallbackOpsEmail = process.env.MUSIC_INQUIRY_NOTIFY_TO || process.env.SMTP_USER;
  const to = venueEmail || fallbackOpsEmail;
  const cc = venueEmail && fallbackOpsEmail && venueEmail !== fallbackOpsEmail
    ? fallbackOpsEmail
    : undefined;
  const venueName = venue?.name || `Venue #${inquiry.venueId}`;
  const subject = `[Live Music Finder] New inquiry for ${venueName}`;
  const text = [
    `New artist inquiry received`,
    ``,
    `Venue: ${venueName}`,
    `Venue ID: ${inquiry.venueId}`,
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Instrument/Style: ${inquiry.instrument || '-'}`,
    `Preferred date/time: ${inquiry.preferredDate || '-'}`,
    ``,
    `Message:`,
    inquiry.message
  ].join('\n');

  await transport.sendMail({
    from: process.env.MUSIC_INQUIRY_FROM || process.env.SMTP_USER,
    to,
    cc,
    replyTo: inquiry.email || undefined,
    subject,
    text
  });
  return { sent: true, to, cc: cc || '' };
}

router.get('/', async (req, res) => {
  try {
    const venueId = Number(req.query.venueId);
    const store = await readStore();
    const items = Number.isFinite(venueId)
      ? store.items.filter((item) => Number(item.venueId) === venueId)
      : store.items;
    res.json({ items, updatedAt: store.updatedAt || null, count: items.length });
  } catch (error) {
    console.error('Failed to list music inquiries:', error.message);
    res.status(500).json({ error: 'Failed to load inquiries.' });
  }
});

router.post('/', async (req, res) => {
  try {
    // Honeypot: bots often fill hidden fields.
    const trap = toText(req.body?.website || req.body?.company || '', 200);
    if (trap) {
      return res.status(202).json({ ok: true });
    }

    const elapsedMs = Number(req.body?.elapsedMs || 0);
    if (Number.isFinite(elapsedMs) && elapsedMs > 0 && elapsedMs < 1200) {
      return res.status(429).json({ error: 'Submission blocked. Please try again.' });
    }

    const ip = extractIp(req);
    if (isRateLimited(ip)) {
      return res.status(429).json({ error: 'Too many inquiries from this connection. Please wait.' });
    }

    const venueId = Number(req.body?.venueId);
    if (!Number.isFinite(venueId)) {
      return res.status(400).json({ error: 'venueId is required.' });
    }
    const inquiry = sanitizeInquiry(req.body, venueId);
    if (!inquiry.name || !inquiry.email || !inquiry.message) {
      return res.status(400).json({ error: 'name, email, and message are required.' });
    }

    const [store, venuesMap] = await Promise.all([readStore(), loadVenuesMap()]);
    const nextStore = { items: [...store.items, inquiry] };
    const saved = await writeStore(nextStore);
    const venue = venuesMap.get(Number(inquiry.venueId));

    let emailNotification = { sent: false, reason: 'not_attempted' };
    try {
      emailNotification = await notifyInquiryByEmail(inquiry, venue);
    } catch (emailError) {
      emailNotification = { sent: false, reason: 'send_failed', error: emailError.message };
      console.warn('Music inquiry email notification failed:', emailError.message);
    }

    res.status(201).json({ item: inquiry, updatedAt: saved.updatedAt, emailNotification });
  } catch (error) {
    console.error('Failed to save music inquiry:', error.message);
    res.status(500).json({ error: 'Failed to save inquiry.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = toText(req.body?.status, 40).toLowerCase();
    if (!Number.isFinite(id) || !status) {
      return res.status(400).json({ error: 'Valid id and status are required.' });
    }
    const store = await readStore();
    const index = store.items.findIndex((item) => Number(item.id) === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    store.items[index] = {
      ...store.items[index],
      status,
      updatedAt: new Date().toISOString()
    };
    const saved = await writeStore(store);
    res.json({ item: store.items[index], updatedAt: saved.updatedAt });
  } catch (error) {
    console.error('Failed to update music inquiry status:', error.message);
    res.status(500).json({ error: 'Failed to update inquiry status.' });
  }
});

module.exports = router;
