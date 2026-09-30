/* Fintech Zone · Yön A tam site betiği
   Gerekli: GSAP + ScrollTrigger (cdnjs). Three.js yalnız #sahne olan sayfada.
   Bileşenler işaretle çalışır: .sabit, .tur, .yay, [data-sayac], [data-canli], [data-paralaks], .sekme, form */
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

  /* ---- sabit anlatı ---- */
  document.querySelectorAll('.sabit').forEach(function (sec) {
    var maddeler = Array.prototype.slice.call(sec.querySelectorAll('.sabit-madde')), fotolar = Array.prototype.slice.call(sec.querySelectorAll('.sabit-foto img')), sayi = sec.querySelector('.sabit-sayi'), noktaKap = sec.querySelector('.sabit-ilerleme');
    if (noktaKap && !noktaKap.children.length) maddeler.forEach(function (m, i) { var n = document.createElement('i'); if (!i) n.className = 'aktif'; noktaKap.appendChild(n); });
    var noktalar = noktaKap ? Array.prototype.slice.call(noktaKap.children) : [];
    if (!GS || azHareket || maddeler.length < 2) { sec.classList.add('duz'); fotolar.forEach(function (f, i) { if (i) f.style.display = 'none'; }); return; }
    gsap.set(maddeler.slice(1), { autoAlpha: 0, y: 40 }); gsap.set(fotolar.slice(1), { autoAlpha: 0, scale: 1.08 });
    var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top top', end: '+=' + (maddeler.length * 90) + '%', pin: true, scrub: .7, anticipatePin: 1, onUpdate: function (st) { var k = Math.min(maddeler.length - 1, Math.floor(st.progress * maddeler.length)); if (sayi) sayi.textContent = ('0' + (k + 1)).slice(-2); noktalar.forEach(function (n, i) { n.classList.toggle('aktif', i === k); }); } } });
    maddeler.forEach(function (m, i) { if (!i) return; tl.to(maddeler[i - 1], { autoAlpha: 0, y: -40, duration: 1 }, '+=.4'); if (fotolar[i - 1]) tl.to(fotolar[i - 1], { autoAlpha: 0, scale: 1, duration: 1 }, '<'); tl.to(m, { autoAlpha: 1, y: 0, duration: 1 }, '<.25'); if (fotolar[i]) tl.to(fotolar[i], { autoAlpha: 1, scale: 1, duration: 1 }, '<'); });
  });

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

  /* ---- yay carousel ---- */
  document.querySelectorAll('.yay').forEach(function (yay) {
    var kartlar = Array.prototype.slice.call(yay.querySelectorAll('.yay-kart')), n = kartlar.length, i = 0, zam = null;
    var nav = yay.nextElementSibling && yay.nextElementSibling.classList.contains('yay-nav') ? yay.nextElementSibling : null;
    var noktaKap = nav && nav.querySelector('.nokta'), sayi = nav && nav.querySelector('.sayi');
    if (noktaKap) kartlar.forEach(function (k, j) { var b = document.createElement('button'); b.setAttribute('aria-label', 'Kart ' + (j + 1)); b.addEventListener('click', function () { git(j); baslat(); }); noktaKap.appendChild(b); });
    function yerlestir() { kartlar.forEach(function (k, j) { var d = ((j - i) % n + n + Math.floor(n / 2)) % n - Math.floor(n / 2); if (d < -2 || d > 2) k.removeAttribute('data-poz'); else k.setAttribute('data-poz', d); }); if (noktaKap) Array.prototype.forEach.call(noktaKap.children, function (b, j) { b.classList.toggle('aktif', j === i); }); if (sayi) sayi.textContent = ('0' + (i + 1)).slice(-2) + ' / 0' + n; }
    function git(k) { i = (k % n + n) % n; yerlestir(); }
    if (nav) nav.querySelectorAll('.ok').forEach(function (o) { o.addEventListener('click', function () { git(i + parseInt(o.getAttribute('data-yon'), 10)); baslat(); }); });
    kartlar.forEach(function (k, j) { k.addEventListener('click', function () { if (j !== i) { git(j); baslat(); } }); });
    var basX = null; yay.addEventListener('pointerdown', function (e) { basX = e.clientX; }); yay.addEventListener('pointerup', function (e) { if (basX === null) return; var f = e.clientX - basX; basX = null; if (Math.abs(f) > 40) { git(i + (f < 0 ? 1 : -1)); baslat(); } });
    function baslat() { if (zam) clearInterval(zam); if (!azHareket) zam = setInterval(function () { git(i + 1); }, 4200); }
    yay.addEventListener('pointerenter', function () { if (zam) { clearInterval(zam); zam = null; } }); yay.addEventListener('pointerleave', baslat);
    yerlestir(); baslat();
  });

  /* ---- paralaks (sahne fotoğrafları) ---- */
  if (GS && !azHareket) document.querySelectorAll('[data-paralaks]').forEach(function (img) { gsap.to(img, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }); });

  /* ---- Three.js yörünge sahnesi (yalnız #sahne varsa) ---- */
  var tuval = document.getElementById('sahne');
  if (tuval && window.THREE) {
    var ren = new THREE.WebGLRenderer({ canvas: tuval, alpha: true, antialias: true }); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    var sahne = new THREE.Scene(), kam = new THREE.PerspectiveCamera(38, 1, .1, 100); kam.position.set(0, 0, 9);
    var grup = new THREE.Group(); sahne.add(grup);
    var video = document.getElementById('kampus-video'), doku;
    if (video && !dar && !azHareket) { doku = new THREE.VideoTexture(video); var oynat = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); }; oynat(); ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, function () { if (video.paused) oynat(); }, { once: true, passive: true }); }); document.addEventListener('visibilitychange', function () { if (!document.hidden && video.paused) oynat(); }); }
    else { doku = new THREE.TextureLoader().load(tuval.getAttribute('data-poster') || '../../gorsel/daire-meydan-1024.webp'); }
    doku.anisotropy = ren.capabilities.getMaxAnisotropy(); doku.center.set(.5, .5);
    var daire = new THREE.Mesh(new THREE.CircleGeometry(1.75, 96), new THREE.MeshBasicMaterial({ map: doku })); grup.add(daire);
    var yayMal = new THREE.MeshBasicMaterial({ color: 0xE1251B }), yaylar = new THREE.Group();
    [0, Math.PI].forEach(function (a) { var y = new THREE.Mesh(new THREE.TorusGeometry(2.35, .11, 18, 120, Math.PI * .62), yayMal); y.rotation.z = a + Math.PI * .19; yaylar.add(y); }); grup.add(yaylar);
    function halka(r, n, renk, egim) { var g = new THREE.BufferGeometry(), poz = new Float32Array(n * 3); for (var i = 0; i < n; i++) { var t = i / n * Math.PI * 2; poz[i * 3] = Math.cos(t) * r; poz[i * 3 + 1] = Math.sin(t) * r; poz[i * 3 + 2] = 0; } g.setAttribute('position', new THREE.BufferAttribute(poz, 3)); var p = new THREE.Points(g, new THREE.PointsMaterial({ color: renk, size: .045, transparent: true, opacity: .9 })); p.rotation.x = egim; return p; }
    var h1 = halka(3.4, 220, 0x9AA6B2, 1.15), h2 = halka(4.7, 300, 0x66727F, 1.05); h2.rotation.y = .4; grup.add(h1); grup.add(h2);
    var dugumler = [];
    [[3.4, 0xFFB548, 0], [3.4, 0xffffff, 2.1], [3.4, 0xffffff, 4.2], [4.7, 0x3FC1CC, 1], [4.7, 0xffffff, 3.1], [4.7, 0xffffff, 5.2]].forEach(function (d) { var m = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 16), new THREE.MeshBasicMaterial({ color: d[1] })); m.userData = { r: d[0], t: d[2] }; dugumler.push(m); (d[0] === 3.4 ? h1 : h2).add(m); });
    var fare = { x: 0, y: 0 }, hedefKam = { x: 0, y: 0 }, kaydir = { v: 0 };
    if (!azHareket) addEventListener('pointermove', function (e) { fare.x = (e.clientX / innerWidth - .5) * 2; fare.y = (e.clientY / innerHeight - .5) * 2; });
    if (GS && !azHareket) gsap.to(kaydir, { v: 1, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    function boyut() { var w = tuval.clientWidth, h = tuval.clientHeight; ren.setSize(w, h, false); kam.aspect = w / h; kam.updateProjectionMatrix(); var yari = 9 * Math.tan(19 * Math.PI / 180) * kam.aspect; grup.position.x = dar ? 0 : yari * .5; grup.scale.setScalar(dar ? .8 : Math.min(1, Math.max(.6, kam.aspect / 1.55))); }
    boyut(); addEventListener('resize', boyut);
    var t0 = performance.now(), gorunur = true, calisiyor = false;
    new IntersectionObserver(function (g) { gorunur = g[0].isIntersecting; if (gorunur && !calisiyor && !azHareket) { calisiyor = true; requestAnimationFrame(cerceve); } }, { threshold: 0 }).observe(tuval);
    function cerceve(ts) {
      if (!gorunur) { calisiyor = false; return; }
      var t = (ts - t0) / 1000;
      if (!azHareket) {
        yaylar.rotation.z = t * .12; h1.rotation.z = t * .06; h2.rotation.z = -t * .04;
        dugumler.forEach(function (m) { var a = m.userData.t + t * (m.userData.r === 3.4 ? .25 : .16); m.position.set(Math.cos(a) * m.userData.r, Math.sin(a) * m.userData.r, 0); });
        hedefKam.x += (fare.x * .9 - hedefKam.x) * .04; hedefKam.y += (-fare.y * .6 - hedefKam.y) * .04; kam.position.x = hedefKam.x; kam.position.y = hedefKam.y;
        grup.rotation.x = kaydir.v * .9 + fare.y * .08; grup.rotation.y = -fare.x * .12; kam.position.z = 9 + kaydir.v * 6; grup.position.y = -kaydir.v * 1.5;
        if (!video || dar) { var z = .86 + Math.sin(t * .09) * .06; doku.repeat.set(z, z); doku.offset.set((1 - z) / 2 + Math.sin(t * .07) * .02, (1 - z) / 2 + Math.cos(t * .05) * .02); }
        daire.lookAt(kam.position);
      }
      kam.lookAt(0, 0, 0); ren.render(sahne, kam);
      if (!azHareket) requestAnimationFrame(cerceve); else calisiyor = false;
    }
    calisiyor = true; requestAnimationFrame(cerceve);
  }
})();
