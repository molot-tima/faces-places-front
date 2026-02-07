/**
 * Events List screen — loads events from API, renders cards.
 * Handles loading / empty / error states.
 */

import { getEvents } from '../api';
import { addFavorite, removeFavorite } from '../api';
import { navigate } from '../router';
import { hapticFeedback } from '../telegram/telegram';
import { bottomNav, setupNavLinks } from './home';
import type { Event } from '../api/generated';

const CATEGORY_EMOJI: Record<string, string> = {
  theatre: '🎭 Театр',
  cinema: '🎬 Кино',
  quest: '🔐 Квест',
  concert: '🎤 Концерт',
  standup: '🎙️ Стендап',
  exhibition: '🖼️ Выставка',
  festival: '🎪 Фестиваль',
  ballet: '🩰 Балет',
  opera: '🎼 Опера',
  club: '🎶 Клуб',
  sport: '⚽ Спорт',
  lecture: '📚 Лекция',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function formatPrice(price: { from: number; to?: number }): string {
  return `от ${price.from.toLocaleString('ru-RU')} ₽`;
}

function renderEventCard(event: Event): string {
  const catLabel = CATEGORY_EMOJI[event.category] ?? event.category;
  const dateLabel = formatDate(event.datetime.date) + ', ' + event.datetime.time;
  const priceLabel = formatPrice(event.price);
  const favoriteClass = event.isFavorite ? 'liked' : '';
  const fillAttr = event.isFavorite ? 'currentColor' : 'none';
  const favStyle = event.isFavorite
    ? 'background: var(--color-accent-primary); color: white; box-shadow: var(--glow-primary);'
    : 'color: white;';

  return `
    <div class="card" data-event-id="${event.id}">
      <div class="card-image" style="cursor: pointer;" data-navigate="/event/${event.id}">
        <div style="width: 100%; height: 100%; background: ${event.image};"></div>
        ${event.matchPercentage && event.matchPercentage >= 90
          ? '<span class="card-badge card-badge-accent">Популярное</span>'
          : ''}
        <button class="card-favorite btn btn-icon-sm ${favoriteClass}" style="${favStyle}" data-fav-id="${event.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${fillAttr}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="card-image-overlay">
          <h3 class="card-title">${event.title}</h3>
          <div class="flex items-center gap-sm text-sm" style="opacity: 0.9;">
            <span>${catLabel}</span>
            <span>•</span>
            <span>${dateLabel}</span>
            <span>•</span>
            <span>${priceLabel}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSkeleton(): string {
  return Array.from({ length: 3 }, () => `
    <div class="card">
      <div class="card-image skeleton" style="height: 200px;"></div>
    </div>
  `).join('');
}

export async function renderEvents(app: HTMLElement): Promise<void> {
  // Render shell with loading skeleton
  app.innerHTML = `
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>

    <div class="page has-bottom-nav">
      <div class="container">
        <header class="page-header">
          <a href="#/" class="back-btn" id="backBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span>Назад</span>
          </a>
        </header>

        <div class="page-content">
          <section class="section">
            <h1 class="heading-3 mb-md">Афиша событий</h1>
          </section>

          <!-- Filters -->
          <section class="section">
            <div class="flex gap-sm" id="categoryFilters" style="overflow-x: auto; margin: 0 calc(var(--space-md) * -1); padding: 0 var(--space-md);">
              <button class="tag tag-accent" data-category="" style="flex-shrink: 0;">Все</button>
              <button class="tag" data-category="theatre" style="flex-shrink: 0;">🎭 Театр</button>
              <button class="tag" data-category="cinema" style="flex-shrink: 0;">🎬 Кино</button>
              <button class="tag" data-category="quest" style="flex-shrink: 0;">🔐 Квесты</button>
              <button class="tag" data-category="concert" style="flex-shrink: 0;">🎤 Концерты</button>
              <button class="tag" data-category="standup" style="flex-shrink: 0;">🎙️ Стендап</button>
              <button class="tag" data-category="exhibition" style="flex-shrink: 0;">🖼️ Выставки</button>
            </div>
          </section>

          <!-- Results count -->
          <div class="flex justify-between items-center mb-md">
            <span class="text-muted text-sm" id="resultsCount"></span>
          </div>

          <!-- Events -->
          <div class="list stagger-children" id="eventsList">
            ${renderSkeleton()}
          </div>

          <!-- Error state -->
          <div id="errorState" style="display: none;" class="error-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p class="text-muted mb-md">Не удалось загрузить события</p>
            <button class="btn btn-secondary" id="retryBtn">Попробовать снова</button>
          </div>
        </div>
      </div>

      ${bottomNav('events')}
    </div>
  `;

  setupNavLinks(app);

  // Back button
  app.querySelector('#backBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('/');
  });

  // Category filter
  let activeCategory = '';
  app.querySelector('#categoryFilters')?.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('[data-category]') as HTMLElement | null;
    if (!btn) return;
    activeCategory = btn.dataset.category ?? '';
    app.querySelectorAll('#categoryFilters .tag').forEach((t) => t.classList.remove('tag-accent'));
    btn.classList.add('tag-accent');
    loadEvents(activeCategory);
  });

  // Retry
  app.querySelector('#retryBtn')?.addEventListener('click', () => loadEvents(activeCategory));

  async function loadEvents(category: string) {
    const listEl = app.querySelector('#eventsList') as HTMLElement;
    const errorEl = app.querySelector('#errorState') as HTMLElement;
    const countEl = app.querySelector('#resultsCount') as HTMLElement;

    listEl.innerHTML = renderSkeleton();
    listEl.style.display = '';
    errorEl.style.display = 'none';

    try {
      const result = await getEvents({
        category: category || undefined,
        limit: 20,
      });

      if (result.data.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 15h8"/>
              <circle cx="9" cy="9" r="1"/>
              <circle cx="15" cy="9" r="1"/>
            </svg>
            <p class="text-muted">Событий не найдено</p>
          </div>
        `;
        countEl.textContent = 'Найдено 0 событий';
        return;
      }

      countEl.textContent = `Найдено ${result.pagination.total} событий`;
      listEl.innerHTML = result.data.map(renderEventCard).join('');

      // Wire up card clicks
      listEl.querySelectorAll('[data-navigate]').forEach((el) => {
        el.addEventListener('click', (e) => {
          // Don't navigate if clicking on the favorite button
          if ((e.target as HTMLElement).closest('.card-favorite')) return;
          e.preventDefault();
          const path = (el as HTMLElement).dataset.navigate!;
          navigate(path);
        });
      });

      // Wire up favorite buttons
      setupFavoriteButtons(listEl);
    } catch (err) {
      console.error('Failed to load events:', err);
      listEl.style.display = 'none';
      errorEl.style.display = '';
      countEl.textContent = '';
    }
  }

  // Initial load
  await loadEvents('');
}

function createParticles(btn: HTMLElement): void {
  const container = document.createElement('div');
  container.className = 'like-particles';
  btn.appendChild(container);

  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.className = 'like-particle';
    const angle = (i / 8) * Math.PI * 2;
    const distance = 25 + Math.random() * 15;
    particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
    particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
    container.appendChild(particle);
  }
  setTimeout(() => container.remove(), 600);
}

function setupFavoriteButtons(container: HTMLElement): void {
  container.querySelectorAll('.card-favorite[data-fav-id]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const el = btn as HTMLElement;
      const eventId = el.dataset.favId!;
      const isLiked = el.classList.contains('liked');

      hapticFeedback('light');

      try {
        if (isLiked) {
          await removeFavorite(eventId);
          el.classList.remove('liked');
          el.style.background = '';
          el.style.boxShadow = '';
          el.querySelector('svg')?.setAttribute('fill', 'none');
        } else {
          await addFavorite(eventId);
          el.classList.add('liked');
          el.style.background = 'var(--color-accent-primary)';
          el.style.color = 'white';
          el.style.boxShadow = 'var(--glow-primary)';
          el.querySelector('svg')?.setAttribute('fill', 'currentColor');
          createParticles(el);
        }
      } catch (err) {
        console.error('Favorite toggle failed:', err);
      }
    });
  });
}
