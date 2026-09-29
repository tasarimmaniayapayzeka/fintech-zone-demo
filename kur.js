/* Fintech Zone demo · sayfa derleyici
   kaynak/sayfalar/<ad>.html  (ilk satır: <!-- meta {...} -->, gerisi <main> içeriği)
   + kaynak/ust.html (üst bar) + kaynak/alt.html (footer)  →  <ad>.html (kök)
   Çalıştır:  node kur.js
   WordPress'e geçişte ust.html → header.php, alt.html → footer.php, sayfa gövdeleri → Klasik Editör içeriği. */
const fs = require('fs');
const path = require('path');
const kok = __dirname;
const K = path.join(kok, 'kaynak');
const ust = fs.readFileSync(path.join(K, 'ust.html'), 'utf8');
const alt = fs.readFileSync(path.join(K, 'alt.html'), 'utf8');
const V = Date.now().toString(36); // önbellek kırıcı

function bas(m) {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m.baslik}</title>
<meta name="description" content="${m.aciklama}">
<meta name="robots" content="noindex, nofollow">
<meta property="og:title" content="${m.baslik}">
<meta property="og:description" content="${m.aciklama}">
<meta property="og:type" content="website">
<meta property="og:image" content="${m.og || 'gorsel/bina-meydan-1600.webp'}">
<link rel="icon" href="logo/o-ikon-renkli.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=Caveat:wght@700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="stil.css?v=${V}">
${m.onyukle ? `<link rel="preload" as="image" href="${m.onyukle}">\n` : ''}</head>
<body${m.govdeSinif ? ' class="' + m.govdeSinif + '"' : ''}>
`;
}

const dizin = path.join(K, 'sayfalar');
let n = 0;
for (const dosya of fs.readdirSync(dizin)) {
  if (!dosya.endsWith('.html')) continue;
  const ham = fs.readFileSync(path.join(dizin, dosya), 'utf8');
  const es = ham.match(/^<!--\s*meta\s+(\{[\s\S]*?\})\s*-->/);
  if (!es) { console.error('meta yok:', dosya); continue; }
  const m = JSON.parse(es[1]);
  const govde = ham.slice(es[0].length).trim();
  const html = bas(m) + '\n' + ust + '\n<main>\n' + govde + '\n</main>\n\n' + alt + '\n<script src="betik.js?v=' + V + '"></script>\n<script src="asistan.js?v=' + V + '"></script>\n</body>\n</html>\n';
  fs.writeFileSync(path.join(kok, dosya), html);
  n++;
}
console.log(n + ' sayfa üretildi.');
