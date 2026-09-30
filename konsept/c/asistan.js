/* FTZ Asistan · Fintech Zone İstanbul site asistanı (widget)
   Tek dosya, bağımlılık yok. Kimlik: Charcoal / Lava Red / Porcelain, DM Serif + IBM Plex.

   Çalışma biçimi:
   - window.FTZ_ASISTAN_UC tanımlıysa (ör. '/asistan-api.php') mesajlar oraya POST edilir
     {oturum, mesajlar:[{rol:'ben'|'bot', icerik}]} ve {cevap, kaynaklar:[{baslik,url}]} beklenir.
   - Tanımlı değilse (bu demo) yerel bilgi tabanından cevap verir. Bilgi tabanı yalnız
     kurumun kendi metinlerinden derlendi; rakam ve tarih uydurmaz, bilmediğinde söyler.
   - Sesli giriş: tarayıcı Web Speech API destekliyorsa mikrofon düğmesi görünür.
   Canlı kurulum: WordPress temasında wp_footer ile <script src="asistan.js" defer></script>. */
(function () {
  'use strict';
  if (window.__ftzAsistan) return;
  window.__ftzAsistan = true;

  var UC = window.FTZ_ASISTAN_UC || null;
  var PORTAL = 'https://portal.fintech.zone/';
  var R = { charcoal: '#3B4A59', koyu: '#2B3743', lava: '#E1251B', porcelain: '#F2F2F2', butter: '#FFB548', teal: '#008895', cizgi: '#DDE1E5', soluk: '#66727F', beyaz: '#FFFFFF' };

  var oturum = (function () {
    try { var k = sessionStorage.getItem('ftz-asistan-oturum'); if (k) return k; k = 'o' + Date.now().toString(36); sessionStorage.setItem('ftz-asistan-oturum', k); return k; }
    catch (e) { return 'o' + Date.now().toString(36); }
  })();
  var gecmis = [];
  try { gecmis = JSON.parse(sessionStorage.getItem('ftz-asistan-gecmis') || '[]'); } catch (e) { gecmis = []; }
  function kaydet() { try { sessionStorage.setItem('ftz-asistan-gecmis', JSON.stringify(gecmis.slice(-16))); } catch (e) {} }

  /* ---------- yerel bilgi tabanı (kurum metinlerinden) ---------- */
  var BILGI = [
    { k: /başvur|basvur|nasıl katıl|nasil katil|üye ol|uye ol|kayıt|kayit|portal/i,
      c: 'Süreç üç adımdan oluşuyor:\n1. **Ön başvuru**: portal.fintech.zone üzerinden şirket ve ürün bilgilerinizi paylaşırsınız.\n2. **Başvuru ve değerlendirme**: ekibimiz başvuruyu inceler, gerekirse ek belge ister ve görüşme planlar.\n3. **Kabul ve sözleşme**: kabul edilen başvurular için sözleşme imzalanır ve kampüse yerleşim planlanır.\n\nÖn başvuruyu hemen başlatabilirsiniz.',
      kay: [{ baslik: 'Ön Başvuru portalı', url: PORTAL }, { baslik: 'Başvuru süreci', url: 'basvuru-sureci.html' }] },
    { k: /kim(ler)? başvur|kimler|uygun mu|şart|sart|kriter|koşul|kosul/i,
      c: 'Kümelenme programları girişimciler, finansal kurumlar, düzenleyiciler, hizmet sağlayıcılar, danışmanlar ve yatırımcılar için tasarlandı. Fintek alanında ürün ya da hizmet geliştiren her ölçekte şirket ön başvuru yapabilir. Kesin uygunluk değerlendirme aşamasında netleşir.',
      kay: [{ baslik: 'Profilinize göre yol haritası', url: 'basvuru-sureci.html' }] },
    { k: /gate|mentör|mentor|eşleş|esles|kurum.*girişim|girişim.*kurum/i,
      c: 'Fintech Gate, kurumlar ile girişimleri sipariş odaklı iş birlikleri için eşleştiren, İSTKA destekli programımız. İlk mentörlük döneminde 15 günde 20 mentör 30 girişimle 32 oturumda birebir görüştü; 288 soru cevaplandı, toplam 1.935 dakika görüşme yapıldı. 22 Eylül 2026\'da Kurumsal Paydaşlar Çalıştayı\'nı gerçekleştirdik.',
      kay: [{ baslik: 'Fintech Gate', url: 'fintech-gate.html' }, { baslik: 'Çalıştay haberi', url: 'haber-calistay.html' }] },
    { k: /muafiyet|teşvik|tesvik|vergi|avantaj|destek/i,
      c: 'Teknopark mevzuatı kapsamındaki muafiyet ve teşviklerden yararlanılıyor. Güncel oran ve koşullar için ekibimizle görüşmenizi öneririm; bu demoda rakam vermiyorum. Ayrıca TÜBİTAK 1707 gibi destek çağrılarını da düzenli duyuruyoruz.',
      kay: [{ baslik: 'Ön Başvuru portalı', url: PORTAL }, { baslik: 'Haberler ve çağrılar', url: 'haberler.html' }] },
    { k: /adres|nerede|konum|ulaşım|ulasim|harita|ümraniye|umraniye|ifm|finans merkezi/i,
      c: 'Kampüs İstanbul Finans Merkezi\'nin içinde: Finanskent Mah. Finans Cad. No: 13/1 Ümraniye, İstanbul.',
      kay: [{ baslik: 'İletişim ve konum', url: 'iletisim.html' }] },
    { k: /webinar|seminer|canlı yayın|canli yayin|tuzcu|ziraat/i,
      c: 'Fintech Zone Webinar Serisi\'nin ilk bölümü 23 Eylül 2026\'da yapıldı; konuk Ziraat Teknoloji Genel Müdürü Bayram Tuzcu\'ydu. Sonraki bölüm tarihi duyurulacak. Kayıt için fintech.zone/webinar adresini kullanabilirsiniz.',
      kay: [{ baslik: 'Webinar kaydı', url: 'https://fintech.zone/webinar' }] },
    { k: /ortak|hissedar|kurucu|kim kurdu|aselsan|üniversite|universite|bilişim vadisi|bilisim vadisi|cbyfo|yatırım ve finans ofisi/i,
      c: 'Fintech Zone İstanbul\'un ortakları: Cumhurbaşkanlığı Yatırım ve Finans Ofisi, İstanbul Finans Merkezi, Aselsan, Bilişim Vadisi, İstanbul Üniversitesi, Marmara Üniversitesi ve İbn Haldun Üniversitesi. Resmi adımız İstanbul Finans ve Teknoloji Üssü A.Ş.',
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }] },
    { k: /vizyon|misyon|değer|deger|amaç|amac|neden|ne iş|ne is|nedir|hakkında|hakkinda/i,
      c: 'Fintech Zone, Türkiye\'nin fintek teknoparkı. Vizyonumuz: milli strateji ile fintek ekosistemine yön veren ve insanlık yararına en fazla değer üreten global bir merkez olmak. Kümelenme, globalleşme, yeni nesil teknopark, temsiliyet ve İFM ile bütünlük olmak üzere beş başlıkta fark yaratıyoruz.',
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }, { baslik: 'Neden Fintech Zone', url: 'index.html#neden' }] },
    { k: /haber|etkinlik|nijerya|heyet|gitex|fuar|çalıştay|calistay|1707|tübitak|tubitak/i,
      c: 'Son gelişmeler: Fintech Gate Kurumsal Paydaşlar Çalıştayı (22 Eylül 2026, İFM), Webinar Serisi\'nin ilk bölümü (23 Eylül), GITEX AI Türkiye 2026 katılımı (9 ve 10 Eylül, CBYFO standı), Nijerya finans ve akademi heyetinin ziyareti (Ağustos) ve TÜBİTAK 1707 çağrı duyurusu.',
      kay: [{ baslik: 'Tüm haberler', url: 'haberler.html' }] },
    { k: /iletişim|iletisim|telefon|e-?posta|mail|ulaş|ulas|görüş|gorus|randevu/i,
      c: 'İletişim formundan yazabilirsiniz; ekibimiz size döner. Telefon ve e-posta bilgileri canlı sitede FTZ tarafından eklenecek.',
      kay: [{ baslik: 'İletişim', url: 'iletisim.html' }] },
    { k: /ingilizce|english|\ben\b/i,
      c: 'Sitenin İngilizce sürümü var; menüdeki EN düğmesinden ulaşılır. Bu demoda bağlantı yer tutucudur.', kay: [] },
    { k: /merhaba|selam|iyi günler|iyi gunler|nasılsın|nasilsin|teşekkür|tesekkur|sağ ol|sagol/i,
      c: 'Merhaba! Başvuru süreci, Fintech Gate, kampüs ya da etkinlikler hakkında sorabilirsiniz.', kay: [] }
  ];
  function yerelCevap(m) {
    for (var i = 0; i < BILGI.length; i++) if (BILGI[i].k.test(m)) return BILGI[i];
    return { c: 'Bu konuda elimde doğrulanmış bilgi yok; uydurmak istemem. Sorunuzu iletişim formundan ekibimize iletebilir ya da ön başvuru sırasında sorabilirsiniz.',
      kay: [{ baslik: 'İletişim', url: 'iletisim.html' }, { baslik: 'Ön Başvuru portalı', url: PORTAL }] };
  }

  /* ---------- stil ---------- */
  var stil = document.createElement('style');
  stil.textContent = [
    '.ftz-as,.ftz-as *{box-sizing:border-box;margin:0;padding:0}',
    '.ftz-as{position:fixed;right:22px;bottom:22px;z-index:9000;font-family:"IBM Plex Sans",system-ui,sans-serif;color:' + R.charcoal + '}',
    '.ftz-as-ac{width:60px;height:60px;border-radius:999px;border:0;cursor:pointer;background:' + R.charcoal + ';color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(59,74,89,.28);transition:transform .2s cubic-bezier(.16,1,.3,1);position:relative}',
    '.ftz-as-ac:hover{transform:translateY(-2px)}.ftz-as-ac:active{transform:scale(.97)}',
    '.ftz-as-ac img{width:30px;height:30px;display:block}',
    '.ftz-as-ac .ftz-as-nokta{position:absolute;top:2px;right:2px;width:12px;height:12px;border-radius:999px;background:' + R.lava + ';border:2px solid #fff}',
    '.ftz-as-etiket{position:absolute;right:70px;bottom:14px;background:#fff;color:' + R.charcoal + ';border:1px solid ' + R.cizgi + ';border-radius:999px;padding:8px 14px;font-size:13.5px;white-space:nowrap;box-shadow:0 6px 20px rgba(59,74,89,.12)}',
    '.ftz-as-panel{position:absolute;right:0;bottom:74px;width:390px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 110px);background:#fff;border:1px solid ' + R.cizgi + ';border-radius:16px;box-shadow:0 24px 60px rgba(59,74,89,.22);display:none;flex-direction:column;overflow:hidden}',
    '.ftz-as-panel.acik{display:flex}',
    '.ftz-as-bas{background:' + R.charcoal + ';color:#fff;padding:14px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0}',
    '.ftz-as-bas img{width:34px;height:34px}',
    '.ftz-as-bas h3{font-family:"DM Serif Display",Georgia,serif;font-weight:400;font-size:18px;letter-spacing:.01em;color:#fff}',
    '.ftz-as-bas p{font-family:"IBM Plex Mono",monospace;font-size:11px;opacity:.75;margin-top:2px}',
    '.ftz-as-bas button{margin-left:auto;background:none;border:0;color:#fff;opacity:.75;cursor:pointer;width:32px;height:32px;border-radius:999px;display:flex;align-items:center;justify-content:center}',
    '.ftz-as-bas button:hover{opacity:1;background:rgba(255,255,255,.12)}',
    '.ftz-as-bas button svg{width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}',
    '.ftz-as-hizli{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid ' + R.cizgi + ';background:#fff;flex-shrink:0;overflow-x:auto;scrollbar-width:none}',
    '.ftz-as-hizli::-webkit-scrollbar{display:none}',
    '.ftz-as-hizli a{flex:none;font-size:12.5px;font-weight:500;color:' + R.charcoal + ';border:1px solid ' + R.cizgi + ';padding:7px 12px;border-radius:999px;text-decoration:none;white-space:nowrap}',
    '.ftz-as-hizli a:hover{border-color:' + R.charcoal + '}',
    '.ftz-as-govde{flex:1;overflow-y:auto;padding:16px;background:' + R.porcelain + ';display:flex;flex-direction:column;gap:10px}',
    '.ftz-as-m{max-width:88%;padding:11px 14px;border-radius:14px;font-size:14.5px;line-height:1.55;word-wrap:break-word}',
    '.ftz-as-m.bot{background:#fff;color:' + R.charcoal + ';align-self:flex-start;border-bottom-left-radius:4px;border:1px solid ' + R.cizgi + '}',
    '.ftz-as-m.ben{background:' + R.charcoal + ';color:#fff;align-self:flex-end;border-bottom-right-radius:4px}',
    '.ftz-as-m.hata{background:#FCE9E8;color:#C21F16;align-self:flex-start}',
    '.ftz-as-m a{color:' + R.lava + ';text-decoration:underline}',
    '.ftz-as-kay{display:flex;flex-wrap:wrap;gap:6px;align-self:flex-start;margin-top:-4px}',
    '.ftz-as-kay a{font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:' + R.charcoal + ';background:' + R.butter + ';padding:5px 10px;border-radius:999px;text-decoration:none}',
    '.ftz-as-kay a:hover{background:#F5A93A}',
    '.ftz-as-cip{display:flex;flex-wrap:wrap;gap:7px;padding:0 14px 12px;background:' + R.porcelain + ';flex-shrink:0}',
    '.ftz-as-cip button{font-family:inherit;font-size:12.5px;color:' + R.charcoal + ';background:#fff;border:1px solid ' + R.cizgi + ';padding:7px 12px;border-radius:999px;cursor:pointer}',
    '.ftz-as-cip button:hover{border-color:' + R.charcoal + '}',
    '.ftz-as-alt{display:flex;gap:8px;padding:12px;border-top:1px solid ' + R.cizgi + ';background:#fff;flex-shrink:0;align-items:flex-end}',
    '.ftz-as-alt textarea{flex:1;font-family:inherit;font-size:14.5px;color:' + R.charcoal + ';border:1.5px solid ' + R.cizgi + ';border-radius:12px;padding:11px 13px;resize:none;height:44px;max-height:120px;outline:none;line-height:1.4}',
    '.ftz-as-alt textarea:focus{border-color:' + R.teal + '}',
    '.ftz-as-alt button{width:44px;height:44px;flex:none;border:0;border-radius:999px;cursor:pointer;display:flex;align-items:center;justify-content:center}',
    '.ftz-as-mik{background:#fff;border:1.5px solid ' + R.cizgi + ' !important;color:' + R.charcoal + '}',
    '.ftz-as-mik.dinliyor{border-color:' + R.lava + ' !important;color:' + R.lava + '}',
    '.ftz-as-gonder{background:' + R.lava + ';color:#fff}',
    '.ftz-as-gonder:disabled{opacity:.45;cursor:not-allowed}',
    '.ftz-as-alt svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}',
    '.ftz-as-not{font-size:10.5px;color:' + R.soluk + ';text-align:center;padding:0 12px 10px;background:#fff;line-height:1.4}',
    '.ftz-as-yaz{display:flex;gap:4px;padding:13px 15px;background:#fff;border:1px solid ' + R.cizgi + ';border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start}',
    '.ftz-as-yaz i{width:6px;height:6px;border-radius:999px;background:' + R.soluk + ';opacity:.4;animation:ftzZipla 1.3s infinite}',
    '.ftz-as-yaz i:nth-child(2){animation-delay:.18s}.ftz-as-yaz i:nth-child(3){animation-delay:.36s}',
    '@keyframes ftzZipla{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-4px);opacity:.9}}',
    '@media(max-width:520px){.ftz-as{right:14px;bottom:14px}.ftz-as-panel{width:calc(100vw - 28px);height:calc(100vh - 96px)}.ftz-as-etiket{display:none}}',
    '@media(prefers-reduced-motion:reduce){.ftz-as-yaz i{animation:none}.ftz-as-ac{transition:none}}'
  ].join('');
  document.head.appendChild(stil);

  /* ---------- iskelet ---------- */
  var kok = document.createElement('div');
  kok.className = 'ftz-as';
  kok.innerHTML =
    '<div class="ftz-as-panel" role="dialog" aria-label="FTZ Asistan">' +
      '<div class="ftz-as-bas"><img src="../../logo/o-ikon-beyaz.svg" alt=""><div><h3>FTZ Asistan</h3><p>FINTECH ZONE İSTANBUL</p></div>' +
        '<button type="button" class="ftz-as-sil" aria-label="Konuşmayı temizle"><svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button>' +
        '<button type="button" class="ftz-as-kapat" aria-label="Kapat"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="ftz-as-hizli"><a href="' + PORTAL + '" target="_blank" rel="noopener">Ön Başvuru</a><a href="basvuru-sureci.html">Başvuru süreci</a><a href="fintech-gate.html">Fintech Gate</a><a href="haberler.html">Haberler</a><a href="iletisim.html">İletişim</a></div>' +
      '<div class="ftz-as-govde" role="log" aria-live="polite"></div>' +
      '<div class="ftz-as-cip"></div>' +
      '<div class="ftz-as-alt">' +
        '<button type="button" class="ftz-as-mik" aria-label="Sesli yaz" hidden><svg viewBox="0 0 24 24"><path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3"/></svg></button>' +
        '<textarea placeholder="Sorunuzu yazın" rows="1" aria-label="Mesajınız" maxlength="600"></textarea>' +
        '<button type="button" class="ftz-as-gonder" aria-label="Gönder"><svg viewBox="0 0 24 24"><path d="M4 12h15M13 6l6 6-6 6"/></svg></button>' +
      '</div>' +
      '<div class="ftz-as-not">Yapay zekâ asistanı. Resmi bilgi için ekibimizle görüşün; kişisel veri paylaşmayın.</div>' +
    '</div>' +
    '<span class="ftz-as-etiket">Sorunuz mu var?</span>' +
    '<button type="button" class="ftz-as-ac" aria-label="FTZ Asistan\'ı aç" aria-expanded="false"><img src="../../logo/o-ikon-beyaz.svg" alt=""><span class="ftz-as-nokta"></span></button>';
  document.body.appendChild(kok);

  var panel = kok.querySelector('.ftz-as-panel');
  var govde = kok.querySelector('.ftz-as-govde');
  var cipler = kok.querySelector('.ftz-as-cip');
  var alan = kok.querySelector('textarea');
  var gonderD = kok.querySelector('.ftz-as-gonder');
  var mikD = kok.querySelector('.ftz-as-mik');
  var acD = kok.querySelector('.ftz-as-ac');
  var etiket = kok.querySelector('.ftz-as-etiket');
  var nokta = kok.querySelector('.ftz-as-nokta');
  var mesgul = false;

  var ILK_CIPLER = ['Nasıl başvururum?', 'Fintech Gate nedir?', 'Kampüs nerede?', 'Muafiyetler neler?'];
  var ILK = 'Merhaba! Ben FTZ Asistan. Başvuru süreci, Fintech Gate, kampüs ve etkinlikler hakkında yardımcı olabilirim. Ne öğrenmek istersiniz?';

  function kac(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function bicimle(t) {
    return kac(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\b(portal\.fintech\.zone|fintech\.zone\/webinar)\b/g, function (m) { return '<a href="https://' + m + '" target="_blank" rel="noopener">' + m + '</a>'; })
      .replace(/\n/g, '<br>');
  }
  function kaydir() { govde.scrollTop = govde.scrollHeight; }
  function balon(rol, metin, kaynaklar, kaydetme) {
    var d = document.createElement('div');
    d.className = 'ftz-as-m ' + rol;
    d.innerHTML = rol === 'ben' ? kac(metin) : bicimle(metin);
    govde.appendChild(d);
    if (kaynaklar && kaynaklar.length) {
      var k = document.createElement('div'); k.className = 'ftz-as-kay';
      kaynaklar.forEach(function (s) { var a = document.createElement('a'); a.href = s.url; if (/^https?:/.test(s.url)) { a.target = '_blank'; a.rel = 'noopener'; } a.textContent = s.baslik; k.appendChild(a); });
      govde.appendChild(k);
    }
    if (!kaydetme) { gecmis.push({ rol: rol, icerik: metin, kaynaklar: kaynaklar || [] }); kaydet(); }
    kaydir();
  }
  function ciplariGoster(liste) {
    cipler.innerHTML = '';
    (liste || []).forEach(function (t) { var b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', function () { gonder(t); }); cipler.appendChild(b); });
  }
  function yaziyor() { var d = document.createElement('div'); d.className = 'ftz-as-yaz'; d.innerHTML = '<i></i><i></i><i></i>'; govde.appendChild(d); kaydir(); return d; }

  function gonder(metin) {
    metin = (metin || '').trim();
    if (!metin || mesgul) return;
    mesgul = true; gonderD.disabled = true; alan.value = ''; alan.style.height = '44px'; cipler.innerHTML = '';
    balon('ben', metin);
    var y = yaziyor();
    function bitir() { mesgul = false; gonderD.disabled = false; alan.focus(); }
    if (UC) {
      fetch(UC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oturum: oturum, mesajlar: gecmis.slice(-10).map(function (m) { return { rol: m.rol, icerik: m.icerik }; }) }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (s) { y.remove(); if (!s.ok || s.j.hata) { balon('hata', s.j.mesaj || 'Bir sorun oluştu. Lütfen tekrar deneyin.'); return; } balon('bot', s.j.cevap, s.j.kaynaklar); })
        .catch(function () { y.remove(); balon('hata', 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.'); })
        .then(bitir);
    } else {
      var c = yerelCevap(metin);
      setTimeout(function () { y.remove(); balon('bot', c.c, c.kay); bitir(); }, 500 + Math.min(900, c.c.length * 4));
    }
  }

  function ac() {
    panel.classList.add('acik'); acD.setAttribute('aria-expanded', 'true'); etiket.style.display = 'none'; nokta.style.display = 'none';
    if (!govde.children.length) {
      if (gecmis.length) { gecmis.forEach(function (m) { balon(m.rol, m.icerik, m.kaynaklar, true); }); }
      else { balon('bot', ILK, []); }
      ciplariGoster(ILK_CIPLER);
    }
    setTimeout(function () { alan.focus(); }, 60);
  }
  function kapat() { panel.classList.remove('acik'); acD.setAttribute('aria-expanded', 'false'); acD.focus(); }

  acD.addEventListener('click', function () { panel.classList.contains('acik') ? kapat() : ac(); });
  kok.querySelector('.ftz-as-kapat').addEventListener('click', kapat);
  kok.querySelector('.ftz-as-sil').addEventListener('click', function () { gecmis = []; kaydet(); govde.innerHTML = ''; balon('bot', ILK, []); ciplariGoster(ILK_CIPLER); });
  gonderD.addEventListener('click', function () { gonder(alan.value); });
  alan.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); gonder(alan.value); } });
  alan.addEventListener('input', function () { alan.style.height = '44px'; alan.style.height = Math.min(120, alan.scrollHeight) + 'px'; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('acik')) kapat(); });
  setTimeout(function () { if (!panel.classList.contains('acik')) etiket.style.display = 'none'; }, 9000);

  /* ---------- sesli giriş (isteğe bağlı) ---------- */
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SR) {
    mikD.hidden = false;
    var tanima = null, dinliyor = false;
    mikD.addEventListener('click', function () {
      if (dinliyor) { try { tanima.stop(); } catch (e) {} return; }
      try {
        tanima = new SR(); tanima.lang = 'tr-TR'; tanima.interimResults = false; tanima.maxAlternatives = 1;
        tanima.onstart = function () { dinliyor = true; mikD.classList.add('dinliyor'); alan.placeholder = 'Dinliyorum'; };
        tanima.onresult = function (e) { var t = e.results[0][0].transcript; alan.value = t; gonder(t); };
        tanima.onerror = function () { alan.placeholder = 'Ses alınamadı, yazabilirsiniz'; };
        tanima.onend = function () { dinliyor = false; mikD.classList.remove('dinliyor'); if (alan.placeholder === 'Dinliyorum') alan.placeholder = 'Sorunuzu yazın'; };
        tanima.start();
      } catch (e) { mikD.hidden = true; }
    });
  }
})();
