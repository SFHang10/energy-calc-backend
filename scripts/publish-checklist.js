const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(
  ROOT,
  'wix-integration',
  'member-content',
  'content-catalog.json'
);

function readCatalog() {
  const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
  return JSON.parse(raw);
}

function isEmpty(value) {
  return !value || String(value).trim().length === 0;
}

function runChecklist() {
  const catalog = readCatalog();
  const items = Array.isArray(catalog.items) ? catalog.items : [];

  const issues = [];
  items.forEach((item) => {
    const id = item.id || '<missing-id>';
    const status = item.status || 'draft';
    const reviewed = item.lastReviewedAt || '';
    const image = item.imageUrl || item.thumbnail || '';

    if (isEmpty(item.id)) issues.push(`${id}: missing id`);
    if (isEmpty(item.title)) issues.push(`${id}: missing title`);
    if (isEmpty(item.type)) issues.push(`${id}: missing type`);
    if (isEmpty(item.url)) issues.push(`${id}: missing url`);
    if (status === 'published' && isEmpty(reviewed)) {
      issues.push(`${id}: published but lastReviewedAt missing`);
    }
    if (isEmpty(image)) {
      issues.push(`${id}: missing imageUrl/thumbnail`);
    }
  });

  console.log('Publish Checklist');
  console.log('=================');
  console.log(`Catalog items: ${items.length}`);
  console.log('');

  if (!issues.length) {
    console.log('✅ No issues found.');
    process.exit(0);
  }

  console.log('⚠️ Issues found:');
  issues.forEach((issue) => console.log(`- ${issue}`));
  process.exit(1);
}

try {
  runChecklist();
} catch (error) {
  console.error('Checklist failed:', error.message);
  process.exit(1);
}
