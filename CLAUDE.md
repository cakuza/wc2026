\# WC2026 Fan Poster Site — MVP



\## Proje amacı

Ülke seç → maç yolunu gör → yerel saat → poster oluştur → indir/paylaş.

SofaScore rakibi değil. Fan poster studio.



\## Stack

\- Next.js 15.1.6

\- React 19

\- TypeScript 5.7.3

\- Tailwind CSS 3.4.17

\- html-to-image 1.11.13 (poster export)

\- lucide-react 0.475.0



\## Kritik scriptler

\- npm run import:schedule → fikstür verisi import

\- npm run validate:data → veri doğrulama

\- npm run check:routes → 121 route kontrolü

\- npm run prelaunch → full validation + build



\## Kritik dosyalar

\- /cards → poster studio ana sayfası

\- /visual-review → görsel test matrisi

\- matches.json → fikstür verisi

\- wc-cards2.jsx, wc-fx.jsx, wc-studio.jsx, wc-screens.jsx, wc-gallery.jsx



\## Kesin KAPSAM DIŞI — dokunma:

\- Telegram bot

\- Ödeme / premium / checkout

\- Kullanıcı hesabı / auth



\## Bilinen kırık şeyler (öncelik sırası):

1\. /cards — template/team/match state bağlantısı çalışmıyor

2\. /visual-review — açılmıyor

3\. Download/copy — hata veriyor

4\. Local time — tüm maçlarda doğrulanmadı



\## Poster export kütüphanesi

html-to-image kullanılıyor (html2canvas değil). Export elementini doğru yakaladığından emin ol.

