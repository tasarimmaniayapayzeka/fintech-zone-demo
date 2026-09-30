# 37 · Fintech Zone İstanbul — web sitesi demosu

Teklif sürecinde FTZ'ye gösterilecek yeniden tasarım önerisi. Yön: **C · Yörünge** (kullanıcı tercih bildirmedi, önceki sekmenin önerisi uygulandı). Devir notu ve kaynaklar: `36-FintechZone-Teklif/DEVIR-NOTU-web-demo.md`, `site-analizi.md`.

**Yapıldı:** 29 Eylül 2026. Kullanıcı isteği: "modern, kurumsal, insan eli ile yapılmış gibi, sonuç odaklı; chatbot gömülü; hareketli kurumsal infografikler; TorThermal seviyesinde kapsamlı."

## Çalıştırma ve derleme

Statik HTML. Sayfalar **`kaynak/`** klasöründen derlenir:

```
node kur.js
```

- `kaynak/ust.html` üst bar (açılır menülü), `kaynak/alt.html` footer, `kaynak/sayfalar/<ad>.html` sayfa gövdesi (ilk satır `<!-- meta {...} -->`: başlık, açıklama, og görseli).
- Kök dizindeki `*.html` dosyaları **üretilmiş çıktıdır**; elle düzenlenmez, kaynak düzenlenip `node kur.js` çalıştırılır. Betik `stil.css`, `betik.js`, `asistan.js` bağlantılarına önbellek kırıcı sürüm ekler.
- Yerel önizleme: `python -m http.server 8037 --directory "<bu klasör>"`. Claude Code'da `.claude/launch.json` girdisi `ftz-demo` (32-EssConcept-Chatbot oturumunda tanımlı).

WordPress'e geçişte: `ust.html` → `header.php`, `alt.html` → `footer.php`, sayfa gövdeleri → Klasik Editör içeriği, infografikler ve profil seçici → kısa kod.

## Sürümler

- **Sürüm 1 (durağan, 29 Eylül):** `v1/` klasörü ve git etiketi `v1`. Canlıda https://tasarimmaniayapayzeka.github.io/fintech-zone-demo/v1/ . Elle düzenlenmez.
- **Sürüm 2 (hareketli, 29 Eylül, kök dizin):** hareket katmanı eklendi. Hero: kelime kelime maskeli başlık, videonun çevresinde gerçek rakamlı dört "uydu" çipi (7 ortak, 30 girişim, 20 mentör, 1.935 dk), yavaş dönen kesikli halkalar, fare takibi; yaylar sürekli döner, dairesel fotoğraf nefes alır; koyu **vurgu bandı** (sayfadaki tek koyu blok, dört sayaç); ortak logoları akan şerit; listeler kademeli belirir, adım çizgileri çizilir; hover'da görsel yakınlaşma, düğme yükselme; üst bar kaydırınca incelir; porselen bölümlerde dönen yay filigranı. İnfografikler: Gate akışında bağlantı üzerinde hareket eden paketler, kuluçka yolunda ilerleyen nokta, yörüngede merkezden düğümlere akan bağlar, halkada legend hover'ı. Hepsi `prefers-reduced-motion`'da kapanır; 375 px'te uydular ve arka plan halkaları gizlenir.
- Kaynak: Figma C yönü şablonlarındaki "yörüngede büyük rakam", tarih çipi ve el yazısı not dili hero ve vurgu bandına taşındı.

## Konsept demoları (30 Eylül 2026): eski siteden kopan üç yön

Kullanıcı: "site eski siteye hâlâ çok benziyor; scrolltide.co gibi çok boyutlu, olağanüstü fikir ve demolar". Sürüm 1 ve 2 eski iskeleti (hero + bölümler) koruyordu; `konsept/` altındaki üç sayfa iskeleti kırar. Karşılaştırma: `konsept/index.html`.

| Dosya | Yön | Mekanikler |
|---|---|---|
| `konsept/a-yorunge-3d.html` | **A · Yörünge 3D** (gece charcoal, sinematik) | Three.js sahne: kampüs videosu dokulu daire, logonun iki yayı torus olarak, iki nokta halkası ve paydaş küreleri; fare kamerayı, kaydırma sahneyi çeker. GSAP: sabitlenen "beş başlık" (madde + fotoğraf değişir), yatay Fintech Gate turu, paralakslı haber. CSS 3D halka carousel. |
| `konsept/b-sinematik.html` | **B · Finans Kenti Sinematik** (porselen, dergi) | Tam ekran fotoğraf + canvas "yaşayan ışık" (screen) + gren; "İFM'nin içinde" harflerinde kayan siluet (background-clip:text, scrub); yatay kampüs turu; sticky yığılan beş kart; dev sayaçlar; dergi düzeni iç sayfa (süslü ilk harf, alıntı). |
| `konsept/c-terminal.html` | **C · Terminal** (Sherpa koyu, ızgara) | Akan veri şeridi; Three.js parçacık küre, İstanbul işareti, Lagos'a rota ve gezen nokta (Nijerya heyeti), sürükleyerek döndürme; metrik konsolu (sayaç, halka, çubuk); kendini yazan başvuru terminali; Fintech Gate konsolu + olay kaydı. |

Ortak: `konsept/konsept.css`. Kütüphaneler cdnjs'ten (three r128, gsap 3.12.5 + ScrollTrigger). Yalnız gerçek rakam ve görsel; WebGL döngüleri hero ekran dışındayken durur; `prefers-reduced-motion`'da sahneler sabit, içerik tam. Mobilde 3D soluklaşır, yatay turlar dikeye döner. Seçilen yön 13 sayfanın tamamına uygulanacak.

## Yayın adresleri (29 Eylül 2026)

- **GitHub Pages:** https://tasarimmaniayapayzeka.github.io/fintech-zone-demo/ (depo `tasarimmaniayapayzeka/fintech-zone-demo`, herkese açık, sayfalar `noindex`). Güncellemek için: `node kur.js`, sonra `git add -A; git commit -m "..."; git push`. Pages 1-2 dakikada yeniler.
- **Tek dosya (Claude artifact, hesaba özel):** https://claude.ai/artifact/H29UEcuQ4y3s6LXXStujTA. Üretimi: `node kur-tek.js` → `ftz-demo-tek.html` (13 sayfa tek HTML'de, #hash ile geçiş, görseller gömülü, 3,3 MB).
- Her iki sürümde de en üstte "tasarım önerisi, resmi site değildir" şeridi var (`kaynak/ust.html`, `.demo-serit`).
- Not: PowerShell 5.1'de `&&` çalışmaz; komutları `;` ile bağla.

## Sayfalar (13)

| Dosya | İçerik | İnfografik |
|---|---|---|
| `index.html` | Hero (yörünge + kubbeli meydan), ortak logoları, Neden Fintech Zone (5 başlık), **ekosistem yörüngesi**, 3 adımlı başvuru (merdiven), Fintech Gate rakamları (sayaç), haberler, webinar bandı, SSS, bülten | Ekosistem yörüngesi |
| `hakkimizda.html` | Vizyon, misyon, değerler, künye, ekosistem profilleri, kampüs galerisi, ortaklar | |
| `ekosistem.html` | Yörünge (büyük), kümelenme programları, **ortaklık halkası** (7 ortak: akademi 3, teknoloji 2, kamu 1, finans 1), logolar | Yörünge, halka |
| `kulucka-merkezi.html` | Fikir → Ürün → Pazar yolculuğu, neler sunuyoruz, SSS | Yolculuk (çizilen yol) |
| `muafiyet-ve-avantajlar.html` | Teknoloji Geliştirme Bölgeleri mevzuatı başlıkları (rakamsız), İFM avantajı, nasıl yararlanılır | Katmanlar |
| `fintech-gate.html` | **Akış** (kurum → Gate → girişim), program akışı, gerçek mentörlük rakamları, **oturum anatomisi**, çalıştay galerisi, İSTKA şeridi | Akış, oturum halkası |
| `basvuru-sureci.html` | 3 adım, profil seçici (6 sekme), belge listesi, SSS | |
| `haberler.html` | Haber listesi (6 kart; 3'ü detay yer tutucu) | |
| `haber-calistay.html` | Haber detayı: Fintech Gate Kurumsal Paydaşlar Çalıştayı, 22 Eylül 2026 | |
| `etkinlikler.html` | Zaman çizelgesi: webinar 2 (yakında), webinar 1, çalıştay, GITEX, Nijerya heyeti, mentörlük dönemi | Zaman çizelgesi |
| `webinar.html` | Bölümler, kayıt formu | |
| `sss.html` | Üç grupta 12 soru, yan menü | |
| `iletisim.html` | Adres, sosyal medya, harita yer tutucu, iletişim formu | |

Ortak dosyalar: `stil.css` (tek stil dosyası), `betik.js` (menü, beliren bölümler, sayaçlar, formlar, sekmeler, infografik tetikleyici), `asistan.js` (FTZ Asistan chatbot widget'ı).

## İnfografikler (7, hepsi SVG + CSS, kredi harcamadan)

Görünür olunca canlanır (`data-canli` → IntersectionObserver `.canli`), `prefers-reduced-motion`'da sabit durur. Rakamlar yalnız gerçek veriden:

1. **Ekosistem yörüngesi:** merkezde O ikonu, iki halkada 6 paydaş; halkalar zıt yönde döner, etiketler dik kalır, üzerine gelince durur.
2. **Fintech Gate akışı:** kurum ↔ Gate ↔ girişim, akan kesikli bağlantılar; altta 4 adım.
3. **Ortaklık halkası:** 7 ortağın sektör dağılımı, dilimler sırayla dolar.
4. **Oturum anatomisi:** 1.935 dk / 32 oturum ≈ 60 dk (dolan halka); 288 / 32 = 9 soru; 32 / 15 ≈ 2 oturum/gün; 30 / 20 = 1,5 girişim/mentör.
5. **Zaman çizelgesi:** çizgi uzar, noktalar sırayla belirir.
6. **Kuluçka yolculuğu:** kırmızı yol çizilir, üç durak belirir.
7. **Muafiyet katmanları:** altı katman soldan açılır, genişlikleri kademeli.

## FTZ Asistan (chatbot)

- Tek dosya, bağımlılık yok; her sayfanın sonunda `asistan.js`.
- **Demo modu:** yerel bilgi tabanından cevap verir (yalnız kurumun metinleri ve gerçek rakamlar; bilmediğinde söyler, iletişime yönlendirir).
- **Canlı mod:** `window.FTZ_ASISTAN_UC = '/asistan-api.php'` tanımlanınca mesajlar oraya POST edilir; beklenen yanıt `{cevap, kaynaklar:[{baslik,url}]}`. Arka uç örnekleri: `11-TorThermal/tor-thermal-web/chatbot.php` (anahtar webroot dışında, hız sınırı), `32-EssConcept-Chatbot/yayin/` (RAG bilgi tabanı).
- Sesli giriş (Web Speech API, Chrome), hızlı bağlantılar, kaynak çipleri, oturum geçmişi, Escape ile kapanır.

## Tasarım kararları

- **Resmi kimlik dışına çıkılmadı:** Charcoal #3B4A59, Lava Red #E1251B, Sherpa #004750, Teal #008895, Porcelain #F2F2F2, Butterscotch #FFB548. DM Serif Display + IBM Plex Sans + IBM Plex Mono + Caveat (yalnız iki el yazısı notu).
- **Yörünge motifi:** logodaki O ikonunun iki kırmızı yayı dairesel fotoğrafı ya da büyük rakamı çevreler; kaydırmayla ±16° döner (CSS `animation-timeline: view()`).
- **Biçim kuralı:** düğme ve çip tam yuvarlak; fotoğraf keskin dikdörtgen ya da tam daire; giriş alanı 4 px.
- Mevcut sitedeki sorunlara karşılık: stok borsa grafiği yok, gerçek bina ve etkinlik fotoğrafları; beliren bölümler hafif (%50 saydamlıktan başlar, sayfa hiç boş görünmez); Fintech Gate ana siteyle aynı dilde.
- Kaydırma dinleyicisi yok; IntersectionObserver ve CSS scroll-driven animation. Ayarlar (design-taste): çeşitlilik 6, hareket 3, yoğunluk 4.
- Kontrol: 1440 px masaüstü ve 375 px mobilde 13 sayfa yatay taşma taramasından geçti.

## Görseller

`gorsel/` içindeki WebP'ler `36-FintechZone-Teklif/varliklar/figma/*.jpg`'den ffmpeg ile üretildi (1600 + 800 px, `srcset`). Çalıştay fotoğraflarında alt %20 (FINTECHZONE filigranı) kırpıldı. Devir varlıklarındaki eski temsilî görseller kullanılmadı; yeni üretilenler aşağıda. Ortak logoları: CBYFO ve İFM devir varlıklarından; diğer beşi fintech.zone'dan 1,5 sn arayla indirildi.

**Higgsfield üretimleri (29 Eylül, kullanıcı onayıyla, toplam ~13 kredi):**
- Hero videosu: `gorsel/hero-kampus.mp4` + `.webm` (720×720 kare kırpım, 6 sn, sessiz döngü; kaynak `varliklar-kaynak/higgsfield/hero-video-a.mp4`, model Cinema Studio V2, başlangıç karesi bina renderı 1). Hareket azaltmada, 700 px altında ve veri tasarrufunda inmez; poster `daire-meydan-700.webp` kalır. B varyantı da kaynakta duruyor.
- Temsilî fotoğraflar (Soul V2, belgesel/film tarzı): `temsili-girisim-ekibi` (kuluçka), `temsili-mentorluk` (Fintech Gate), `temsili-danismanlik` (muafiyet). Sayfada "Temsilî görsel" diye etiketli; gerçek kişiyle eşleştirilmedi. Dördüncü kare (boş ofis katı) karanlık çıktı, kullanılmadı.

## FTZ'den alınacaklar (sayfalarda "(FTZ'den alınacak)" diye işaretli)

- Değerlendirme süresi ve kriterleri, belge listesi; kuluçka süresi, kontenjan, ücret
- Muafiyet ve teşvik oranları (demoda hiç rakam verilmedi)
- İSTKA logosu; Fintech Gate dönem takvimi
- Webinar 2. bölüm tarihi ve 1. bölüm kaydı; TÜBİTAK 1707 son başvuru tarihi
- E-posta ve telefon; çalıştay konuşmacı adları
- İngilizce sürüm, KVKK ve çerez metinleri
- Vizyon cümlesi tutarsızlığı: kimlik sayfası "Milli strateji ile… global bir merkez olmak", ana sayfa "evrensel bir üs olmak". Demoda kimlik sayfasındaki kullanıldı.

## Canlıya geçerse

CLAUDE.md kuralı: **WordPress + Klasik Editör**, tema bu tasarımdan yazılır, her metin ve görsel panelden değişir. Yazılar `00-SEO-STANDART/ICERIK-URETIM-STANDARDI.md`'ye göre yeniden yazılır ve kopya denetiminden geçer; demo için bu denetim yapılmadı.
