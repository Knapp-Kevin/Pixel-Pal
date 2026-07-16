import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';

const manifestPath = resolve('art/adventure-production-manifest.json');
const outputDirectory = resolve('artifacts/art-review');
const assetDirectory = resolve(outputDirectory, 'assets');

function fail(message) {
  throw new Error(`Art review report generation failed: ${message}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function humanize(value) {
  return String(value)
    .split('-')
    .map((part) => part.length > 0 ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(' ');
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

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
if (manifest.schemaVersion !== 2 || manifest.product !== 'Pixel Pals' || !Array.isArray(manifest.assets)) {
  fail('adventure-production-manifest.json must be a Pixel Pals schemaVersion 2 manifest.');
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(assetDirectory, { recursive: true });

const cards = [];
const summary = {
  generatedAt: new Date().toISOString(),
  manifestStatus: manifest.manifestStatus,
  totalViews: 0,
  plannedViews: 0,
  benchmarkViews: 0,
  approvedViews: 0,
  productionViews: 0,
  copiedFiles: 0
};

for (const asset of manifest.assets) {
  for (const view of asset.views ?? []) {
    summary.totalViews += 1;
    const counter = `${view.status}Views`;
    if (counter in summary) summary[counter] += 1;

    let imageMarkup = '<div class="planned-placeholder"><span>No promoted file</span><small>Concept and review work remains outside the runtime.</small></div>';
    let physicalBytes = null;
    if (view.status !== 'planned') {
      if (typeof view.filePath !== 'string' || view.filePath.length === 0) {
        fail(`${asset.id}.${view.id} is ${view.status} but has no filePath.`);
      }
      const source = resolve(view.filePath);
      const file = await stat(source).catch(() => null);
      if (!file?.isFile()) fail(`${asset.id}.${view.id} points to a missing file.`);
      physicalBytes = file.size;
      const extension = extname(view.filePath);
      const destinationName = `${asset.id}-${view.id}${extension}`;
      await copyFile(source, resolve(assetDirectory, destinationName));
      summary.copiedFiles += 1;
      imageMarkup = `<img src="assets/${escapeHtml(destinationName)}" alt="${escapeHtml(view.alt ?? `${asset.subject}: ${humanize(view.variant)}`)}">`;
    }

    const provenanceState = view.provenance
      ? `${escapeHtml(view.provenance.creator ?? 'Unknown creator')} · ${escapeHtml(view.provenance.approvedAt ?? 'Not approved')}`
      : 'No provenance record';
    const budgetText = physicalBytes === null
      ? `Budget ${Math.round(view.maxBytes / 1000)} KB`
      : `${Math.round(physicalBytes / 1000)} KB of ${Math.round(view.maxBytes / 1000)} KB`;

    cards.push(`
      <article class="review-card" data-status="${escapeHtml(view.status)}" data-orientation="${escapeHtml(view.orientation)}">
        <header>
          <div>
            <p class="eyebrow">${escapeHtml(asset.subject)}</p>
            <h2>${escapeHtml(humanize(view.variant))}</h2>
          </div>
          <span class="status">${escapeHtml(view.status)}</span>
        </header>
        <div class="art-frame ${escapeHtml(view.orientation)}">
          ${imageMarkup}
          <div class="character-safe-area" style="${safeAreaStyle(manifest.compositionContract, view.orientation)}">
            <span class="pal-zone pal-zone-left">First Pal</span>
            <span class="pal-zone pal-zone-right">Fern</span>
          </div>
        </div>
        <dl>
          <div><dt>View</dt><dd>${escapeHtml(view.id)}</dd></div>
          <div><dt>Dimensions</dt><dd>${view.width} × ${view.height}</dd></div>
          <div><dt>Crop</dt><dd>${escapeHtml(view.objectPosition ?? '50% 50%')}</dd></div>
          <div><dt>File</dt><dd>${view.filePath ? escapeHtml(basename(view.filePath)) : 'Planned'}</dd></div>
          <div><dt>Budget</dt><dd>${escapeHtml(budgetText)}</dd></div>
          <div><dt>Provenance</dt><dd>${provenanceState}</dd></div>
        </dl>
      </article>`);
  }
}

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pixel Pals Production Art Review</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #183b2e; background: #eef3e8; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; }
    main { max-width: 1500px; margin: 0 auto; }
    .report-header { padding: 24px 28px; border: 2px solid #315b4c; border-radius: 24px; background: #fffaf0; }
    h1, h2, p { margin-top: 0; }
    h1 { margin-bottom: 8px; font-family: Georgia, serif; }
    .summary { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .summary span, .status { padding: 7px 11px; border: 1px solid #5d7669; border-radius: 999px; background: #f7f0d8; font-weight: 800; }
    .grid { margin-top: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(390px, 1fr)); gap: 20px; }
    .review-card { padding: 18px; border: 2px solid #6a8175; border-radius: 22px; background: #fffdf5; box-shadow: 0 12px 28px rgb(36 67 51 / 12%); }
    .review-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; }
    .eyebrow { margin-bottom: 4px; color: #526b5f; font-size: .78rem; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
    .review-card h2 { margin-bottom: 12px; font-family: Georgia, serif; }
    .review-card[data-status="planned"] .status { background: #eee9dc; }
    .review-card[data-status="benchmark"] .status { background: #fff0b9; }
    .review-card[data-status="approved"] .status { background: #dcebd4; }
    .review-card[data-status="production"] .status { color: white; background: #315b4c; }
    .art-frame { position: relative; width: 100%; overflow: hidden; border: 2px solid #315b4c; border-radius: 18px; background: #d9e6d6; }
    .art-frame.landscape { aspect-ratio: 8 / 5; }
    .art-frame.portrait { width: min(72%, 430px); margin-inline: auto; aspect-ratio: 5 / 8; }
    .art-frame img { width: 100%; height: 100%; display: block; object-fit: cover; }
    .planned-placeholder { width: 100%; height: 100%; padding: 24px; display: grid; place-content: center; gap: 8px; text-align: center; background: repeating-linear-gradient(135deg, #dce6d8 0 16px, #eef3e8 16px 32px); }
    .planned-placeholder span { font-size: 1.15rem; font-weight: 900; }
    .character-safe-area { position: absolute; border: 2px dashed rgb(255 249 220 / 90%); background: rgb(31 66 49 / 12%); pointer-events: none; }
    .pal-zone { position: absolute; bottom: 4%; width: 31%; height: 74%; display: grid; place-items: end center; border: 2px dashed rgb(255 226 137 / 92%); border-radius: 45% 45% 18% 18%; color: #fffbe7; background: rgb(31 66 49 / 24%); font-size: .76rem; font-weight: 900; text-shadow: 0 1px 2px #183b2e; }
    .pal-zone-left { left: 1%; }
    .pal-zone-right { right: 1%; }
    dl { margin: 16px 0 0; display: grid; gap: 7px; }
    dl div { display: grid; grid-template-columns: 92px minmax(0, 1fr); gap: 8px; }
    dt { font-weight: 900; }
    dd { margin: 0; overflow-wrap: anywhere; }
    @media (max-width: 640px) { body { padding: 12px; } .grid { grid-template-columns: 1fr; } .art-frame.portrait { width: 88%; } }
  </style>
</head>
<body>
  <main>
    <section class="report-header">
      <p class="eyebrow">Internal evidence · not child-facing</p>
      <h1>Pixel Pals Production Art Review</h1>
      <p>Responsive adventure environments with protected space for the saved first Pal and Fern. Planned slots remain visibly empty until files and provenance are promoted through the manifest.</p>
      <div class="summary">
        <span>${summary.totalViews} views</span>
        <span>${summary.plannedViews} planned</span>
        <span>${summary.benchmarkViews} benchmark</span>
        <span>${summary.approvedViews} approved</span>
        <span>${summary.productionViews} production</span>
      </div>
    </section>
    <section class="grid">${cards.join('')}</section>
  </main>
</body>
</html>`;

await writeFile(resolve(outputDirectory, 'index.html'), html, 'utf8');
await writeFile(resolve(outputDirectory, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Generated art review report: ${summary.totalViews} views, ${summary.copiedFiles} promoted files copied.`);
