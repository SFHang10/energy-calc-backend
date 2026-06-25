/**
 * Subtle "Agent Story" link for newcomers — appended to compose hint (not header / quick links).
 */
(function (global) {
  'use strict';

  var STORY_HREF = '/greenways/agents-story';

  function injectStoryLink() {
    var hint = document.querySelector('.chat-compose .compose-hint');
    if (!hint || hint.querySelector('.gw-agent-story-link')) return;

    hint.appendChild(document.createTextNode(' · '));

    var link = document.createElement('a');
    link.className = 'gw-agent-story-link';
    link.href = STORY_HREF;
    link.target = '_top';
    link.rel = 'noopener';
    link.textContent = 'Agent Story';
    link.title = 'Why the Greenways Transition Portal and agents exist';
    hint.appendChild(link);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStoryLink);
  } else {
    injectStoryLink();
  }
})(window);
