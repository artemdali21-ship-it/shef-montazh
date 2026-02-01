# Progressive Web App (PWA)

## Overview

ШЕФ-МОНТАЖ теперь является Progressive Web App - пользователи могут установить приложение на домашний экран мобильного устройства и пользоваться им как нативным приложением.

## Files Created

### Core PWA Files:
- `public/manifest.json` - манифест приложения (метаданные, иконки)
- `public/sw.js` - Service Worker (кеширование, offline режим)
- `app/offline/page.tsx` - страница при отсутствии интернета
- `components/InstallPWA.tsx` - промпт для установки приложения

### Modified Files:
- `app/layout.tsx` - добавлены PWA мета-теги, viewport, SW регистрация

## Manifest.json

```json
{
  "name": "Шеф-Монтаж",
  "short_name": "Шеф-Монтаж",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#E85D2F",
  "icons": [...]
}
```

**Key Properties**:
- **name** - полное название (показывается при установке)
- **short_name** - краткое название (на домашнем экране)
- **start_url** - URL при запуске приложения
- **display: standalone** - скрывает браузерный UI
- **theme_color** - цвет status bar (#E85D2F - orange)
- **background_color** - цвет splash screen
- **orientation: portrait** - только вертикальная ориентация

## Service Worker

### Cache Strategy

```javascript
const CACHE_NAME = 'chef-montazh-v1'
const urlsToCache = ['/', '/offline']
```

**Events**:
1. **install** - кеширует критичные ресурсы
2. **activate** - удаляет старые кеши
3. **fetch** - возвращает из кеша или делает запрос

**Cache-first strategy**:
- Сначала проверяет кеш
- Если нет - делает сетевой запрос
- Подходит для статических ресурсов

### Version Management

При обновлении приложения:
```javascript
const CACHE_NAME = 'chef-montazh-v2'  // Increment version
```

Старые кеши автоматически удаляются в activate event.

## Icons Required

### Create Icons:

Нужно создать 2 иконки в `/public/`:
- `icon-192.png` - 192x192px
- `icon-512.png` - 512x512px

**Requirements**:
- PNG формат
- Прозрачный или белый фон
- Логотип/символ в центре
- Отступы по краям (safe area)
- Purpose: "any maskable" (адаптивная маска)

### Tools for Icon Generation:

**Online**:
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)

**Command Line**:
```bash
# С помощью ImageMagick
convert logo.png -resize 192x192 icon-192.png
convert logo.png -resize 512x512 icon-512.png
```

**Figma/Photoshop**:
- Создать артборды 192x192 и 512x512
- Export as PNG
- Optimize с TinyPNG

## Installation Flow

### Mobile (Android/iOS):

1. **User открывает сайт** в браузере
2. **InstallPWA промпт** появляется автоматически (bottom toast)
3. **User нажимает "Установить"**
4. **Browser показывает** системный диалог установки
5. **Иконка добавляется** на домашний экран
6. **User запускает** как обычное приложение

### Desktop (Chrome/Edge):

- Иконка "Установить" в адресной строке
- Или через меню → Установить ШЕФ-МОНТАЖ

## InstallPWA Component

### Features:
- **beforeinstallprompt event** - перехватывает системный промпт
- **Deferred prompt** - показывает в удобный момент
- **Dismissible** - можно закрыть (X кнопка)
- **Responsive** - bottom-4 на mobile, bottom-right на desktop
- **Glassmorphism** - backdrop-blur-xl, white/10 фон

### Auto-hide Conditions:
- После установки (outcome === 'accepted')
- После dismiss (пользователь закрыл)
- Если уже установлено (beforeinstallprompt не fires)

## Metadata Updates

### PWA-specific:

```typescript
export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Шеф-Монтаж',
  },
}

export const viewport: Viewport = {
  themeColor: '#E85D2F',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}
```

**Why separate viewport**:
- Next.js 14+ требует отдельный export
- Устраняет warning в консоли
- Лучшая типизация

## Service Worker Registration

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.log('SW error', err));
  });
}
```

**Placed in `<head>`**:
- Регистрируется после load события
- Не блокирует первичную загрузку
- Логирует успех/ошибку в console

## Offline Page

**Route**: `/offline`

**Features**:
- WifiOff icon (16x16, gray)
- "Нет подключения" заголовок
- Инструкция проверить интернет
- Dark theme (matches app design)

**When shown**:
- Service Worker возвращает /offline при fetch error
- Пользователь видит friendly сообщение вместо browser error

## Testing

### Local Testing:

1. **Build production**:
```bash
pnpm build
pnpm start
```

2. **Open DevTools** → Application → Service Workers
3. **Check SW registered**
4. **Test offline**: DevTools → Network → Offline
5. **Check manifest**: Application → Manifest

### Mobile Testing:

**Android Chrome**:
1. Open site on phone
2. Wait for install prompt
3. Install
4. Check home screen icon
5. Launch app (should be fullscreen)

**iOS Safari**:
1. Open site
2. Share → Add to Home Screen
3. Edit name if needed
4. Add
5. Launch from home screen

### Lighthouse Audit:

```bash
# Install lighthouse
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view
```

Check PWA score (should be 100/100).

## PWA Capabilities

### What Works:

- **Installable** - add to home screen
- **Standalone mode** - no browser UI
- **Offline page** - fallback при no connection
- **App-like** - полноэкранный режим
- **Fast load** - cached resources
- **Icon on home screen** - как нативное приложение

### What Doesn't Work (yet):

- **Push notifications** - требует VAPID keys
- **Background sync** - требует sync API
- **Full offline** - только основные страницы
- **App store** - не доступно в App Store/Play Store

## Future Enhancements

### 1. Advanced Caching

**Network-first для API**:
```javascript
// Свежие данные приоритетнее
if (event.request.url.includes('/api/')) {
  return fetch(event.request).catch(() => caches.match(event.request))
}
```

**Stale-while-revalidate для страниц**:
```javascript
// Показываем кеш, обновляем в фоне
caches.match(event.request).then(cached => {
  const fetchPromise = fetch(event.request).then(response => {
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, response))
  })
  return cached || fetchPromise
})
```

### 2. Push Notifications

```typescript
// lib/push-notifications.ts
export async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY,
  })
  // Отправить subscription на сервер
}
```

**Use cases**:
- Новые смены в вашей зоне
- Приглашения в бригады
- Сообщения в чатах
- Изменение статуса смены
- Напоминания о check-in

### 3. Background Sync

```javascript
// Синхронизация при восстановлении сети
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})
```

**Use cases**:
- Отправка сообщений offline
- Синхронизация данных профиля
- Upload фото при плохом соединении

### 4. Pre-caching Strategy

```javascript
// Кешируем критичные ресурсы
const criticalResources = [
  '/',
  '/worker',
  '/client',
  '/shef',
  '/styles/globals.css',
  '/fonts/inter.woff2',
]
```

### 5. App Shortcuts

```json
// manifest.json
{
  "shortcuts": [
    {
      "name": "Мои смены",
      "url": "/worker/shifts",
      "icon": "/icons/shifts.png"
    },
    {
      "name": "Создать смену",
      "url": "/client/shifts/create",
      "icon": "/icons/create.png"
    }
  ]
}
```

Long-press на иконке → quick actions.

### 6. Share Target

```json
// manifest.json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url"
    }
  }
}
```

Позволяет share в ШЕФ-МОНТАЖ из других приложений.

## Platform-Specific Features

### Android:

- **Splash screen** - auto-generated из background_color + icon
- **Install banner** - системный промпт после 2+ визитов
- **Back button** - работает как в браузере
- **Share sheet** - native share menu

### iOS:

- **No install prompt** - только через Share → Add to Home Screen
- **No push notifications** - Safari не поддерживает
- **Standalone detection**:
```javascript
if (window.navigator.standalone) {
  // Running as installed PWA on iOS
}
```

### Desktop:

- **Install from omnibox** - иконка в адресной строке
- **App window** - отдельное окно без браузерного UI
- **Taskbar/Dock icon** - как desktop приложение

## Browser Support

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| **Install** | ✅ | ⚠️ Manual | ⚠️ Limited | ✅ |
| **Service Worker** | ✅ | ✅ | ✅ | ✅ |
| **Push Notifications** | ✅ | ❌ | ✅ | ✅ |
| **Background Sync** | ✅ | ❌ | ❌ | ✅ |
| **Standalone mode** | ✅ | ✅ | ✅ | ✅ |

## Performance Benefits

### Before PWA:
- First load: ~2-3s
- Repeat visits: ~1-2s
- No offline support

### After PWA:
- First load: ~2-3s (same)
- Repeat visits: ~200-500ms (cached)
- Offline fallback: instant

### Metrics:

```javascript
// Measure cache hit rate
const cacheHitRate = cachedRequests / totalRequests
// Target: >80% for repeat visitors
```

## Security

### HTTPS Required:
- PWA работает только на HTTPS
- localhost - исключение для development
- Service Workers требуют secure context

### Content Security Policy:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### Permissions:
- Notifications - требует user permission
- Location - требует user permission
- Camera - требует user permission

## Debugging

### Chrome DevTools:

1. **Application tab** → Manifest
   - Check all fields parsed correctly
   - Warnings about icons/colors

2. **Application tab** → Service Workers
   - Status: activated and running
   - Update on reload
   - Unregister/Bypass

3. **Network tab** → Disable cache
   - Test SW caching behavior

4. **Application tab** → Storage
   - View cached files
   - Clear storage

### Console Commands:

```javascript
// Check if installed
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('Running as PWA')
}

// Force SW update
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update()
})

// Unregister SW
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister()
})
```

## Install Prompt Behavior

### When Shown:

Промпт показывается если:
- ✅ Manifest корректный
- ✅ Service Worker registered
- ✅ HTTPS (или localhost)
- ✅ User посетил сайт 2+ раза
- ✅ User провел на сайте 30+ секунд (Chrome heuristics)

### User Dismissed:

Если пользователь dismiss промпт:
- Chrome: не показывает 3 месяца
- Можно показать custom UI для повторного промпта

## Uninstall

### Android:
- Long press icon → App info → Uninstall
- Or Settings → Apps → Шеф-Монтаж → Uninstall

### iOS:
- Long press icon → Remove App

### Desktop:
- chrome://apps → Right click → Uninstall
- Or App window → ⋮ → Uninstall

## Analytics

### Track Installation:

```javascript
// components/InstallPWA.tsx
const handleInstall = async () => {
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  // Track in analytics
  if (outcome === 'accepted') {
    gtag('event', 'pwa_install', { method: 'prompt' })
  }
}
```

### Track Usage Mode:

```javascript
// Track if user is in PWA or browser
const isPWA = window.matchMedia('(display-mode: standalone)').matches
gtag('event', 'page_view', { display_mode: isPWA ? 'pwa' : 'browser' })
```

## Best Practices

### 1. Test on Real Devices
- Android phone with Chrome
- iPhone with Safari
- Different screen sizes

### 2. Optimize Icons
- Use TinyPNG for compression
- Ensure icons look good at all sizes
- Test maskable icons on Android (circular mask)

### 3. Cache Strategy
- Don't cache everything (storage limits)
- Cache-first for static assets
- Network-first for API calls
- Cache images selectively

### 4. Update Strategy
- Increment CACHE_NAME on deploy
- Show "Update available" banner
- Force reload on major updates

### 5. Offline UX
- Show clear offline indicators
- Queue actions for when online
- Provide offline-first features

## Common Issues

### Install prompt doesn't show:
- Check manifest valid (DevTools → Application)
- Ensure HTTPS
- Try after 2+ visits
- Check browser console for errors

### Service Worker not updating:
- Hard refresh (Cmd+Shift+R)
- Unregister old SW
- Increment CACHE_NAME
- Check SW lifecycle in DevTools

### Icons not showing:
- Verify icon paths in manifest
- Check icons exist in /public/
- Ensure correct sizes (192, 512)
- Test with Lighthouse

### Offline page not working:
- Check SW caches /offline route
- Verify fetch event handler
- Test in incognito (clean state)

## Metrics to Track

1. **Install Rate**: installs / visitors
2. **PWA Usage**: PWA sessions / total sessions
3. **Retention**: 7-day retention PWA vs browser
4. **Engagement**: session time PWA vs browser
5. **Offline Access**: offline page views

## Differences from Native Apps

### PWA Pros:
- ✅ No app store review
- ✅ Instant updates (no download)
- ✅ Smaller size (~1MB vs ~50MB)
- ✅ Cross-platform (one codebase)
- ✅ Discoverable via web search

### PWA Cons:
- ❌ No app store presence
- ❌ Limited iOS support
- ❌ No native API access (Bluetooth, NFC)
- ❌ Lower user trust (не из App Store)

## Deployment Checklist

- [ ] Create icon-192.png and icon-512.png
- [ ] Verify manifest.json serves correctly
- [ ] Test service worker registration
- [ ] Test offline page loads
- [ ] Test install prompt on mobile
- [ ] Verify standalone mode works
- [ ] Check theme_color in status bar
- [ ] Run Lighthouse PWA audit
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Verify HTTPS in production

## Production Notes

- Service Worker кеширует aggressively - тестируй updates
- Manifest должен быть доступен на всех routes
- Icons должны быть optimized (TinyPNG)
- Consider workbox для advanced caching strategies
- Monitor SW errors в Sentry/analytics
- Provide "Check for updates" button для manual refresh

## Related Docs

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [web.dev PWA Checklist](https://web.dev/pwa-checklist/)
- [PWABuilder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox)

## Next Steps

After creating icons:
1. Test installation на Android
2. Test installation на iPhone
3. Run Lighthouse audit
4. Monitor install rate
5. Consider push notifications implementation
