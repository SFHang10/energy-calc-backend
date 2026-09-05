/**
 * Wave 9 — agent outbound mail (Gmail/Workspace SMTP pilot).
 * Shared From: gwta@greenwaysrestaurants.com (Green Ways Transition Agents).
 */
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const MAILBOXES_PATH = path.join(__dirname, '..', 'data', 'greenways-agent-mailboxes.json');
const SEND_LOG_PATH = path.join(__dirname, '..', 'data', 'agent-mail-send-log.jsonl');

const DEFAULT_FROM = 'gwta@greenwaysrestaurants.com';
const MAX_BODY_CHARS = 8000;
const MAX_SUBJECT_CHARS = 180;
const DEFAULT_DAILY_LIMIT = 20;

/** @type {Map<string, { day: string, count: number }>} */
const rateBucket = new Map();

function envFlag(name) {
  const v = String(process.env[name] || '')
    .trim()
    .toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}

function loadMailboxes() {
  try {
    return JSON.parse(fs.readFileSync(MAILBOXES_PATH, 'utf8'));
  } catch (_) {
    return { meta: {}, agents: {} };
  }
}

function getMailbox(agentSlug) {
  const registry = loadMailboxes();
  const slug = String(agentSlug || '').trim();
  const row = (registry.agents && registry.agents[slug]) || {};
  const shared =
    (registry.meta && registry.meta.sharedFrom) ||
    process.env.AGENT_MAIL_SMTP_USER ||
    DEFAULT_FROM;
  return {
    slug,
    name: row.name || 'Greenways Agent',
    fromName: row.fromName || `${row.name || 'Greenways'} · Green Ways Transition Agents`,
    fromAddress: row.fromAddress || shared,
    replyTo: row.replyTo || shared,
    subjectPrefix: row.subjectPrefix || '',
    signOff: row.signOff || row.name || 'Greenways'
  };
}

function smtpConfigured() {
  const user = String(process.env.AGENT_MAIL_SMTP_USER || process.env.GMAIL_USER || '').trim();
  const pass = String(process.env.AGENT_MAIL_SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  return Boolean(user && pass);
}

function getMailStatus() {
  const user = String(process.env.AGENT_MAIL_SMTP_USER || process.env.GMAIL_USER || DEFAULT_FROM).trim();
  const allowlist = getAllowlist();
  return {
    ok: true,
    service: 'agent-mail',
    version: '1',
    sharedFrom: user || DEFAULT_FROM,
    smtpConfigured: smtpConfigured(),
    sendEnabled: envFlag('AGENT_MAIL_SEND_ENABLED') && smtpConfigured(),
    allowlistActive: allowlist.length > 0,
    allowlistCount: allowlist.length,
    dailyLimit: Number(process.env.AGENT_MAIL_DAILY_LIMIT || DEFAULT_DAILY_LIMIT) || DEFAULT_DAILY_LIMIT
  };
}

function getAllowlist() {
  const raw = String(process.env.AGENT_MAIL_ALLOWLIST || '').trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkRateLimit(key) {
  const limit = Number(process.env.AGENT_MAIL_DAILY_LIMIT || DEFAULT_DAILY_LIMIT) || DEFAULT_DAILY_LIMIT;
  const day = dayKey();
  const row = rateBucket.get(key);
  if (!row || row.day !== day) {
    rateBucket.set(key, { day, count: 0 });
    return { ok: true, remaining: limit };
  }
  if (row.count >= limit) {
    return { ok: false, remaining: 0, limit };
  }
  return { ok: true, remaining: limit - row.count };
}

function bumpRateLimit(key) {
  const day = dayKey();
  const row = rateBucket.get(key) || { day, count: 0 };
  if (row.day !== day) {
    rateBucket.set(key, { day, count: 1 });
    return;
  }
  row.count += 1;
  rateBucket.set(key, row);
}

function appendSendLog(entry) {
  try {
    fs.appendFileSync(SEND_LOG_PATH, `${JSON.stringify(entry)}\n`, 'utf8');
  } catch (err) {
    console.warn('agent-mail log write failed:', err.message);
  }
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildBodies({ greeting, summary, link, signOff, agentName }) {
  const plain =
    `${greeting}\n\n${summary}\n\nContinue in chat:\n${link}\n\n—\n${signOff}\n\n` +
    `Green Ways Transition Agents · transactional note (not marketing).\n`;

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#0b1220;font-family:Segoe UI,Tahoma,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b1220;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#f8f4ec;border-radius:14px;overflow:hidden;">
        <tr><td style="padding:18px 22px;background:#121a28;color:#c9a961;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;font-weight:700;">
          Green Ways Transition Agents
        </td></tr>
        <tr><td style="padding:22px 22px 8px;color:#1a2332;font-size:16px;font-weight:600;">${escapeHtml(greeting)}</td></tr>
        <tr><td style="padding:0 22px 16px;color:#2a3548;font-size:15px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(summary)}</td></tr>
        <tr><td style="padding:0 22px 18px;">
          <div style="padding:12px 14px;border-radius:10px;border:1px solid rgba(201,169,97,0.4);background:rgba(201,169,97,0.12);">
            <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#7a6540;font-weight:700;margin-bottom:4px;">Continue in chat</div>
            <a href="${escapeHtml(link)}" style="color:#1a4d8c;font-size:13px;word-break:break-all;">${escapeHtml(link)}</a>
          </div>
        </td></tr>
        <tr><td style="padding:8px 22px 22px;color:#1a2332;font-size:14px;line-height:1.45;white-space:pre-wrap;border-top:1px solid rgba(26,35,50,0.12);">
          —<br>${escapeHtml(signOff).replace(/\n/g, '<br>')}
        </td></tr>
        <tr><td style="padding:0 22px 18px;color:#7a8499;font-size:12px;font-style:italic;">
          Sent by ${escapeHtml(agentName)} via Greenways · transactional Email me this (not a marketing list).
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { plain, html };
}

function createTransport() {
  const user = String(process.env.AGENT_MAIL_SMTP_USER || process.env.GMAIL_USER || '').trim();
  const pass = String(process.env.AGENT_MAIL_SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '').trim();
  if (!user || !pass) {
    const err = new Error('SMTP not configured');
    err.code = 'MAIL_NOT_CONFIGURED';
    throw err;
  }
  return nodemailer.createTransport({
    host: process.env.AGENT_MAIL_SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.AGENT_MAIL_SMTP_PORT || 465),
    secure: String(process.env.AGENT_MAIL_SMTP_SECURE || '1') !== '0',
    auth: { user, pass }
  });
}

/**
 * @param {object} opts
 */
async function sendAgentEmail(opts = {}) {
  const status = getMailStatus();
  if (!status.sendEnabled) {
    const err = new Error('Agent mail send is disabled or SMTP is not configured');
    err.code = 'MAIL_SEND_DISABLED';
    throw err;
  }

  const to = String(opts.to || '').trim().toLowerCase();
  if (!isValidEmail(to)) {
    const err = new Error('Valid to email is required');
    err.code = 'MAIL_BAD_TO';
    throw err;
  }

  const allowlist = getAllowlist();
  if (allowlist.length && !allowlist.includes(to)) {
    const err = new Error('Recipient not on AGENT_MAIL_ALLOWLIST (pilot mode)');
    err.code = 'MAIL_NOT_ALLOWLISTED';
    throw err;
  }

  const agentSlug = String(opts.agentSlug || 'finance-agent').trim();
  const mailbox = getMailbox(agentSlug);
  const subject = String(opts.subject || `${mailbox.subjectPrefix}Your Greenways answer`)
    .trim()
    .slice(0, MAX_SUBJECT_CHARS);
  const summary = String(opts.summary || opts.body || '')
    .trim()
    .slice(0, MAX_BODY_CHARS);
  const greeting = String(opts.greeting || 'Hi,').trim().slice(0, 120);
  const link = String(opts.link || '').trim().slice(0, 500);
  const memberKey = String(opts.memberId || to).trim() || to;

  if (!summary) {
    const err = new Error('summary is required');
    err.code = 'MAIL_BAD_BODY';
    throw err;
  }

  const rate = checkRateLimit(memberKey);
  if (!rate.ok) {
    const err = new Error(`Daily send limit reached (${rate.limit || status.dailyLimit})`);
    err.code = 'MAIL_RATE_LIMIT';
    throw err;
  }

  const { plain, html } = buildBodies({
    greeting,
    summary,
    link: link || `https://energy-calc-backend.onrender.com/greenways/${encodeURIComponent(agentSlug)}`,
    signOff: mailbox.signOff,
    agentName: mailbox.name
  });

  const transport = createTransport();
  const smtpUser = String(process.env.AGENT_MAIL_SMTP_USER || process.env.GMAIL_USER || mailbox.fromAddress).trim();
  const info = await transport.sendMail({
    from: `"${mailbox.fromName.replace(/"/g, '')}" <${smtpUser}>`,
    replyTo: mailbox.replyTo || smtpUser,
    to,
    subject,
    text: plain,
    html
  });

  bumpRateLimit(memberKey);
  const logEntry = {
    at: new Date().toISOString(),
    agentSlug,
    to,
    subject,
    messageId: info.messageId || null,
    memberId: opts.memberId || null
  };
  appendSendLog(logEntry);

  return {
    ok: true,
    messageId: info.messageId || null,
    from: smtpUser,
    to,
    subject,
    agentSlug
  };
}

module.exports = {
  getMailStatus,
  getMailbox,
  sendAgentEmail,
  smtpConfigured,
  DEFAULT_FROM
};
