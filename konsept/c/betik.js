/* Fintech Zone · Yön C tam site betiği
   Gerekli: GSAP + ScrollTrigger (cdnjs). Three.js yalnız #kure olan sayfada.
   Bileşenler işaretle çalışır: .serit, .terminal[data-yaz], #kure, .tur, [data-sayac], [data-canli], [data-paralaks], .sekme, form */
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

  function ustH() { var u = document.querySelector('.ust'); return u ? u.offsetHeight : 0; }
  /* ---- yatay tur ---- */
  document.querySelectorAll('.tur').forEach(function (sec) {
    var ray = sec.querySelector('.ray'), nav = sec.querySelector('.tur-nav'); if (!ray) return;
    var adet = ray.children.length, noktaKap = nav && nav.querySelector('.nokta'), sayiEl = nav && nav.querySelector('.sayi');
    if (noktaKap && !noktaKap.children.length) for (var i = 0; i < adet; i++) { var b = document.createElement('button'); b.setAttribute('aria-label', 'Durak ' + (i + 1)); if (!i) b.className = 'aktif'; noktaKap.appendChild(b); }
    var noktalar = noktaKap ? Array.prototype.slice.call(noktaKap.children) : [];
    if (!GS || azHareket || dar) return;
    var mes = function () { return ray.scrollWidth - innerWidth; };
    var st = ScrollTrigger.create({ trigger: sec, start: function () { return 'top ' + ustH(); }, end: function () { return '+=' + Math.round(mes() * 2.2); }, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      snap: { snapTo: 1 / (adet - 1), duration: { min: .2, max: .6 }, ease: 'power2.inOut' },
      onUpdate: function (t) { gsap.set(ray, { x: -mes() * t.progress }); var k = Math.round(t.progress * (adet - 1)); noktalar.forEach(function (n, i) { n.classList.toggle('aktif', i === k); }); if (sayiEl) sayiEl.textContent = ('0' + (k + 1)).slice(-2) + ' / 0' + adet; } });
    function git(k) { k = Math.max(0, Math.min(adet - 1, k)); window.scrollTo({ top: st.start + (st.end - st.start) * k / (adet - 1), behavior: 'smooth' }); }
    noktalar.forEach(function (n, i) { n.addEventListener('click', function () { git(i); }); });
    if (nav) nav.querySelectorAll('.ok').forEach(function (o) { o.addEventListener('click', function () { git(Math.round(st.progress * (adet - 1)) + parseInt(o.getAttribute('data-yon'), 10)); }); });
  });


  /* ---- veri şeridi: içeriği ikile ---- */
  document.querySelectorAll('.serit-ic').forEach(function (s) { if (azHareket) { s.style.animation = 'none'; return; } var k = s.cloneNode(true); k.setAttribute('aria-hidden', 'true'); s.parentNode.appendChild(k); });

  /* ---- terminal satırları kendini yazar ---- */
  var terminaller = document.querySelectorAll('.terminal[data-yaz]');
  if (terminaller.length && !azHareket && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('yaz-hazir');
    terminaller.forEach(function (term) {
      var satirlar = Array.prototype.slice.call(term.querySelectorAll('.satir')), metinler = satirlar.map(function (s) { return s.textContent; }), sonImlec = satirlar.length && satirlar[satirlar.length - 1].querySelector('.imlec');
      satirlar.forEach(function (s, i) { if (!(sonImlec && i === satirlar.length - 1)) s.textContent = ''; });
      var io = new IntersectionObserver(function (g) {
        if (!g[0].isIntersecting) return; io.disconnect(); var i = 0;
        (function yaz() {
          if (i >= satirlar.length) return;
          var s = satirlar[i], m = metinler[i], j = 0; s.style.opacity = 1;
          if (sonImlec && i === satirlar.length - 1) return;
          var hiz = s.classList.contains('in') ? 34 : 10;
          (function harf() { if (j <= m.length) { s.textContent = m.slice(0, j++); setTimeout(harf, hiz); } else { i++; setTimeout(yaz, s.classList.contains('in') ? 220 : 380); } })();
        })();
      }, { threshold: .35 });
      io.observe(term);
    });
  }

  /* ---- Three.js parçacık küre (yalnız #kure varsa) ---- */
  var tuval = document.getElementById('kure');
  if (window.THREE && tuval) {
    var ren = new THREE.WebGLRenderer({ canvas: tuval, alpha: true, antialias: true }); ren.setPixelRatio(Math.min(devicePixelRatio, 2));
    var sahne = new THREE.Scene(), kam = new THREE.PerspectiveCamera(36, 1, .1, 100); kam.position.set(0, 0, 7.6);
    var grup = new THREE.Group(); sahne.add(grup);
    var R = 2.3, N = dar ? 1400 : 2600, poz = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963; poz[i * 3] = Math.cos(th) * r * R; poz[i * 3 + 1] = y * R; poz[i * 3 + 2] = Math.sin(th) * r * R; }
    var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(poz, 3));
    grup.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x3FC1CC, size: .028, transparent: true, opacity: .75 })));
    for (var e = -60; e <= 60; e += 30) { var rr = Math.cos(e * Math.PI / 180) * R, yy = Math.sin(e * Math.PI / 180) * R, pts = []; for (var a2 = 0; a2 <= 96; a2++) { var t2 = a2 / 96 * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(t2) * rr, yy, Math.sin(t2) * rr)); } grup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x2B6E75, transparent: true, opacity: .35 }))); }
    function konum(lat, lon, rad) { var p = (90 - lat) * Math.PI / 180, l = (lon + 180) * Math.PI / 180; return new THREE.Vector3(-rad * Math.sin(p) * Math.cos(l), rad * Math.cos(p), rad * Math.sin(p) * Math.sin(l)); }
    var ist = konum(41.02, 29.1, R), lag = konum(6.45, 3.4, R);
    var isaret = new THREE.Mesh(new THREE.SphereGeometry(.07, 16, 16), new THREE.MeshBasicMaterial({ color: 0xFFB548 })); isaret.position.copy(ist); grup.add(isaret);
    var halka = new THREE.Mesh(new THREE.RingGeometry(.1, .13, 40), new THREE.MeshBasicMaterial({ color: 0xFFB548, transparent: true, opacity: .8, side: THREE.DoubleSide })); halka.position.copy(ist); halka.lookAt(new THREE.Vector3(0, 0, 0)); grup.add(halka);
    var lagos = new THREE.Mesh(new THREE.SphereGeometry(.05, 16, 16), new THREE.MeshBasicMaterial({ color: 0x3FC1CC })); lagos.position.copy(lag); grup.add(lagos);
    var orta = ist.clone().add(lag).multiplyScalar(.5).normalize().multiplyScalar(R * 1.45);
    var egri = new THREE.QuadraticBezierCurve3(ist, orta, lag); grup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(egri.getPoints(80)), new THREE.LineBasicMaterial({ color: 0xFFB548, transparent: true, opacity: .9 })));
    var yolcu = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); grup.add(yolcu);
    grup.rotation.y = -Math.atan2(ist.z, ist.x) + Math.PI / 2 - .6;
    var hedef = { x: 0, y: grup.rotation.y }, suruk = false, son = { x: 0, y: 0 };
    if (!azHareket) {
      tuval.addEventListener('pointerdown', function (ev) { suruk = true; son = { x: ev.clientX, y: ev.clientY }; tuval.setPointerCapture(ev.pointerId); });
      tuval.addEventListener('pointermove', function (ev) { if (!suruk) return; hedef.y += (ev.clientX - son.x) * .006; hedef.x += (ev.clientY - son.y) * .004; hedef.x = Math.max(-1, Math.min(1, hedef.x)); son = { x: ev.clientX, y: ev.clientY }; });
      addEventListener('pointerup', function () { suruk = false; });
    }
    function boyut() { var w = tuval.clientWidth, h = tuval.clientHeight; ren.setSize(w, h, false); kam.aspect = w / h; kam.updateProjectionMatrix(); var yari = 7.6 * Math.tan(18 * Math.PI / 180) * kam.aspect; grup.position.x = dar ? 0 : Math.min(1.9, yari * .45); }
    boyut(); addEventListener('resize', boyut);
    var t0 = performance.now(), gorunur = true, calisiyor = false;
    new IntersectionObserver(function (gg) { gorunur = gg[0].isIntersecting; if (gorunur && !calisiyor && !azHareket) { calisiyor = true; requestAnimationFrame(cerceve); } }, { threshold: 0 }).observe(tuval);
    function cerceve(ts) { if (!gorunur) { calisiyor = false; return; } var t = (ts - t0) / 1000; if (!azHareket && !suruk) hedef.y += .0018; grup.rotation.y += (hedef.y - grup.rotation.y) * .08; grup.rotation.x += (hedef.x - grup.rotation.x) * .08; halka.scale.setScalar(1 + Math.sin(t * 3) * .18); yolcu.position.copy(egri.getPoint((t * .18) % 1)); ren.render(sahne, kam); if (!azHareket) requestAnimationFrame(cerceve); else calisiyor = false; }
    calisiyor = true; requestAnimationFrame(cerceve);
  }

  /* ---- paralaks (sahne fotoğrafları) ---- */
  if (GS && !azHareket) document.querySelectorAll('[data-paralaks]').forEach(function (img) { gsap.to(img, { yPercent: -10, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }); });

})();
