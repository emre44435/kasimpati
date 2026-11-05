# Doğrulama — 5 Kasım 2026

## Gerçek tarayıcı kontrolleri

Chrome'da çalışan site ve aşağıdaki görünüm alanları incelendi. Telefon ölçüleri,
tarayıcı içindeki aynı kaynaktan yüklenen ayrı çerçevelerle kontrol edildi.

| Görünüm | Başlangıç | Final notu |
| --- | --- | --- |
| 320 × 568 | Yatay taşma yok; belge 568 px yüksekliğinde | Yatay taşma yok; tüm not ve düğmeler dikey kaydırmayla erişilebilir |
| 390 × 844 | Yatay taşma yok; belge 844 px yüksekliğinde | Yatay taşma yok; belge 1067 px; not ve düğmeler erişilebilir |
| 430 × 932 | Yatay taşma yok; belge 932 px yüksekliğinde | Yatay taşma yok; belge 1044 px |
| 1363 × 936 | Yatay taşma yok; iki sütunlu kompozisyon | Yatay taşma yok; not ve iki eylem düğmesi görünür |

Dikey kaydırma çubuğu olan masaüstü çerçevelerinde içerik genişliği 15 px azalır.
Genişlik karşılaştırması `scrollWidth` ile `clientWidth` arasında yapıldı.

Kontrol edilen etkileşimler:

- Kullanıcı dokunuşuyla 3D açılış ve MP3 başlatıldı; ses etiketi “Ses açık” oldu.
- 6.4512 saniyedeki gerçek ara karede duraklatma doğrulandı (`paused: true`).
- Zaman çizgisinde Home / PageUp ile 1.62 saniyeye gidildi; duraklama korundu.
- Devam et düğmesinden sonra video doğal sonuna ulaştı (`ended: true`, süre 16.2 sn).
- Video biter bitmez final notuna geçildi; başlık odağı güncellendi.
- Ses kapatıldı ve yeniden açıldı; MP3 oynatma durumu doğrulandı.
- Tekrar oynatma çiçeği başa alıp yeniden başlattı (kontrol anında 0.2775 sn).
- Başa dön kontrolü ilk sahneyi geri getirdi.
- “Mesajı oku” başlangıçtan doğrudan nota geçti.
- Bilgi penceresi açıldı ve kapatıldı.
- İstenen başlık ve yeni not, Türkçe karakterleriyle doğrulandı.

Görsel kanıtlar `verification` klasöründedir. Açılış, yalnızca bir sabit görselin
ölçeklenmesi değildir; ara kare ve açık çiçek görüntüleri aynı 3D sahneden gelir.

## Dosya ve medya doğrulaması

- JavaScript: `node --check` başarılı.
- HTML: 35 benzersiz öğe kimliği; JavaScript hedeflerinin tümü mevcut.
- Başvurulan yerel dosyalar mevcut; ZIP bütünlüğü kontrol edildi.
- Ana video: H.264 High / YUV420p, 768 × 1024, 30 fps, 16.2 saniye, 1,926,315 bayt.
- Alternatif video: H.264 Constrained Baseline / YUV420p, 384 × 512, 30 fps,
  16.2 saniye, 477,796 bayt.
- MP3: 79.934694 saniye; 1,279,546 bayt; sağlanan dosyayla SHA-256 birebir aynı.
- Tüm fontlar ve medya yereldir; çalışırken ücretli API veya CDN gerekmez.

## Kapsamın sınırları

Fiziksel iPhone / Android cihazında veya Safari motorunda bu oturumda test yapılmadı.
Tarayıcı ölçülerinde yapılan kontrol fiziksel cihaz testinin yerine geçmez.
Sistem hareket azaltma tercihi, arka plan duraklatması ve otomatik kalite seçimi kodda
uygulanıp incelendi; bu oturumdaki tarayıcıda bu koşulların tümü zorlanarak ölçülmedi.
Yerel paylaşım menüsüyle gerçek bir kişiye paylaşım yapılmadı. GitHub'a yükleme ve
canlı yayın yapılmadı; yayımlanabilir statik dosyalar teslim edildi.
