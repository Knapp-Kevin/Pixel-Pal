import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const rawBaseUrl = process.argv[2] ?? process.env.PIXEL_PALS_DEPLOYMENT_URL;

if (!rawBaseUrl) {
  throw new Error('Provide the deployed Pixel Pals URL as the first argument or PIXEL_PALS_DEPLOYMENT_URL.');
}

const baseUrl = new URL(rawBaseUrl);
if (baseUrl.protocol !== 'https:') throw new Error('Deployment verification requires HTTPS.');
if (baseUrl.username || baseUrl.password || baseUrl.port) throw new Error('Deployment verification does not accept credentials or custom ports.');
if (!baseUrl.pathname.endsWith('/')) baseUrl.pathname += '/';

function isPrivateAddress(address) {
  if (address === '::1' || address === '0:0:0:0:0:0:0:1') return true;
  if (address.startsWith('fc') || address.startsWith('fd') || address.startsWith('fe80:')) return true;
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  return parts[0] === 10
    || parts[0] === 127
    || (parts[0] === 169 && parts[1] === 254)
    || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
    || (parts[0] === 192 && parts[1] === 168)
    || parts[0] === 0;
}

const hostname = baseUrl.hostname.toLowerCase();
if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
  throw new Error('Deployment verification only accepts public hosts.');
}
if (isIP(hostname) && isPrivateAddress(hostname)) throw new Error('Deployment verification rejects private IP addresses.');

const resolved = await lookup(hostname, { all: true, verbatim: true });
if (resolved.length === 0 || resolved.some(({ address }) => isPrivateAddress(address))) {
  throw new Error('Deployment verification rejects hosts that resolve to private addresses.');
}

const failures = [];
const evidence = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

async function fetchResource(path) {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, { redirect: 'follow' });
  const finalUrl = new URL(response.url);
  requireCondition(finalUrl.hostname === hostname, `${url} redirected to an unexpected host`);
  const body = await response.text();
  evidence.push({
    url: response.url,
    status: response.status,
    contentType: response.headers.get('content-type'),
    cacheControl: response.headers.get('cache-control')
  });
  requireCondition(response.ok, `${url} returned ${response.status}`);
  return { response, body };
}

const root = await fetchResource('');
const headers = root.response.headers;
const csp = headers.get('content-security-policy') ?? '';
requireCondition(csp.includes("default-src 'self'"), 'root response is missing the expected default-src CSP');
requireCondition(csp.includes("frame-ancestors 'none'"), 'root response is missing frame-ancestors protection');
requireCondition(headers.get('x-content-type-options')?.toLowerCase() === 'nosniff', 'root response is missing X-Content-Type-Options: nosniff');
requireCondition(headers.get('referrer-policy')?.toLowerCase() === 'no-referrer', 'root response is missing Referrer-Policy: no-referrer');
requireCondition(Boolean(headers.get('permissions-policy')), 'root response is missing Permissions-Policy');
requireCondition(headers.get('x-frame-options')?.toUpperCase() === 'DENY', 'root response is missing X-Frame-Options: DENY');
requireCondition(headers.get('cross-origin-opener-policy')?.toLowerCase() === 'same-origin', 'root response is missing Cross-Origin-Opener-Policy: same-origin');
requireCondition(headers.get('cross-origin-resource-policy')?.toLowerCase() === 'same-origin', 'root response is missing Cross-Origin-Resource-Policy: same-origin');
requireCondition((headers.get('cache-control') ?? '').includes('no-store'), 'HTML response must not be stored by caches');
requireCondition(root.body.includes('manifest.webmanifest'), 'deployed HTML does not link the web manifest');

const manifestResponse = await fetchResource('manifest.webmanifest');
let manifest = {};
try {
  manifest = JSON.parse(manifestResponse.body);
} catch {
  failures.push('manifest.webmanifest is not valid JSON');
}
requireCondition(manifest.name === 'Pixel Pals', 'deployed manifest name is incorrect');
requireCondition(manifest.display === 'standalone', 'deployed manifest display mode is not standalone');
requireCondition(manifest.orientation === 'landscape', 'deployed manifest orientation is not landscape');
requireCondition((manifestResponse.response.headers.get('cache-control') ?? '').includes('no-cache'), 'manifest must use no-cache');

const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
const standardIcon = icons.find((icon) => icon.src === '/pixel-pals-icon.svg' && String(icon.purpose).includes('any'));
const maskableIcon = icons.find((icon) => icon.src === '/pixel-pals-maskable.svg' && String(icon.purpose).includes('maskable'));
requireCondition(Boolean(standardIcon), 'deployed manifest is missing the standard icon');
requireCondition(Boolean(maskableIcon), 'deployed manifest is missing the maskable icon');

for (const icon of [standardIcon, maskableIcon].filter(Boolean)) {
  const iconResponse = await fetchResource(icon.src.replace(/^\//, ''));
  requireCondition((iconResponse.response.headers.get('content-type') ?? '').includes('image/svg+xml'), `${icon.src} has the wrong content type`);
}

const serviceWorker = await fetchResource('sw.js');
requireCondition(serviceWorker.body.length > 100, 'service worker response is unexpectedly small');
requireCondition((serviceWorker.response.headers.get('cache-control') ?? '').includes('no-cache'), 'service worker must use no-cache');

console.log(JSON.stringify({ baseUrl: baseUrl.toString(), evidence, failures }, null, 2));
if (failures.length > 0) throw new Error(`Deployment verification failed with ${failures.length} finding(s).`);
console.log('Pixel Pals deployment verification passed.');
