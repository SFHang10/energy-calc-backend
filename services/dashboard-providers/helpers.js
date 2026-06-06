function toNum(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toArray(values, fallback = []) {
  return Array.isArray(values) && values.length > 0 ? values : fallback;
}

module.exports = {
  toNum,
  toArray
};
