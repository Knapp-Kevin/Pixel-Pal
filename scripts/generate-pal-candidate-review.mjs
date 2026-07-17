import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const manifest = JSON.parse(await readFile(resolve('art/pal-candidate-manifest.json'), 'utf8'));
const output = resolve('artifacts/pal-candidate-review');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const assetCards = [];
for (const entry of manifest.characters) {
  const modelSheet = entry.assets['model-sheet'];
  const idle = entry.assets['idle-happy'];
  const primary = idle ?? modelSheet ?? null;
  const image = primary
    ? `<img src="../../../${escapeHtml(primary.path)}" alt="${escapeHtml(entry.displayName)} ${escapeHtml(primary.pose)} candidate">`
    : `<div class="missing">Candidate not generated</div>`;
  assetCards.push(`
    <article class="pal-card" data-character-key="${escapeHtml(entry.key)}" data-species="${escapeHtml(entry.species)}" data-review-state="${escapeHtml(entry.reviewState)}">
      <header>
        <div>
          <p class="eyebrow">${escapeHtml(entry.artIdentity)}</p>
          <h2>${escapeHtml(entry.displayName)}</h2>
        </div>
        <span class="status">${escapeHtml(entry.reviewState)}</span>
      </header>
      <div class="stage">
        <div class="eye-line"></div>
        <div class="ground-line"></div>
        ${image}
      </div>
      <dl>
        <div><dt>Species</dt><dd>${escapeHtml(entry.species)}</dd></div>
        <div><dt>Palette</dt><dd>${escapeHtml(entry.palette)}</dd></div>
        <div><dt>Marking</dt><dd>${escapeHtml(entry.marking)}</dd></div>
        <div><dt>Silhouette</dt><dd>${escapeHtml(entry.silhouette)}</dd></div>
        <div><dt>Face</dt><dd>${escapeHtml(entry.face)}</dd></div>
        <div><dt>Outfit</dt><dd>${escapeHtml(entry.outfitPalette)}</dd></div>
        <div><dt>Assets</dt><dd>${Object.keys(entry.assets).length} / ${manifest.requiredAssetSet.length}</dd></div>
      </dl>
    </article>`);
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pixel Pals Canonical Pal Candidates</title>
<style>
:root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#173a2c;background:#e7efe4}
*{box-sizing:border-box}body{margin:0;padding:18px}main{max-width:1440px;margin:auto}.report{padding:18px 22px;border:2px solid #315b4c;border-radius:20px;background:#fffaf0}.report h1,.pal-card h2{font-family:Georgia,serif}.report h1{margin:0 0 8px}.report p{margin:0;max-width:900px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-top:18px}.pal-card{padding:14px;border:2px solid #627b6e;border-radius:18px;background:#fffdf6;box-shadow:0 8px 20px rgb(36 67 51 / 12%)}header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}.eyebrow{margin:0 0 4px;color:#5b7064;font-size:.72rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.pal-card h2{margin:0 0 10px}.status{padding:5px 9px;border:1px solid #637b6f;border-radius:999px;background:#fff0b9;font-size:.78rem;font-weight:900}.stage{position:relative;aspect-ratio:1/1;overflow:hidden;border:2px solid #315b4c;border-radius:16px;background-color:#f6f3e8;background-image:linear-gradient(45deg,#dfe5dc 25%,transparent 25%),linear-gradient(-45deg,#dfe5dc 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#dfe5dc 75%),linear-gradient(-45deg,transparent 75%,#dfe5dc 75%);background-size:24px 24px;background-position:0 0,0 12px,12px -12px,-12px 0}.stage img{position:absolute;inset:2%;width:96%;height:96%;object-fit:contain}.ground-line,.eye-line{position:absolute;left:5%;right:5%;z-index:2;border-top:2px dashed rgb(43 86 67 / 60%);pointer-events:none}.ground-line{bottom:10%}.eye-line{top:29%;border-color:rgb(154 102 42 / 65%)}.missing{position:absolute;inset:0;display:grid;place-items:center;color:#65776d;font-weight:900;text-align:center;padding:20px}dl{display:grid;gap:6px;margin:12px 0 0;font-size:.82rem}dl div{display:grid;grid-template-columns:72px minmax(0,1fr);gap:7px}dt{font-weight:900}dd{margin:0}.pal-card[data-review-state="candidate"]{border-color:#a16b2c}.pal-card[data-review-state="approved"]{border-color:#2e7d4d}
@media(max-width:640px){body{padding:10px}.grid{grid-template-columns:1fr 1fr;gap:10px}.pal-card{padding:9px}.pal-card dl{display:none}.report{padding:14px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
</style>
</head>
<body><main><section class="report"><p class="eyebrow">Internal candidate surface · never child-facing</p><h1>Canonical Pal Candidate Review</h1><p>Five starter families and Fern share one scale, outfit, anchoring, and emotional-language contract. Candidate art remains outside production until a named human reviewer approves it.</p></section><section class="grid">${assetCards.join('')}</section></main></body>
</html>`;

await writeFile(resolve(output, 'index.html'), html, 'utf8');
await writeFile(resolve(output, 'summary.json'), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  characters: manifest.characters.map((entry) => ({
    key: entry.key,
    displayName: entry.displayName,
    species: entry.species,
    artIdentity: entry.artIdentity,
    reviewState: entry.reviewState,
    decision: entry.decision,
    assets: Object.keys(entry.assets)
  }))
}, null, 2)}\n`, 'utf8');
console.log(`Generated canonical Pal review for ${manifest.characters.length} character packages.`);
