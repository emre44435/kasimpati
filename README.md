# BLOOM — Senin İçin Kodladım

Açık adaçayı ve fildişi tonlarında, dokunmayla açılan 3D kasımpatı deneyimi.
Başlık ve not, istenen son metinlerle güncellendi. Sağlanan MP3 dosyası pakette bulunur.

## GitHub Pages'e yükleme

1. ZIP'i bilgisayarında çıkar.
2. GitHub'da bir depo oluştur. **ZIP'in kendisini değil, içindeki dosya ve klasörleri** yükle.
3. `index.html` deponun ana dizininde olmalı; `assets` klasörüyle aynı seviyede kalmalı.
4. **Settings → Pages → Build and deployment → Deploy from a branch** seç.
5. Branch: **main**, klasör: **/(root)** seçip kaydet.
6. GitHub'ın oluşturduğu Pages bağlantısını aç. Yayının hazırlanması birkaç dakika sürebilir.

Ücretli hizmet, API anahtarı, abonelik, derleme veya sunucu uygulaması gerekmez.
Tüm adresler göreli olduğundan hem `kullanici.github.io` hem `kullanici.github.io/depo/` yapısında çalışır.

## Deneyim

- Çiçeğe ya da davet düğmesine dokun: açılış ve izin verildiyse müzik başlar.
- Açılırken çiçeğe yeniden dokun: duraklat / devam et.
- Açılırken çiçeği basılı tut: ağır çekim. Bırak: normal hız.
- İnce zaman çizgisini sürükle: açılışın istediğin anına git.
- Ses düğmesi: müziği aç / kapat. Müzik sayfa yüklenince otomatik başlamaz.
- Açılış bitince kişisel not görünür. “Bir kez daha açsın” baştan oynatır.
- “Mesajı oku” ile beklemeden nota geçilebilir.
- Sisteminde hareketi azaltma açıksa açılış atlanır; açık çiçek ve not gösterilir.
- Sekme arka plana alınırsa medya durur. Geri dönünce önceden çalıyorsa sürer.

## Dosyalar

- `index.html`, `style.css`, `app.js`: tüm arayüz kaynakları.
- `assets/bloom.mp4`: 768 × 1024, H.264, 30 fps 3D açılış.
- `assets/bloom-lite.mp4`: 384 × 512 H.264 alternatifi. Veri tasarrufu veya ölçülen kare düşüşünde seçilir.
- `assets/bud.webp`, `assets/flower.webp`: aynı modelin şeffaf başlangıç / final kareleri.
- `assets/beyaz-ve-sen.mp3`: sağladığın ses dosyasının birebir kopyası.
- `assets/fonts`: yerel Cormorant Garamond fontları. Harici font isteği yapılmaz.
- `source/chrysanthemum.blend`: düzenlenebilir özgün 3D sahne ve animasyon.
- `source/create_flower.py`, `source/process_media.py`: sahnenin ve medyanın yeniden üretim kodu.
- `licenses`: lisans ve kaynak bilgileri.
- `TEST-RESULTS.md`: doğrulanan testler ve test kapsamının sınırları.

## 3D sahneyi yeniden üretme

Siteyi yayınlamak için bu adımlar gerekmez. Kaynak sahneyi değiştirmek için:

```bash
blender -b -t 8 --python source/create_flower.py
python -m pip install oidn==0.2.1 Pillow numpy
python source/process_media.py
```

Blender 4.3.2 ve libx264 destekli FFmpeg kullanıldı. Sahne 97 RGBA kare oluşturur.
Her taç yaprağının membranı ayrı şekil anahtarlarıyla kıvrılıp açılır. Bu, büyütülen sabit
bir resim veya CSS ile taklit edilmiş açılış değildir. Çalışma zamanında telefonun
GPU'suna yüz binlerce poligon yüklememek için özgün 3D sahnenin işlenmiş H.264
animasyonu kullanılır. Gerçek çiçek çekimi değildir.

İstemci kodu üçüncü taraf kitaplık içermez; izleme, çerez, form veya veri toplama yoktur.

## Metni veya müziği değiştirme

Başlık `index.html` içindeki `h1`, not `#personal-note` alanındadır. JavaScript kapalı
içerik için `noscript` içindeki metni de aynı tut. MP3'ü aynı dosya adıyla değiştirebilirsin.
Dosya adlarının büyük / küçük harflerini koru. Ses hakları için `licenses/ASSETS.md` dosyasına bak.
