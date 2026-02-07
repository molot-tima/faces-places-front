/**
 * Home screen — greeting + CTA + bottom nav.
 */

import { getUserUnsafe } from '../telegram/telegram';
import { navigate } from '../router';

export function renderHome(app: HTMLElement): void {
  const user = getUserUnsafe();
  const name = user?.first_name ?? 'друг';

  app.innerHTML = `
    <!-- Animated background orbs -->
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <div class="page has-bottom-nav">
      <div class="container">
        <header class="page-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span>Faces & Places</span>
          </div>
          <div class="flex items-center gap-sm">
            <button class="btn btn-ghost btn-sm" id="cityBtn" style="font-size: 0.875rem;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Москва</span>
            </button>
          </div>
        </header>

        <div class="page-content">
          <section class="section">
            <h1 class="heading-3 mb-sm">Привет, ${name}!</h1>
            <p class="text-muted">Какое событие выберем сегодня?</p>
          </section>

          <section class="section">
            <a href="#/events" class="btn btn-cta btn-full" id="ctaBtn">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
              <span class="flex flex-col items-center">
                <span style="font-size: 1.25rem;">Подберём события для вас</span>
                <span style="font-size: 0.875rem; opacity: 0.9; font-weight: 400;">Дата • Бюджет • Предпочтения</span>
              </span>
            </a>
          </section>
        </div>
      </div>

      ${bottomNav('home')}
    </div>
  `;

  // CTA button handler
  app.querySelector('#ctaBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/events');
  });

  setupNavLinks(app);
}

export function bottomNav(active: 'home' | 'events' | 'favorites'): string {
  return `
    <nav class="nav-bottom">
      <div class="nav-bottom-inner">
        <a href="#/" class="nav-item ${active === 'home' ? 'active' : ''}" data-nav="home">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span class="nav-item-label">Главная</span>
        </a>
        <a href="#/events" class="nav-item ${active === 'events' ? 'active' : ''}" data-nav="events">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="nav-item-label">Афиша</span>
        </a>
        <a href="#/favorites" class="nav-item ${active === 'favorites' ? 'active' : ''}" data-nav="favorites">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span class="nav-item-label">Избранное</span>
        </a>
      </div>
    </nav>
  `;
}

export function setupNavLinks(app: HTMLElement): void {
  app.querySelectorAll('.nav-item[data-nav]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = (link as HTMLAnchorElement).getAttribute('href');
      if (href) navigate(href.replace('#', ''));
    });
  });
}
