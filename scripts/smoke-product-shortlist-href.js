/**
 * W4 — marketplace open URL contract for agent shortlist + module embed.
 */
'use strict';

function marketplaceHrefFor(id, existing) {
  if (existing) {
    const href = String(existing).trim();
    if (/^https?:\/\//i.test(href)) return href;
    if (href.charAt(0) === '/') return href;
    return '/' + href.replace(/^\.\//, '');
  }
  if (!id) return '';
  return (
    '/product-page-v2-marketplace.html?product=' +
    encodeURIComponent(id) +
    '&fromPopup=true'
  );
}

const sampleId = 'etl_21_29475';
const href = marketplaceHrefFor(sampleId);
if (!href.includes('fromPopup=true')) {
  throw new Error('marketplace href must include fromPopup=true');
}
if (!href.includes(sampleId)) {
  throw new Error('marketplace href must include product id');
}
if (!href.startsWith('/product-page-v2-marketplace.html')) {
  throw new Error('marketplace href must be root-relative');
}

const normalized = marketplaceHrefFor('', './product-page-v2-marketplace.html?product=etl_14_59333&fromPopup=true');
if (!normalized.startsWith('/product-page-v2-marketplace.html')) {
  throw new Error('relative marketplace href must normalize to root path');
}

console.log('OK W4 marketplace href contract');
