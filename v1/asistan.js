/* FTZ Asistan · Fintech Zone İstanbul site asistanı (widget)
   Tek dosya, bağımlılık yok. Kimlik: Charcoal / Lava Red / Porcelain, DM Serif + IBM Plex.

   Çalışma biçimi:
   - window.FTZ_ASISTAN_UC tanımlıysa (ör. '/asistan-api.php') mesajlar oraya POST edilir
     {oturum, mesajlar:[{rol:'ben'|'bot', icerik}]} ve {cevap, kaynaklar:[{baslik,url}]} beklenir.
   - Tanımlı değilse (bu demo) yerel bilgi tabanından cevap verir. Bilgi tabanı yalnız
     fintech.zone resmi metinlerinden derlendi (kaynak/resmi-bilgi.md, 30 Eylül 2026);
     rakam ve tarih uydurmaz, bilmediği konuda info@fintech.zone ve 0216 222 2963'ü verir.
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
  var EPOSTA = 'mailto:info@fintech.zone', TEL = 'tel:+902162222963';
  var BILGI = [
    { k: /kvkk|kişisel veri|kisisel veri|çerez|cerez|aydınlatma|aydinlatma|gizlilik/i,
      c: "Yasal metinlerimiz fintech.zone üzerinde yer alır: KVKK Ziyaretçi Aydınlatma Metni, Çerez Politikası ve Aydınlatma Bildirimi. Bağlantılar aşağıda.\n\nLütfen bu sohbette kişisel veri paylaşmayın.",
      kay: [{ baslik: 'KVKK', url: 'https://fintech.zone/kvkk-ziyaretci-aydinlatma-metni/' }, { baslik: 'Çerez Politikası', url: 'https://fintech.zone/cerez-politikasi/' }, { baslik: 'Aydınlatma Bildirimi', url: 'https://fintech.zone/aydinlatma-bildirimi/' }] },
    { k: /[iİ]ngilizce|english/i,
      c: "Sitenin İngilizce sürümüne https://fintech.zone/en/fintech-zone-istanbul/ adresinden ulaşabilirsiniz.",
      kay: [{ baslik: 'English', url: 'https://fintech.zone/en/fintech-zone-istanbul/' }] },
    { k: /bülten|bulten|abone|haberdar|e-?posta listesi|eposta listesi/i,
      c: "Faaliyetlerimizle ilgili ayda bir kez gönderdiğimiz epostalara abone olabilirsiniz. Abonelik formu İletişim sayfasında yer alır (İsim, Eposta ve Ticari Elektronik İleti Onay Metni).\n\nWebinarlarımızdan haberdar olmak için fintech.zone/webinar sayfasından e-posta adresinizi bırakabilirsiniz.",
      kay: [{ baslik: 'E-posta aboneliği', url: 'iletisim.html' }, { baslik: 'Webinar', url: 'webinar.html' }] },
    { k: /çalıştay|calistay|çalistay|workshop/i,
      c: "**Fintech Gate Kurumsal Paydaşlar Çalıştayı** 22.09.2026'da İstanbul Finans Merkezi'nde gerçekleştirildi. Çalıştay kapsamında; kurum içi inovasyon ile girişim çevikliğinin doğru zeminde nasıl buluşturulabileceği, PoC (Kavram Kanıtlama) süreçlerinden ticarileşmeye uzanan yolun nasıl hızlandırılabileceği ve gerçek anlamda kazan-kazan yaklaşımı sunan katma değerli iş birliği modellerinin dinamikleri ele alındı.\n\n**Katılımcılar:** Visa Türkiye, Craftgate, Vakıf Katılım, Ziraat Teknoloji, Architecht, Paynion Bilişim A.Ş., Zanha Grup, Kuveyt Türk Katılım Bankası, Matriks Finansal Teknolojiler ve İstanbul Kalkınma Ajansı (İSTKA).",
      kay: [{ baslik: 'Çalıştay haberi', url: 'haber-calistay.html' }, { baslik: 'Fintech Gate', url: 'fintech-gate.html' }] },
    { k: /webinar|webiner|seminer|canlı yayın|canli yayin|tuzcu|ziraat|youtube/i,
      c: "Fintech Zone Webinar Serisi'nin ilk webinarı **“Finansal Teknolojilerin Geleceği”** 23 Eylül 2026 Çarşamba, saat 11.00 – 12.00 arasında yapıldı. Konuk: Ziraat Teknoloji Genel Müdürü Sayın Bayram Tuzcu. Finansal teknolojilerdeki güncel gelişmeler, sektörel yenilikler ve geleceğin teknoloji trendleri ele alındı.\n\nKaydı YouTube'da izleyebilirsiniz: https://youtube.com/live/D5m6uiXl9cQ?feature=share\n\nSeri her ay düzenli olarak devam edecek; yeni etkinlikler ve güncel duyurular fintech.zone/webinar adresinden takip edilebilir.",
      kay: [{ baslik: 'Webinar', url: 'webinar.html' }, { baslik: 'YouTube kaydı', url: 'https://youtube.com/live/D5m6uiXl9cQ?feature=share' }] },
    { k: /mentör|mentor|oturum|rakam|istatistik/i,
      c: "Fintech Zone'un Instagram paylaşımı “Rakamlarla Fintech Gate Mentörlük Oturumları”na göre: 15 gün, 20 mentör, 30 girişim, 32 oturum, 288 soru-cevap ve 1.935 dakika görüşme.\n\nFintech Gate Hızlandırma Programı boyunca startup'lar; teknik eğitimler, mentor desteği, kurumsal şirketlerle eşleşme ve birlikte çalışma fırsatı yakalar. Teknoparkta ayrıca ihtiyaca uygun mentörlük ve danışmanlık desteği sağlanacaktır.",
      kay: [{ baslik: 'Fintech Gate', url: 'fintech-gate.html' }] },
    { k: /kuluçka|kulucka|inkübasyon|inkubasyon|tematik program|erken aşama|erken asama/i,
      c: "Fintech Zone'un Kuluçka Merkezi, fintek dünyasının geleceğini şekillendiren yenilikçi ve dinamik bir inovasyon merkezidir. Girişimcilerin yenilikçi fikirlerini geliştirmelerini ve sürdürülebilir başarıya ulaşmalarını destekleyen bu merkez, aynı zamanda uluslararası yatırımlara erişim ve global rekabetçilik için gerekli destek ve hizmetleri sunmaktadır.\n\n**Programlar:** Ön Kuluçka Programları · Kuluçka Programları · Farklı Fintek Dikeylerinde Tematik Programlar · Erken Aşama Hızlandırma Programları · Uluslararası Hızlandırma Programları.\n\nKuluçka süresi, kontenjan ve ücretler hakkında en doğru bilgi için info@fintech.zone ya da 0216 222 2963.",
      kay: [{ baslik: 'Kuluçka Merkezi', url: 'kulucka-merkezi.html' }, { baslik: 'Ekosistem', url: 'ekosistem.html' }] },
    { k: /nijerya|nigeria|heyet/i,
      c: "05.08.2026 · **Nijerya'dan Finans ve Akademi Dünyasının Üst Düzey Temsilcilerini Ağırladık**\nNijerya'nın farklı eyaletlerinden finans, akademi ve bilişim alanlarında görev yapan yöneticilerden oluşan geniş bir heyeti İstanbul Finans Merkezi'nde ağırladık. Ziyaret kapsamında Türkiye'deki teknopark yapılanması, girişimcilik olanakları ve finansal teknolojiler ekosisteminin gelişimi hakkında bilgi paylaşımında bulunduk.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /aselsan.*(ziyaret|nezaket)|(ziyaret|nezaket).*aselsan|ebru tümer|ebru tumer|[iİ]smail anı|[iİ]smail ani/i,
      c: "09.07.2026 · **ASELSAN'dan Fintech Zone'a Nezaket Ziyareti**\nASELSAN Bağımsız Yönetim Kurulu Üyeleri Ebru Tümer ve İsmail Anı, İstanbul Finans Merkezi'nde faaliyetlerini sürdüren Fintech Zone'un yönetim ofisine nezaket ziyaretinde bulundu. Fintech Zone Genel Müdürü Bilal Benna Haksal tarafından ağırlanan heyete Fintech Zone'un mevcut çalışmaları, ekosistem içerisindeki konumu ve gelecek döneme ilişkin planları hakkında bilgi paylaşımında bulunuldu.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /techinvestor|tech investor|startupfon|yatırımcı aday|yatirimci aday/i,
      c: "22.07.2026 · **TechInvestor Academy ile Yatırımcı Adayları Bilgilendirildi**\nStartupfon iş birliğiyle düzenlenen TechInvestor Academy, 22 Temmuz'da online olarak gerçekleştirildi. Teknoloji ve startup yatırımlarına ilgi duyan yatırımcı adaylarını bir araya getiren etkinlikte; girişimcilik ekosisteminin işleyişi, startup yatırımlarının temel dinamikleri, fon yönetimi ve yatırım süreçlerinde dikkat edilmesi gereken başlıklar ele alındı.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /lansman/i,
      c: "14.05.2026 · **Fintech Gate Lansman Programı Gerçekleştirildi**\nİstanbul Kalkınma Ajansı'nın destekleriyle hayata geçirilen Fintech Gate İstanbul Destek Programı'nın lansmanını, İstanbul Finans Merkezi ev sahipliğinde; finans ve finansal teknoloji ekosisteminden değerli misafirlerimizin katılımıyla gerçekleştirdik.",
      kay: [{ baslik: 'Fintech Gate', url: 'fintech-gate.html' }, { baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /fintech bridge|[iİ]spanya|spain/i,
      c: "17.04.2026 · **“Fintech Bridge: Spain & Türkiye 2026” Etkinliğine Katıldık**\nTürkiye ile İspanya'nın finansal teknoloji ekosistemleri arasındaki iş birliğini güçlendirmeyi amaçlayan etkinlik; kamu kurumları, finans kuruluşları, teknoloji şirketleri ve fintek ekosistemi temsilcilerini bir araya getirdi.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /b[iİ]gg|[iİ]suzu/i,
      c: "23.12.2025 · **BİGGVADİ Girişimden Geleceğe Dönüşüm Programı Projemiz Onaylandı**\nFintech Zone İstanbul olarak, TÜBİTAK BİGG Uygulayıcı Kuruluş çağrısı kapsamında, Bilişim Vadisi ve ISUZU iş birliğiyle sunduğumuz “BİGGVADİ-Girişimden Geleceğe Dönüşüm Programı” isimli projenin desteklenmeye hak kazanmasından memnuniyet duyuyoruz.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /take ?off/i,
      c: "18.12.2025 · **Take Off İstanbul 2025'teydik**\nTürkiye'nin teknoloji ve girişimcilik ekosisteminin en önemli buluşmalarından biri olan Take Off İstanbul girişimcileri, yatırımcıları ve teknoloji liderlerini bir araya getirdi.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /singapore|fintech festival|singapur fintech|singapur festival/i,
      c: "11.12.2025 · **Singapore FinTech Festival 2025'a Katıldık**\nSingapur'da gerçekleştirilen ve 65 binden fazla ziyaretçiye ev sahipliği yapan Singapore FinTech Festival 2025 kapsamında, “Invest in Türkiye – Fintech Zone” pavilyonunda yer alarak fintek girişimlerimizle birlikte ülkemizin finansal teknolojiler ekosistemini uluslararası arenada tanıtma imkânı bulduk.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /riyad|money'20/i,
      c: "18.10.2025 · **Riyad'da Fintech Zone'u ve Ekosistemi Tanıttık**\nFintech Zone İstanbul, Suudi Arabistan'ın başkenti Riyad'da üç gündür devam eden dünyanın önde gelen finansal teknoloji etkinliklerinden Money'20/20'de yerini aldı.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }] },
    { k: /(gate|hızlandırma|hizlandirma).*(kriter|kimler|katıl|katil|şart|sart)|(kriter|kimler|katıl|katil|şart|sart).*(gate|hızlandırma|hizlandirma)/i,
      c: "Fintech Gate'e girişimci bakış açısını kurumsal deneyimle bir araya getirmek isteyen tüm paydaşlar katılabilir.\n\n**Girişimciler (Startuplar) için:**\n• Dikey Uyumluluk: ödeme sistemleri, açık bankacılık, InsurTech, RegTech, siber güvenlik veya gömülü finans alanlarında çözüm üretiyor olmak\n• Teknolojik Olgunluk: en az MVP aşamasında olmak veya ticarileşmiş bir ürüne sahip olmak\n• Ekip Yapısı: ürünü teknik olarak geliştirebilecek ve Sandbox entegrasyonunu yürütebilecek yetkinlikte bir çekirdek ekibe sahip olmak\n• Ölçeklenebilirlik: kurumsal paydaşların (Banka, Sigorta vb.) sistemlerine entegre olabilecek ve yüksek işlem hacmini kaldırabilecek bir iş modeline sahip olmak\n• İnovasyon Odaklılık: mevcut finansal süreçlere yenilikçi, maliyet düşürücü veya verimlilik artırıcı bir yaklaşım sunmak\n\n**Kurumsal Şirketler (Partnerler) için:** Sektörel Odak · İnovasyon Vizyonu · Mentörlük Kapasitesi · İş Birliği İştahı.",
      kay: [{ baslik: 'Fintech Gate', url: 'fintech-gate.html' }, { baslik: 'fintech.zone/fintech-gate', url: 'https://fintech.zone/fintech-gate/' }] },
    { k: /gate|hızlandırma|hizlandirma|[iİ]stka|kalkınma ajans|kalkinma ajans|demo ?day|eşleş|esles|pilot|startup|girişimci çağrı|girisimci cagri|sandbox altyap|sandbox ortam|ser danışmanlık|ser danismanlik|üçlü protokol|uclu protokol/i,
      c: "**Fintech Gate İstanbul Destek Programı**, İstanbul Kalkınma Ajansı (İSTKA) desteğiyle hayata geçirildi. Kurumsal şirketlerin ihtiyaçlarını startup'ların yenilikçi çözümleriyle buluşturmayı ve ticarileşme süreçlerini hızlandırmayı hedefliyor; proje 2026 sonuna kadar devam edecek.\n\n**Proje Yol Haritası:** 1. Kurumsal Başvuru · 2. Kurumsal İhtiyaç Analizi · 3. Kurumsal İnovasyon Hazırlık · 4. Girişimci Çağrısı · 5. Stratejik Eşleştirme (“Üçlü Protokol”) · 6. Hızlandırma Programı · 7. Kurumsal Paydaşların Sandbox Altyapısına Erişim ve Pilot Uygulama · 8. Demo Day ve Ticarileşme\n\n**Takvim:** 15 Haziran (Son Başvuru) Girişimci Başvuru · 15 Haziran – 30 Haziran Başvuru Değerlendirme · 1 Temmuz – 30 Ekim Eğitim ve Mentorluk · 30 Temmuz (Son Tarih) Kurumsal-Startup Eşleştirme · 1 Temmuz – 28 Şubat Pilot Uygulama ve Ticarileşme · Aralık 2026 Demo Day\n\n**Proje paydaşları:** Yürütücü: Fintech Zone (İstanbul Finans ve Teknoloji Üssü) · Destekleyen: İstanbul Kalkınma Ajansı · Proje Ortağı: İstanbul Üniversitesi · İştirakçiler: Ser Danışmanlık & Craftgate",
      kay: [{ baslik: 'Fintech Gate', url: 'fintech-gate.html' }, { baslik: 'fintech.zone/fintech-gate', url: 'https://fintech.zone/fintech-gate/' }] },
    { k: /\bsss\b|sık sorulan|sik sorulan|merak edilen/i,
      c: "Sık Sorulan Sorular iki grupta toplanır.\n\n**Başvuru Öncesi**\n1. Fintech Zone İstanbul'a katılmak için ne yapmalıyım?\n2. Başvuru yapabilmek için önceden yerine getirilmesi gereken şartlar veya gereklilikler var mıdır?\n3. Firmamı henüz kurmadım, başvuru yapabilir miyim?\n4. Fintech Zone İstanbul'a sadece finansal teknoloji firmaları (fintek) mı başvuru yapabilir?\n5. Başvuru için herhangi bir ücret ödemem gerekiyor mu?\n\n**Başvuru Sonrası**\n6. Hakemler ve komisyon üyeleri, başvuruları değerlendirirken hangi ölçütleri göz önünde bulundurmaktadır?\n7. Başvuru formunu ilettikten sonra değerlendirme süreci ve sonraki aşamalar nasıl ilerliyor?\n8. Fintech Zone İstanbul'da mevcut çalışma alanları hangi metrekare aralığında kiralanabilir?\n9. Teknopark'a dahil olduğumda ne tür imkan ve avantajlar elde edebilirim?\n10. Fintech Zone İstanbul'da kira ve ortak alan kullanım bedeli ücretlendirme politikası nasıl çalışıyor?\n\nBunlardan birini sorabilirsiniz.",
      kay: [{ baslik: 'SSS', url: 'sss.html' }] },
    { k: /(ifm|İfm) ?(teşvik|tesvik|avantaj|kanun|vergi)|7412|finansal hizmet ihra|transit|nitelikli hizmet|bsmv|asgari vergi|finansal faaliyet harc|yabancı para|yabanci para|tek durak|serbest hukuk|hukuk seçimi|yabancı personel|yabanci personel|katılımcı belgesi|katilimci belgesi/i,
      c: "Fintech Zone İstanbul bünyesinde yer alan ve ilgili koşulları sağlayan girişimler, TGB avantajlarına ek olarak, 7412 sayılı İFM Kanunu kapsamında sunulan vergi teşvikleri ve operasyonel avantajlardan da yararlanabilecektir.\n\n**İFM vergi teşvikleri:**\n• Finansal Hizmet İhracatı: yurt dışındaki kişilere sunulan ve yurt dışında faydalanılan finansal hizmetlerden elde edilen kazançların tamamı, 22 Haziran 2047 tarihine kadar kurum kazancından indirilebilir.\n• Transit Ticaret İndirimi: Türkiye'ye getirilmeksizin yurt dışında alınıp satılan mallardan veya bu işlemlere aracılıktan elde edilen kazançların yüzde 100'ü kurumlar vergisi matrahından indirilebilir; kazancın aynı yıl Türkiye'ye transfer edilmesi gerekir.\n• Nitelikli Hizmet Merkezi: belirlenen koşulları sağlayan merkezlerin kazançlarının yüzde 100'ü, Türkiye'ye transfer edilmesi şartıyla 20 hesap dönemi boyunca kurum kazancından indirilebilir; personel ücretlerinin brüt asgari ücretin beş katına kadar olan kısmı gelir vergisinden istisnadır.\n• Personel Gelir Vergisi: yurt dışında en az beş yıllık mesleki deneyime sahip personelin ücretinin yüzde 60'ı, en az on yıllık deneyime sahip personelin ücretinin yüzde 80'i gelir vergisinden istisnadır.\n• Damga Harç Muafiyeti · Finansal Faaliyet Harçları (Kanun'un yürürlük tarihinden itibaren 20 yıl) · BSMV İstisnası · Asgari Vergi İndirimi\n\n**İFM operasyonel avantajları:** Tek Durak Ofis · Yabancı Para Kayıtları · Serbest Hukuk Seçimi · Yabancı Personel İstihdamı\n\nAyrıntılar: https://ifm.gov.tr/tesvikler",
      kay: [{ baslik: 'Muafiyet ve Avantajlar', url: 'muafiyet-ve-avantajlar.html' }, { baslik: 'İFM teşvikleri', url: 'https://ifm.gov.tr/tesvikler' }] },
    { k: /muafiyet|muaf|teşvik|tesvik|vergi|[iİ]stisna|kdv|stopaj|damga|harç|harc\b|sigorta|sgk|tgb|4691|bölge dışı|bolge disi|öğretim üyesi|ogretim uyesi|akademisyen|makine|teçhizat|techizat|gümrük|gumruk|[iİ]stihdam/i,
      c: "Fintech Zone İstanbul'da 4691 sayılı TGB Kanunu ve 7412 sayılı İFM Kanunu kapsamındaki avantajlardan yararlanılabilir. Özet başlıklar: Ar-Ge Teşvikleri · İstihdam Desteği · Vergi Avantajları · Küresel Operasyon.\n\n**TGB vergi ve istihdam avantajlarından bazıları:**\n• Ar-Ge ve Yazılım Kazançlarında Vergi İstisnası: bölgede yürütülen yazılım, tasarım ve Ar-Ge faaliyetlerinden elde edilen kazançlar, şartların sağlanması hâlinde 31 Aralık 2028'e kadar gelir veya kurumlar vergisinden istisnadır (4691 TGB Kanunu, Geçici Madde 2/1).\n• Personel Ücretlerinde Gelir Vergisi Avantajı: Ar-Ge, tasarım ve kapsam dâhilindeki destek personelinin ücretlerinin belirlenen sınırı aşmayan kısmı için gelir vergisi stopaj teşviki uygulanır (4691 TGB Kanunu, Geçici Madde 2/3).\n• Bölge Dışında Çalışma Esnekliği: 2026 yılı sonuna kadar bilişim personeli için %100'e, diğer personel için %50'ye kadar bölge dışında geçirilen süreler belirli şartlarla gelir vergisi stopaj teşviki kapsamında değerlendirilebilir (4691 TGB Kanunu, Geçici Madde 2/3; 10766 sayılı Cumhurbaşkanı Kararı, Madde 1).\n• Yazılım Teslimlerinde KDV İstisnası (3065 KDV Kanunu, Geçici Madde 20/1).\n• Proje Belgelerinde Vergi ve Harç İstisnası ile Proje İthalatlarında Vergi Avantajı (4691 TGB Kanunu, Ek Madde 2).\n• Ayrıca: Destek Personeli Gelir Vergisi Muafiyeti · TÜBİTAK Projeleri Destek Uygulamaları · Bölge Dışı Çalışma İzni · Makine-Teçhizat Alımlarında KDV İstisnası · Teknolojik Ürün Yatırım İzin Desteği · Öğretim Üyelerine Sağlanan Destekler\n\nİFM avantajları için “İFM teşvikleri” yazabilirsiniz.",
      kay: [{ baslik: 'Muafiyet ve Avantajlar', url: 'muafiyet-ve-avantajlar.html' }] },
    { k: /[iİ]mk[aâ]n|olanak|avantaj|ne kazan|faydalan|ayrıcalık|ayricalik/i,
      c: "Fintech Zone İstanbul girişimcilere TGB ve İFM kanunlarının sunduğu avantajlara ek olarak; fintek odaklı eğitim ve seminerlere katılım, ihtiyaca uygun mentörlük ve danışmanlık desteği, global hibe fonlarına ve yatırım ağlarına erişim desteği sağlayacaktır.\n\n**Diğer imkân ve avantajlar:** Türkiye ve yurt dışında faaliyet gösteren finansal teknoloji firmaları ile iş birliği · vergi avantajlarından faydalanma · 7/24 kullanıma açık nitelikli ofisler · teknik ve teknolojik altyapı desteği · sosyal etkileşim alanları · global veri tabanlarına erişim · finansal aktörler ile iş birliği.",
      kay: [{ baslik: 'Muafiyet ve Avantajlar', url: 'muafiyet-ve-avantajlar.html' }, { baslik: 'SSS', url: 'sss.html' }] },
    { k: /vizyon|misyon|değerleriniz|degerleriniz|değerlerimiz|degerlerimiz|değerler\b|degerler\b/i,
      c: "**Vizyonumuz:** Milli strateji ile fintek ekosistemine yön veren ve insanlık yararına en fazla değer üreten global bir merkez olmak.\n\n**Misyonumuz:**\n1. Etkin ve dinamik bir fintek kümelenmesi ile güçlü bir fintek ekosistemi oluşturma,\n2. Fintek girişimlerinin yerelden globale açılmasına katkı sağlama,\n3. Hızlı, nitelikli ve sürdürülebilir büyümeye yönelik iş birlikleri geliştirme,\n4. Fintek girişimlerinin AR-GE becerilerini ve kapasitelerini güçlendirme, yatırıma erişimini kolaylaştırma,\n5. Altyapı, muafiyet ve teşvik destekleri ile fintek girişimcilerinin maliyet ve rekabet avantajı elde etmelerini sağlama.\n\n**Değerlerimiz:** Yenilikçi Duruş · Destekleyici Yapı · Evrensel Bakış · Milli Gelişim.",
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }] },
    { k: /şart|sart|koşul|kosul|gereklilik|kimler başvur|kimler basvur|kimler katıl|kimler katil|kim başvur|kim basvur|kim katıl|kim katil|uygun mu|şirket kur|sirket kur|firma kur|firmamı|firmami|kurmadım|kurmadim|kurulmadan|sadece|fintek olmayan/i,
      c: "**Başvuru şartları:** Başvuru yapabilmek için iki kritik şart bulunmaktadır: Öncelikle, fintek alanında Ar-Ge, yazılım veya teknoloji içeren bir projeye sahip olmanız gerekmektedir. İkincisi, fintek sektöründe faaliyet gösteren veya gelecekte bu alanda faaliyet göstermeyi planlayan bir firma olmanızdır.\n\n**Firmanızı henüz kurmadıysanız:** Evet, firmanızı kurmadan da başvuru yapabilirsiniz. Başvuru süreciniz devam ederken şirket kurulumunuzu tamamlayabilirsiniz.\n\n**Yalnız fintekler mi?** Fintech Zone İstanbul, fintek sektöründe faaliyet gösteren firmaları desteklemek ve geliştirmek amacıyla kurulmuş fintek odaklı bir teknoparktır. Bu nedenle, başvuruda bulunan şirketlerin fintek sektöründe faaliyet göstermeleri ve bu alanda yenilikçi çözümler sunmaları beklenmektedir.",
      kay: [{ baslik: 'SSS', url: 'sss.html' }, { baslik: 'Ön Başvuru portalı', url: PORTAL }] },
    { k: /ücret|ucret|ödeme|odeme|bedel|kira|aidat|fiyat|metrekare|\bm2\b|m²|çalışma alan|calisma alan|ortak alan|masraf/i,
      c: "**Başvuru ücreti:** Hayır, ön başvuru sürecinde herhangi bir ödeme yapmanız gerekmemektedir. Bununla birlikte, Ar-Ge firma başvurusunda belirli bir ödeme yapmanız gerekebilecektir. İlgili ücretler zaman içinde değişebilir.\n\n**Kira ve ortak alan kullanım bedeli:** Kullanacağınız alanın büyüklüğüne, türüne ve hizmetlere göre belirlenir. Kira ücretleri esas olarak metrekare başına hesaplanmaktadır ancak teknopark içindeki konumuna, donanımlarına ve ek hizmetlere bağlı olarak değişiklik gösterebilir. Aidat ücretleri ise teknoparkta sunulan ortak hizmetler ve altyapı kullanımına göre belirlenmektedir.\n\n**Çalışma alanları:** Farklı büyüklüklerde çalışma alanları ve farklı metrekare seçenekleri bulunmaktadır.\n\nGüncel ücretler için en doğru bilgi: info@fintech.zone ya da 0216 222 2963.",
      kay: [{ baslik: 'SSS', url: 'sss.html' }, { baslik: 'E-posta', url: EPOSTA }, { baslik: 'Telefon', url: TEL }] },
    { k: /değerlendir|degerlendir|ölçüt|olcut|kriter|hakem|komisyon|süre(?![çc])|sure(?![çc])|kaç gün|kac gun|kaç hafta|kac hafta|sonuç|sonuc|geri dönüş|geri donus|puan/i,
      c: "**Değerlendirme ölçütleri:** Hakemler ve komisyon üyeleri başvuruları değerlendirirken öncelikli olarak Ar-Ge projesinin inovasyon kapasitesi, iş planı ve yönetimi, rekabet avantajı, finansal uygulanabilirliği, ticarileşme ve piyasa potansiyeli, sürdürülebilirlik ve etkisi gibi ölçütleri dikkate alacaktır.\n\n**Sonraki aşamalar:** Teknopark yönetimi başvurunuzu inceler ve formda eksik veya yanlış bilgi tespit edilirse düzenleme yapmanızı talep eder. Başvuru formunu eksiksiz doldurduğunuz takdirde başvurunuz hakemlerin yer aldığı komisyon değerlendirmesine gönderilir. Yeterli puanı alan başvuru sahipleri için yer tahsis süreci başlar. Kira sözleşmesini imzaladıktan sonra personel kartlarınızı alarak faaliyetlerinize başlayabilirsiniz.\n\n**Süre:** Başvurunuz değerlendirilecek ve en uygun zamanda olumlu/olumsuz geri dönüş yapılacaktır.",
      kay: [{ baslik: 'Başvuru süreci', url: 'basvuru-sureci.html' }, { baslik: 'SSS', url: 'sss.html' }] },
    { k: /haber|gelişme|gelisme|son durum|duyuru|faaliyetleriniz|neler yaptınız|neler yaptiniz|ziyaret/i,
      c: "Son haberlerimiz:\n• 28.09.2026 · Fintech Zone Webinar Serisi “Finansal Teknolojilerin Geleceği” ile Başladı\n• 22.09.2026 · Fintech Gate Kurumsal Paydaşlar Çalıştayı Gerçekleştirildi\n• 05.08.2026 · Nijerya'dan Finans ve Akademi Dünyasının Üst Düzey Temsilcilerini Ağırladık\n• 22.07.2026 · TechInvestor Academy ile Yatırımcı Adayları Bilgilendirildi\n• 09.07.2026 · ASELSAN'dan Fintech Zone'a Nezaket Ziyareti\n• 14.05.2026 · Fintech Gate Lansman Programı Gerçekleştirildi\n• 17.04.2026 · “Fintech Bridge: Spain & Türkiye 2026” Etkinliğine Katıldık\n• 23.12.2025 · BİGGVADİ Girişimden Geleceğe Dönüşüm Programı Projemiz Onaylandı\n• 18.12.2025 · Take Off İstanbul 2025'teydik\n• 11.12.2025 · Singapore FinTech Festival 2025'a Katıldık\n• 18.10.2025 · Riyad'da Fintech Zone'u ve Ekosistemi Tanıttık\n\n**Duyuru:** 1707 Siparişe Dayalı Ar-Ge Projeleri İçin KOBİ Destekleme Programı 2026 Yılı 3. Çağrısı açıldı; son başvuru 13 Kasım 2026 saat 23.59 (kaynak: TÜBİTAK duyurusu).\n\nBir haberin ayrıntısı için adını yazabilirsiniz.",
      kay: [{ baslik: 'Tüm haberler', url: 'haberler.html' }] },
    { k: /1707|t[üu]b[iİ]tak|kobi/i,
      c: "**Duyuru:** “1707 Siparişe Dayalı Ar-Ge Projeleri İçin KOBİ Destekleme Programı 2026 Yılı 3. Çağrısı Açıldı.” Çağrı 01.09.2026'da açıldı; son başvuru 13 Kasım 2026 saat 23.59 (kaynak: TÜBİTAK duyurusu ve Fintech Zone Instagram paylaşımı).\n\nAyrıca teknopark firmaları, TÜBİTAK tarafından sağlanan geri ödemesiz veya düşük faizli destek programlarından yararlanabilir.",
      kay: [{ baslik: 'Haberler', url: 'haberler.html' }, { baslik: 'tubitak.gov.tr', url: 'https://tubitak.gov.tr' }] },
    { k: /etkinlik|takvim|konferans|zirve|summit|teknofest|fintech week|webrazzi|money ?2020|expo|world finance|lisbon|lizbon|eurasia/i,
      c: "Fintek Etkinlikleri takviminde Türkiye'de ve globalde düzenlenen fintek, finans ve teknoloji temalı etkinlikleri takip edebilirsiniz. Takvimdeki yaklaşan etkinliklerden bazıları:\n• TEKNOFEST 2026 · 30 Eylül – 4 Ekim 2026\n• Istanbul Fintech Week 2026 · 5–7 Ekim 2026\n• Eurasia Technology Week 2026 · 7–9 Ekim 2026\n• Money2020 USA 2026 · 18–21 Ekim 2026\n• Payments Leaders Summit UK 2026 · 21 Ekim 2026\n• Webrazzi Summit 2026 · 21 Ekim 2026\n• Yapay Zeka Zirvesi 2026 · 23 Ekim 2026\n• Web Summit Lisbon 2026 · 9–12 Kasım 2026\n• Accounting and Business Expo Saudi Arabia 2026 · 17–18 Kasım 2026\n• World Finance Forum Paris · 26 Kasım 2026\n\nEtkinliklerin güncel bilgileri, katılım şartları ve programları için kendi sitelerini kontrol etmeyi unutmayınız. Takvimde yer almasını istediğiniz etkinlikleri “Etkinlik Öner” formuyla iletebilirsiniz.",
      kay: [{ baslik: 'Etkinlikler', url: 'etkinlikler.html' }, { baslik: 'Fintek Etkinlikleri', url: 'https://fintech.zone/fintek-etkinlikleri/' }] },
    { k: /londra|dubai|singapur|malezya|temsilcilik|yurt ?dışı|yurtdışı|global|küresel|kuresel|uluslararası|uluslararasi|g-?local|hinterland/i,
      c: "G-Local programı aracılığıyla “Küresel Düşün, Yerel Hareket Et” felsefesini benimseyen Fintech Zone, Londra, Dubai, Singapur ve Malezya gibi dünyanın önde gelen fintek merkezlerinde temsilcilikler kurarak Türk fintek girişimlerinin uluslararası entegrasyonunu sağlayacaktır.\n\n**Fintech G-Local** kümelenme programı, Türk fintek ekosistemini uluslararası pazarlara açarak, yerel girişimlerin küresel rekabetçiliğini artırmayı ve yabancı girişimlerin Türkiye'de filizlenmesini sağlayacaktır.\n\n**Globalleşme:** Ülkemizden global pazarlara, hinterlandımızda yer alan ülkelerden Türkiye'ye girişim transfer etmeyi hedefleyen bir stratejiye sahibiz.",
      kay: [{ baslik: 'Ekosistem', url: 'ekosistem.html' }] },
    { k: /kümelen|kumelen|fintech hub|\bhub\b|sandbox|academy|akademi|forum|library|kütüphane|kutuphane|database|veri taban|scorecard|score card|programlar|programınız|programiniz/i,
      c: "Fintech Zone, fintek ekosisteminin tüm paydaşları için kümelenme odaklı programlar sunacaktır. **8 kümelenme programı:**\n1. **Fintech Hub:** Girişimcilerin ve yenilikçilerin, ulusal ve uluslararası ağlarla buluştuğu, destek ve kaynaklarla donatılmıştır.\n2. **Fintech Sandbox:** Fintek girişimlerinin inovatif ürünlerini gerçek dünya koşullarında test etmelerine olanak tanıyacak, regülasyonlara uyumlarına yardımcı olacaktır.\n3. **Fintech G-Local:** Türk fintek ekosistemini uluslararası pazarlara açarak, yerel girişimlerin küresel rekabetçiliğini artırmayı ve yabancı girişimlerin Türkiye'de filizlenmesini sağlayacaktır.\n4. **Fintech Academy:** Öğrenciler, girişimciler, akademisyenler ve finans sektörü profesyonellerini hedef alarak, fintek alanında bilgi ve beceri gelişimine katkıda bulunacaktır.\n5. **Fintech Forum:** Fintek ekosisteminin çeşitli paydaşlarını birleştirerek bilgi paylaşımı, iş birlikleri ve ağ oluşturma fırsatları sunacak ve katılımcılara yeni bakış açıları kazandıracaktır.\n6. **Fintech Library:** Fintek ekosisteminin kapsamlı bir şekilde anlaşılmasını ve sektörel bilginin geliştirilmesini hedefleyen yayınlar sunacaktır.\n7. **Fintech Database:** Fintek ekosisteminin dinamiklerini kavramak ve finteklerin veriye dayalı karar alma süreçlerine yardımcı olacaktır.\n8. **Fintech ScoreCard:** Fintek girişimlerine performanslarını objektif kriterler temelinde değerlendirme ve gelişim alanlarını belirleme imkanı sunacaktır.\n\nKuluçka Merkezi'nde ayrıca Ön Kuluçka, Kuluçka, Tematik, Erken Aşama Hızlandırma ve Uluslararası Hızlandırma programları yer alır.",
      kay: [{ baslik: 'Ekosistem', url: 'ekosistem.html' }, { baslik: 'Kuluçka Merkezi', url: 'kulucka-merkezi.html' }] },
    { k: /ekosistem|paydaş|paydas|köprü|kopru|entegrasyon/i,
      c: "Kümelenme programları; girişimciler, finansal kurumlar, düzenleyiciler (kamu kurumları), hizmet sağlayıcılar, danışmanlar ve yatırımcılar dahil olmak üzere tüm fintek ekosistemi ve paydaşlarını desteklemek ve birbirine bağlamak için hayata geçirilecektir.\n\n**Fintekler ile Ekosistem Arasında Bir Köprü:** Fintech Zone, İstanbul Finans Merkezi'nin geniş perspektifi ile uyumlu bir şekilde, finansal teknolojiler alanında yenilikçiliğin ve iş birliğinin merkezi olarak hizmet vermektedir. Entegrasyon ve Yenilikçilik · Stratejik Uyum ve Güçlendirme · Bölgesel Liderlik ve İş Birliği.\n\n8 kümelenme programını görmek için “kümelenme programları” yazabilirsiniz.",
      kay: [{ baslik: 'Ekosistem', url: 'ekosistem.html' }] },
    { k: /başvur|basvur|adım|adim|aşama|asama|nasıl katıl|nasil katil|katılmak|katilmak|portal|üye ol|uye ol|kayıt ol|kayit ol|dahil ol/i,
      c: "Başvuru süreci beş adımdan oluşur:\n1. **Ön Başvuru ve Birebir Görüşme:** Ön başvurunuz ekibimiz tarafından incelenir. Projenizi ve ihtiyaçlarınızı daha yakından değerlendirmek üzere çevrim içi veya yüz yüze birebir görüşme gerçekleştirilir.\n2. **Ar-Ge Proje Başvurusu:** Ön değerlendirmesi olumlu sonuçlanan girişim ve firmalar, portal üzerinden Ar-Ge proje başvurularını tamamlayarak değerlendirme sürecine dahil olur.\n3. **Hakem Heyeti Değerlendirmesi:** Ar-Ge proje başvurusu, alanında uzman hakemler tarafından teknik, yenilikçi ve ticari kriterler doğrultusunda değerlendirilir.\n4. **İstanbul Finans Merkezi Katılımcı Belgesi Başvurusu:** 7412 sayılı İstanbul Finans Merkezi Kanunu kapsamındaki teşvik, muafiyet ve avantajlardan yararlanmak üzere yapılır.\n5. **Yer Tahsisi ve Kira Sözleşmesi:** Değerlendirme süreci olumlu sonuçlanan girişim ve firmalar için çalışma alanı tahsis edilir ve kira sözleşmesi süreci tamamlanır. Gerekli koşulların sağlanmasının ardından İFM Katılımcı Belgesi düzenlenir.\nArdından firmalar Fintech Zone İstanbul'da faaliyetlerine başlayabilir.\n\nÖn başvuru için portal.fintech.zone adresinden teknopark portalına ücretsiz üye olabilirsiniz. Başvurunuz değerlendirilecek ve en uygun zamanda olumlu/olumsuz geri dönüş yapılacaktır.",
      kay: [{ baslik: 'Ön Başvuru portalı', url: PORTAL }, { baslik: 'Başvuru süreci', url: 'basvuru-sureci.html' }] },
    { k: /genel müdür|genel mudur|yönetici|yonetici|\bceo\b|bilal|haksal|müdür|mudur/i,
      c: "Fintech Zone Genel Müdürü Bilal Benna Haksal'dır.",
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }] },
    { k: /ortak(?! alan)|hissedar|kurucu|kim kurdu|aselsan|üniversite|universite|bilişim vadisi|bilisim vadisi|cbyfo|yatırım ve finans ofisi|yatirim ve finans ofisi|marmara|[iİ]bn haldun/i,
      c: "**Ortaklık Yapımız:** Cumhurbaşkanlığı Yatırım ve Finans Ofisi, İstanbul Finans Merkezi, ASELSAN, Bilişim Vadisi, İstanbul Üniversitesi, Marmara Üniversitesi ve İbn Haldun Üniversitesi.\n\n“Fintech Zone İstanbul” bir İstanbul Finans ve Teknoloji Üssü A.Ş. markasıdır.",
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }] },
    { k: /[iİ]leti[sş]im|telefon|numara|e-?posta|eposta|mail|\bkep\b|ulaş|ulas|randevu|instagram|linkedin|twitter|sosyal medya|bize yaz|mesaj/i,
      c: "Bize şu kanallardan ulaşabilirsiniz:\n• E-posta: info@fintech.zone\n• KEP: istanbulfinans@hs01.kep.tr\n• Telefon: 0216 222 2963\n• Yönetim Ofisi: Finanskent mah. Finans cd. No: 13/1 Ümraniye - İstanbul\n• Teknopark Binası: Finanskent mah. Finans cd. F Blok. No: 34 Ümraniye - İstanbul\n• Sosyal medya: instagram.com/fintechzoneist · linkedin.com/company/fintechzoneist · twitter.com/fintechzoneist\n\nİletişim sayfasındaki mesaj formundan da yazabilirsiniz.",
      kay: [{ baslik: 'İletişim', url: 'iletisim.html' }, { baslik: 'E-posta', url: EPOSTA }, { baslik: 'Telefon', url: TEL }] },
    { k: /adres|nerede|nerde|konum|harita|ümraniye|umraniye|finanskent|ofis|bina|kampüs|kampus|\bifm\b|İfm|finans merkezi/i,
      c: "Fintech Zone İstanbul, İstanbul Finans Merkezi'nde faaliyet göstermektedir.\n\n**Yönetim Ofisi:** Finanskent mah. Finans cd. No: 13/1 Ümraniye - İstanbul\nKonum: https://maps.app.goo.gl/4DywBUmGvpD8p2ax5\n\n**Teknopark Binası:** Finanskent mah. Finans cd. F Blok. No: 34 Ümraniye - İstanbul\nKonum: https://maps.app.goo.gl/LMJJU8aG3tbXjeKe6",
      kay: [{ baslik: 'İletişim', url: 'iletisim.html' }] },
    { k: /logo|kurumsal kimlik|medya|basın|basin|marka/i,
      c: "“Fintech Zone İstanbul” bir İstanbul Finans ve Teknoloji Üssü A.Ş. markasıdır. Her türlü medya talebiniz için info@fintech.zone adresini kullanabilir, Kurumsal Kimlik sayfasından ilgili dosyalara erişebilirsiniz: https://fintech.zone/kurumsal-kimlik/",
      kay: [{ baslik: 'Kurumsal Kimlik', url: 'https://fintech.zone/kurumsal-kimlik/' }, { baslik: 'E-posta', url: EPOSTA }] },
    { k: /hakkında|hakkinda|nedir|ne iş|kimsiniz|tanıt|tanit|amaç|amac|neden|kuruldu|kuruluş|kurulus|teknopark|fintech zone|temsiliyet|yeni nesil/i,
      c: "Fintech Zone İstanbul, Türkiye'nin fintek teknoparkıdır. 11. Kalkınma Planı hedeflerinden biri olarak kurulan “İstanbul Finans ve Teknoloji Üssü Teknoloji Geliştirme Bölgesi”, Fintech Zone İstanbul markası ile İstanbul Finans Merkezi'nde faaliyet göstermektedir. Fintech Zone İstanbul aynı zamanda T.C. Sanayi ve Teknoloji Bakanlığı'nın yayınladığı “Ulusal Teknoloji Girişimciliği Stratejisi Eylem Planı” çerçevesinde fintek alanında kümelenme faaliyetlerinin yürütücüsü olarak yetkilendirilmiştir.\n\nTemel başlıklarımız: Kümelenme · Globalleşme · Yeni Nesil Teknopark · Temsiliyet · İFM ile Bütünlük.",
      kay: [{ baslik: 'Hakkımızda', url: 'hakkimizda.html' }] },
    { k: /merhaba|selam|iyi günler|iyi gunler|günaydın|gunaydin|iyi akşamlar|iyi aksamlar|nasılsın|nasilsin|teşekkür|tesekkur|sağ ol|sag ol|sagol/i,
      c: "Merhaba! Başvuru süreci, şartlar ve ücretler, muafiyet ve avantajlar, Fintech Gate, kümelenme programları, webinar ve haberler hakkında sorabilirsiniz.", kay: [] }
  ];
  function yerelCevap(m) {
    for (var i = 0; i < BILGI.length; i++) if (BILGI[i].k.test(m)) return BILGI[i];
    return { c: 'Bu konuda en doğru bilgi için info@fintech.zone ya da 0216 222 2963 üzerinden ekibimize ulaşabilirsiniz.',
      kay: [{ baslik: 'İletişim', url: 'iletisim.html' }, { baslik: 'E-posta', url: EPOSTA }, { baslik: 'Telefon', url: TEL }] };
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
      '<div class="ftz-as-bas"><img src="logo/o-ikon-beyaz.svg" alt=""><div><h3>FTZ Asistan</h3><p>FINTECH ZONE İSTANBUL</p></div>' +
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
    '<button type="button" class="ftz-as-ac" aria-label="FTZ Asistan\'ı aç" aria-expanded="false"><img src="logo/o-ikon-beyaz.svg" alt=""><span class="ftz-as-nokta"></span></button>';
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

  var ILK_CIPLER = ['Nasıl başvururum?', 'Fintech Gate nedir?', 'Muafiyetler neler?', 'İletişim bilgileri'];
  var ILK = 'Merhaba! Ben FTZ Asistan. Başvuru süreci, muafiyet ve avantajlar, Fintech Gate, kümelenme programları, webinar ve haberler hakkında fintech.zone\'daki resmi bilgilerle yardımcı olabilirim. Ne öğrenmek istersiniz?';

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
