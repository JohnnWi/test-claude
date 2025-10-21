const FALLBACK_PLATFORM = 'Altro';

function isValidDate(value) {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function normalizePlatform(platform) {
  if (!platform || typeof platform !== 'string') {
    return FALLBACK_PLATFORM;
  }

  const trimmed = platform.trim();
  if (!trimmed) {
    return FALLBACK_PLATFORM;
  }

  return trimmed;
}

export function sanitizeImportedPurchases(rawData, { initialIdSeed = Date.now() } = {}) {
  if (!Array.isArray(rawData)) {
    throw new Error('Formato file non valido: atteso un array di acquisti.');
  }

  const sanitized = [];
  let invalidCount = 0;

  rawData.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      invalidCount += 1;
      return;
    }

    const name = typeof item.name === 'string' ? item.name.trim() : '';
    const parsedPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price);
    const price = Number.isFinite(parsedPrice) ? parsedPrice : NaN;
    const date = isValidDate(item.date) ? item.date : null;
    const platform = normalizePlatform(item.platform);

    if (!name || !date || Number.isNaN(price) || price < 0) {
      invalidCount += 1;
      return;
    }

    sanitized.push({
      id: typeof item.id === 'string' && item.id.trim() ? item.id : `${initialIdSeed}-${index}`,
      name,
      price,
      date,
      link: typeof item.link === 'string' ? item.link : '',
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
      platform,
      notes: typeof item.notes === 'string' ? item.notes : ''
    });
  });

  return { sanitized, invalidCount };
}
