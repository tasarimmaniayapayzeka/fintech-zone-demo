/* Fintech Zone demo · tek dosyalık sürüm
   13 sayfayı tek HTML'de birleştirir: stil ve betikler gömülü, görseller ve video base64.
   Sayfalar arası geçiş #hash ile (ör. #fintech-gate, #index/sss). Paylaşım ve telefon önizlemesi için.
   Önce `node kur.js` (kök html'ler güncel olsun), sonra:  node kur-tek.js [cikti-yolu]
   Varsayılan çıktı: ftz-demo-tek.html */
const fs = require('fs');
const path = require('path');
const kok = __dirname;
const cikti = process.argv[2] || path.join(kok, 'ftz-demo-tek.html');

const SAYFALAR = ['index', 'hakkimizda', 'ekosistem', 'kulucka-merkezi', 'muafiyet-ve-avantajlar', 'fintech-gate', 'basvuru-sureci', 'haberler', 'haber-calistay', 'etkinlikler', 'webinar', 'sss', 'iletisim'];
const MIME = { '.webp': 'image/webp', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webm': 'video/webm', '.png': 'image/png', '.jpg': 'image/jpeg' };
const onbellek = {};
function veri(yol) {
  if (onbellek[yol]) return onbellek[yol];
  const tam = path.join(kok, yol);
  if (!fs.existsSync(tam)) { console.warn('yok:', yol); return yol; }
  onbellek[yol] = 'data:' + (MIME[path.extname(yol)] || 'application/octet-stream') + ';base64,' + fs.readFileSync(tam).toString('base64');
  return onbellek[yol];
}
function kucukVaryant(yol) {
  return yol.replace(/-1600\.webp$/, '-800.webp').replace(/-1200\.webp$/, '-700.webp').replace(/-1000\.webp$/, '-600.webp');
}
function yollariGom(s) {
  return s.replace(/(src|href|poster|content)="(gorsel|logo)\/([^"]+)"/g, (m, at, dz, dosya) => `${at}="${veri(kucukVaryant(dz + '/' + dosya))}"`);
}
function baglantilariCevir(s) {
  return s.replace(/href="(index|[a-z-]+)\.html(#[a-z-]+)?"/g, (m, ad, cpa) => `href="#${ad}${cpa ? '/' + cpa.slice(1) : ''}"`);
}

/* --- ortak parçalar (index'ten) --- */
const ilk = fs.readFileSync(path.join(kok, 'index.html'), 'utf8');
let head = ilk.slice(ilk.indexOf('<head>') + 6, ilk.indexOf('</head>'))
  .replace(/<link rel="stylesheet" href="stil\.css[^"]*">\n?/, '')
  .replace(/<link rel="preload"[^>]*>\n?/, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Fintech Zone İstanbul · Tasarım Önerisi (Demo)</title>');
head = yollariGom(head);
let ust = ilk.slice(ilk.indexOf('<div class="demo-serit">'), ilk.indexOf('<main>'));
let alt = ilk.slice(ilk.indexOf('<footer'), ilk.indexOf('</footer>') + 9);

/* --- sayfa gövdeleri --- */
const govdeler = SAYFALAR.map(ad => {
  const h = fs.readFileSync(path.join(kok, ad + '.html'), 'utf8');
  const baslik = (h.match(/<title>([^<]*)<\/title>/) || [, ad])[1];
  const govde = h.slice(h.indexOf('<main>') + 6, h.lastIndexOf('</main>')).trim();
  return `<div class="sayfa" data-sayfa="${ad}" data-baslik="${baslik.replace(/"/g, '&quot;')}" hidden>\n${govde}\n</div>`;
}).join('\n\n');

let govde = ust + '\n<main>\n' + govdeler + '\n</main>\n\n' + alt;
govde = baglantilariCevir(govde);
govde = govde.replace(/\s+srcset="[^"]*"/g, '').replace(/\s+sizes="[^"]*"/g, '');
govde = yollariGom(govde);
govde = govde.replace(/<source src="data:video\/webm[^"]*" type="video\/webm">\s*/g, '');

/* --- stil ve betikler --- */
const stil = fs.readFileSync(path.join(kok, 'stil.css'), 'utf8');
let betik = fs.readFileSync(path.join(kok, 'betik.js'), 'utf8');
let asistan = fs.readFileSync(path.join(kok, 'asistan.js'), 'utf8');
asistan = asistan.split('logo/o-ikon-beyaz.svg').join(veri('logo/o-ikon-beyaz.svg'))
  .replace(/url: '([a-z-]+)\.html(#[a-z-]+)?'/g, (m, ad, cpa) => `url: '#${ad}${cpa ? '/' + cpa.slice(1) : ''}'`)
  .replace(/href="([a-z-]+)\.html"/g, 'href="#$1"');
betik = betik.replace("var sayfa = (location.pathname.split('/').pop() || 'index.html').toLowerCase();",
  "var sayfa = ((location.hash || '#index').slice(1).split('/')[0] || 'index') + '.html';")
  .replace("var h = (a.getAttribute('href') || '').toLowerCase();", "var h = ((a.getAttribute('href') || '').replace(/^#/, '').split('/')[0] || '') + '.html';");

const yonlendirici = `/* --- tek dosya yönlendiricisi: #sayfa[/çapa] --- */
(function () {
  var sayfalar = document.querySelectorAll('.sayfa');
  var menu = document.getElementById('ana-menu'), menuDugme = document.querySelector('.menu-ac');
  function goster() {
    var h = (location.hash || '#index').slice(1).split('/');
    var ad = h[0] || 'index', capa = h[1];
    var bulundu = false;
    sayfalar.forEach(function (s) { var a = s.getAttribute('data-sayfa') === ad; s.hidden = !a; if (a) { bulundu = true; document.title = s.getAttribute('data-baslik'); } });
    if (!bulundu) { location.hash = '#index'; return; }
    document.querySelectorAll('.ust-menu a').forEach(function (a) { var x = (a.getAttribute('href') || '').replace(/^#/, '').split('/')[0]; a.classList.toggle('aktif', x === ad); });
    if (menu) { menu.classList.remove('acik'); if (menuDugme) menuDugme.setAttribute('aria-expanded', 'false'); }
    if (capa) { var el = document.getElementById(capa); if (el) { el.scrollIntoView(); return; } }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', goster);
  goster();
})();`;

/* gömülü betikte </script> geçmemeli (asistan.js açıklamasında var) */
const betikGuvenli = (betik + '\n' + asistan).split('</script').join('<\\/script');
const html = '<!DOCTYPE html>\n<html lang="tr">\n<head>' + head +
  '<style>\n' + stil + '\n.sayfa[hidden]{display:none}\n</style>\n</head>\n<body>\n' + govde +
  '\n<script>\n' + yonlendirici + '\n' + betikGuvenli + '\n</script>\n</body>\n</html>\n';

fs.writeFileSync(cikti, html);
console.log('yazıldı:', cikti, (fs.statSync(cikti).size / 1024 / 1024).toFixed(2) + ' MB');
