#!/usr/bin/env node
/**
 * Apply verified primary-link fixes to schemes.json (links[0].url).
 * Run: node scripts/apply-scheme-link-fixes.js
 */

const fs = require('fs');
const path = require('path');

const SCHEMES_PATH = path.join(__dirname, '..', 'schemes.json');

const GOVIE_SEAI_2026 =
  'https://www.gov.ie/en/department-of-climate-energy-and-the-environment/press-releases/minister-obrien-announces-suite-of-new-seai-grant-supports-bringing-energy-upgrades-to-more-and-more-homeowners/';

/** @type {Record<string, string>} */
const PRIMARY_LINK_FIXES = {
  'energy-labelling': 'https://energy.ec.europa.eu/topics/energy-efficiency/energy-label-and-ecodesign_en',
  'nest-wales': 'https://www.gov.wales/nest',
  'seai-heat-pump': GOVIE_SEAI_2026,
  'seai-solar': GOVIE_SEAI_2026,
  'seai-insulation': GOVIE_SEAI_2026,
  'seai-one-stop-shop': GOVIE_SEAI_2026,
  'seai-ev': GOVIE_SEAI_2026,
  'warmer-homes-ie': GOVIE_SEAI_2026,
  spvo: 'https://www.rvo.nl/subsidies-financiering/trp',
  'sol-energy': 'https://www.rvo.nl/subsidies-financiering/isde',
  'wind-energy': 'https://www.rvo.nl/subsidies-financiering/sde',
  'ev-charging': 'https://business.gov.nl/subsidies-and-schemes/?q=laadpalen',
  geothermal: 'https://www.rvo.nl/subsidies-financiering/isde',
  'smart-grid': 'https://www.topsectorenergie.nl/',
  refurbishment: 'https://www.rvo.nl/onderwerpen/wetten-en-regels-gebouwen',
  'geea-label': 'https://www.dena.de/',
  'prime-adapt': 'https://www.anah.gouv.fr/',
  'be-ev-premium': 'https://www.vlaanderen.be/mobiliteit-en-openbare-werken/duurzame-mobiliteit/milieuvriendelijke-voertuigen/premie-voor-aankoop-van-een-zero-emissievoertuig',
  'be-solar-premium': 'https://www.energuide.be/',
  'uci-urban': 'https://www.mivau.gob.es/',
  'es-solar': 'https://www.idae.es/en',
  'pree-building': 'https://www.idae.es/en',
  'es-thermal': 'https://www.idae.es/en',
  'prr-transition': 'https://www.portugal2030.pt/',
  'nl-mia-vamil': 'https://www.rvo.nl/subsidies-financiering/mia-vamil',
  'nl-wbso': 'https://www.rvo.nl/subsidies-financiering/wbso',
  'nl-bmkb-groen': 'https://www.rvo.nl/subsidies-financiering/bmkb',
  'nl-dei-plus': 'https://www.rvo.nl/subsidies-financiering/dei',
  'nl-spril-a': 'https://business.gov.nl/subsidies-and-schemes/?q=SPRILA',
  'nl-flex-e': 'https://www.rvo.nl/subsidies-financiering/flex-e',
  'nl-mit-top-sectors': 'https://www.rvo.nl/subsidies-financiering/mit',
  'nl-dtif': 'https://www.rvo.nl/subsidies-financiering/dutch-trade-and-investment-fund-dtif',
  'nl-veki': 'https://www.rvo.nl/subsidies-financiering/veki'
};

const SEAI_DETAIL_LINKS = {
  'seai-heat-pump': {
    text: '🔥 SEAI heat pump grant',
    url: 'https://www.seai.ie/grants/home-energy-grants/individual-grants/heat-pump-systems'
  },
  'seai-solar': {
    text: '☀️ SEAI solar grant',
    url: 'https://www.seai.ie/grants/home-energy-grants/individual-grants/solar-electricity-grant'
  },
  'seai-insulation': {
    text: '🏠 SEAI insulation grants',
    url: 'https://www.seai.ie/grants/home-energy-grants/individual-grants/insulation-grants'
  },
  'seai-one-stop-shop': {
    text: '🏡 SEAI One Stop Shop',
    url: 'https://www.seai.ie/grants/home-energy-grants'
  },
  'seai-ev': {
    text: '🚗 SEAI EV grants',
    url: 'https://www.seai.ie/grants/electric-vehicle-grants'
  },
  'warmer-homes-ie': {
    text: '🏠 SEAI free upgrades',
    url: 'https://www.seai.ie/grants/home-energy-grants'
  }
};

const schemes = JSON.parse(fs.readFileSync(SCHEMES_PATH, 'utf8'));
let updated = 0;

for (const scheme of schemes) {
  const nextUrl = PRIMARY_LINK_FIXES[scheme.id];
  if (!nextUrl || !Array.isArray(scheme.links) || !scheme.links[0]) continue;
  if (scheme.links[0].url !== nextUrl) {
    scheme.links[0].url = nextUrl;
    scheme.links[0].text = scheme.links[0].text || '📋 Official update';
    scheme.links[0].type = scheme.links[0].type || 'info';
    updated += 1;
  }
  const detail = SEAI_DETAIL_LINKS[scheme.id];
  if (detail) {
    const hasSeai = scheme.links.some((link) => link.url && link.url.includes('seai.ie'));
    if (!hasSeai) {
      scheme.links.push({ text: detail.text, url: detail.url, type: 'apply' });
    }
  }
}

const beEv = schemes.find((s) => s.id === 'be-ev-premium');
if (beEv) {
  beEv.status = 'expired';
  beEv.deadline = '2024-12-31';
  beEv.description =
    'Flanders zero-emission vehicle purchase premium (ended December 2024). Kept for reference — check current green mobility options in Flanders.';
}

fs.writeFileSync(SCHEMES_PATH, `${JSON.stringify(schemes, null, 2)}\n`);
console.log(`Updated ${updated} scheme primary links.`);
