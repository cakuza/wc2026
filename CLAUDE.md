\# WC2026 Fan Poster Site — MVP



\## Proje amacı

Ülke seç → maç yolunu gör → yerel saat → poster oluştur → indir/paylaş.

SofaScore rakibi değil. Fan poster studio.



\## Current State (June 4, 2026)

\- Deploy: wc2026-wine.vercel.app (Vercel, auto-deploy from GitHub)

\- GitHub: github.com/cakuza/wc2026



\## Çalışan özellikler (What's working)

\- 48 teams, real squads (1246 players), real fixtures

\- Poster engine: Anton font, team colors, grain/floodlight/vignette

\- Country picker onboarding (/cards)

\- Web Share API

\- 7 poster templates

\- Stats infrastructure: scripts/sync-results.mjs ready

&nbsp;&nbsp;- football-data.org API key in GitHub Secrets

&nbsp;&nbsp;- GitHub Action: .github/workflows/sync-results.yml

&nbsp;&nbsp;- Runs every 15min June 11 - July 19



\## Açık görevler (Open tasks)

\- Claude Design output → port to poster-engine.tsx

\- Country picker overlay visual upgrade

\- Homepage hero polish

\- Consider custom domain



\## Bilinen sorunlar (Known issues)

\- Homepage CDN cache slow to update (force-dynamic set)

\- wc26.app watermark changed to WC26 HUB



\## Stack

\- Next.js 15.1.6

\- React 19

\- TypeScript 5.7.3

\- Tailwind CSS 3.4.17

\- html-to-image 1.11.13 (poster export)

\- Anton (Google Fonts)

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

\- scripts/sync-results.mjs → maç sonuçları sync

\- wc-cards2.jsx, wc-fx.jsx, wc-studio.jsx, wc-screens.jsx, wc-gallery.jsx



\## Kesin KAPSAM DIŞI — dokunma:

\- Telegram bot

\- Ödeme / premium / checkout

\- Kullanıcı hesabı / auth



\## Poster export kütüphanesi

html-to-image kullanılıyor (html2canvas değil). Export elementini doğru yakaladığından emin ol.
