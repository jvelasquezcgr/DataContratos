import { HTTP, SOCRATA } from './config.js';

export class OperationRun {
  constructor() { this.controller = new AbortController(); }
  get signal() { return this.controller.signal; }
  abort() { this.controller.abort(); }
}

const delay = (ms, signal) => new Promise((resolve, reject) => {
  if (signal?.aborted) return reject(new DOMException('Cancelado', 'AbortError'));
  const timer = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Cancelado', 'AbortError')); }, { once: true });
});

function mergeSignals(a, b) {
  if (!a) return b;
  if (!b) return a;
  const controller = new AbortController();
  const forward = () => controller.abort();
  a.addEventListener('abort', forward, { once: true });
  b.addEventListener('abort', forward, { once: true });
  if (a.aborted || b.aborted) controller.abort();
  return controller.signal;
}

export async function socrataGet(datasetId, params = {}, { signal, timeoutMs = 20000 } = {}) {
  const url = new URL(`${SOCRATA.base}${datasetId}.json`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value != null) url.searchParams.set(key, value);
  }
  if (SOCRATA.appToken) url.searchParams.set('$$app_token', SOCRATA.appToken);

  let lastError;
  for (let attempt = 0; attempt < HTTP.maxRetries; attempt++) {
    const timeoutCtrl = new AbortController();
    const timeout = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
    const merged = mergeSignals(signal, timeoutCtrl.signal);
    try {
      const response = await fetch(url, { signal: merged });
      if (!response.ok) throw new Error(`HTTP ${response.status} en ${datasetId}`);
      return await response.json();
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
      lastError = error;
      if (attempt < HTTP.maxRetries - 1) {
        const backoff = HTTP.baseDelayMs * (attempt + 1) + Math.random() * 250;
        await delay(backoff, signal);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

export async function socrataGetAll(datasetId, params = {}, { signal } = {}) {
  const rows = [];
  for (let page = 0; page < HTTP.maxPages; page++) {
    const block = await socrataGet(datasetId, { ...params, '$limit': HTTP.pageSize, '$offset': page * HTTP.pageSize }, { signal });
    rows.push(...block);
    if (block.length < HTTP.pageSize) break;
  }
  return rows;
}
