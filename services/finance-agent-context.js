const { findMarketRow } = require('./finance-agent-energy');
const { REGION_LABELS } = require('./greenways-agent-shared');

function monthlyBillFromProfile(profile = {}) {
  const n = Number(profile.monthlyBillEur || profile.monthlyBill || profile.billEur || profile.energyBillEur);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function profileContextLine(profile = {}) {
  const region = REGION_LABELS[profile.region] || null;
  const bill = monthlyBillFromProfile(profile);
  if (region && bill) {
    return `**Your context:** ${region} · ~€${bill.toLocaleString('en-GB')}/mo on energy (from your profile). I'll keep numbers in that ballpark.`;
  }
  if (region) {
    return `**Your context:** ${region}. Share a **rough monthly energy bill** (or open **Site Brief**) and I'll size payback in your numbers—not generic demos only.`;
  }
  return `**Quick start:** tell me your **region** and **rough monthly energy bill** (e.g. "NL, €2,800/mo") so I can ground the maths.`;
}

function profileContextPrompt(profile = {}) {
  if (profile.region && monthlyBillFromProfile(profile)) return '';
  return 'Set **region + monthly bill** in your team profile, or say them in chat—I reuse them for every payback answer.';
}

function fundingStackGuide() {
  return (
    '**Funding stack (typical order)**\n' +
    '1. **Grants / subsidies** → ask **Andrieus** — non-repayable capex first\n' +
    '2. **Gap left?** → **BNPL** for smaller kit · **equipment finance** for leased lines · **green loans** for larger retrofits\n' +
    '3. **Always** run **savings projection** before you sign monthly payments\n' +
    '4. **Retail tariff** may lag wholesale—pair ticker context with **Finance Finder**, not supplier quotes from me alone'
  );
}

function paybackSensitivityLine(snapshot, profile = {}, baseMonths = 24) {
  const tariffs = snapshot && snapshot.modellingTariffs;
  const elec = Number(tariffs && tariffs.electricityEurPerKwh) || 0.3;
  if (!Number.isFinite(elec) || elec <= 0) return '';
  const up = Math.max(1, Math.round(baseMonths * 1.2));
  const down = Math.max(1, Math.round(baseMonths * 0.92));
  const row = findMarketRow(snapshot, profile);
  const market = row ? row.name : 'your market';
  return (
    `**Sensitivity (illustrative fridge-class upgrade, ~${baseMonths} mo at €${elec.toFixed(2)}/kWh model):** ` +
    `wholesale **+20%** in ${market} stretches payback toward **~${up} mo**; **−10%** toward **~${down} mo**. ` +
    'Efficient equipment still wins on kWh—you buy less at any price.'
  );
}

function buildGroundedUpgradeCase(profile = {}, snapshot = {}, product = {}) {
  const id = product.id || 'etl_14_86293';
  const label = product.label || 'Commercial freezer upgrade';
  const elec = Number(snapshot.modellingTariffs && snapshot.modellingTariffs.electricityEurPerKwh) || 0.3;
  const savingsKwhMo = 420;
  const savingsEurMo = Math.round(savingsKwhMo * elec * 0.85);
  const capexEur = 4200;
  const grantEur = 1050;
  const netCapex = capexEur - grantEur;
  const paybackMo = savingsEurMo > 0 ? (netCapex / savingsEurMo).toFixed(1) : '—';
  const bill = monthlyBillFromProfile(profile);
  const billNote = bill
    ? ` On a **€${bill.toLocaleString('en-GB')}/mo** site, €${savingsEurMo}/mo savings is roughly **${Math.round((savingsEurMo / bill) * 100)}%** of energy spend.`
    : '';

  return (
    `**Example case — ${label}** (\`${id}\`)\n` +
    `- **Capex** ~€${capexEur.toLocaleString('en-GB')} · **grant chip** ~€${grantEur.toLocaleString('en-GB')} (illustrative) → **net ~€${netCapex.toLocaleString('en-GB')}**\n` +
    `- **Modelled saving** ~€${savingsEurMo}/mo at €${elec.toFixed(2)}/kWh · **payback ~${paybackMo} mo** on net capex${billNote}\n` +
    '- Next: open **savings projection** with your figures, then **Finance Finder** for the gap'
  );
}

module.exports = {
  monthlyBillFromProfile,
  profileContextLine,
  profileContextPrompt,
  fundingStackGuide,
  paybackSensitivityLine,
  buildGroundedUpgradeCase
};
