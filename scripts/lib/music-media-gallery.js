/**
 * Shared mediaGallery helpers for music venue pipeline.
 */

const GALLERY_MAX = 8;

function normalizeGalleryItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const type = String(raw.type || '').toLowerCase();
  if (type === 'image') {
    const url = String(raw.url || '').trim();
    if (!url || !/^https?:\/\//i.test(url)) return null;
    return {
      type: 'image',
      url: url.slice(0, 500),
      caption: String(raw.caption || '').trim().slice(0, 160)
    };
  }
  if (type === 'youtube' || type === 'video') {
    const id = String(raw.id || raw.youtubeId || '').trim().slice(0, 40);
    if (!id || !/^[a-zA-Z0-9_-]{6,20}$/.test(id)) return null;
    return {
      type: 'youtube',
      id,
      title: String(raw.title || raw.caption || '').trim().slice(0, 120)
    };
  }
  return null;
}

function galleryItemKey(item) {
  if (!item) return '';
  return item.type === 'youtube' ? `yt:${item.id}` : `img:${item.url}`;
}

function mergeGalleryItems(existing, incoming) {
  const out = [];
  const seen = new Set();
  const add = (item) => {
    const norm = normalizeGalleryItem(item);
    if (!norm) return;
    const key = galleryItemKey(norm);
    if (!key || seen.has(key) || out.length >= GALLERY_MAX) return;
    seen.add(key);
    out.push(norm);
  };
  (existing || []).forEach(add);
  (incoming || []).forEach(add);
  return out;
}

function candidateToGalleryItem(c) {
  if (!c) return null;
  const type = String(c.type || '').toLowerCase();
  if (type === 'image') {
    return normalizeGalleryItem({
      type: 'image',
      url: c.url,
      caption: c.caption
    });
  }
  if (type === 'youtube' || type === 'video') {
    return normalizeGalleryItem({
      type: 'youtube',
      id: c.youtubeId || c.id,
      title: c.title || c.caption
    });
  }
  return null;
}

module.exports = {
  GALLERY_MAX,
  normalizeGalleryItem,
  galleryItemKey,
  mergeGalleryItems,
  candidateToGalleryItem
};
