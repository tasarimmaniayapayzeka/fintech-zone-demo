/* Fintech Zone · Yön B tam site betiği
   Gerekli: GSAP + ScrollTrigger (cdnjs).
   Bileşenler işaretle çalışır: canvas.isik, .maske-yazi, .tur, .kart (yığın), [data-perde], [data-sayac], [data-canli], [data-paralaks], .sekme, form */
(function () {
  'use strict';
  var azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dar = matchMedia('(max-width: 900px)').matches;
  var GS = !!(window.gsap && window.ScrollTrigger);
  if (GS) gsap.registerPlugin(ScrollTrigger);

  /* ---- menü ---- */
  var menuDugme = document.querySelector('.menu-ac'), menu = document.getElementById('ana-menu');
  if (menuDugme && menu) {
    menuDugme.addEventListener('click', function () { var a = menu.classList.toggle('acik'); menuDugme.setAttribute('aria-expanded', a ? 'true' : 'false'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.classList.remove('acik'); });
  }
  var sayfa = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.ust-menu a[href]').forEach(function (a) {
    var h = (a.getAttribute('href') || '').toLowerCase().split('#')[0];
    if (h && h === sayfa) { a.classList.add('aktif'); var g = a.closest('.ust-grup'); if (g) g.querySelector(':scope > a').classList.add('aktif'); }
  });

  /* ---- başlık kelimeleri maskeli açılır ---- */
  if (!azHareket) document.querySelectorAll('h1').forEach(function (h) {
    var i = 0;
    (function sar(n) { Array.prototype.slice.call(n.childNodes).forEach(function (c) {
      if (c.nodeType === 3) { var kap = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(function (p) { if (!p) return; if (/^\s+$/.test(p)) { kap.appendChild(document.createTextNode(p)); return; } var d = document.createElement('span'); d.className = 'kelime'; var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++); d.appendChild(s); kap.appendChild(d); }); c.parentNode.replaceChild(kap, c); }
      else if (c.nodeType === 1 && !c.classList.contains('kelime')) sar(c); }); })(h);
  });

  /* ---- beliren ---- */
  var gorunler = document.querySelectorAll('.gorun');
  if (azHareket || !('IntersectionObserver' in window)) gorunler.forEach(function (el) { el.classList.add('gorundu'); });
  else {
    var go = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('gorundu'); go.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    gorunler.forEach(function (el) { go.observe(el); });
    requestAnimationFrame(function () { gorunler.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) el.classList.add('gorundu'); }); });
  }

  /* ---- sayaçlar ---- */
  function bicim(n, b) { return b === 'tr' ? n.toLocaleString('tr-TR') : String(n); }
  document.querySelectorAll('[data-sayac]').forEach(function (el) {
    var hedef = parseInt(el.getAttribute('data-sayac'), 10), b = el.getAttribute('data-bicim');
    var hedefDugum = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : null;
    function yaz(v) { if (hedefDugum) hedefDugum.nodeValue = bicim(v, b); else el.textContent = bicim(v, b); }
    if (azHareket || !('IntersectionObserver' in window)) { yaz(hedef); return; }
    var io = new IntersectionObserver(function (g) { if (!g[0].isIntersecting) return; io.disconnect(); var t0 = null; (function adim(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / 1400), e = 1 - Math.pow(1 - k, 3); yaz(Math.round(hedef * e)); if (k < 1) requestAnimationFrame(adim); })(performance.now()); }, { threshold: .4 });
    io.observe(el);
  });

  /* ---- canlanan infografikler ---- */
  var infolar = document.querySelectorAll('[data-canli]');
  if (azHareket || !('IntersectionObserver' in window)) infolar.forEach(function (el) { el.classList.add('canli'); });
  else { var io2 = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('canli'); io2.unobserve(x.target); } }); }, { threshold: .25 }); infolar.forEach(function (el) { io2.observe(el); }); }
  document.querySelectorAll('.info-halka').forEach(function (h) { var d = h.querySelectorAll('circle.dilim'); h.querySelectorAll('li').forEach(function (li, i) { li.addEventListener('mouseenter', function () { d.forEach(function (c, j) { c.style.opacity = i === j ? 1 : .3; }); }); li.addEventListener('mouseleave', function () { d.forEach(function (c) { c.style.opacity = 1; }); }); }); });

  /* ---- logo şeridi ---- */
  var duvar = document.querySelector('.logo-duvari');
  if (duvar && !azHareket) { var ic = document.createElement('div'); ic.className = 'kayan-ic'; while (duvar.firstChild) ic.appendChild(duvar.firstChild); var kopya = ic.cloneNode(true); kopya.setAttribute('aria-hidden', 'true'); duvar.appendChild(ic); duvar.appendChild(kopya); duvar.classList.add('kayan'); }

  /* ---- formlar (demo) ---- */
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var mesaj = form.querySelector('.form-mesaj');
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var eksik = [];
      form.querySelectorAll('[required]').forEach(function (a) { var bos = a.type === 'checkbox' ? !a.checked : !a.value.trim(); var hatali = a.type === 'email' && a.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.value); if (bos || hatali) eksik.push(a); });
      if (eksik.length) { mesaj.className = 'form-mesaj hata'; mesaj.textContent = eksik[0].type === 'checkbox' ? 'Devam etmek için onay kutusunu işaretleyin.' : 'Lütfen zorunlu alanları kontrol edin.'; eksik[0].focus(); return; }
      mesaj.className = 'form-mesaj ok'; mesaj.textContent = form.getAttribute('data-ok') || 'Teşekkürler, kaydınız alındı. (Demo: sunucu bağlantısı canlı sitede kurulacak.)'; form.reset();
    });
  });

  /* ---- sekmeler ---- */
  var sekmeler = document.querySelectorAll('.sekme');
  sekmeler.forEach(function (s) { s.addEventListener('click', function () { sekmeler.forEach(function (x) { x.setAttribute('aria-selected', 'false'); }); s.setAttribute('aria-selected', 'true'); document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('aktif', p.id === s.getAttribute('aria-controls')); }); }); });

  /* ---- yatay tur ---- */
  document.querySelectorAll('.tur').forEach(function (sec) {
    var ray = sec.querySelector('.ray'), nav = sec.querySelector('.tur-nav'); if (!ray) return;
    var adet = ray.children.length, noktaKap = nav && nav.querySelector('.nokta'), sayiEl = nav && nav.querySelector('.sayi');
    if (noktaKap && !noktaKap.children.length) for (var i = 0; i < adet; i++) { var b = document.createElement('button'); b.setAttribute('aria-label', 'Durak ' + (i + 1)); if (!i) b.className = 'aktif'; noktaKap.appendChild(b); }
    var noktalar = noktaKap ? Array.prototype.slice.call(noktaKap.children) : [];
    if (!GS || azHareket || dar) return;
    var mes = function () { return ray.scrollWidth - innerWidth; };
    var st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: function () { return '+=' + Math.round(mes() * 2.2); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      snap: { snapTo: 1 / (adet - 1), duration: { min: .2, max: .6 }, ease: 'power2.inOut' },
      onUpdate: function (t) { gsap.set(ray, { x: -mes() * t.progress }); var k = Math.round(t.progress * (adet - 1)); noktalar.forEach(function (n, i) { n.classList.toggle('aktif', i === k); }); if (sayiEl) sayiEl.textContent = ('0' + (k + 1)).slice(-2) + ' / 0' + adet; } });
    function git(k) { k = Math.max(0, Math.min(adet - 1, k)); window.scrollTo({ top: st.start + (st.end - st.start) * k / (adet - 1), behavior: 'smooth' }); }
    noktalar.forEach(function (n, i) { n.addEventListener('click', function () { git(i); }); });
    if (nav) nav.querySelectorAll('.ok').forEach(function (o) { o.addEventListener('click', function () { git(Math.round(st.progress * (adet - 1)) + parseInt(o.getAttribute('data-yon'), 10)); }); });
  });


  /* ---- perde: görseller kaydırınca açılır ---- */
  var perdeler = document.querySelectorAll('[data-perde]');
  if (perdeler.length && !azHareket && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('perde-hazir');
    var po = new IntersectionObserver(function (g) { g.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('acik'); po.unobserve(x.target); } }); }, { threshold: .15 });
    perdeler.forEach(function (el) { po.observe(el); });
  }

  /* ---- yaşayan ışık: canvas mesh gradyan (screen karışımı) ---- */
  document.querySelectorAll('canvas.isik').forEach(function (tuval) {
    if (azHareket) return;
    var ctx = tuval.getContext('2d'), W, H, gorunur = true, calisiyor = false;
    function boyut() { W = tuval.width = Math.max(1, tuval.clientWidth * .5); H = tuval.height = Math.max(1, tuval.clientHeight * .5); }
    boyut(); addEventListener('resize', boyut);
    var toplar = [{ r: [0, 136, 149], x: .2, y: .3, s: .32, hx: .00021, hy: .00017 }, { r: [225, 37, 27], x: .75, y: .55, s: .28, hx: -.00017, hy: .00023 }, { r: [255, 181, 72], x: .55, y: .85, s: .22, hx: .00013, hy: -.00019 }, { r: [63, 193, 204], x: .85, y: .15, s: .2, hx: -.00011, hy: .00015 }];
    function ciz(ts) {
      if (!gorunur) { calisiyor = false; return; }
      ctx.clearRect(0, 0, W, H);
      toplar.forEach(function (t, i) { var x = (t.x + Math.sin(ts * t.hx + i) * .14) * W, y = (t.y + Math.cos(ts * t.hy + i * 1.7) * .12) * H, r = t.s * Math.max(W, H); var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + t.r.join(',') + ',.55)'); g.addColorStop(1, 'rgba(' + t.r.join(',') + ',0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); });
      requestAnimationFrame(ciz);
    }
    new IntersectionObserver(function (g) { gorunur = g[0].isIntersecting; if (gorunur && !calisiyor) { calisiyor = true; requestAnimationFrame(ciz); } }).observe(tuval);
  });

  /* ---- harflerin içindeki fotoğraf ---- */
  document.querySelectorAll('.maske-yazi').forEach(function (m) {
    var f = m.getAttribute('data-foto'); if (f) m.style.backgroundImage = 'url("' + f + '")';
    if (GS && !azHareket) gsap.fromTo(m, { backgroundPosition: '50% 15%' }, { backgroundPosition: '50% 75%', ease: 'none', scrollTrigger: { trigger: m.closest('section') || m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---- yığılan kartlar: sonraki kart gelirken önceki küçülür ---- */
  document.querySelectorAll('.yigin').forEach(function (y) {
    var kartlar = Array.prototype.slice.call(y.querySelectorAll('.kart'));
    if (!GS || azHareket || dar) return;
    kartlar.forEach(function (k, i) { if (i === kartlar.length - 1) return; gsap.to(k.querySelector('.kart-ic'), { scale: .92, filter: 'brightness(.72)', ease: 'none', scrollTrigger: { trigger: kartlar[i + 1], start: 'top bottom', end: 'top ' + 76, scrub: true } }); });
  });

  /* ---- paralaks (sahne fotoğrafları) ---- */
  if (GS && !azHareket) document.querySelectorAll('[data-paralaks]').forEach(function (img) { gsap.to(img, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }); });

})();
