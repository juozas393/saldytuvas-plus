# 📱 PWA (Progressive Web App) Setup

## Apžvalga

Saldytuvas Plus palaiko **PWA** funkcionalumą, kuris leidžia:
- ✅ Instaliuoti aplikaciją kaip native app
- ✅ Veikti offline režime
- ✅ Greitai užkrauti su caching
- ✅ Push notifications (vėliau)

---

## 🔧 Konfigūracija

### 1. Manifest.json

PWA manifest failas yra `mobile/public/manifest.json` ir apibrėžia:
- App pavadinimą ir aprašymą
- Ikonas (192x192, 512x512, maskable)
- Theme colors
- Display mode (`standalone`)
- Shortcuts (greitieji veiksmai)

### 2. Service Worker

Service worker (`mobile/public/service-worker.js`) užtikrina:
- **Offline caching** - cache'ina statinius asset'us
- **Runtime caching** - cache'ina API atsakymus
- **Background sync** - sinchronizuoja duomenis offline režime

### 3. Web Build

Expo automatiškai generuoja PWA-ready build'ą:

```bash
npm run build:web
```

Build failai bus `web-build/` direktorijoje su:
- `index.html` - HTML entry point
- `manifest.json` - PWA manifest
- `service-worker.js` - Service worker
- Static assets (JS, CSS, images)

---

## 🚀 Deployment

### Cloudflare Pages

1. **Build command:**
   ```bash
   npm run build:web
   ```

2. **Build output directory:**
   ```
   web-build
   ```

3. **Environment variables:**
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - `EXPO_PUBLIC_GEMINI_API_KEY`
   - `EXPO_PUBLIC_SPOONACULAR_API_KEY`

### Vercel

1. **Build command:**
   ```bash
   npm run build:web
   ```

2. **Output directory:**
   ```
   web-build
   ```

3. **Framework preset:**
   ```
   Other
   ```

---

## ✅ PWA Checklist

### Lighthouse Audit

Paleiskite Lighthouse auditą, kad patikrintumėte PWA reikalavimus:

```bash
# Chrome DevTools → Lighthouse → Progressive Web App
```

**Reikalingi rezultatai:**
- ✅ Installable
- ✅ Offline support
- ✅ Fast load time (LCP < 1.5s)
- ✅ Responsive design
- ✅ HTTPS enabled

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 1.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **INP (Interaction to Next Paint)**: < 200ms

---

## 🔍 Testing

### Local Testing

1. **Build web versiją:**
   ```bash
   npm run build:web
   ```

2. **Serve statinį build'ą:**
   ```bash
   npx serve web-build
   ```

3. **Patikrinkite PWA:**
   - Atidarykite Chrome DevTools
   - Eikite į Application → Service Workers
   - Patikrinkite, kad service worker registruotas
   - Eikite į Application → Manifest
   - Patikrinkite manifest validumą

### Offline Testing

1. **Chrome DevTools:**
   - Network tab → Offline checkbox
   - Patikrinkite, kad app veikia offline

2. **Service Worker:**
   - Application → Service Workers → Update on reload
   - Patikrinkite cache strategijas

---

## 📚 Nuorodos

- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

**Data:** 2025-01-XX  
**Status:** PWA setup dokumentacija












