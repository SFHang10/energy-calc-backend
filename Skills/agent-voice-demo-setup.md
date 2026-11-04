# Agent voice demo setup (SkillBoss TTS)

**Demo cast:** Andrieus · Vincent · Zara · Artemis  
**Config:** `data/greenways-agent-voice-config.json`  
**Client:** `HTMLS GWM GWB/js/greenways-agent-voice.js`  
**Server:** `POST /api/agent-voice/tts` · `GET /api/agent-voice/health`

---

## 1. Render environment

| Variable | Value |
|----------|--------|
| `SKILLBOSS_API_KEY` | Agent Sky / SkillBoss API key (paste from your local notes file — **never commit** `SKLBASKY.txt`) |
| `AGENT_VOICE_TTS_PROVIDER` | `skillboss` (recommended) |
| `ELEVENLABS_API_KEY` | Leave **unset** unless testing direct ElevenLabs |

Local only: copy the key into `.env` as `SKILLBOSS_API_KEY=...` (gitignored). Do not add key files to the repo.

Redeploy → `GET …/api/agent-voice/health` → `ttsAvailable: true`, `active: "skillboss"`.  
Live API test (uses a tiny TTS call): `GET …/api/agent-voice/health?probe=1` → `probe.ok: true` and `probe.bytes` > 0.

---

## 2. Local / CI smoke

```bash
# .env with SKILLBOSS_API_KEY
npm run smoke:agent-voice
```

---

## 3. Demo URLs (mic + premium listen)

Use **full page** (no `?embed=1`):

| Agent | URL |
|-------|-----|
| Andrieus | `/greenways/grants-agent` |
| Vincent | `/greenways/finance-agent` |
| Zara | `/greenways/deals-agent` |
| Artemis | `/greenways/equipment-agent` |

Chrome → welcome tag → ask → **Listen** on `spokenSummary`. **Speak** for mic input.

Wix iframe: mic may fail — link to full Render URL (see `WIX-GREENWAYS-AGENTS-EMBED.md` § Voice).

---

## 4. Suggested demo questions

- **Andrieus:** “What grants might help a UK restaurant upgrade refrigeration?”
- **Vincent:** “What’s the wholesale energy picture for the Netherlands?”
- **Zara:** “Show me water and sustainability deals this month.”
- **Artemis:** “Where should we start with kitchen equipment upgrades?”

---

## 5. Swap voices

Edit `voiceId` + `voiceNote` per slug in voice config (ElevenLabs premade IDs via SkillBoss). Run `node scripts/sync-greenways-agent-voice.js` only if HTML shells need re-wiring — config is loaded at runtime from `/data/greenways-agent-voice-config.json`.

---

## 6. Later

- Lip-sync / animated portraits: separate from TTS; keep stable `voiceId` per character.
- Expand cast: set `useServerTts: true` on remaining agents in voice config.
- Agent email on SkillBoss: Wave 9 — SMTP today (`AGENT_MAIL_*`).
