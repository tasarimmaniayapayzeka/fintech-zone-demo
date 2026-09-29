/* Fintech Zone İstanbul · demo betiği
   Menü, kaydırınca beliren bölümler, sayaçlar, bülten/iletişim formu, profil sekmeleri.
   Bağımlılık yok. WordPress temasına taşınırken olduğu gibi tema.js olarak alınabilir. */
(function () {
  'use strict';
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobil menü ---- */
  var menuDugme = document.querySelector('.menu-ac');
  var menu = document.getElementById('ana-menu');
  if (menuDugme && menu) {
    menuDugme.addEventListener('click', function () {
      var acik = menu.classList.toggle('acik');
      menuDugme.setAttribute('aria-expanded', acik ? 'true' : 'false');
      menuDugme.setAttribute('aria-label', acik ? 'Menüyü kapat' : 'Menüyü aç');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('acik')) { menu.classList.remove('acik'); menuDugme.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---- aktif menü bağlantısı ---- */
  var sayfa = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.ust-menu a[href]').forEach(function (a) {
    var h = (a.getAttribute('href') || '').toLowerCase();
    if (h === sayfa || (sayfa === 'haber-calistay.html' && h === 'haberler.html')) a.classList.add('aktif');
  });

  /* ---- kaydırınca beliren bölümler (IntersectionObserver; scroll dinleyicisi yok) ---- */
  var gorunler = document.querySelectorAll('.gorun');
  if (azHareket || !('IntersectionObserver' in window)) {
    gorunler.forEach(function (el) { el.classList.add('gorundu'); });
  } else {
    var go = new IntersectionObserver(function (girdiler) {
      girdiler.forEach(function (g) {
        if (g.isIntersecting) { g.target.classList.add('gorundu'); go.unobserve(g.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    gorunler.forEach(function (el) { go.observe(el); });
    /* Ekranda zaten olanlar ilk karede görünsün */
    requestAnimationFrame(function () {
      gorunler.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('gorundu');
      });
    });
  }

  /* ---- sayaçlar: gerçek rakamlar data-sayac ile gelir, sayfa açılınca sayar ---- */
  function bicimle(n, bicim) {
    return bicim === 'tr' ? n.toLocaleString('tr-TR') : String(n);
  }
  var sayaclar = document.querySelectorAll('[data-sayac]');
  function sayacBaslat(el) {
    var hedef = parseInt(el.getAttribute('data-sayac'), 10);
    var bicim = el.getAttribute('data-bicim');
    if (azHareket || isNaN(hedef)) { el.textContent = bicimle(hedef || 0, bicim); return; }
    var sure = 1100, t0 = null;
    function adim(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / sure);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = bicimle(Math.round(hedef * e), bicim);
      if (k < 1) requestAnimationFrame(adim);
    }
    requestAnimationFrame(adim);
  }
  if (sayaclar.length) {
    if ('IntersectionObserver' in window && !azHareket) {
      var so = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (g) { if (g.isIntersecting) { sayacBaslat(g.target); so.unobserve(g.target); } });
      }, { threshold: 0.4 });
      sayaclar.forEach(function (el) { so.observe(el); });
    } else {
      sayaclar.forEach(sayacBaslat);
    }
  }

  /* ---- formlar (demo: sunucu yok, doğrulama + onay mesajı) ---- */
  function formKur(form) {
    if (!form) return;
    var mesaj = form.querySelector('.form-mesaj');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var eksik = [];
      form.querySelectorAll('[required]').forEach(function (alan) {
        var bos = alan.type === 'checkbox' ? !alan.checked : !alan.value.trim();
        var hatali = alan.type === 'email' && alan.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(alan.value);
        if (bos || hatali) eksik.push(alan);
      });
      if (eksik.length) {
        mesaj.className = 'form-mesaj hata';
        mesaj.textContent = eksik[0].type === 'checkbox' ? 'Devam etmek için onay kutusunu işaretleyin.' : 'Lütfen zorunlu alanları kontrol edin.';
        eksik[0].focus();
        return;
      }
      mesaj.className = 'form-mesaj ok';
      mesaj.textContent = form.getAttribute('data-ok') || 'Teşekkürler, kaydınız alındı. (Demo: sunucu bağlantısı canlı sitede kurulacak.)';
      form.reset();
    });
  }
  formKur(document.getElementById('bulten-form'));
  formKur(document.getElementById('iletisim-form'));

  /* ---- hero videosu: hareket azaltmada ve dar ekranda inmez, poster kalır ---- */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    if (azHareket || window.matchMedia('(max-width: 700px)').matches || (navigator.connection && navigator.connection.saveData)) {
      heroVideo.removeAttribute('autoplay');
      heroVideo.preload = 'none';
      heroVideo.querySelectorAll('source').forEach(function (s) { s.remove(); });
      heroVideo.load();
    }
  }

  /* ---- başlık kelimeleri maskeli açılır (h1; em.vurgu korunur) ---- */
  var basliklar = document.querySelectorAll('.hero h1, .sayfa-bas h1');
  if (basliklar.length && !azHareket) {
    var sira = 0;
    function sar(dugum) {
      Array.prototype.slice.call(dugum.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parcalar = n.textContent.split(/(\s+)/);
          var kap = document.createDocumentFragment();
          parcalar.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { kap.appendChild(document.createTextNode(p)); return; }
            var d = document.createElement('span'); d.className = 'kelime';
            var i = document.createElement('span'); i.textContent = p; i.style.setProperty('--i', sira++);
            d.appendChild(i); kap.appendChild(d);
          });
          n.parentNode.replaceChild(kap, n);
        } else if (n.nodeType === 1 && !n.classList.contains('kelime')) { sar(n); }
      });
    }
    basliklar.forEach(sar);
  }

  /* ---- ortaklık halkası: legend üzerine gelince dilim vurgulanır ---- */
  document.querySelectorAll('.info-halka').forEach(function (h) {
    var dilimler = h.querySelectorAll('circle.dilim');
    h.querySelectorAll('li').forEach(function (li, i) {
      li.addEventListener('mouseenter', function () { h.classList.add('vurgulu'); dilimler.forEach(function (d, j) { d.classList.toggle('secili', i === j); }); });
      li.addEventListener('mouseleave', function () { h.classList.remove('vurgulu'); dilimler.forEach(function (d) { d.classList.remove('secili'); }); });
    });
  });

  /* ---- ortak logoları: akan şerit (sayfada bir kez; hareket azaltmada durağan duvar) ---- */
  var duvar = document.querySelector('.logo-duvari');
  if (duvar && !azHareket) {
    var ic = document.createElement('div');
    ic.className = 'kayan-ic';
    while (duvar.firstChild) ic.appendChild(duvar.firstChild);
    var kopya = ic.cloneNode(true);
    kopya.setAttribute('aria-hidden', 'true');
    kopya.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
    duvar.appendChild(ic); duvar.appendChild(kopya);
    duvar.classList.add('kayan');
  }

  /* ---- hero yörüngesi fareyi izler (pointermove; scroll dinleyicisi değil) ---- */
  var heroAlan = document.querySelector('.hero');
  var heroYorunge = heroAlan && heroAlan.querySelector('.yorunge');
  if (heroYorunge && !azHareket && window.matchMedia('(pointer: fine)').matches) {
    var bekleyen = null;
    heroAlan.addEventListener('pointermove', function (e) {
      if (bekleyen) return;
      bekleyen = requestAnimationFrame(function () {
        bekleyen = null;
        var r = heroAlan.getBoundingClientRect();
        var fx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var fy = ((e.clientY - r.top) / r.height - 0.5) * 2;
        heroYorunge.style.setProperty('--fx', fx.toFixed(3));
        heroYorunge.style.setProperty('--fy', fy.toFixed(3));
      });
    });
    heroAlan.addEventListener('pointerleave', function () {
      heroYorunge.style.setProperty('--fx', '0'); heroYorunge.style.setProperty('--fy', '0');
    });
  }

  /* ---- infografikler: görünür olunca canlanır ---- */
  var infolar = document.querySelectorAll('[data-canli]');
  if (infolar.length) {
    if (azHareket || !('IntersectionObserver' in window)) {
      infolar.forEach(function (el) { el.classList.add('canli'); });
    } else {
      var io = new IntersectionObserver(function (girdiler) {
        girdiler.forEach(function (g) { if (g.isIntersecting) { g.target.classList.add('canli'); io.unobserve(g.target); } });
      }, { threshold: 0.25 });
      infolar.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- profil sekmeleri (başvuru sayfası) ---- */
  var sekmeler = document.querySelectorAll('.profil-sekme');
  if (sekmeler.length) {
    sekmeler.forEach(function (s) {
      s.addEventListener('click', function () {
        sekmeler.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        s.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.profil-panel').forEach(function (p) { p.classList.toggle('aktif', p.id === s.getAttribute('aria-controls')); });
      });
    });
  }
})();
