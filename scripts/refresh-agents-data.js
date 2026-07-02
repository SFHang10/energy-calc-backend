#!/usr/bin/env node
/**
 * Staff playbook runner — lists or executes the agents data refresh pipeline.
 * See Skills/agents-data-refresh-playbook.md and data/agents-data-pipeline.json
 *
 * Usage:
 *   node scripts/refresh-agents-data.js --dry-run     (default — print checklist)
 *   node scripts/refresh-agents-data.js --validate    (run validator smokes only)
 *   node scripts/refresh-agents-data.js --step integrator
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PIPELINE_PATH = path.join(ROOT, 'data', 'agents-data-pipeline.json');

function loadPipeline() {
  const raw = fs.readFileSync(PIPELINE_PATH, 'utf8');
  return JSON.parse(raw);
}

function printHeader(pipeline) {
  console.log('\nGreenways agents data refresh');
  console.log('Playbook:', pipeline.playbookSkill);
  console.log('Admin:', pipeline.staffLinks?.agentsAdmin);
  console.log('Map:', pipeline.staffLinks?.agentsAdminMap);
  console.log('Verify:', pipeline.verify?.hint || 'systems-agent status');
  console.log('');
}

function printChecklist(pipeline) {
  console.log('--- Tier 1 (edit before rebuild) ---');
  (pipeline.tiers?.[0]?.paths || []).forEach((p) => console.log('  •', p));
  console.log('\n--- Pipeline (run matching steps only) ---');
  (pipeline.pipeline || []).forEach((step, i) => {
    console.log(`  ${i + 1}. [${step.id}] ${step.label}`);
    console.log(`     ${step.command}`);
    console.log(`     When: ${step.when}`);
  });
  console.log('\n--- Validators (after rebuild) ---');
  (pipeline.validators || []).forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.label}: ${v.command}`);
  });
  console.log('\nDry-run only. Re-run with --step <id> or --validate to execute.\n');
}

function runCommand(command, label) {
  console.log(`\n▶ ${label}\n   ${command}\n`);
  const isWin = process.platform === 'win32';
  const result = spawnSync(command, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
    env: process.env
  });
  if (result.status !== 0) {
    console.error(`\n✗ Failed: ${label} (exit ${result.status})`);
    process.exit(result.status || 1);
  }
  console.log(`\n✓ Done: ${label}`);
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.length === 0;
  const validate = args.includes('--validate');
  const stepIdx = args.indexOf('--step');
  const stepId = stepIdx >= 0 ? args[stepIdx + 1] : null;

  const pipeline = loadPipeline();
  printHeader(pipeline);

  if (validate) {
    (pipeline.validators || []).forEach((v) => runCommand(v.command, v.label));
    console.log('\nValidators passed.\n');
    return;
  }

  if (stepId) {
    const step = (pipeline.pipeline || []).find((s) => s.id === stepId);
    if (!step) {
      console.error(`Unknown step id: ${stepId}`);
      console.error('Available:', (pipeline.pipeline || []).map((s) => s.id).join(', '));
      process.exit(1);
    }
    runCommand(step.command, step.label);
    return;
  }

  if (dryRun) {
    printChecklist(pipeline);
    return;
  }

  printChecklist(pipeline);
}

main();
