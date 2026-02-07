/**
 * Application entry point.
 *
 * 1. Starts MSW (if VITE_MOCK_API=true)
 * 2. Initializes Telegram SDK
 * 3. Sets up mock auth token
 * 4. Registers routes and starts the router
 */

import { initTelegram, isTelegram, getUserUnsafe, setBackButtonVisible, applyTheme } from './telegram/telegram';
import { setAccessToken } from './api/http';
import { addRoute, startRouter, getCurrentPath } from './router';
import { renderHome } from './pages/home';
import { renderEvents } from './pages/events';
import { renderEventDetail } from './pages/event-detail';
import { renderFavorites } from './pages/favorites';

async function main() {
  // 1. Start MSW in dev mode
  if (import.meta.env.VITE_MOCK_API === 'true') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    console.log('[MSW] Mock API enabled');
  }

  // 2. Initialize Telegram SDK
  initTelegram();
  applyTheme();

  // 3. Show dev banner if not in Telegram
  if (!isTelegram()) {
    const banner = document.createElement('div');
    banner.className = 'dev-banner';
    const user = getUserUnsafe();
    banner.textContent = user
      ? `Dev Mode — Telegram user: ${user.first_name} ${user.last_name ?? ''} (@${user.username ?? 'n/a'})`
      : 'Dev Mode — Not in Telegram WebView';
    document.body.prepend(banner);
  }

  // 4. Set up mock auth token
  // TODO: In production, exchange Telegram initData for a real JWT via
  // POST /api/v1/auth/social { provider: "telegram", token: initData }
  // The backend must verify the initData signature (HMAC-SHA-256 with bot token)
  // before issuing tokens.
  setAccessToken('mock_dev_token_' + Date.now());

  // 5. Get app container
  const app = document.getElementById('app');
  if (!app) throw new Error('#app element not found');

  // 6. Register routes
  addRoute('/', () => {
    setBackButtonVisible(false);
    renderHome(app);
  });

  addRoute('/events', () => {
    setBackButtonVisible(false);
    renderEvents(app);
  });

  addRoute('/event/:id', ({ id }) => {
    renderEventDetail(app, id);
  });

  addRoute('/favorites', () => {
    setBackButtonVisible(false);
    renderFavorites(app);
  });

  // 7. Start router
  startRouter();
}

main().catch(console.error);
