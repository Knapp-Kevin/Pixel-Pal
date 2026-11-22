import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { startHeadlessChrome } from './cdp-browser.mjs';

// Brand concept artwork is separate from the production game-art approval gate.
// Never bake children, personal information, or fixed player identities into art.
const source = await readFile(resolve('assets/brand/source/lantern-path-concept.avif'));
const imageUrl = 'data:image/avif;base64,' + source.toString('base64');
const outputs = [
  { name: 'readme-banner.png', width: 1600, height: 520, mode: 'banner' },
  { name: 'social-preview.png', width: 1280, height: 640, mode: 'social' }
];

function markup(output) {
  const width = output.width;
  const height = output.height;
  const titleTop = output.mode === 'banner' ? '29%' : '30%';
  const titleSize = output.mode === 'banner' ? '90px' : '90px';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><style>' +
    '*{box-sizing:border-box}html,body{margin:0;width:' + width + 'px;height:' + height + 'px;overflow:hidden}' +
    'body{position:relative;background:#0b2730;color:#fff7e5;font-family:Arial,sans-serif}' +
    '.background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 52%}' +
    '.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(9,26,36,.94) 0%,rgba(9,26,36,.83) 35%,rgba(9,26,36,.35) 68%,rgba(9,26,36,.05) 100%)}' +
    '.label{position:absolute;top:15%;left:7.4%;background:#164d40;border:1px solid #a4d3b6;border-radius:40px;padding:11px 22px;color:#c4eaca;font-size:14px;letter-spacing:1.9px;font-weight:bold}' +
    'h1{position:absolute;top:' + titleTop + ';left:7.3%;font:bold ' + titleSize + '/1 Georgia,serif;letter-spacing:-2px;margin:0;white-space:nowrap;text-shadow:0 3px 13px #081924}' +
    '.rule{position:absolute;top:55%;left:7.4%;width:205px;height:5px;background:#f6ca81;border-radius:3px}' +
    '.tagline{position:absolute;top:61%;left:7.4%;font-size:29px;line-height:1.32;color:#fdf7e9;margin:0;text-shadow:0 1px 7px #081924}' +
    '.note{position:absolute;top:87%;left:7.4%;font-size:17px;letter-spacing:.2px;color:#cee8d3;margin:0}' +
    '</style></head><body>' +
    '<img class="background" src="' + imageUrl + '" alt="">' +
    '<div class="shade"></div><div class="label">A STORYBOOK WORLD</div>' +
    '<h1>PIXEL PALS</h1><div class="rule"></div>' +
    '<p class="tagline">Where every friendship<br>changes the world.</p>' +
    '<p class="note">A heartfelt, family-inspired game in the making</p>' +
    '</body></html>';
}

const browser = await startHeadlessChrome({ port: 9251 });
try {
  for (const output of outputs) {
    const page = await browser.newPage();
    try {
      await page.send('Emulation.setDeviceMetricsOverride', {
        width: output.width, height: output.height, deviceScaleFactor: 1, mobile: false
      });
      const html = markup(output);
      await page.navigate('data:text/html;base64,' + Buffer.from(html).toString('base64'));
      await page.waitFor('document.readyState === "complete" && document.images[0]?.complete && document.images[0]?.naturalWidth > 0');
      const shot = await page.send('Page.captureScreenshot', {
        format: 'png', fromSurface: true, captureBeyondViewport: false
      });
      const path = resolve('assets/brand/' + output.name);
      await mkdir(dirname(path), {recursive:true});
      await writeFile(path, Buffer.from(shot.data,'base64'));
      console.log('Created ' + output.name + ' at ' + output.width + 'x' + output.height);
    } finally {
      page.close();
    }
  }
} finally {
  await browser.close();
}
