import { performance } from 'node:perf_hooks';

function loopbackUrl(env, fallback) {
  const url = new URL(process.env[env] || fallback);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || ['3302', '4191'].includes(url.port)) {
    throw new Error(`${env} must point to the isolated loopback stack on 127.0.0.1.`);
  }
  return url;
}

function positiveInteger(value, fallback, maximum) {
  const number = value === undefined ? fallback : Number(value);
  if (!Number.isInteger(number) || number < 1 || number > maximum) {
    throw new Error(`Expected an integer between 1 and ${maximum}.`);
  }
  return number;
}

const api = loopbackUrl('SWIFTBITE_LOAD_API_URL', 'http://127.0.0.1:3303/');
const site = loopbackUrl('SWIFTBITE_LOAD_WEB_URL', 'http://127.0.0.1:4192/');
const requestCount = positiveInteger(process.argv[2], 1000, 5000);
const concurrency = positiveInteger(process.argv[3], 20, 32);
const baseCatalog = new URL('/api/restaurants', api);
const seedResponse = await fetch(baseCatalog, { redirect: 'error', signal: AbortSignal.timeout(5000) });
if (!seedResponse.ok) throw new Error('Cannot read the QA catalog.');
const catalog = await seedResponse.json();
const restaurant = catalog.find((venue) => venue.slug === 'salford-and-co' && venue.isOpen);
if (!restaurant?.id) throw new Error('Seed the QA database with its open Salford & Co reference venue.');

const endpoints = [
  ['Storefront', new URL('/', site)],
  ['Catalog', baseCatalog],
  ['Restaurant detail', new URL(`/api/restaurants/${encodeURIComponent(restaurant.id)}`, api)],
  ['Restaurant dishes', new URL(`/api/meals/restaurant/${encodeURIComponent(restaurant.id)}`, api)],
].map(([name, url]) => ({ name, url, timings: [], failures: 0 }));

let next = 0;
const started = performance.now();
await Promise.all(Array.from({ length: concurrency }, async () => {
  while (next < requestCount) {
    const endpoint = endpoints[next++ % endpoints.length];
    const start = performance.now();
    try {
      const response = await fetch(endpoint.url, { redirect: 'error', signal: AbortSignal.timeout(5000) });
      await response.arrayBuffer();
      if (response.ok) endpoint.timings.push(performance.now() - start);
      else endpoint.failures++;
    } catch {
      endpoint.failures++;
    }
  }
}));
const seconds = (performance.now() - started) / 1000;

const rows = endpoints.map(({ name, timings, failures }) => {
  timings.sort((a, b) => a - b);
  const percentile = (p) => timings.length
    ? Number(timings[Math.ceil(timings.length * p) - 1].toFixed(1))
    : null;
  return { endpoint: name, succeeded: timings.length, failures, p50ms: percentile(0.50), p95ms: percentile(0.95), p99ms: percentile(0.99) };
});
console.table(rows);
console.log(`${requestCount} requests, concurrency ${concurrency}, ${seconds.toFixed(2)} seconds, ${(requestCount / seconds).toFixed(1)} requests/second`);
if (rows.some(({ failures }) => failures > 0)) process.exitCode = 1;
