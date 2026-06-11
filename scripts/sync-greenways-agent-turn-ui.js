/**
 * Wire shared split/tablet turn UI into all Greenways agent HTML pages.
 * Run: node scripts/sync-greenways-agent-turn-ui.js
 */
const fs = require('fs');
const path = require('path');

const GWB = path.join(__dirname, '..', 'HTMLS GWM GWB');
const AGENTS = [
  { file: 'greenways-grants-agent.html', avatar: '🏛️' },
  { file: 'greenways-finance-agent.html', avatar: '💶' },
  { file: 'greenways-equipment-agent.html', avatar: '🍳' },
  { file: 'greenways-deals-agent.html', avatar: '⚡' },
  { file: 'greenways-media-agent.html', avatar: '📰' },
  { file: 'greenways-sustainable-products-agent.html', avatar: '🌿' },
  { file: 'greenways-systems-agent.html', avatar: '⚙️' }
];

const CSS_LINK = '<link rel="stylesheet" href="js/greenways-agent-turn-ui.css">';
const JS_SCRIPT = '<script src="js/greenways-agent-turn-ui.js"></script>';

function ensureAssets(html) {
  let out = html;
  if (!out.includes('greenways-agent-turn-ui.css')) {
    out = out.replace(
      /(<link[^>]+fonts\.googleapis\.com[^>]+>)/,
      `$1\n${CSS_LINK}`
    );
  }
  if (!out.includes('greenways-agent-turn-ui.js')) {
    out = out.replace(/(<script>\s*\n?\(function \(\) \{)/, `${JS_SCRIPT}\n$1`);
  }
  return out;
}

function removeLegacyTurnFunctions(html) {
  const startMarkers = [
    'function encodeSchemePayload(scheme)',
    'function introFromAnswer(answer)',
    'function schemeChipsHtml(suggestions)'
  ];
  let start = -1;
  for (const m of startMarkers) {
    const i = html.indexOf(m);
    if (i !== -1 && (start === -1 || i < start)) start = i;
  }
  if (start === -1) return html;

  const endMarker = 'function followUpChips(';
  const end = html.indexOf(endMarker, start);
  if (end === -1) return html;

  return html.slice(0, start) + html.slice(end);
}

function insertTurnUiHelpers(html, avatar) {
  if (html.includes('AGENT_TURN_AVATAR')) return html;
  const snippet = `
  var TurnUi = window.GreenwaysAgentTurnUi;
  var AGENT_TURN_AVATAR = "${avatar}";

  function buildAgentTurnParts(rawAnswer, suggestions, blocks, meta) {
    return TurnUi.buildParts(rawAnswer, suggestions, blocks, meta, {
      escapeHtml: escapeHtml,
      formatAnswer: formatAnswer
    });
  }

  function applySplitRowClasses(row, bubble, useSplit) {
    TurnUi.applySplitClasses(row, bubble, useSplit);
  }

  function renderAgentBubbleContent(turn) {
    var profile = getProfile();
    var parts = buildAgentTurnParts(
      turn.answer || "",
      turn.suggestions || [],
      turn.blocks || [],
      {
        footHtml:
          followUpChips(turn.intentId, profile, turn.question || "") +
          '<span class="source-pill">' + escapeHtml(sourceLabel(turn.source)) + "</span>"
      }
    );
    return TurnUi.layoutHtml(parts, AGENT_TURN_AVATAR);
  }

`;
  return html.replace(
    /(function formatAnswer\(text\) \{[\s\S]*?return "<p>" \+ t \+ "<\/p>";\s*\})/,
    `$1${snippet}`
  );
}

function patchFinishAgentTurn(html) {
  if (html.includes('TurnUi.revealTyped(el, parts')) return html;

  html = html.replace(
    /function finishAgentTurn\(el, payload\) \{([\s\S]*?)const answer = payload\.answer[\s\S]*?const suggestions = payload\.suggestions \|\| \[\];/,
    function (match, head) {
      if (match.includes('payload.blocks')) return match;
      return (
        'function finishAgentTurn(el, payload) {' +
        head +
        'const answer = payload.answer || "I could not answer that yet.";\n    const suggestions = payload.suggestions || [];\n    const blocks = payload.blocks || [];'
      );
    }
  );

  html = html.replace(
    /const tail =[\s\S]*?revealTypedAnswer\(el, (?:displayAnswer|answer), tail, function \(\) \{/,
    `const parts = buildAgentTurnParts(answer, suggestions, blocks, {
      footHtml:
        followUpChips(intentId, profile, payload.question || lastQuestion) +
        '<span class="source-pill">' + escapeHtml(src) + "</span>"
    });

    TurnUi.revealTyped(el, parts, {
      thread: thread,
      formatAnswer: formatAnswer,
      avatarEmoji: AGENT_TURN_AVATAR
    }, function () {`
  );

  html = html.replace(
    /revealTypedAnswer\(el, displayAnswer, tail, function \(\) \{/g,
    `TurnUi.revealTyped(el, parts, {
      thread: thread,
      formatAnswer: formatAnswer,
      avatarEmoji: AGENT_TURN_AVATAR
    }, function () {`
  );

  if (!html.includes('blocks: payload.blocks')) {
    html = html.replace(
      /(suggestions: payload\.suggestions \|\| \[\],)\n(\s+source:)/,
      '$1\n        blocks: payload.blocks || [],\n$2'
    );
  }

  return html;
}

function patchRestoreSession(html) {
  if (html.includes('renderAgentBubbleContent(turn)')) {
    html = html.replace(
      /const id = appendMessage\("agent", formatAnswer[\s\S]*?sessionTurns\.push\(turn\);/,
      `const id = appendMessage("agent", "", "");
          const el = document.getElementById(id);
          if (el) {
            const bubble = el.querySelector(".msg-bubble");
            if (bubble) {
              bubble.innerHTML = renderAgentBubbleContent(turn);
              const parts = buildAgentTurnParts(
                turn.answer || "",
                turn.suggestions || [],
                turn.blocks || [],
                {
                  footHtml:
                    followUpChips(turn.intentId, getProfile(), turn.question || "") +
                    '<span class="source-pill">' + escapeHtml(sourceLabel(turn.source)) + "</span>"
                }
              );
              applySplitRowClasses(el, bubble, parts.useSplit);
            }
          }
          sessionTurns.push(turn);`
    );
  }
  return html;
}

function removeOldRevealTyped(html) {
  return html.replace(
    /function revealTypedAnswer\(el,[\s\S]*?\n  \}\n\n  function finishAgentTurn/,
    'function finishAgentTurn'
  );
}

function patchOfflineCompare(html) {
  return html.replace(
    /Deploy \/api\/grants-agent\/compare for full catalogue detail\./g,
    'Use the scheme cards on the right for full detail and official links.'
  );
}

for (const agent of AGENTS) {
  const filePath = path.join(GWB, agent.file);
  let html = fs.readFileSync(filePath, 'utf8');
  html = ensureAssets(html);
  html = removeLegacyTurnFunctions(html);
  html = insertTurnUiHelpers(html, agent.avatar);
  html = removeOldRevealTyped(html);
  html = patchFinishAgentTurn(html);
  html = patchRestoreSession(html);
  html = patchOfflineCompare(html);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Patched', agent.file);
}

console.log('Done.');
