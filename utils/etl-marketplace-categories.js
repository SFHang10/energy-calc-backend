/**
 * ETL official technology labels for marketplace display (8 tiles).
 * Database category/subcategory fields are unchanged; only displayCategory / shopCategory.
 * @see https://api.etl.energysecurity.gov.uk/api/v1/technologies
 */

/** Internal bucket names used by categorization logic (unchanged). */
const MARKETPLACE_BUCKETS = [
  'Heat Pumps',
  'Motor Drives',
  'HVAC Equipment',
  'Heating Equipment',
  'Lighting',
  'Ovens',
  'Hand Dryers',
  'Fridges and Freezers',
];

/** ETL website technology wording for marketplace tiles. */
const BUCKET_TO_ETL_DISPLAY = {
  'Heat Pumps': 'Heat Pumps',
  'Motor Drives': 'Motors, Drives & Fans',
  'HVAC Equipment': 'Heating, Ventilation and Air Conditioning (HVAC) Equipment',
  'Heating Equipment': 'Boiler Equipment',
  'Lighting': 'Lighting',
  'Ovens': 'Professional Foodservice Equipment',
  'Hand Dryers': 'Hand Dryers',
  'Fridges and Freezers': 'Refrigeration Equipment',
};

/** Old tile labels → ETL display (bookmarks / Wix links). */
const LEGACY_DISPLAY_TO_ETL = { ...BUCKET_TO_ETL_DISPLAY };

const ETL_DISPLAY_TO_LEGACY = Object.fromEntries(
  Object.entries(BUCKET_TO_ETL_DISPLAY).map(([legacy, etl]) => [etl, legacy])
);

const MARKETPLACE_ETL_DISPLAY_NAMES = MARKETPLACE_BUCKETS.map((b) => BUCKET_TO_ETL_DISPLAY[b]);

function isEtlMarketplaceProduct(productMeta = {}) {
  const id = productMeta.id || productMeta.productId || '';
  const source = (productMeta.source || '').toString();
  return (typeof id === 'string' && id.startsWith('etl_')) || source === 'ETL';
}

function getEtlMarketplaceDisplayName(marketplaceBucket) {
  return BUCKET_TO_ETL_DISPLAY[marketplaceBucket] || marketplaceBucket;
}

function resolveMarketplaceCategoryParam(categoryParam) {
  if (!categoryParam) return categoryParam;
  return LEGACY_DISPLAY_TO_ETL[categoryParam] || categoryParam;
}

function productMatchesMarketplaceCategory(product, etlDisplayName) {
  const legacy = ETL_DISPLAY_TO_LEGACY[etlDisplayName];
  const labels = [etlDisplayName, legacy].filter(Boolean);
  return labels.some(
    (label) => product.displayCategory === label || product.shopCategory === label
  );
}

module.exports = {
  MARKETPLACE_BUCKETS,
  BUCKET_TO_ETL_DISPLAY,
  LEGACY_DISPLAY_TO_ETL,
  ETL_DISPLAY_TO_LEGACY,
  MARKETPLACE_ETL_DISPLAY_NAMES,
  isEtlMarketplaceProduct,
  getEtlMarketplaceDisplayName,
  resolveMarketplaceCategoryParam,
  productMatchesMarketplaceCategory,
};
