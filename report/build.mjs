import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = new URL('../', import.meta.url);
const result = await build({
  entryPoints: [fileURLToPath(new URL('src/Report.jsx', import.meta.url))],
  bundle: true,
  write: false,
  minify: true,
  format: 'iife',
  target: 'es2022',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'inline',
});
const script = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const css = await readFile(new URL('src/report.css', import.meta.url), 'utf8');
const font = await readFile(new URL('src/SpaceGrotesk.ttf', import.meta.url));
const fontCss = `@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url(data:font/ttf;base64,${font.toString('base64')}) format('truetype')}`;
const notices = (
  await readFile(
    new URL('skills/prospector/assets/THIRD_PARTY_LICENSES.txt', root),
    'utf8',
  )
).replace(/--/g, '—');
const html = `<!doctype html>
<!-- Third-party licences\n${notices}\n-->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'"><title>Prospector research</title><style>${fontCss}${css}</style></head><body><div id="prospector-root"></div><noscript>This interactive report needs JavaScript. Saved evidence is also available in the accompanying run.json file.</noscript><script type="application/json" id="prospector-data">"__PROSPECTOR_DATA__"</script><script>${script}</script></body></html>`;
await writeFile(
  new URL('skills/prospector/assets/report-template.html', root),
  html,
);
console.log(
  `Bundled offline report: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`,
);
