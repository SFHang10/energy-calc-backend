/**
 * Fix finishAgentTurn after sync-greenways-agent-turn-ui.js
 */
const fs = require('fs');
const path = require('path');

const GWB = path.join(__dirname, '..', 'HTMLS GWM GWB');

const CHAT_AGENTS = [
  'greenways-grants-agent.html',
  'greenways-finance-agent.html',
  'greenways-equipment-agent.html',
  'greenways-deals-agent.html',
  'greenways-media-agent.html',
  'greenways-sustainable-products-agent.html'
];

const FINISH_TEMPLATE = `  function finishAgentTurn(el, payload) {
    const profile = getProfile();
    const answer = payload.answer || "I could not answer that yet.";
    const suggestions = payload.suggestions || [];
    const blocks = payload.blocks || [];
    const src = sourceLabel(payload.source);
    const intentId = payload.intentId || null;
    lastIntentId = intentId;
    lastQuestion = payload.question || lastQuestion;

    if (payload.productSamples && payload.productSamples.length) {
      paintBannerProducts(payload.productSamples);
    }

    const parts = buildAgentTurnParts(answer, suggestions, blocks, {
      footHtml:
        followUpChips(intentId, profile, payload.question || lastQuestion) +
        '<span class="source-pill">' + escapeHtml(src) + "</span>"
    });

    TurnUi.revealTyped(el, parts, {
      thread: thread,
      formatAnswer: formatAnswer,
      avatarEmoji: AGENT_TURN_AVATAR
    }, function () {
      __POST_REVEAL__
      sessionTurns.push({
        role: "agent",
        question: payload.question || "",
        answer: answer,
        suggestions: payload.suggestions || [],
        blocks: payload.blocks || [],
        source: payload.source || "",
        intentId: intentId
      });
      saveSession();
    });

    setStatus("Answered · " + src, payload.source === "llm" ? "ok" : "warn");
  }`;

for (const file of CHAT_AGENTS) {
  let html = fs.readFileSync(path.join(GWB, file), 'utf8');

  html = html.replace(/\n  function revealTypedAnswer\([\s\S]*?\n  \}\n\n  function finishAgentTurn/g, '\n  function finishAgentTurn');

  const postReveal = file.includes('grants')
    ? 'updateCompareUi();\n      showQuickReplies(intentId, profile);'
    : 'showQuickReplies(intentId, profile);';

  const replacement = FINISH_TEMPLATE.replace('__POST_REVEAL__', postReveal);

  html = html.replace(/  function finishAgentTurn\(el, payload\) \{[\s\S]*?\n  \}\n\n  function saveSession/, replacement + '\n\n  function saveSession');

  fs.writeFileSync(path.join(GWB, file), html, 'utf8');
  console.log('Fixed', file);
}

console.log('Done.');
