# Sade sürüm — doğrulama, 5 Kasım 2026

## Son MP3 güncellemesi

- Önceki MP3 paketten kaldırıldı; yeni dosya `assets/buklum-buklum.mp3` yoluna birebir kopyalandı.
- HTML'nin gizli ses öğesi yeni dosyaya bağlıdır; ses kullanıcı dokunuşuyla başlar.
- Yeni MP3: 34.037551 sn, 1,364,884 bayt, 44.1 kHz, stereo.
- SHA-256: `a84422ca7243b928b0af496c414f40151a5c13b029f85cbf0df94ef766645de1`.
- Dosyanın tamamı FFmpeg ile çözülerek kontrol edildi; işlem başarılı.
- ZIP içindeki ses dosyası yüklenen dosyayla SHA-256 bakımından aynı.
- 3D videolar, model, görseller, CSS ve JavaScript önceki paketle aynı.
- Bu ses değişikliğinden sonra fiziksel cihaz veya yeni tarayıcı testi yapılmadı.

## Gerçek tarayıcıda animasyon — önceki arayüz kontrolü

Aşağıdaki oynatma ölçümleri, arayüz sadeleştirilirken önceki ses dosyasıyla yapılan
testlere aittir. Animasyon ve oynatma kodu bu ses değişikliğinde değiştirilmedi.

Chrome'da başlatma düğmesine basıldı. Video süresi, oynatma durumu, görünür arayüz ve
finale geçiş gerçek sayfadan okunarak kontrol edildi; başlangıç, ara ve final görüntüleri alındı.

| Kontrol | Gözlenen sonuç |
| --- | --- |
| İlk dokunuş | Video 0.1858 sn, `paused: false`; MP3 0.158308 sn, `paused: false` |
| Açılışın ara karesi | Video 5.1605 sn, `paused: false`, `ended: false`; taç yaprakları açılıyor |
| Açılış sırasındaki arayüz | Başlık ve davet düğmesi gizli; görünür düğme sayısı 0; video / ses kontrolü yok |
| Doğal son | Video 16.2 sn, `ended: true`; sayfa kendiliğinden `letter` durumuna geçti |
| Tekrar açma | “Bir kez daha açsın” çiçeği 0 saniyeden başlattı; MP3 de başa döndü ve oynadı |
| İkinci açılış | Ara kare ve tekrar doğal son doğrulandı; final notu yeniden açıldı |
| Masaüstü açılışı | Video 0.2759 → 6.3682 → 16.2 sn ilerledi; ara karede görünür düğme yok |
| Masaüstü kompozisyonu | Açılışta çiçek merkez X: 681.5 px; ekran genişliği 1363 px |
| Final arayüzü | Yalnızca not ve “Bir kez daha açsın” düğmesi; paylaş / müzik / altbilgi yok |

Ana dosyanın medya süresi 16.2 saniyedir; korunan `.88` oynatma hızıyla açılış yaklaşık
18.4 saniye sürer. Animasyon gerçek tarayıcıda sonuna kadar oynatılarak test edildi.

## Mobil ve masaüstü yerleşimi

Telefon ölçüleri Chrome içinde aynı kaynağı yükleyen ayrı çerçevelerle denetlendi.
Her telefon ölçüsünde video doğal sonuna ulaştı ve not otomatik açıldı.

| Görünüm | Başlangıç yüksekliği | Final belge yüksekliği | Yatay taşma |
| --- | ---: | ---: | --- |
| 320 × 568 | 568 px | 974 px | Yok |
| 390 × 844 | 844 px | 1023 px | Yok |
| 430 × 932 | 932 px | 1009 px | Yok |
| 1363 × 936 | 936 px | 936 px | Yok |

`scrollWidth` ile `clientWidth` eşitliği kontrol edildi. Mobil final notu gerektiğinde
dikey kaydırılır. Çerçevelerdeki masaüstü kaydırma çubuğu içerik genişliğini 15 px azaltır.

## Kaynak ve dosya kontrolleri

- HTML'de 14 benzersiz öğe kimliği; tüm JavaScript hedefleri mevcut.
- `node --check app.js` başarılı.
- Tüm yerel dosya başvuruları mevcut; ZIP bütünlüğü doğrulandı.
- Logo, Bloom yazısı, ses düğmesi, zaman çizgisi, duraklatma, mesajı atlama, paylaşım,
  bölüm sayacı ve altbilgiler HTML'den kaldırıldı.
- Yeni düğme metni ve final başlığı doğru; kişisel not korundu.
- 3D sahne, iki açılış videosu ve başlangıç / final görselleri için SHA-256 karşılaştırması yapıldı.
  Beş görsel dosyanın tamamı önceki teslimle birebir aynı.
- H.264 768 × 1024 ana video: 1,926,315 bayt; 384 × 512 alternatif: 477,796 bayt.
- Güncel MP3 dosyasının doğrulaması yukarıdaki “Son MP3 güncellemesi” bölümündedir.

Ekran görüntüleri `verification` klasöründedir. Sitede harici çalışma zamanı bağımlılığı
veya ücretli hizmet yoktur. Lisans / ses kaynağı bilgileri `licenses` klasöründe tutulur;
sayfada görünür müzik alanı yoktur.

## Test kapsamı

Bu oturumda fiziksel iPhone / Android cihazı veya Safari motoru kullanılmadı. Mobil ölçü
kontrolleri fiziksel cihaz testinin yerine geçmez. Hareket azaltma, arka plan duraklatması
ve otomatik kalite seçimi kodda korunmuştur; bu koşulların tamamı zorlanarak ölçülmedi.
GitHub'a yükleme veya canlı yayın yapılmadı; yayınlanabilir statik dosyalar teslim edildi.
