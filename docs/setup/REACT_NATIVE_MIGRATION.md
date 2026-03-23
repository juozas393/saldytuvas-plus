# 🚀 React Native + PWA Migracijos Planas

## 📋 Apžvalga

Projektas migruojamas iš **Flutter** į **React Native** su **PWA (Progressive Web App)** palaikymu.

### Technologijų stackas:
- **React Native** - mobiliesiems įrenginiams (iOS, Android)
- **React Native Web** - web versijai
- **Expo** - development platform ir build tooling
- **TypeScript** - type safety
- **PWA** - service worker, offline palaikymas, installable web app

---

## 🏗️ Projekto Struktūra

```
saldytuvas_plus_clean/
├── mobile/                    # React Native projektas (Expo)
│   ├── app/                   # Expo Router (file-based routing)
│   ├── src/
│   │   ├── core/              # Core utilities, config, errors
│   │   ├── features/          # Feature-based struktūra
│   │   │   ├── auth/
│   │   │   ├── inventory/
│   │   │   ├── meal_planner/
│   │   │   ├── shopping/
│   │   │   └── ...
│   │   ├── services/          # Business logic services
│   │   ├── theme/             # Theme, colors, typography
│   │   └── types/             # TypeScript types
│   ├── public/                # PWA assets (manifest, icons, service worker)
│   ├── app.json               # Expo config
│   ├── package.json
│   └── tsconfig.json
├── web/                       # Web-specific optimizations
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   ├── service-worker.js  # Service worker
│   │   └── icons/             # PWA icons
│   └── index.html             # Web entry point
└── docs/
    └── setup/
        └── REACT_NATIVE_MIGRATION.md
```

---

## 📦 PWA Konfigūracija

### 1. Manifest.json

PWA manifest failas apibrėžia:
- App pavadinimą, ikonas, spalvas
- Display mode (`standalone`, `fullscreen`)
- Start URL
- Theme colors

### 2. Service Worker

Service worker užtikrina:
- Offline palaikymą
- Cache strategijas
- Background sync
- Push notifications (vėliau)

### 3. Web Optimizations

- Code splitting
- Lazy loading
- Image optimization (WebP/AVIF)
- Bundle size optimization (<250KB gzipped)

---

## 🔧 Setup Instrukcijos

### 1. Sukurti Expo projektą

```bash
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
```

### 2. Įdiegti React Native Web

```bash
npm install react-native-web react-dom
npm install --save-dev @expo/webpack-config
```

### 3. PWA dependencies

```bash
npm install workbox-webpack-plugin
npm install --save-dev @types/workbox-webpack-plugin
```

### 4. Expo config (app.json)

```json
{
  "expo": {
    "name": "Saldytuvas Plus",
    "slug": "saldytuvas-plus",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "static",
      "name": "Saldytuvas Plus",
      "shortName": "Saldytuvas",
      "lang": "lt",
      "scope": "/",
      "themeColor": "#0175C2",
      "backgroundColor": "#ffffff",
      "display": "standalone",
      "orientation": "portrait",
      "startUrl": "/",
      "manifest": "./public/manifest.json"
    },
    "plugins": [
      "expo-router"
    ]
  }
}
```

---

## 🎯 Clean Architecture (React Native)

### Struktūra:

```
src/
├── core/
│   ├── config/
│   │   └── app.config.ts          # API keys, env vars
│   ├── errors/
│   │   ├── exceptions.ts
│   │   └── failures.ts
│   ├── network/
│   │   ├── supabase.client.ts
│   │   └── http.client.ts
│   ├── storage/
│   │   └── local.storage.ts        # AsyncStorage wrapper
│   └── utils/
│       └── helpers.ts
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── inventory/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── ...
├── services/
│   ├── meal-planning.service.ts
│   ├── shopping-list.service.ts
│   └── ...
└── theme/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts
```

---

## 📱 Platform-Specific Code

### Web vs Mobile

```typescript
// src/core/utils/platform.ts
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
```

### Platform-specific komponentai:

```typescript
// src/features/inventory/components/ProductScanner.tsx
import { Platform } from 'react-native';
import { WebScanner } from './WebScanner';
import { MobileScanner } from './MobileScanner';

export const ProductScanner = () => {
  if (Platform.OS === 'web') {
    return <WebScanner />;
  }
  return <MobileScanner />;
};
```

---

## 🚀 Build & Deploy

### Development

```bash
# Mobile (iOS/Android)
npm run ios
npm run android

# Web
npm run web
```

### Production Build

```bash
# Web (PWA)
npm run build:web

# Mobile
npm run build:ios
npm run build:android
```

### Deploy

- **Web (PWA)**: Cloudflare Pages / Vercel
- **Mobile**: App Store / Google Play

---

## ✅ Migracijos Checklist

- [ ] Sukurti Expo projektą
- [ ] Konfigūruoti React Native Web
- [ ] Sukonfigūruoti PWA (manifest, service worker)
- [ ] Sukurti projektų struktūrą (Clean Architecture)
- [ ] Migruoti core komponentus (config, errors, network)
- [ ] Migruoti features (auth, inventory, meal planner)
- [ ] Sukonfigūruoti Supabase client
- [ ] Pridėti TypeScript types
- [ ] Testuoti web versiją (PWA)
- [ ] Testuoti mobile versiją (iOS/Android)
- [ ] Optimizuoti bundle size
- [ ] Atnaujinti deployment diagramą

---

## 📚 Nuorodos

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)

---

**Data:** 2025-01-XX  
**Status:** Migracijos planas












