import { nanoid } from 'nanoid';

/**
 * Generates an idempotency key following the format: adm_<timestamp>_<random>
 * Ex: adm_1773530274094_n8dmuk
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now();
  const randomSuffix = nanoid(6);
  return `adm_${timestamp}_${randomSuffix}`;
}

/**
 * Generates a UUID v4 for customer_id.
 */
export function generateCustomerId(): string {
  // Use crypto.randomUUID() if available, else fallback to nanoid
  // Node.js environments without secure context might fail on randomUUID
  try {
    return crypto.randomUUID();
  } catch (e) {
    return nanoid(21);
  }
}

/**
 * Generates a job number in PA-YYYY-MM-XXXXX format.
 * Uses current date + 5-digit random sequence.
 * Ex: PA-2026-03-00216
 */
export function generateJobNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `PA-${yyyy}-${mm}-${seq}`;
}
