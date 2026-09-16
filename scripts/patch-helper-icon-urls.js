/**
 * One-shot: add iconUrl to HELPERS in agent HTML pages.
 * Run: node scripts/patch-helper-icon-urls.js
 */
const fs = require('fs');
const path = require('path');

const GWB = path.join(__dirname, '..', 'HTMLS GWM GWB');
const U = (id) => `https://static.wixstatic.com/media/${id}`;

const MAPS = {
  'greenways-grants-agent.html': {
    byId: {
      nl: U('c123de_6fc35ea9558a4d89ae9f1f1f18241328~mv2.webp'),
      eu: U('c123de_1d4e923ece2f4e91ad1076ef65d502b5~mv2.png'),
      equip: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      deadline: U('c123de_2b7453bb263942a08c5b8aab85be69ea~mv2.jpeg'),
      product: U('c123de_af9734cf96c8440885b17834b2548528~mv2.png')
    }
  },
  'greenways-finance-agent.html': {
    byId: {
      prices: U('c123de_a7746ac7981d466095fdc261bb208fa8~mv2.jpg'),
      etl: U('c123de_bf1ad7e1c10d44349f9927401a3ab550~mv2.png'),
      calc: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      audit: U('c123de_0d7afe9e21764df285cc2a357e218ddd~mv2.webp'),
      upgrade: U('c123de_3e2c2ae921094adb867970a6ec792f35~mv2.png'),
      bnpl: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      loans: U('c123de_1fe1c58ec83544f0b0eaf57cf9ac4e02~mv2.avif'),
      payback: U('c123de_988c141478e044d5ba8d137d2a451713~mv2.png'),
      portal: U('c123de_1fe1c58ec83544f0b0eaf57cf9ac4e02~mv2.avif'),
      news: U('c123de_30cd3bb450684c64b1069fdaaae7ab7d~mv2.jpeg'),
      funding: U('c123de_6fc35ea9558a4d89ae9f1f1f18241328~mv2.webp')
    }
  },
  'greenways-equipment-agent.html': {
    byId: {
      kitchen: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      reno: U('c123de_538ebcd0cb8744009c22d5676cb8a5da~mv2.jpg'),
      insul: U('c123de_1d4e923ece2f4e91ad1076ef65d502b5~mv2.png'),
      cold: U('c123de_af9734cf96c8440885b17834b2548528~mv2.png'),
      hvac: U('c123de_cf3c9a53550d498589191bb008fe08fa~mv2.jpeg'),
      deep: U('c123de_957ddf8c995e441cb9d1535015adbdf4~mv2.jpg')
    }
  },
  'greenways-deals-agent.html': {
    byId: {
      products: U('c123de_730cc6f6f243445aae3dffd962cf6706~mv2.jpg'),
      compare: U('c123de_374114018b1b4defa5fc6475cae63ce2~mv2.jpeg'),
      nl: U('c123de_6fc35ea9558a4d89ae9f1f1f18241328~mv2.webp'),
      water: U('c123de_6636e625d6e24fbfad80468144c585f9~mv2.jpeg'),
      catalog: U('c123de_f9c0cade510541d9a5953df184d442f8~mv2.jpeg'),
      page: U('c123de_c7cdbed4a4ee407289677a4f0079c1e5~mv2.png')
    }
  },
  'greenways-media-agent.html': {
    byId: {
      policy: U('c123de_30cd3bb450684c64b1069fdaaae7ab7d~mv2.jpeg'),
      funding: U('c123de_6fc35ea9558a4d89ae9f1f1f18241328~mv2.webp'),
      video: U('c123de_18dbdb1160fe4048bf54df3de814ba32~mv2.jpg'),
      rest: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      news: U('c123de_333c90ab8930465a98b503e1d24316b4~mv2.png'),
      map: U('c123de_f9c0cade510541d9a5953df184d442f8~mv2.jpeg')
    }
  },
  'greenways-sustainable-products-agent.html': {
    byId: {
      water: U('c123de_82c7779bdacd41fd8b9e26891e32baa2~mv2.jpg'),
      elec: U('c123de_bf1ad7e1c10d44349f9927401a3ab550~mv2.png'),
      gas: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      spot: U('c123de_c7cdbed4a4ee407289677a4f0079c1e5~mv2.png'),
      sources: U('c123de_dc5b2e3e4aef4cc4b75c7b44888281bd~mv2.png'),
      portal: U('c123de_6636e625d6e24fbfad80468144c585f9~mv2.jpeg')
    }
  },
  'greenways-systems-agent.html': {
    byName: {
      'Systems innovation': U('c123de_eeb61cbf84bd402eb642e28b2b457c76~mv2.png'),
      'Why monitor?': U('c123de_e57c85ae1f0e4e59b2b6e1abece7df19~mv2.jpeg'),
      Restaurant: U('c123de_281b24bf85fc4b2d8cf13e3a6cefcf92~mv2.jpeg'),
      Home: U('c123de_0d7afe9e21764df285cc2a357e218ddd~mv2.webp'),
      Reviews: U('c123de_cf3c9a53550d498589191bb008fe08fa~mv2.jpeg'),
      'Energy dashboard': U('c123de_eeb61cbf84bd402eb642e28b2b457c76~mv2.png'),
      'Dashboard maths': U('c123de_a7746ac7981d466095fdc261bb208fa8~mv2.jpg'),
      'Peak vs off-peak': U('c123de_0d7afe9e21764df285cc2a357e218ddd~mv2.webp'),
      'ETL examples': U('c123de_bf1ad7e1c10d44349f9927401a3ab550~mv2.png'),
      'Deep dive': U('c123de_957ddf8c995e441cb9d1535015adbdf4~mv2.jpg'),
      'Platform health': U('c123de_eeb61cbf84bd402eb642e28b2b457c76~mv2.png')
    }
  }
};

function patchHelpersBlock(block, map) {
  const byId = map.byId || {};
  const byName = map.byName || {};
  let added = 0;

  const patched = block.replace(/\{[^{}]*\}/g, (obj) => {
    if (obj.includes('iconUrl')) return obj;
    const idM = obj.match(/id:\s*"([^"]+)"/);
    const nameM = obj.match(/name:\s*"([^"]+)"/);
    const url =
      (idM && byId[idM[1]]) ||
      (nameM && byName[nameM[1]]) ||
      null;
    if (!url) return obj;
    if (!/icon:\s*"/.test(obj)) return obj;
    added += 1;
    return obj.replace(/icon:\s*"[^"]*"/, (m) => `${m},\n      iconUrl: "${url}"`);
  });

  return { patched, added };
}

let total = 0;
for (const [file, map] of Object.entries(MAPS)) {
  const fp = path.join(GWB, file);
  let html = fs.readFileSync(fp, 'utf8');
  const start = html.indexOf('const HELPERS = [');
  if (start < 0) {
    console.log('SKIP (no HELPERS)', file);
    continue;
  }
  const end = html.indexOf('];', start);
  if (end < 0) {
    console.log('SKIP (no end)', file);
    continue;
  }
  const block = html.slice(start, end + 2);
  const { patched, added } = patchHelpersBlock(block, map);
  html = html.slice(0, start) + patched + html.slice(end + 2);
  fs.writeFileSync(fp, html);
  total += added;
  console.log(file, 'added', added);
}
console.log('total', total);
