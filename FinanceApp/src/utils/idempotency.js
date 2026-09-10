/**
 * Generate a UUID v4 string for API idempotency
 */
export function generateIdempotencyKey(prefix = 'idem') {
  const timestamp = Date.now().toString(36);
  const randomPart = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `${prefix}_${timestamp}_${randomPart}`;
}

const processedKeys = new Set();

export function isKeyAlreadyProcessed(key) {
  return processedKeys.has(key);
}

export function markKeyProcessed(key) {
  processedKeys.add(key);
  if (processedKeys.size > 200) {
    const iterator = processedKeys.values();
    for (let i = 0; i < 50; i++) {
      const item = iterator.next().value;
      if (item) processedKeys.delete(item);
    }
  }
}
