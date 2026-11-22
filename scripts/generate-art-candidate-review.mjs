import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const candidatesDirectory = resolve('art/review/candidates');
const outputDirectory = resolve('artifacts/art-candidate-review');
const assetDirectory = resolve(outputDirectory, 'assets');
const candidateAssetsRoot = resolve('art/candidates');

function fail(message) {
  throw new Error(`Art candidate review generation failed: ${message}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function checkedCandidateAssetPath(assetPath) {
  if (typeof assetPath !== 'string' || !assetPath.startsWith('art/candidates/')) {
    fail('candidate asset path must be a relative art/candidates/ path.');
  }
  const allowedRoot = await realpath(candidateAssetsRoot);
  const source = await realpath(resolve(assetPath));
  if (!source.startsWith(`${allowedRoot}${sep}`)) fail(`candidate asset path escapes art/candidates: ${assetPath}`);
  if (!['.avif', '.webp', '.png'].includes(extname(source).toLowerCase())) {
    fail(`candidate asset must be an image in an allowed format: ${assetPath}`);
  }
  return source;
}

function safeAreaStyle(contract, orientation) {
  const area = orientation === 'portrait'
    ? contract.portraitCharacterSafeArea
    : contract.landscapeCharacterSafeArea;
  if (!area) fail(`missing ${orientation} character safe area.`);
  return [
    `left:${area.leftPercent}%`,
    `right:${area.rightPercent}%`,
    `bottom:${area.bottomPercent}%`,
    `height:${area.heightPercent}%`
  ].join(';');
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(assetDirectory, { recursive: true });

const files = (await readdir(candidatesDirectory).catch(() => []))
  .filter((name) => name.endsWith('.json'))
  .sort();
if (files.length === 0) fail('no candidate review records were found.');

const cards = [];
const summary = {
  generatedAt: new Date().toISOString(),
  candidates: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  assetsCopied: 0
};

for (const file of files) {
  const candidate = JSON.parse(await readFile(resolve(candidatesDirectory, file), 'utf8'));
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(candidate.candidateId ?? '')) {
    fail(`${file} has an invalid candidateId; only lowercase slug characters are allowed.`);
  }
  if (candidate.schemaVersion !== 1 || candidate.product !== 'Pixel Pals') {
    fail(`${file} is not a Pixel Pals candidate schemaVersion 1 record.`);
  }
  if (candidate.status !== 'candidate') fail(`${file} must remain status=candidate.`);
  if (!['pending', 'approved', 'rejected'].includes(candidate.decision)) {
    fail(`${file} has unsupported decision ${candidate.decision}.`);
  }
  if (candidate.decision === 'approved' && (
    candidate.provenance?.humanArtApproval !== true ||
    candidate.reviewer?.kind !== 'human' ||
    typeof candidate.reviewer?.name !== 'string' ||
    !candidate.reviewer.name.trim() ||
    typeof candidate.reviewedAt !== 'string' ||
    !Number.isFinite(Date.parse(candidate.reviewedAt))
  )) {
    fail(`${file} cannot be approved without named human review, approval, and a valid reviewedAt timestamp.`);
  }
  if (candidate.decision !== 'approved' && candidate.provenance?.humanArtApproval === true) {
    fail(`${file} cannot claim humanArtApproval=true with decision=${candidate.decision}.`);
  }
  summary.candidates += 1;
  summary[candidate.decision] += 1;

  for (const orientation of ['landscape', 'portrait']) {
    const asset = candidate.assets?.[orientation];
    if (!asset?.path) fail(`${file} is missing ${orientation} asset metadata.`);
    const source = await checkedCandidateAssetPath(asset.path);
    const sourceStat = await stat(source).catch(() => null);
    if (!sourceStat?.isFile()) fail(`${file} points to missing ${orientation} file ${asset.path}.`);
    if (sourceStat.size !== asset.bytes) {
      fail(`${file} ${orientation} byte count ${sourceStat.size} does not match ${asset.bytes}.`);
    }
    const sourceBuffer = await readFile(source);
    const digest = createHash('sha256').update(sourceBuffer).digest('hex');
    if (digest !== asset.sha256) {
      fail(`${file} ${orientation} sha256 ${digest} does not match ${asset.sha256}.`);
    }
    const extension = extname(asset.path);
    const destinationName = `${candidate.candidateId}-${orientation}${extension}`;
    await copyFile(source, resolve(assetDirectory, destinationName));
    summary.assetsCopied += 1;

    cards.push(`
      <article class="review-card" data-candidate-id="${escapeHtml(candidate.candidateId)}" data-orientation="${orientation}" data-decision="${escapeHtml(candidate.decision)}" data-expected-width="${asset.width}" data-expected-height="${asset.height}">
        <header>
          <div>
            <p class="eyebrow">${escapeHtml(candidate.assetPair.manifestAssetId)}</p>
            <h2>${escapeHtml(candidate.assetPair.variant)} · ${orientation}</h2>
          </div>
          <span class="status">${escapeHtml(candidate.decision)}</span>
        </header>
        <div class="art-frame ${orientation}">
          <img src="assets/${escapeHtml(destinationName)}" alt="Pixel Pals ${escapeHtml(candidate.assetPair.variant)} ${orientation} art candidate">
          <div class="character-safe-area" style="${safeAreaStyle(candidate.compositionContract, orientation)}">
            <span class="pal-zone pal-zone-left">First Pal</span>
            <span class="pal-zone pal-zone-right">Fern</span>
          </div>
        </div>
        <dl>
          <div><dt>Candidate</dt><dd>${escapeHtml(candidate.candidateId)}</dd></div>
          <div><dt>Dimensions</dt><dd>${asset.width} × ${asset.height}</dd></div>
          <div><dt>Bytes</dt><dd>${asset.bytes}</dd></div>
          <div><dt>SHA-256</dt><dd>${escapeHtml(asset.sha256)}</dd></div>
          <div><dt>Decision</dt><dd>${escapeHtml(candidate.decision)}</dd></div>
          <div><dt>Approval</dt><dd>${candidate.provenance.humanArtApproval ? 'human approved' : 'not approved'}</dd></div>
        </dl>
      </article>`);
  }
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pixel Pals Art Candidate Review</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #183b2e; background: #e8efe5; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 18px; }
    main { max-width: 1320px; margin: 0 auto; }
    .report-header { padding: 18px 22px; border: 2px solid #315b4c; border-radius: 20px; background: #fffaf0; }
    h1, h2, p { margin-top: 0; }
    h1 { margin-bottom: 7px; font-family: Georgia, serif; }
    .eyebrow { margin-bottom: 4px; color: #526b5f; font-size: .76rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
    .summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .summary span, .status { padding: 6px 10px; border: 1px solid #5d7669; border-radius: 999px; background: #fff0b9; font-weight: 800; }
    .grid { margin-top: 18px; display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 18px; align-items: start; }
    .review-card { padding: 16px; border: 2px solid #6a8175; border-radius: 20px; background: #fffdf5; box-shadow: 0 10px 24px rgb(36 67 51 / 12%); }
    .review-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .review-card h2 { margin-bottom: 10px; font-family: Georgia, serif; text-transform: capitalize; }
    .art-frame { position: relative; width: 100%; overflow: hidden; border: 2px solid #315b4c; border-radius: 16px; background: #d9e6d6; }
    .art-frame.landscape { aspect-ratio: 8 / 5; }
    .art-frame.portrait { width: min(72%, 430px); margin-inline: auto; aspect-ratio: 5 / 8; }
    .art-frame img { width: 100%; height: 100%; display: block; object-fit: cover; }
    .character-safe-area { position: absolute; border: 2px dashed rgb(255 249 220 / 95%); background: rgb(31 66 49 / 12%); pointer-events: none; }
    .pal-zone { position: absolute; bottom: 4%; width: 31%; height: 74%; display: grid; place-items: end center; border: 2px dashed rgb(255 226 137 / 95%); border-radius: 45% 45% 18% 18%; color: #fffbe7; background: rgb(31 66 49 / 24%); font-size: .74rem; font-weight: 900; text-shadow: 0 1px 2px #183b2e; }
    .pal-zone-left { left: 1%; }
    .pal-zone-right { right: 1%; }
    dl { margin: 14px 0 0; display: grid; gap: 6px; }
    dl div { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 8px; }
    dt { font-weight: 900; }
    dd { margin: 0; overflow-wrap: anywhere; }
    body[data-orientation-filter="landscape"] .review-card:not([data-orientation="landscape"]),
    body[data-orientation-filter="portrait"] .review-card:not([data-orientation="portrait"]) { display: none; }
    body[data-orientation-filter="landscape"],
    body[data-orientation-filter="portrait"] { padding: 8px; overflow: hidden; }
    body[data-orientation-filter="landscape"] .report-header,
    body[data-orientation-filter="portrait"] .report-header { display: none; }
    body[data-orientation-filter="landscape"] .grid,
    body[data-orientation-filter="portrait"] .grid { height: calc(100vh - 16px); margin: 0; display: grid; grid-template-columns: 1fr; place-items: center; }
    body[data-orientation-filter="landscape"] .review-card,
    body[data-orientation-filter="portrait"] .review-card { width: 100%; height: 100%; padding: 8px; display: flex; flex-direction: column; overflow: hidden; }
    body[data-orientation-filter="landscape"] .review-card header,
    body[data-orientation-filter="portrait"] .review-card header { min-height: 40px; }
    body[data-orientation-filter="landscape"] .review-card dl,
    body[data-orientation-filter="portrait"] .review-card dl { display: none; }
    body[data-orientation-filter="landscape"] .art-frame { width: min(100%, calc((100vh - 72px) * 8 / 5)); margin: auto; }
    body[data-orientation-filter="portrait"] .art-frame { width: min(100%, calc((100vh - 72px) * 5 / 8)); margin: auto; }
    @media (max-width: 640px) { body { padding: 10px; } .report-header { padding: 14px; } .grid { grid-template-columns: 1fr; } .art-frame.portrait { width: 88%; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; animation: none !important; transition: none !important; } }
  </style>
</head>
<body data-orientation-filter="all">
  <main>
    <section class="report-header">
      <p class="eyebrow">Internal candidate evidence · never child-facing</p>
      <h1>Pixel Pals Art Candidate Review</h1>
      <p>Generated scene candidates remain isolated from production and runtime paths until a named human reviewer records an explicit decision.</p>
      <div class="summary">
        <span>${summary.candidates} candidate${summary.candidates === 1 ? '' : 's'}</span>
        <span>${summary.pending} pending</span>
        <span>${summary.approved} approved</span>
        <span>${summary.rejected} rejected</span>
      </div>
    </section>
    <section class="grid">${cards.join('')}</section>
  </main>
  <script>
    const orientation = new URLSearchParams(location.search).get('orientation');
    if (orientation === 'landscape' || orientation === 'portrait') document.body.dataset.orientationFilter = orientation;
  </script>
</body>
</html>`;

await writeFile(resolve(outputDirectory, 'index.html'), html, 'utf8');
await writeFile(resolve(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Generated candidate art review: ${summary.candidates} candidates, ${summary.assetsCopied} files copied.`);
