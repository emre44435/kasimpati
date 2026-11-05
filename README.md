# Senin İçin Kodladım — 3D Kasımpatı

Aynı 3D kasımpatı korundu; müzik son gönderilen MP3 ile değiştirildi. Mobil öncelikli sade sürüm.

## Deneyim

İlk ekranda yalnızca “Herkes Çiçek Alır.. Ben Senin İçin Kodladım.” başlığı, kasımpatı
tomurcuğu ve “Dokun, Galiba Başardım 😂” düğmesi bulunur.

Düğmeye dokunulduğunda müzik ve 3D açılış başlar. Başlık ve düğme kaybolur; açılış
sırasında ekranda yalnızca çiçek kalır. Görünür oynatıcı, zaman çizgisi, ses düğmesi,
ileri / geri sarma veya mesajı atlama kontrolü yoktur.

Açılış bittiğinde not kendiliğinden görünür. Yeni başlık “Kasımpatılar en serin günlerde
bile açar.” şeklindedir; kişisel not bunun altında yer alır. Yalnızca “Bir kez daha açsın”
düğmesi korunur. Bu düğme çiçeği ve müziği baştan başlatır. Paylaş düğmesi kaldırılmıştır.

Sayfa açılınca ses otomatik başlamaz; başlatma düğmesine dokunmak gerekir. Ses dosyası
sitede görünmez. Tarayıcının / cihazın ses politikaları geçerlidir. Sekme arka plana
alındığında medya durur. Hareket azaltma tercihi açıksa doğrudan açık çiçek ve not gösterilir.

## GitHub Pages'e yükleme

1. ZIP'i bilgisayarında çıkar.
2. GitHub'da bir depo oluştur. **ZIP'in kendisini değil, içindeki dosya ve klasörleri** yükle.
3. `index.html`, deponun ana dizininde ve `assets` klasörüyle aynı seviyede olmalı.
4. **Settings → Pages → Build and deployment → Deploy from a branch** seç.
5. Branch: **main**, klasör: **/(root)** seçip kaydet.
6. GitHub'ın verdiği Pages bağlantısını aç. Yayının hazırlanması birkaç dakika sürebilir.

Ücretli hizmet, API anahtarı, abonelik, derleme veya sunucu uygulaması gerekmez.
Dosya adresleri göreli olduğundan depo alt dizini üzerinden yayınlanabilir.
Eski sürümü güncelliyorsan aynı adlı dosyaların üzerine yaz ve sayfayı yenile.

## İçerik

- `index.html`, `style.css`, `app.js`: tüm arayüz ve etkileşim kodları.
- `assets/bloom.mp4`: korunan 768 × 1024 H.264 3D açılış; 30 fps.
- `assets/bloom-lite.mp4`: veri tasarrufu / düşük performans için 384 × 512 alternatif.
- `assets/bud.webp`, `assets/flower.webp`: aynı modelin başlangıç ve final kareleri.
- `assets/buklum-buklum.mp3`: kullanıcı tarafından sağlanan dosyanın birebir kopyası.
- `assets/fonts`: yerel Cormorant Garamond fontları.
- `source/chrysanthemum.blend`: özgün düzenlenebilir 3D sahne.
- `source/create_flower.py`, `source/process_media.py`: yeniden üretim kodları.
- `licenses`: lisans ve ses kaynağı bilgileri.
- `TEST-RESULTS.md`, `verification`: test kapsamı ve ekran görüntüleri.

Çiçek modeli, açılış videosu ve başlangıç / final görselleri değiştirilmedi.
Müzik, kullanıcının son paylaştığı Büklüm Büklüm MP3 dosyasıyla değiştirildi; eski
ses dosyası paketten kaldırıldı. Açılışın hızı önceki sürümdeki gibi `.88`'dir.

## 3D sahneyi yeniden üretme

Yayınlamak için bu adımlar gerekmez. Kaynak sahneyi düzenlemek için:

```bash
blender -b -t 8 --python source/create_flower.py
python -m pip install oidn==0.2.1 Pillow numpy
python source/process_media.py
```

Blender 4.3.2 ve libx264 destekli FFmpeg kullanıldı. Sahne 97 RGBA kare üretir.
Taç yaprakları ayrı şekil anahtarlarıyla kıvrılıp açılır. Telefondaki işlem yükünü azaltmak
üzere özgün 3D sahnenin işlenmiş videosu kullanılır; gerçek çiçek çekimi değildir.
İstemci kodunda harici kitaplık, takip kodu, çerez veya veri toplama yoktur.

Başlığı `index.html` içindeki `h1` alanından, final başlığını `h2`, notu `#personal-note`
alanından değiştirebilirsin. Ses hakları için `licenses/ASSETS.md` dosyasına bak.
