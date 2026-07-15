/**
 * Smoke — US-027 member auto-speak wiring (no browser).
 * Run: node scripts/smoke-agent-voice-auto-speak.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const GWB = path.join(ROOT, 'HTMLS GWM GWB');
const AGENTS = [
  'greenways-grants-agent.html',
  'greenways-finance-agent.html',
  'greenways-equipment-agent.html',
  'greenways-deals-agent.html',
  'greenways-media-agent.html',
  'greenways-sustainable-products-agent.html',
  'greenways-systems-agent.html'
];

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function loadVoiceApi() {
  const src = fs.readFileSync(path.join(GWB, 'js', 'greenways-agent-voice.js'), 'utf8');
  const store = Object.create(null);
  const sandbox = {
    console,
    localStorage: {
      getItem(k) {
        return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
      },
      setItem(k, v) {
        store[k] = String(v);
      },
      removeItem(k) {
        delete store[k];
      }
    },
    speechSynthesis: { cancel() {}, speak() {} },
    SpeechRecognition: function SpeechRecognition() {},
    SpeechSynthesisUtterance: function SpeechSynthesisUtterance() {},
    fetch: async () => ({ ok: false }),
    URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
    Audio: function Audio() {},
    document: { querySelector: () => null },
    addEventListener() {},
    location: { pathname: '/greenways/grants-agent' }
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  vm.runInNewContext(src, sandbox);
  assert(sandbox.GreenwaysAgentVoice, 'GreenwaysAgentVoice not exported');
  return { api: sandbox.GreenwaysAgentVoice, store };
}

function main() {
  for (const name of AGENTS) {
    const html = fs.readFileSync(path.join(GWB, name), 'utf8');
    assert(html.includes('id="voice-auto-btn"'), `${name}: missing voice-auto-btn`);
    assert(
      html.includes('autoSpeakBtn: document.getElementById("voice-auto-btn")'),
      `${name}: init missing autoSpeakBtn`
    );
    assert(html.includes('getProfile:'), `${name}: init missing getProfile`);
  }
  console.log('OK all seven agent shells wire auto-listen button');

  const css = fs.readFileSync(path.join(GWB, 'js', 'greenways-agent-voice.css'), 'utf8');
  assert(css.includes('.gw-voice-btn.is-on'), 'voice.css missing .is-on');
  console.log('OK voice.css auto-listen styles');

  const js = fs.readFileSync(path.join(GWB, 'js', 'greenways-agent-voice.js'), 'utf8');
  assert(js.includes('gw-voice-listen-mode-v1'), 'listen mode key missing');
  assert(js.includes('state.member'), 'member gate missing in maybeAutoSpeak');
  assert(js.includes('Stop reading aloud'), 'stop control label missing');
  console.log('OK voice.js member gate + stop control');

  const { api, store } = loadVoiceApi();
  assert(api.isMemberProfile({ tier: 'member' }) === true, 'member tier should pass');
  assert(api.isMemberProfile({ tier: 'guest' }) === false, 'guest tier should fail');
  assert(api.isMemberProfile({}) === false, 'empty profile should fail');
  console.log('OK isMemberProfile gates on tier=member');

  api.setListenMode(true);
  assert(store[api.LISTEN_MODE_KEY] === '1', 'listen mode should persist');
  assert(api.getListenMode() === true, 'getListenMode true');
  api.setListenMode(false);
  assert(api.getListenMode() === false, 'getListenMode false after off');
  console.log('OK listen mode localStorage toggle');

  console.log('\nAll US-027 auto-speak smokes passed.');
}

main();
