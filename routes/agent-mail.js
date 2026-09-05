const express = require('express');
const { getMailStatus, sendAgentEmail } = require('../services/agent-mail-service');

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json(getMailStatus());
});

router.get('/health', (_req, res) => {
  const status = getMailStatus();
  res.json({ ...status, health: 'ok' });
});

/**
 * POST /api/agent-mail/send
 * Body: { to, agentSlug, subject, summary, greeting, link, memberId }
 */
router.post('/send', async (req, res) => {
  try {
    const result = await sendAgentEmail({
      to: req.body?.to,
      agentSlug: req.body?.agentSlug,
      subject: req.body?.subject,
      summary: req.body?.summary || req.body?.body,
      greeting: req.body?.greeting,
      link: req.body?.link,
      memberId: req.body?.memberId
    });
    return res.json(result);
  } catch (error) {
    const code = error.code || 'MAIL_ERROR';
    const status =
      code === 'MAIL_SEND_DISABLED' || code === 'MAIL_NOT_CONFIGURED'
        ? 503
        : code === 'MAIL_RATE_LIMIT'
          ? 429
          : code === 'MAIL_BAD_TO' || code === 'MAIL_BAD_BODY' || code === 'MAIL_NOT_ALLOWLISTED'
            ? 400
            : 500;
    console.error('agent-mail send error:', code, error.message);
    return res.status(status).json({
      ok: false,
      error: error.message || 'Send failed',
      code
    });
  }
});

module.exports = router;
